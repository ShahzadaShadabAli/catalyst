import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { getSite } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <Nav />
      <main id="main">{children}</main>
      <Footer site={site} />
      <div aria-hidden className="grain" />
    </>
  );
}
