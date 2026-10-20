import { Polaroid } from "@/components/craft";
import { Reveal } from "@/components/motion/Reveal";
import { Paragraphs, Section } from "@/components/site/Section";
import { SectionHeader } from "@/components/site/SectionHeader";
import type { ImageRef, Site } from "@/lib/schemas";
import { cn, tapeColor, tilt } from "@/lib/utils";

const FALLBACK_CAPTIONS = ["where it began", "day one", "the first meetup"];

export function Origin({ site }: { site: Site }) {
  const { origin } = site;
  const images: (ImageRef & { caption?: string })[] = origin.images.length
    ? origin.images
    : FALLBACK_CAPTIONS.map((c) => ({ url: "", alt: "", caption: c }));

  return (
    <Section id="origin">
      <SectionHeader
        number={1}
        label="Origin"
        align="left"
        eyebrow="How it started"
        title={origin.title || "It started with a few girls and one big question."}
      />
      <div className="grid gap-16 md:grid-cols-[1fr_1.05fr] md:gap-12">
        <Reveal className="space-y-5 text-lg leading-relaxed text-charcoal">
          {origin.text ? (
            <Paragraphs
              text={origin.text}
              firstClassName="text-xl text-ink md:text-2xl md:leading-snug first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-sage-deep"
            />
          ) : (
            <p>Our story is being written. Check back soon.</p>
          )}
          <p className="pt-4 font-hand text-2xl text-sage-deep">— and we&apos;re only getting started.</p>
        </Reveal>

        <div className="relative grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-8">
          {images.slice(0, 5).map((img, i) => (
            <Reveal
              key={i}
              variant="drop"
              rotate={tilt(i, 1.4)}
              delay={i * 0.08}
              lift
              className={cn(i % 2 === 1 && "translate-y-10", images.length % 2 === 1 && i === images.length - 1 && "col-span-2 mx-auto w-1/2")}
            >
              <Polaroid
                image={img.url ? img : null}
                caption={"caption" in img ? img.caption : img.alt || undefined}
                tape={tapeColor(i)}
                sizes="(max-width: 768px) 45vw, 260px"
              />
            </Reveal>
          ))}
          <svg
            aria-hidden
            viewBox="0 0 120 80"
            className="pointer-events-none absolute -left-10 -top-14 hidden h-20 w-28 text-sage-deep md:block"
            fill="none"
          >
            <path d="M8 10c30-6 66 2 84 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" />
            <path d="m82 44 10 8 3-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Section>
  );
}
