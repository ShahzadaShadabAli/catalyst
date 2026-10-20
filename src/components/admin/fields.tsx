"use client";
import Image from "next/image";
import { useId, useRef, useState, type ReactNode } from "react";
import { Photo } from "@/components/craft";
import { emptyImage, type ImageRef, type MediaItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { parseYouTubeId, youTubeThumb } from "@/lib/youtube";
import { uploadImage, uploadsEnabled } from "./upload";

/* ───────── Field definitions ───────── */

type Base = { name: string; label: string; hint?: string; full?: boolean };
export type FieldDef =
  | (Base & { type: "text" | "email" | "url" | "date" | "tel"; maxLength?: number; placeholder?: string })
  | (Base & { type: "textarea"; rows?: number; maxLength?: number; placeholder?: string })
  | (Base & { type: "number"; min?: number; max?: number; nullable?: boolean })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "checkbox" })
  | (Base & { type: "image" })
  | (Base & { type: "images"; max?: number })
  | (Base & { type: "parent" })
  | (Base & { type: "slug"; from: string })
  | (Base & { type: "media" })
  | (Base & { type: "list"; itemFields: FieldDef[]; itemLabel: string; blank: Record<string, unknown>; max?: number });

export type FieldCtx = { selfId: string | null; leaders?: { id: string; name: string; role: string; parentId: string | null }[] };

/* ───────── Path helpers for nested values like "hero.title" or "values.0.title" ───────── */

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const key = head!;
  const isIndex = /^\d+$/.test(key);
  const copy: Record<string, unknown> | unknown[] = Array.isArray(obj) ? [...obj] : { ...(obj as object) };
  const current = (copy as Record<string, unknown>)[key];
  (copy as Record<string, unknown>)[isIndex ? Number(key) : key] = rest.length ? setPath(current ?? {}, rest.join("."), value) : value;
  return copy as T;
}

/* ───────── Small UI pieces ───────── */

export const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2.5 text-[0.95rem] text-ink shadow-sm transition focus:border-sage-deep focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-danger";

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold text-ink">
      <span>{children}</span>
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function ErrorText({ children, id }: { children?: string; id?: string }) {
  return children ? (
    <p id={id} className="mt-1 text-sm text-danger">
      {children}
    </p>
  ) : null;
}

function IconBtn({ label, onClick, children, danger, disabled }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md border text-sm transition disabled:opacity-30",
        danger ? "border-transparent text-danger hover:bg-danger/10" : "border-line bg-card text-charcoal hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
};

/* ───────── Image upload ───────── */

