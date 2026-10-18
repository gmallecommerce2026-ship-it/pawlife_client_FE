import PageHero from "./PageHero";
import { COLOR, FONT_BODY, FONT_HEAD, HEADER_HEIGHT, LEGAL_UPDATED } from "@/lib/site";

export type Block = string | { list: string[] };
export type LegalSection = { id: string; title: string; blocks: Block[] };

export default function LegalLayout({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} desc={intro}>
        <p style={{ marginTop: 12, fontSize: 13, color: COLOR.faint, fontFamily: FONT_BODY }}>Cập nhật lần cuối: {LEGAL_UPDATED}</p>
      </PageHero>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-4 lg:flex-row lg:gap-16">
        <aside className="lg:w-[260px] lg:shrink-0">
          <nav aria-label="Mục lục" className="rounded-[20px] border bg-white p-5 lg:sticky" style={{ borderColor: COLOR.line, top: HEADER_HEIGHT + 16, boxShadow: "0 10px 30px rgba(0,0,0,.03)" }}>
            <p style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 800, letterSpacing: 1, color: COLOR.muted, marginBottom: 10 }}>MỤC LỤC</p>
            <ol className="flex flex-col gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {sections.map((s, i) => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:text-[#F09E5B]" style={{ fontSize: 13, color: COLOR.body, textDecoration: "none", fontFamily: FONT_BODY }}>{i + 1}. {s.title}</a></li>
              ))}
            </ol>
          </nav>
        </aside>
        <article className="min-w-0 flex-1">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} style={{ scrollMarginTop: HEADER_HEIGHT + 16, marginBottom: 36 }}>
              <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, color: COLOR.ink, marginBottom: 12 }}>{i + 1}. {s.title}</h2>
              {s.blocks.map((b, j) =>
                typeof b === "string" ? (
                  <p key={j} style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.75, color: COLOR.body, marginBottom: 12 }}>{b}</p>
                ) : (
                  <ul key={j} style={{ margin: "0 0 12px", paddingLeft: 22, listStyle: "disc" }}>
                    {b.list.map((t) => <li key={t} style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.75, color: COLOR.body, marginBottom: 4 }}>{t}</li>)}
                  </ul>
                ),
              )}
            </section>
          ))}
        </article>
      </div>
    </>
  );
}