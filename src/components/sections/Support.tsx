import { Pin, StickyNote } from "@/components/craft";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppIcon } from "@/components/site/icons";
import { Section } from "@/components/site/Section";
import { SectionHeader } from "@/components/site/SectionHeader";
import type { BankAccount, Site } from "@/lib/schemas";
import { tilt } from "@/lib/utils";
import { BankCard } from "./BankCard";

export function Support({ accounts, site }: { accounts: BankAccount[]; site: Site }) {
  const wa = site.whatsapp.replace(/\D/g, "");
  return (
    <Section id="support">
      <SectionHeader
        number={7}
        label="Support"
        eyebrow="Fuel the work"
        title={
          <>
            Chip in, <em className="text-sage-deep">directly.</em>
          </>
        }
        intro={
          site.support.intro ||
          "Every rupee goes into materials, transport and workshop supplies. Transfer directly to one of our accounts below."
        }
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
        {accounts.length ? (
          <ul className="grid gap-8 md:grid-cols-2">
            {accounts.map((a, i) => (
              <li key={a.id}>
                <Reveal rotate={tilt(i, 0.4)} delay={i * 0.08} className="h-full">
                  <BankCard account={a} index={i} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-hand text-2xl text-muted">Account details will be posted here soon.</p>
        )}

        <Reveal variant="drop" rotate={2.5} className="mx-auto w-full max-w-xs">
          <StickyNote color="sticky-butter" className="pt-8">
            <Pin className="left-1/2 top-2 -translate-x-1/2" color="pin-blush" />
            <p className="font-hand text-[1.7rem] leading-none text-ink">Good to know</p>
            <ul className="mt-4 space-y-3 text-[0.95rem] leading-snug text-charcoal">
              <li>✿ This website never takes payments or asks for card details.</li>
              <li>✿ Only send money to the accounts listed here.</li>
              <li>✿ Send us your receipt so we can thank you properly.</li>
            </ul>
            {wa ? (
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi! I just sent a donation to Catalyst Collective.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm mt-6 w-full"
              >
                <WhatsAppIcon width={16} height={16} /> Send receipt
              </a>
            ) : site.contactEmail ? (
              <a href={`mailto:${site.contactEmail}?subject=Donation%20receipt`} className="btn btn-primary btn-sm mt-6 w-full">
                Email receipt
              </a>
            ) : null}
          </StickyNote>
        </Reveal>
      </div>
    </Section>
  );
}