export function ImageInput({ value, onChange, id }: { value: ImageRef; onChange: (v: ImageRef) => void; id: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const img = value ?? emptyImage;

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadImage(file);
      onChange({ ...uploaded, alt: img.alt });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex gap-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-line bg-paper-2">
        <Photo image={img.url ? img : null} sizes="96px" />
        {busy ? <div className="absolute inset-0 grid place-items-center bg-card/80 text-xs font-semibold">Uploading…</div> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" className="btn btn-ghost btn-sm" disabled={!uploadsEnabled || busy} onClick={() => fileRef.current?.click()}>
            {img.url ? "Replace" : "Upload image"}
          </button>
          {img.url ? (
            <button type="button" className="btn btn-sm text-danger hover:bg-danger/10" onClick={() => onChange(emptyImage)}>
              Remove
            </button>
          ) : null}
        </div>
        <input
          id={id}
          className={inputCls}
          placeholder="Describe the image (for screen readers)"
          value={img.alt ?? ""}
          maxLength={200}
          onChange={(e) => onChange({ ...img, alt: e.target.value })}
        />
        {!uploadsEnabled ? <p className="text-xs text-muted">Add your Cloudinary keys to turn on uploads.</p> : null}
        <ErrorText>{error}</ErrorText>
      </div>
    </div>
  );
}

/* ───────── Multiple images (e.g. origin photos) ───────── */

function ImagesInput({ value, onChange, max = 6 }: { value: ImageRef[]; onChange: (v: ImageRef[]) => void; max?: number }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const list = value ?? [];

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const room = Math.max(0, max - list.length);
    const picked = Array.from(files).slice(0, room);
    setBusy(picked.length);
    const added: ImageRef[] = [];
    for (const f of picked) {
      try {
        added.push(await uploadImage(f));
      } catch (e) {
        setError((e as Error).message);
      }
      setBusy((b) => b - 1);
    }
    onChange([...list, ...added]);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((img, i) => (
          <li key={`${img.url}-${i}`} className="rounded-lg border border-line bg-card p-2">
            <div className="relative aspect-square overflow-hidden rounded-md bg-paper-2">
              <Photo image={img} sizes="160px" />
            </div>
            <input
              className={cn(inputCls, "mt-2 py-1.5 text-sm")}
              placeholder="Caption / alt text"
              value={img.alt}
              maxLength={200}
              aria-label={`Caption for image ${i + 1}`}
              onChange={(e) => onChange(list.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
            />
            <div className="mt-2 flex gap-1">
              <IconBtn label="Move left" onClick={() => onChange(move(list, i, i - 1))} disabled={i === 0}>←</IconBtn>
              <IconBtn label="Move right" onClick={() => onChange(move(list, i, i + 1))} disabled={i === list.length - 1}>→</IconBtn>
              <span className="flex-1" />
              <IconBtn label="Remove image" danger onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</IconBtn>
            </div>
          </li>
        ))}
      </ul>
      <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <button type="button" className="btn btn-ghost btn-sm" disabled={!uploadsEnabled || busy > 0 || list.length >= max} onClick={() => fileRef.current?.click()}>
        {busy ? `Uploading ${busy}…` : `Add photos (${list.length}/${max})`}
      </button>
      {!uploadsEnabled ? <p className="text-xs text-muted">Add your Cloudinary keys to turn on uploads.</p> : null}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* ───────── Event gallery: photos + YouTube videos ───────── */

function MediaInput({ value, onChange, errors, path }: { value: MediaItem[]; onChange: (v: MediaItem[]) => void; errors: Record<string, string>; path: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const [yt, setYt] = useState("");
  const list = value ?? [];

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const picked = Array.from(files).slice(0, 30);
    setBusy(picked.length);
    const added: MediaItem[] = [];
    for (const f of picked) {
      try {
        added.push({ kind: "image", image: await uploadImage(f), caption: "" });
      } catch (e) {
        setError((e as Error).message);
      }
      setBusy((b) => b - 1);
    }
    onChange([...list, ...added]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addYouTube() {
    const id = parseYouTubeId(yt);
    if (!id) {
      setError("That doesn't look like a YouTube link.");
      return;
    }
    setError("");
    onChange([...list, { kind: "youtube", youtubeId: id, caption: "" }]);
    setYt("");
  }

  return (
    <div className="space-y-4">
      {list.length ? (
        <ul className="space-y-2">
          {list.map((m, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-card p-2">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-paper-2">
                {m.kind === "image" ? (
                  <Photo image={m.image} sizes="80px" />
                ) : (
                  <>
                    <Image src={youTubeThumb(m.youtubeId)} alt="" fill sizes="80px" className="object-cover" unoptimized />
                    <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1 text-[0.6rem] font-bold text-paper">VIDEO</span>
                  </>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  className={cn(inputCls, "py-1.5 text-sm")}
                  placeholder="Caption"
                  value={m.caption}
                  maxLength={200}
                  aria-label={`Caption for item ${i + 1}`}
                  onChange={(e) => onChange(list.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
                />
                <ErrorText>{errors[`${path}.${i}.image.url`] ?? errors[`${path}.${i}.youtubeId`]}</ErrorText>
              </div>
              <IconBtn label="Move up" onClick={() => onChange(move(list, i, i - 1))} disabled={i === 0}>↑</IconBtn>
              <IconBtn label="Move down" onClick={() => onChange(move(list, i, i + 1))} disabled={i === list.length - 1}>↓</IconBtn>
              <IconBtn label="Remove" danger onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</IconBtn>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">No photos or videos yet.</p>
      )}

      <div className="flex flex-col gap-3 rounded-lg bg-paper-2/60 p-3 sm:flex-row sm:items-center">
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <button type="button" className="btn btn-ghost btn-sm shrink-0" disabled={!uploadsEnabled || busy > 0} onClick={() => fileRef.current?.click()}>
          {busy ? `Uploading ${busy}…` : "Add photos"}
        </button>
        <span className="hidden text-xs text-muted sm:block">or</span>
        <div className="flex flex-1 gap-2">
          <input
            className={cn(inputCls, "py-1.5 text-sm")}
            placeholder="Paste a YouTube link"
            value={yt}
            onChange={(e) => setYt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addYouTube();
              }
            }}
            aria-label="YouTube link"
          />
          <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={addYouTube} disabled={!yt.trim()}>
            Add video
          </button>
        </div>
      </div>
      {!uploadsEnabled ? <p className="text-xs text-muted">Photo uploads turn on once Cloudinary keys are added. YouTube links work now.</p> : null}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* ───────── The renderer ───────── */

type RendererProps = {
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  errors: Record<string, string>;
  path: string;
  ctx: FieldCtx;
  draft?: Record<string, unknown>;
};

export function FieldRenderer({ def, value, onChange, errors, path, ctx, draft }: RendererProps) {
  const id = useId();
  const error = errors[path];
  const invalid = error ? { "aria-invalid": true as const, "aria-describedby": `${id}-err` } : {};
  const wrap = (control: ReactNode, labelFor: string | undefined = id) => (
    <div className={cn(def.full && "sm:col-span-2")}>
      {def.type !== "checkbox" ? (
        <Label htmlFor={labelFor} hint={def.hint}>
          {def.label}
        </Label>
      ) : null}
      {control}
      <ErrorText id={`${id}-err`}>{error}</ErrorText>
    </div>
  );

  switch (def.type) {
    case "text":
    case "email":
    case "url":
    case "date":
    case "tel":
      return wrap(
        <input
          id={id}
          type={def.type}
          className={inputCls}
          value={(value as string) ?? ""}
          maxLength={"maxLength" in def ? def.maxLength : undefined}
          placeholder={"placeholder" in def ? def.placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
          {...invalid}
        />,
      );
    case "slug":
      return wrap(
        <div className="flex gap-2">
          <span className="hidden items-center rounded-lg bg-paper-2 px-3 font-mono text-xs text-muted sm:flex">/works/</span>
          <input
            id={id}
            className={cn(inputCls, "font-mono text-sm")}
            value={(value as string) ?? ""}
            maxLength={80}
            onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            {...invalid}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm shrink-0"
            onClick={() => {
              const src = String(draft?.[def.from] ?? "");
              onChange(
                src
                  .toLowerCase()
                  .normalize("NFKD")
                  .replace(/[̀-ͯ]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")
                  .slice(0, 80),
              );
            }}
          >
            From title
          </button>
        </div>,
      );
    case "textarea":
      return wrap(
        <>
          <textarea
            id={id}
            rows={def.rows ?? 4}
            className={cn(inputCls, "resize-y leading-relaxed")}
            value={(value as string) ?? ""}
            maxLength={def.maxLength}
            placeholder={def.placeholder}
            onChange={(e) => onChange(e.target.value)}
            {...invalid}
          />
          {def.maxLength ? (
            <p className="mt-1 text-right text-xs text-muted">
              {String(value ?? "").length}/{def.maxLength}
            </p>
          ) : null}
        </>,
      );
    case "number":
      return wrap(
        <input
          id={id}
          type="number"
          inputMode="numeric"
          className={inputCls}
          min={def.min}
          max={def.max}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? (def.nullable ? null : 0) : Number(e.target.value))}
          {...invalid}
        />,
      );
    case "select":
      return wrap(
        <select id={id} className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} {...invalid}>
          {def.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>,
      );
    case "checkbox":
      return wrap(
        <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-card px-3 py-3">
          <input id={id} type="checkbox" className="size-4 accent-[var(--color-sage-deep)]" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm font-semibold text-ink">{def.label}</span>
          {def.hint ? <span className="text-xs text-muted">{def.hint}</span> : null}
        </label>,
      );
    case "image":
      return wrap(<ImageInput id={id} value={(value as ImageRef) ?? emptyImage} onChange={onChange} />);
    case "images":
      return wrap(<ImagesInput value={(value as ImageRef[]) ?? []} onChange={onChange} max={def.max} />, undefined);
    case "media":
      return wrap(<MediaInput value={(value as MediaItem[]) ?? []} onChange={onChange} errors={errors} path={path} />, undefined);
    case "parent": {
      const leaders = ctx.leaders ?? [];
      // Exclude yourself and anyone below you, so the tree can't loop.
      const below = new Set<string>();
      if (ctx.selfId) {
        below.add(ctx.selfId);
        let grew = true;
        while (grew) {
          grew = false;
          for (const l of leaders) {
            if (l.parentId && below.has(l.parentId) && !below.has(l.id)) {
              below.add(l.id);
              grew = true;
            }
          }
        }
      }
      return wrap(
        <select id={id} className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)} {...invalid}>
          <option value="">— Top of the tree —</option>
          {leaders
            .filter((l) => !below.has(l.id))
            .map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.role})
              </option>
            ))}
        </select>,
      );
    }
    case "list": {
      const list = (value as Record<string, unknown>[]) ?? [];
      const max = def.max ?? 50;
      return wrap(
        <div className="space-y-3">
          {list.map((item, i) => (
            <fieldset key={i} aria-label={`${def.itemLabel} ${i + 1}`} className="rounded-xl border border-line bg-paper/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <p className="flex-1 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  {def.itemLabel} {i + 1}
                </p>
                <IconBtn label="Move up" onClick={() => onChange(move(list, i, i - 1))} disabled={i === 0}>↑</IconBtn>
                <IconBtn label="Move down" onClick={() => onChange(move(list, i, i + 1))} disabled={i === list.length - 1}>↓</IconBtn>
                <IconBtn label={`Remove ${def.itemLabel.toLowerCase()}`} danger onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</IconBtn>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {def.itemFields.map((f) => (
                  <FieldRenderer
                    key={f.name}
                    def={f}
                    value={item[f.name]}
                    onChange={(v) => onChange(list.map((x, j) => (j === i ? { ...x, [f.name]: v } : x)))}
                    errors={errors}
                    path={`${path}.${i}.${f.name}`}
                    ctx={ctx}
                  />
                ))}
              </div>
            </fieldset>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" disabled={list.length >= max} onClick={() => onChange([...list, { ...def.blank }])}>
            + Add {def.itemLabel.toLowerCase()}
          </button>
        </div>,
        undefined,
      );
    }
  }
}
