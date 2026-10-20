"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { submitApplication } from "@/actions/join";
import { Pin, StickyNote, Tape } from "@/components/craft";
import { applicationSchema, educationLevels, fieldErrors } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type Type = "permanent" | "honorary";
const EMPTY = { fullName: "", dob: "", education: "", institution: "", city: "", email: "", phone: "", reason: "", expertise: "" };
type Values = typeof EMPTY;

function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function JoinForm({ permanentText, honoraryText }: { permanentText: string; honoraryText: string }) {
  const [type, setType] = useState<Type>("permanent");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [website, setWebsite] = useState("");
  const [pending, startTransition] = useTransition();
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((errs) => Object.fromEntries(Object.entries(errs).filter(([k]) => k !== key)));
  };

  const a11y = (key: keyof Values) => ({
    id: `join-${key}`,
    name: key,
    value: values[key],
    onChange: set(key),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `join-${key}-error` : undefined,
    className: "field",
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const check = applicationSchema.safeParse({ ...values, type });
    if (!check.success) {
      const errs = fieldErrors(check.error);
      setErrors(errs);
      document.getElementById(`join-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    startTransition(async () => {
      const res = await submitApplication({ ...values, type, website, startedAt: startedAt.current });
      if (res.ok) {
        setDone(true);
        setValues(EMPTY);
      } else {
        setErrors(res.errors ?? {});
        setMessage(res.message ?? (res.errors ? "Please fix the highlighted fields." : ""));
      }
    });
  }

  const options: { key: Type; title: string; text: string; color: string; rotate: number }[] = [
    {
      key: "permanent",
      title: "Permanent member",
      text: permanentText || "Be part of the core team: plan events, volunteer on the ground and grow with us.",
      color: "sticky-sage",
      rotate: -2,
    },
    {
      key: "honorary",
      title: "Honorary member",
      text: honoraryText || "Lend your expertise, network or voice without a regular time commitment.",
      color: "sticky-blush",
      rotate: 2,
    },
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-16">
      <div role="radiogroup" aria-label="Membership type" className="grid content-start gap-6 sm:grid-cols-2 lg:grid-cols-1">
        {options.map((o) => {
          const active = type === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setType(o.key)}
              className="text-left transition-transform duration-300 hover:-translate-y-1"
              style={{ rotate: `${active ? 0 : o.rotate}deg` }}
            >
              <StickyNote color={o.color} className={cn("transition-all", active ? "ring-2 ring-ink ring-offset-4 ring-offset-paper" : "opacity-80")}>
                {active ? <Pin className="right-4 top-3" color="pin-charcoal" /> : null}
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn("grid size-5 place-items-center rounded-full border-2 border-ink", active && "bg-ink")}
                  >
                    {active ? <span className="size-1.5 rounded-full bg-paper" /> : null}
                  </span>
                  <span className="font-hand text-[1.9rem] leading-none text-ink">{o.title}</span>
                </span>
                <span className="mt-3 block text-[0.95rem] leading-snug text-charcoal">{o.text}</span>
              </StickyNote>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: -40, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -1.5 }}
              className="paper-card mx-auto max-w-lg px-8 py-14 text-center"
              role="status"
            >
              <Tape color="tape-sage" className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
              <p className="font-hand text-5xl text-sage-deep">Got it!</p>
              <p className="mt-4 text-lg text-charcoal">
                Thank you for applying. Someone from the team will reach out by email or phone soon.
              </p>
              <button type="button" className="btn btn-ghost btn-sm mt-8" onClick={() => setDone(false)}>
                Send another application
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 30, rotate: 3 }}
              onSubmit={onSubmit}
              noValidate
              className="notebook paper-card relative px-6 pb-10 pt-12 sm:pl-16 sm:pr-10"
              aria-label={`${type === "permanent" ? "Permanent" : "Honorary"} membership application`}
            >
              <Pin className="left-1/2 top-4 -translate-x-1/2" />
              <p className="font-hand text-3xl text-ink">
                Applying as <span className="text-sage-deep">{type === "permanent" ? "a permanent" : "an honorary"} member</span>
              </p>

              {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
              <div aria-hidden className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
              </div>

              <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                <Field id="join-fullName" label="Full name" error={errors.fullName} className="sm:col-span-2">
                  <input {...a11y("fullName")} autoComplete="name" maxLength={80} required />
                </Field>
                <Field id="join-dob" label="Date of birth" error={errors.dob}>
                  <input {...a11y("dob")} type="date" autoComplete="bday" required max={new Date().toISOString().slice(0, 10)} />
                </Field>
                <Field id="join-education" label="Education" error={errors.education}>
                  <select {...a11y("education")} required>
                    <option value="" disabled>
                      Choose…
                    </option>
                    {educationLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="join-institution" label="School / college / university" error={errors.institution} hint="Optional">
                  <input {...a11y("institution")} maxLength={120} autoComplete="organization" />
                </Field>
                <Field id="join-city" label="City" error={errors.city}>
                  <input {...a11y("city")} maxLength={60} autoComplete="address-level2" required />
                </Field>
                <Field id="join-email" label="Email" error={errors.email}>
                  <input {...a11y("email")} type="email" autoComplete="email" maxLength={120} required />
                </Field>
                <Field id="join-phone" label="Phone / WhatsApp" error={errors.phone}>
                  <input {...a11y("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="03xx xxxxxxx" maxLength={20} required />
                </Field>
                {type === "honorary" ? (
                  <Field
                    id="join-expertise"
                    label="Your field or affiliation"
                    error={errors.expertise}
                    className="sm:col-span-2"
                  >
                    <input {...a11y("expertise")} maxLength={200} placeholder="e.g. Doctor at DHQ Skardu, artist, teacher…" />
                  </Field>
                ) : null}
                <Field
                  id="join-reason"
                  label="Why do you want to join?"
                  error={errors.reason}
                  hint={`${values.reason.length}/1000`}
                  className="sm:col-span-2"
                >
                  <textarea {...a11y("reason")} rows={5} maxLength={1000} required className="field resize-y leading-[36px]" />
                </Field>
              </div>

              {message ? (
                <p role="alert" className="mt-6 rounded-lg bg-blush/40 px-4 py-3 text-sm text-ink">
                  {message}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xs text-xs leading-snug text-muted">
                  We only use these details to contact you about joining. They&apos;re never shared or published.
                </p>
                <button type="submit" className="btn btn-primary" disabled={pending}>
                  {pending ? "Sending…" : "Send my application"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
