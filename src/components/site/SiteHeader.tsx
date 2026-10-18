'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { COLOR, FONT_BODY, ROUTES } from "@/lib/site";

const LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Về chúng tôi", href: "/#about" },
  { label: "Thẻ QR", href: "/#qr" },
  { label: "Nhận nuôi", href: ROUTES.pets },
  { label: "Hỗ trợ", href: ROUTES.support },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open]);

  const glass = scrolled || open;
  const link: React.CSSProperties = { fontFamily: FONT_BODY, fontSize: 15, fontWeight: 500, color: "#1e1e1e", textDecoration: "none" };
  const cta: React.CSSProperties = { backgroundColor: COLOR.brand, color: "#fff", padding: "9px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: FONT_BODY, textDecoration: "none", boxShadow: "0 12px 30px rgba(240,158,91,0.3)" };

  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: glass ? 1 : 0, transition: "opacity .35s", background: "linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.52))", backdropFilter: "blur(18px) saturate(180%)", WebkitBackdropFilter: "blur(18px) saturate(180%)", borderBottom: "1px solid rgba(255,255,255,.65)", boxShadow: "0 8px 32px rgba(31,38,135,.08)" }} />
      <div className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 lg:px-10 xl:px-16" style={{ paddingTop: scrolled ? 10 : 20, paddingBottom: 10, transition: "padding .35s" }}>
        <BrandLogo />
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => <Link key={l.href} href={l.href} style={link} className="transition-colors hover:text-[#F09E5B]">{l.label}</Link>)}
          <Link href={ROUTES.contact} style={cta} className="transition hover:-translate-y-0.5">Liên hệ</Link>
        </nav>
        <button type="button" aria-label={open ? "Đóng menu" : "Mở menu"} aria-expanded={open} aria-controls="info-mobile-menu" className="p-1 lg:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: COLOR.ink }} onClick={() => setOpen((v) => !v)}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></> : <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="info-mobile-menu" aria-label="Menu di động" className="relative mx-3 mb-2 flex flex-col rounded-2xl p-4 lg:hidden" style={{ background: "rgba(255,255,255,.88)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 12px 32px rgba(0,0,0,.08)" }}>
          {[...LINKS, { label: "Liên hệ", href: ROUTES.contact }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ ...link, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{l.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}