import type { Metadata } from "next";
import Link from "next/link";
import { COLOR, CONTACT, FONT_BODY, FONT_HEAD, ROUTES, SOCIALS } from "@/lib/site";
import PageHero from "@/components/site/PageHero";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Liên hệ | PawLife",
  description: "Liên hệ đội ngũ PawLife để được hỗ trợ về ứng dụng, thẻ QR, nhận nuôi và hợp tác trạm cứu hộ.",
  alternates: { canonical: ROUTES.contact },
};

const INFO = [
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: "Điện thoại", value: CONTACT.phone, href: CONTACT.phoneHref },
  { label: "Địa chỉ", value: CONTACT.address },
  { label: "Giờ làm việc", value: CONTACT.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Liên hệ" title="Chúng tôi luôn sẵn sàng lắng nghe" desc="Có câu hỏi về app, thẻ QR hay muốn đồng hành cùng PawLife? Hãy để lại lời nhắn, chúng tôi sẽ phản hồi trong 1–2 ngày làm việc." />
      <div className="mx-auto grid w-full max-w-[1000px] gap-8 px-4 lg:grid-cols-[360px_1fr]">
        <div className="flex flex-col gap-4">
          {INFO.map((i) => (
            <div key={i.label} className="rounded-[20px] border bg-white p-5" style={{ borderColor: COLOR.line, boxShadow: "0 10px 30px rgba(0,0,0,.03)" }}>
              <p style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 800, letterSpacing: 1, color: COLOR.faint }}>{i.label.toUpperCase()}</p>
              {i.href ? <a href={i.href} className="hover:text-[#F09E5B]" style={{ fontSize: 15, fontWeight: 600, color: COLOR.ink, textDecoration: "none", fontFamily: FONT_BODY }}>{i.value}</a>
                : <p style={{ fontSize: 15, fontWeight: 600, color: COLOR.ink }}>{i.value}</p>}
            </div>
          ))}
          <div className="rounded-[20px] p-5" style={{ background: COLOR.brandSoft }}>
            <p style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 14, color: COLOR.ink }}>Cần trợ giúp nhanh?</p>
            <p style={{ fontSize: 13, color: COLOR.body, lineHeight: 1.6, margin: "4px 0 10px" }}>Nhiều câu hỏi đã có sẵn câu trả lời trong Trung tâm hỗ trợ.</p>
            <Link href={ROUTES.support} style={{ color: COLOR.brand, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Xem trung tâm hỗ trợ →</Link>
          </div>
          <div className="flex gap-4" style={{ fontSize: 14, fontWeight: 600 }}>
            <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer" style={{ color: COLOR.purple, textDecoration: "none" }}>Facebook</a>
            <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" style={{ color: COLOR.purple, textDecoration: "none" }}>Instagram</a>
          </div>
        </div>
        <div className="rounded-[24px] border bg-white p-6 lg:p-9" style={{ borderColor: COLOR.line, boxShadow: "0 10px 30px rgba(0,0,0,.03)" }}>
          <ContactForm />
        </div>
      </div>
    </>
  );
}