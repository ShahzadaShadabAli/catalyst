import { Hero } from "@/components/sections/Hero";
import { JoinForm } from "@/components/sections/JoinForm";
import { Leadership } from "@/components/sections/Leadership";
import { MembersWall } from "@/components/sections/Members";
import { Mission } from "@/components/sections/Mission";
import { NotesCarousel } from "@/components/sections/Notes";
import { Origin } from "@/components/sections/Origin";
import { Support } from "@/components/sections/Support";
import { Supporters } from "@/components/sections/Supporters";
import { Works } from "@/components/sections/Works";
import { Section } from "@/components/site/Section";
import { SectionHeader } from "@/components/site/SectionHeader";
import {
  getBankAccounts,
  getEvents,
  getLeaders,
  getMembers,
  getNotes,
  getSite,
  getSupporters,
} from "@/lib/data";

// Static page, refreshed instantly when an admin edits content (and hourly as a fallback).
export const revalidate = 3600;

export default async function HomePage() {
  const [site, leaders, members, events, notes, accounts, supporters] = await Promise.all([
    getSite(),
    getLeaders(),
    getMembers(),
    getEvents(),
    getNotes(),
    getBankAccounts(),
    getSupporters(),
  ]);
  const place = site.location ? `${site.location.split(",")[0]}, GB` : "Skardu, GB";

  return (
    <>
      <Hero site={site} latest={events[0]} />
      <Origin site={site} />
      <Mission site={site} />
      <Leadership leaders={leaders} />

      <Section id="members" className="pt-0 md:pt-0">
        <SectionHeader
          number={4}
          label="Members"
          eyebrow="The whole crew"
          title={
            <>
              Many hands, <em className="text-sage-deep">one board.</em>
            </>
          }
        />
        <MembersWall members={members} />
      </Section>

      <Works events={events} />

      {notes.length ? (
        <Section id="note">
          <SectionHeader number={6} label="A note" eyebrow="From the leadership" title="Why we started this." />
          <NotesCarousel notes={notes} place={place} founded={site.foundedYear} />
        </Section>
      ) : null}

      <Support accounts={accounts} site={site} />

      <Section id="join" className="grid-paper">
        <SectionHeader
          number={8}
          label="Join us"
          eyebrow="Pull up a chair"
          title={
            <>
              Two ways to <em className="text-sage-deep">join.</em>
            </>
          }
          intro="Pick the one that fits you, tell us a little about yourself, and we'll be in touch."
        />
        <JoinForm permanentText={site.join.permanentText} honoraryText={site.join.honoraryText} />
      </Section>

      <Supporters supporters={supporters} />
    </>
  );
}
