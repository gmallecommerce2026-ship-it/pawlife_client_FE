import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { ANDROID_APP_URL, COLOR, CONTACT, FONT_BODY, FONT_HEAD, IOS_APP_URL, ROUTES } from "@/lib/site";

const COLS = [
  { title: "Khám phá", links: [["Về chúng tôi", "/#about"], ["Thẻ QR", "/#qr"], ["Nhận nuôi", ROUTES.pets], ["Trạm cứu hộ", ROUTES.shelters]] },
  { title: "Hỗ trợ", links: [["Trung tâm hỗ trợ", ROUTES.support], ["Liên hệ", ROUTES.contact], ["Xóa tài khoản", ROUTES.deleteAccount]] },
  { title: "Pháp lý", links: [["Điều khoản sử dụng", ROUTES.terms], ["Chính sách bảo mật", ROUTES.privacy]] },
];

export default function SiteFooter() {
  const a: React.CSSProperties = { color: COLOR.body, fontSize: 14, textDecoration: "none", fontFamily: FONT_BODY };
  return (
    <footer className="mt-[80px] w-full bg-[#F8F9FA] px-6 pb-8 pt-16 lg:px-[60px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 lg:flex-row lg:justify-between">
        <div className="max-w-[320px]">
          <BrandLogo size={36} fontSize={24} />
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.7, color: COLOR.muted, fontFamily: FONT_BODY }}>Dự án phi lợi nhuận kết nối trạm cứu hộ với những gia đình yêu động vật.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[["App Store", IOS_APP_URL], ["Google Play", ANDROID_APP_URL]].map(([l, h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ background: COLOR.ink, color: "#fff", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: FONT_HEAD, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
        <nav aria-label="Liên kết chân trang" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:gap-16">
          {COLS.map((c) => (
            <div key={c.title} className="flex flex-col gap-3">
              <p style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: COLOR.ink }}>{c.title}</p>
              {c.links.map(([l, h]) => <Link key={h} href={h} style={a} className="hover:text-[#F09E5B]">{l}</Link>)}
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-[1200px] flex-col justify-between gap-2 border-t pt-6 sm:flex-row" style={{ borderColor: COLOR.border }}>
        <p style={{ fontSize: 13, color: COLOR.muted, fontFamily: FONT_BODY }}>© {new Date().getFullYear()} PawLife. Bảo lưu mọi quyền.</p>
        <a href={`mailto:${CONTACT.email}`} style={{ ...a, fontSize: 13 }}>{CONTACT.email}</a>
      </div>
    </footer>
  );
}