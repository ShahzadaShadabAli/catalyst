import { Pin, Polaroid, StickyNote } from "@/components/craft";
import { Reveal } from "@/components/motion/Reveal";
import { Paragraphs, Section } from "@/components/site/Section";
import { SectionHeader } from "@/components/site/SectionHeader";
import type { Site } from "@/lib/schemas";
import { noteColor, tilt } from "@/lib/utils";

export function Mission({ site }: { site: Site }) {
  const { mission } = site;
  return (
    <Section id="mission" className="bg-paper-2/60">
      <SectionHeader number={2} label="Mission" eyebrow="Why we exist" title="Our mission." />

      <div className="grid items-center gap-14 md:grid-cols-[0.85fr_1.15fr]">
        <Reveal variant="drop" rotate={-3} className="mx-auto w-full max-w-sm">
          <Polaroid
            image={mission.image.url ? mission.image : null}
            caption="empowering people. transforming communities."
            aspect="aspect-square"
            tape="tape-sage"
            sizes="(max-width: 768px) 80vw, 380px"
            fallbackLabel="Catalyst Collective"
            className="[&_figcaption]:text-lg"
          />
        </Reveal>

        <Reveal rotate={1}>
          <div className="paper-card px-7 pb-9 pt-12 md:px-12 md:pb-12 md:pt-14">
            <Pin className="left-6 top-5" />
            <Pin className="right-6 top-5" color="pin-blush" />
            <p className="font-display text-2xl leading-snug text-ink md:text-[2.1rem] md:leading-[1.2]">
              {mission.title || "Give every young woman in Gilgit-Baltistan the room, the skills and the courage to lead."}
            </p>
            {mission.text ? (
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
                <Paragraphs text={mission.text} />
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>

      {mission.values.length ? (
        <ul className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mission.values.map((v, i) => (
            <li key={v.title}>
              <Reveal variant="drop" rotate={tilt(i + 2)} delay={i * 0.08} lift>
                <StickyNote color={noteColor(i)} className="min-h-44">
                  <Pin className="left-1/2 top-2 -translate-x-1/2" color={i % 2 ? "pin-charcoal" : ""} />
                  <p className="mt-3 font-mono text-xs tracking-[0.2em] text-sage-deep">0{i + 1}</p>
                  <h3 className="mt-2 font-hand text-[2rem] leading-none text-ink">{v.title}</h3>
                  {v.text ? <p className="mt-3 text-[0.95rem] leading-snug text-charcoal">{v.text}</p> : null}
                </StickyNote>
              </Reveal>
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
