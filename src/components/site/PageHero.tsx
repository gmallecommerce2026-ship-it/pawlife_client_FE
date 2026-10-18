import { COLOR, FONT_BODY, FONT_HEAD } from "@/lib/site";

export default function PageHero({ eyebrow, title, desc, children }: { eyebrow: string; title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <section className="relative px-4 pb-10 pt-[130px] text-center lg:pt-[150px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(to right,#f3f4f6 1px,transparent 1px),linear-gradient(to bottom,#f3f4f6 1px,transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse at center,#000 30%,transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center,#000 30%,transparent 75%)" }} />
      <p style={{ color: COLOR.brand, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: FONT_HEAD }}>{eyebrow}</p>
      <h1 style={{ color: COLOR.ink, fontSize: "clamp(30px,5vw,48px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-1px", fontFamily: FONT_HEAD }}>{title}</h1>
      {desc && <p className="mx-auto" style={{ maxWidth: 560, marginTop: 16, color: COLOR.muted, fontSize: 15, lineHeight: 1.7, fontFamily: FONT_BODY }}>{desc}</p>}
      {children}
    </section>
  );
}