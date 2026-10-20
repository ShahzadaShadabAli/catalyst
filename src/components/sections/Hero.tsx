import Link from "next/link";
import { Polaroid, StickyNote, Tape } from "@/components/craft";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/site/icons";
import type { Event, Site } from "@/lib/schemas";
import { HeroTitle } from "./HeroTitle";

const RIBBON = ["clean-up drives", "skill workshops", "awareness sessions", "art & craft", "community care", "girls who lead"];

export function Hero({ site, latest }: { site: Site; latest?: Event }) {
  const { hero } = site;
  return (
    <section className="grid-paper relative overflow-hidden pt-28 md:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 md:grid-cols-[1.2fr_1fr] md:px-8 md:pb-28">
        <div>
          <Reveal variant="fade">
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block size-2 rounded-full bg-sage" />
              {hero.eyebrow || "Est. Skardu · Gilgit-Baltistan"}
            </p>
          </Reveal>
          <div className="mt-6">
            <HeroTitle
              line1={hero.titleLine1 || "Empowering people."}
              line2={hero.titleLine2 || "Transforming communities."}
            />
          </div>
          {hero.subtitle ? (
            <Reveal delay={0.5} variant="fade">
              <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-charcoal md:text-xl">{hero.subtitle}</p>
            </Reveal>
          ) : null}
          <Reveal delay={0.65} variant="fade">
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/#join" className="btn btn-primary">
                Join the collective <ArrowIcon width={18} height={18} />
              </Link>
              <Link href="/#works" className="btn btn-ghost">
                See our work
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Collage */}
        <div className="relative mx-auto h-[400px] w-full max-w-[440px] sm:h-[460px] md:h-[540px]">
          <Parallax speed={24} className="absolute left-[6%] top-[4%] z-10 w-[68%]">
            <Reveal variant="drop" rotate={-4} delay={0.35}>
              <Polaroid
                image={{ url: "/brand/logo-round.png", alt: "Catalyst Collective logo" }}
                caption="the collective ✿"
                aspect="aspect-square"
                sizes="(max-width: 768px) 70vw, 320px"
                tape="tape-sage"
                priority
              />
            </Reveal>
          </Parallax>

          <Parallax speed={60} className="absolute right-0 top-0 z-20 w-[44%]">
            <Reveal variant="drop" rotate={7} delay={0.6}>
              <StickyNote color="sticky-blush" className="font-hand text-[1.45rem] leading-tight text-ink">
                <Tape color="tape-gingham" className="-top-3 left-6 w-16 rotate-[-8deg]" />
                girls who get things done
              </StickyNote>
            </Reveal>
          </Parallax>

          {latest ? (
            <Parallax speed={40} className="absolute bottom-[2%] right-[2%] z-20 w-[40%]">
              <Reveal variant="drop" rotate={6} delay={0.8}>
                <Link href={`/works/${latest.slug}`} aria-label={`Latest: ${latest.title}`}>
                  <Polaroid
                    image={latest.cover}
                    caption="latest!"
                    small
                    aspect="aspect-[4/5]"
                    sizes="180px"
                    tape="tape-butter"
                    fallbackLabel={latest.title}
                  />
                </Link>
              </Reveal>
            </Parallax>
          ) : null}

          <Parallax speed={18} className="absolute bottom-[8%] left-0 z-30">
            <Reveal variant="fade" rotate={-9} delay={1}>
              <span className="stamp bg-paper/70 text-sage-deep">{site.location ? site.location.split(",")[0] : "Skardu"} · GB</span>
            </Reveal>
          </Parallax>
        </div>
      </div>

      {/* Taped ribbon marquee */}
      <div className="relative -mb-4 -rotate-[1.6deg] border-y border-ink/10 bg-kraft/80 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,.5)]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1} className="flex shrink-0 items-center">
              {RIBBON.map((r) => (
                <li key={r} className="flex items-center gap-6 px-6 font-mono text-sm uppercase tracking-[0.2em] text-ink/80">
                  {r} <span className="text-sage-deep">✿</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
