import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pin, Polaroid, StickyNote } from "@/components/craft";
import { Reveal } from "@/components/motion/Reveal";
import { Gallery } from "@/components/sections/Gallery";
import { EventCard } from "@/components/sections/Works";
import { ArrowIcon, LocationIcon } from "@/components/site/icons";
import { Paragraphs } from "@/components/site/Section";
import { getEventBySlug, getEvents } from "@/lib/data";
import { formatDate, noteColor, tilt } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Not found" };
  const cover = event.cover.url.startsWith("https://res.cloudinary.com/")
    ? event.cover.url.replace("/upload/", "/upload/c_fill,w_1200,h_630,f_jpg,q_auto/")
    : event.cover.url || undefined;
  return {
    title: event.title,
    description: event.summary || `What happened at ${event.title}.`,
    openGraph: cover ? { images: [{ url: cover, width: 1200, height: 630, alt: event.title }] } : undefined,
  };
}

export default async function EventPage({ params }: PageProps<"/works/[slug]">) {
  const { slug } = await params;
  const [event, events] = await Promise.all([getEventBySlug(slug), getEvents()]);
  if (!event) notFound();
  const more = events.filter((e) => e.id !== event.id).slice(0, 2);

  return (
    <article>
      {/* Header */}
      <header className="grid-paper px-5 pb-20 pt-32 md:px-8 md:pt-40">
        <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href="/#works" className="eyebrow inline-flex items-center gap-2 hover:text-ink">
              <ArrowIcon width={14} height={14} className="rotate-180" /> All works
            </Link>
            <h1 className="mt-6 text-balance text-[clamp(2.4rem,6vw,4.8rem)] leading-[1] text-ink">{event.title}</h1>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="stamp -rotate-2 text-sage-deep">{formatDate(event.date, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
              {event.location ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm text-charcoal ring-1 ring-line">
                  <LocationIcon width={15} height={15} /> {event.location}
                </span>
              ) : null}
            </div>
            {event.summary ? <p className="mt-7 max-w-xl text-xl leading-relaxed text-charcoal">{event.summary}</p> : null}
          </div>
          <Reveal variant="drop" rotate={3} className="mx-auto w-full max-w-sm">
            <Polaroid image={event.cover} aspect="aspect-[4/5]" tape="tape-blush" sizes="(max-width: 768px) 85vw, 400px" fallbackLabel={event.title} priority />
          </Reveal>
        </div>
      </header>

      {/* Story */}
      {event.story ? (
        <section className="px-5 py-20 md:px-8 md:py-28" aria-labelledby="story-title">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[220px_1fr]">
            <div>
              <p className="eyebrow">01 — The story</p>
              <h2 id="story-title" className="mt-3 text-3xl text-ink">What happened</h2>
            </div>
            <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-charcoal">
              <Paragraphs text={event.story} firstClassName="text-2xl leading-snug text-ink font-display" />
            </div>
          </div>
        </section>
      ) : null}

      {/* Voices */}
      {event.testimonials.length ? (
        <section className="bg-paper-2/60 px-5 py-20 md:px-8 md:py-28" aria-labelledby="voices-title">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-center">02 — Voices</p>
            <h2 id="voices-title" className="mt-3 text-center text-4xl text-ink md:text-5xl">
              What locals <em className="text-sage-deep">said.</em>
            </h2>
            <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {event.testimonials.map((t, i) => (
                <li key={i}>
                  <Reveal variant="drop" rotate={tilt(i, 1.2)} delay={i * 0.07} lift>
                    <StickyNote color={noteColor(i)} className="pt-9">
                      <Pin className="left-1/2 top-2.5 -translate-x-1/2" color={i % 2 ? "pin-blush" : ""} />
                      <blockquote className="font-hand text-[1.65rem] leading-[1.15] text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                      <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-charcoal">
                        — {t.name}
                        {t.role ? `, ${t.role}` : ""}
                      </p>
                    </StickyNote>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {event.media.length ? (
        <section className="px-5 py-20 md:px-8 md:py-28" aria-labelledby="gallery-title">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow text-center">03 — Gallery</p>
            <h2 id="gallery-title" className="mb-14 mt-3 text-center text-4xl text-ink md:text-5xl">
              Moments from the day.
            </h2>
            <Gallery media={event.media} title={event.title} />
          </div>
        </section>
      ) : null}

      {more.length ? (
        <section className="border-t border-line px-5 py-20 md:px-8" aria-labelledby="more-title">
          <div className="mx-auto max-w-6xl">
            <h2 id="more-title" className="mb-10 text-3xl text-ink">More of our work</h2>
            <ul className="grid gap-10 md:grid-cols-2">
              {more.map((e, i) => (
                <li key={e.id}>
                  <EventCard event={e} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
