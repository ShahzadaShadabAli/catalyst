import Image from "next/image";
import { Tape } from "@/components/craft";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeader } from "@/components/site/SectionHeader";
import type { Supporter } from "@/lib/schemas";
import { tapeColor, tilt } from "@/lib/utils";

function Logo({ s }: { s: Supporter }) {
  if (!s.logo.url) return <span className="font-display text-2xl leading-tight text-ink">{s.name}</span>;
  const isCloudinary = s.logo.url.startsWith("https://res.cloudinary.com/");
  return (
    <span className="relative block h-16 w-full">
      <Image
        src={isCloudinary ? s.logo.url.replace("/upload/", "/upload/f_auto,q_auto,h_160,c_fit/") : s.logo.url}
        alt={s.logo.alt || s.name}
        fill
        sizes="200px"
        unoptimized={isCloudinary}
        className="object-contain"
      />
    </span>
  );
}

export function Supporters({ supporters }: { supporters: Supporter[] }) {
  if (!supporters.length) return null;
  return (
    <Section id="supporters" className="bg-paper-2/60">
      <SectionHeader number={9} label="Supported by" eyebrow="With gratitude" title="The people backing us." />
      <ul className="flex flex-wrap justify-center gap-8">
        {supporters.map((s, i) => {
          const card = (
            <div className="paper-card flex h-full w-64 flex-col items-center justify-center gap-3 px-6 pb-6 pt-8 text-center transition-shadow hover:shadow-[var(--shadow-lift)]">
              <Tape color={tapeColor(i + 2)} className="-top-3 left-1/2 w-20 -translate-x-1/2 -rotate-3" />
              <Logo s={s} />
              {s.logo.url ? <p className="font-semibold text-ink">{s.name}</p> : null}
              {s.blurb ? <p className="text-sm leading-snug text-muted">{s.blurb}</p> : null}
            </div>
          );
          return (
            <li key={s.id}>
              <Reveal variant="drop" rotate={tilt(i, 0.7)} delay={i * 0.06} lift className="h-full">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                    {card}
                  </a>
                ) : (
                  card
                )}
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
