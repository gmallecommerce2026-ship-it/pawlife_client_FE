import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import { COLOR, FONT_BODY } from "@/lib/site";
import { FooterSection, HeaderSection } from "../page";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col" style={{ background: "#fff", fontFamily: FONT_BODY }}>
      <style>{`html{scroll-behavior:smooth}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}a:focus-visible,button:focus-visible,summary:focus-visible{outline:2px solid ${COLOR.brand};outline-offset:3px;border-radius:8px}`}</style>
      <HeaderSection />
      <main className="flex-1">{children}</main>
      <FooterSection />
    </div>
  );
}