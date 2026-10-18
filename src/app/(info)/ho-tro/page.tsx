import type { Metadata } from "next";
import Link from "next/link";
import { COLOR, FONT_BODY, FONT_HEAD, HEADER_HEIGHT, ROUTES } from "@/lib/site";
import { FAQ_GROUPS } from "@/components/site/FAQData";
import PageHero from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Trung tâm hỗ trợ & Hỏi đáp | PawLife",
  description: "Giải đáp về tài khoản, thẻ QR, chế độ lạc, nhận nuôi và cách xóa tài khoản PawLife.",
  alternates: { canonical: ROUTES.support },
};

const QUICK = [
  { title: "Xóa tài khoản", desc: "Hướng dẫn xóa tài khoản và dữ liệu", href: ROUTES.deleteAccount },
  { title: "Liên hệ hỗ trợ", desc: "Gửi câu hỏi cho đội ngũ PawLife", href: ROUTES.contact },
  { title: "Chính sách bảo mật", desc: "Cách chúng tôi xử lý dữ liệu", href: ROUTES.privacy },
];

export default function SupportPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow="Hỗ trợ" title="Chúng tôi có thể giúp gì cho bạn?" desc="Tìm câu trả lời nhanh cho các câu hỏi thường gặp về PawLife." />
      <div className="mx-auto w-full max-w-[860px] px-4">
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="rounded-[20px] border bg-white p-5 transition hover:-translate-y-1" style={{ borderColor: COLOR.line, boxShadow: "0 10px 30px rgba(0,0,0,.03)", textDecoration: "none" }}>
              <p style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 15, color: COLOR.ink }}>{q.title}</p>
              <p style={{ fontSize: 13, color: COLOR.muted, marginTop: 4, lineHeight: 1.5 }}>{q.desc}</p>
            </Link>
          ))}
        </div>

        {FAQ_GROUPS.map((g) => (
          <section key={g.id} id={g.id} style={{ scrollMarginTop: HEADER_HEIGHT + 16, marginBottom: 40 }}>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 700, color: COLOR.ink, marginBottom: 14 }}>{g.title}</h2>
            {g.items.map((it) => (
              <details key={it.q} className="group mb-3 overflow-hidden rounded-xl border bg-white open:shadow-[0_4px_15px_rgba(0,0,0,0.03)]" style={{ borderColor: COLOR.border }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 700, color: COLOR.ink, lineHeight: 1.4 }}>{it.q}</span>
                  <svg className="shrink-0 transition-transform group-open:rotate-180" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <div className="px-6 pb-5">
                  <p style={{ fontFamily: FONT_BODY, fontSize: 15, lineHeight: 1.65, color: COLOR.muted }}>{it.a}</p>
                  {it.link && <Link href={it.link.href} style={{ display: "inline-block", marginTop: 10, color: COLOR.brand, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{it.link.label} →</Link>}
                </div>
              </details>
            ))}
          </section>
        ))}

        <p className="text-center" style={{ fontSize: 14, color: COLOR.muted }}>
          Không tìm thấy câu trả lời? <Link href={ROUTES.contact} style={{ color: COLOR.brand, fontWeight: 700 }}>Liên hệ chúng tôi</Link>
        </p>
      </div>
    </>
  );
}