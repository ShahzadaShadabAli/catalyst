import Image from "next/image";
import Link from "next/link";
import type { Site } from "@/lib/schemas";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  TikTokIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "./icons";

const EXPLORE = [
  ["/#origin", "Our origin"],
  ["/#team", "Leadership & members"],
  ["/#works", "Our works"],
  ["/#support", "Support us"],
  ["/#join", "Join the collective"],
] as const;

export function Footer({ site }: { site: Site }) {
  const wa = site.whatsapp.replace(/\D/g, "");
  const socials = [
    { href: site.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.socials.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: site.socials.youtube, label: "YouTube", Icon: YouTubeIcon },
    { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: wa ? `https://wa.me/${wa}` : "", label: "WhatsApp", Icon: WhatsAppIcon },
    { href: site.contactEmail ? `mailto:${site.contactEmail}` : "", label: "Email", Icon: MailIcon },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-10 pt-20 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-full bg-paper">
              <Image src="/brand/mark.png" alt="" width={34} height={31} className="h-auto w-[34px]" />
            </span>
            <p className="font-display text-2xl leading-tight">
              Catalyst <span className="italic text-sage-soft">Collective</span>
            </p>
          </div>
          <p className="mt-5 max-w-sm text-paper/70">
            Empowering people. Transforming communities. A teenage, women-led collective from{" "}
            {site.location || "Skardu, Gilgit-Baltistan"}.
          </p>
        </div>

        <div>
          <p className="eyebrow !text-sage-soft">Explore</p>
          <ul className="mt-4 space-y-2 text-paper/80">
            {EXPLORE.map(([href, label]) => (
              <li key={href}>
                <Link className="transition-colors hover:text-sage-soft" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-sage-soft">Say hello</p>
          {socials.length ? (
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full bg-paper/10 text-paper transition-all hover:-translate-y-1 hover:-rotate-6 hover:bg-sage hover:text-card"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-paper/60">Socials coming soon.</p>
          )}
          {site.contactEmail ? (
            <a href={`mailto:${site.contactEmail}`} className="mt-5 block break-all text-paper/80 underline-offset-4 hover:underline">
              {site.contactEmail}
            </a>
          ) : null}
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[15vw] italic leading-[0.8] tracking-tighter text-paper/[0.07]"
      >
        catalyst collective
      </p>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-paper/10 px-5 py-6 text-sm text-paper/50 sm:flex-row md:px-8">
        <p>© {new Date().getFullYear()} Catalyst Collective. Made with care in Skardu.</p>
        <Link href="/admin" className="hover:text-paper" rel="nofollow">
          Team login
        </Link>
      </div>
    </footer>
  );
}
