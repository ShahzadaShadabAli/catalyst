"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { deleteItem, reorderItems, saveItem } from "@/actions/admin";
import { Photo } from "@/components/craft";
import type { CollectionName, ImageRef } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { FieldRenderer, getPath, setPath, type FieldCtx, type FieldDef } from "./fields";
import { Drawer, PageHeader, useToast } from "./ui";

type Item = { id: string } & Record<string, unknown>;

export type Summary = { title: string; subtitle?: string; image?: ImageRef | null; badge?: ReactNode };

type Props = {
  collection: CollectionName;
  title: string;
  description?: string;
  singular: string;
  items: Item[];
  fields: FieldDef[];
  blank: Record<string, unknown>;
  summary: (item: Item, all: Item[]) => Summary;
  wide?: boolean;
  reorderable?: boolean;
  previewHref?: (item: Item) => string | null;
};

export function CollectionManager({
  collection,
  title,
  description,
  singular,
  items: initial,
  fields,
  blank,
  summary,
  wide,
  reorderable = true,
  previewHref,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<{ id: string | null; draft: Record<string, unknown> } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  // Pick up fresh server data after router.refresh().
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setItems(initial);
  }

  const ctx: FieldCtx = {
    selfId: editing?.id ?? null,
    leaders:
      collection === "leaders"
        ? items.map((i) => ({ id: i.id, name: String(i.name), role: String(i.role), parentId: (i.parentId as string | null) ?? null }))
        : undefined,
  };

  function open(item: Item | null) {
    setErrors({});
    setFormError("");
    if (item) {
      const { id, ...draft } = item;
      setEditing({ id, draft });
    } else setEditing({ id: null, draft: structuredClone(blank) });
  }

  function save() {
    if (!editing) return;
    startTransition(async () => {
      const res = await saveItem(collection, editing.id, editing.draft);
      if (res.ok) {
        toast(`${singular} saved`);
        setEditing(null);
        router.refresh();
      } else {
        setErrors(res.errors ?? {});
        setFormError(res.error);
      }
    });
  }

  function remove(item: Item) {
    const name = summary(item, items).title;
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteItem(collection, item.id);
      if (res.ok) {
        toast(`${singular} deleted`);
        setItems((list) => list.filter((i) => i.id !== item.id));
        setEditing(null);
        router.refresh();
      } else toast(res.error, "error");
    });
  }

  function reorder(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    setItems(next);
    startTransition(async () => {
      const res = await reorderItems(collection, next.map((i) => i.id));
      if (!res.ok) {
        toast(res.error, "error");
        setItems(items);
      }
    });
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          <button type="button" className="btn btn-primary" onClick={() => open(null)}>
            + Add {singular.toLowerCase()}
          </button>
        }
      />

      {items.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {items.map((item, i) => {
            const s = summary(item, items);
            const href = previewHref?.(item);
            return (
              <li
                key={item.id}
                draggable={reorderable}
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) reorder(dragIndex, i);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn("flex items-center gap-3 px-3 py-3 sm:px-4", dragIndex === i && "opacity-40")}
              >
                {reorderable ? (
                  <span aria-hidden className="hidden cursor-grab select-none px-1 text-muted sm:block" title="Drag to reorder">
                    ⋮⋮
                  </span>
                ) : null}
                {s.image !== undefined ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                    <Photo image={s.image} sizes="48px" fallbackLabel={s.title} />
                  </div>
                ) : null}
                <button type="button" onClick={() => open(item)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-semibold text-ink hover:underline">{s.title}</p>
                  {s.subtitle ? <p className="truncate text-sm text-muted">{s.subtitle}</p> : null}
                </button>
                {s.badge}
                {href ? (
                  <a href={href} target="_blank" rel="noopener" className="hidden text-sm text-sage-deep hover:underline sm:block">
                    View
                  </a>
                ) : null}
                {reorderable ? (
                  <div className="flex gap-1">
                    <button type="button" aria-label={`Move ${s.title} up`} disabled={i === 0 || pending} onClick={() => reorder(i, i - 1)} className="grid size-8 place-items-center rounded-md border border-line text-sm disabled:opacity-30">
                      ↑
                    </button>
                    <button type="button" aria-label={`Move ${s.title} down`} disabled={i === items.length - 1 || pending} onClick={() => reorder(i, i + 1)} className="grid size-8 place-items-center rounded-md border border-line text-sm disabled:opacity-30">
                      ↓
                    </button>
                  </div>
                ) : null}
                <button type="button" onClick={() => open(item)} className="btn btn-ghost btn-sm">
                  Edit
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-card/60 p-10 text-center">
          <p className="font-hand text-3xl text-muted">Nothing here yet.</p>
          <button type="button" className="btn btn-primary btn-sm mt-4" onClick={() => open(null)}>
            Add the first {singular.toLowerCase()}
          </button>
        </div>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        wide={wide}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            {editing?.id ? (
              <button
                type="button"
                className="btn btn-sm text-danger hover:bg-danger/10"
                disabled={pending}
                onClick={() => {
                  const item = items.find((i) => i.id === editing.id);
                  if (item) remove(item);
                }}
              >
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              {formError ? <p className="text-sm text-danger">{formError}</p> : null}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={save}>
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        }
      >
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {fields.map((f) => (
              <FieldRenderer
                key={f.name}
                def={f}
                path={f.name}
                value={getPath(editing.draft, f.name)}
                onChange={(v) => setEditing((e) => (e ? { ...e, draft: setPath(e.draft, f.name, v) } : e))}
                errors={errors}
                ctx={ctx}
                draft={editing.draft}
              />
            ))}
            <button type="submit" hidden />
          </form>
        ) : null}
      </Drawer>
    </div>
  );
}
