import Link from "next/link";
import { Photo, StickyNote, Tape } from "@/components/craft";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon, LocationIcon } from "@/components/site/icons";
import { Section } from "@/components/site/Section";
import { SectionHeader } from "@/components/site/SectionHeader";
import type { Event } from "@/lib/schemas";
import { cn, formatDate, tapeColor, tilt } from "@/lib/utils";

export function EventCard({ event, index, featured }: { event: Event; index: number; featured?: boolean }) {
  const photos = event.media.filter((m) => m.kind === "image").length;
  const videos = event.media.length - photos;
  return (
    <Link href={`/works/${event.slug}`} className="group block h-full focus-visible:outline-offset-8">
      <article className="paper-card flex h-full flex-col p-3 pb-6 transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]">
        <Tape color={tapeColor(index + 1)} className="-top-3 left-8 -rotate-6" />
        <div className={cn("relative overflow-hidden bg-paper-2", featured ? "aspect-[16/10]" : "aspect-[4/3]")}>
          <Photo
            image={event.cover}
            sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            fallbackLabel={event.title}
            className="transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <span className="stamp absolute bottom-3 left-3 rotate-[-4deg] bg-card/90 text-ink">
            {formatDate(event.date)}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-3 pt-5">
          <h3 className={cn("leading-tight text-ink", featured ? "text-3xl md:text-4xl" : "text-2xl")}>{event.title}</h3>
          {event.location ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <LocationIcon width={15} height={15} /> {event.location}
            </p>
          ) : null}
          {event.summary ? <p className="mt-3 leading-relaxed text-charcoal">{event.summary}</p> : null}
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              {[
                event.testimonials.length && `${event.testimonials.length} voices`,
                photos && `${photos} photos`,
                videos && `${videos} video${videos > 1 ? "s" : ""}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-sage-deep">
              Read the story
              <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function Works({ events }: { events: Event[] }) {
  return (
    <Section id="works" className="bg-paper-2/60">
      <SectionHeader
        number={5}
        label="Works"
        eyebrow="What we've been up to"
        title={
          <>
            Small projects, <em className="text-sage-deep">big hearts.</em>
          </>
        }
        intro="Clean-ups, workshops and gatherings. Here's what happened, and what our neighbours said about it."
      />
      {events.length ? (
        <ul className={cn("grid gap-10 md:grid-cols-2", events.length > 2 ? "lg:grid-cols-3" : "mx-auto max-w-4xl")}>
          {events.map((e, i) => (
            <li key={e.id} className={cn(i === 0 && events.length > 2 && "lg:col-span-2")}>
              <Reveal rotate={tilt(i, 0.5)} delay={(i % 3) * 0.08} lift className="h-full">
                <EventCard event={e} index={i} featured={i === 0 && events.length > 2} />
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <StickyNote className="mx-auto max-w-sm rotate-2 text-center font-hand text-2xl">
          Our first project story is being written. Check back soon!
        </StickyNote>
      )}
    </Section>
  );
}
