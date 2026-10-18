'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import axiosClient from "@/lib/api/axiosClient";
import AdoptionFormModal from "@/components/adoption/AdoptionFormModal";

// ============================================================================
// 0. CẤU HÌNH & HẰNG SỐ
// ============================================================================

const IOS_APP_URL = "https://apps.apple.com/vn/app/pawlife-pet-id/id6760687982";
const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.annguyen.pawlife&hl=en";

const ROUTES = {
  scan: "/scan", qrShop: "/the-qr", pets: "/thu-cung", shelters: "/tram-cuu-ho",
  stories: "/cau-chuyen", privacy: "/chinh-sach-bao-mat", terms: "/dieu-khoan",
  contact: "/lien-he", support: "/ho-tro", deleteAccount: "/xoa-tai-khoan", signIn: "/dang-nhap"
};

const SOCIALS = { facebook: "https://facebook.com/pawlife.vn", instagram: "https://instagram.com/pawlife.vn" };
const CONTACT = { phone: "+84 901 234 567", phoneHref: "tel:+84901234567", email: "hello@pawlife.vn", address: "Quận 1, TP. Hồ Chí Minh" };

const COLOR = {
  brand: "#FBBF24", // Vàng cam chuẩn UI
  brandSoft: "#FEF3C7",
  purple: "#8B5CF6", // Tím pastel
  ink: "#111827",
  body: "#6B7280",
  muted: "#9CA3AF",
  faint: "#D1D5DB",
  line: "#F3F4F6",
  border: "#E5E7EB",
};

const FONT_HEAD = "'Be Vietnam Pro', sans-serif";
const FONT_BODY = "'Inter', 'Be Vietnam Pro', sans-serif";
const HEADER_HEIGHT = 80;

const NAV_LINKS = [
  { label: "Trang chủ", href: "#top" },
  { label: "Quét QR", href: "#qr" },
  { label: "Trạm cứu hộ", href: "#shelters" },
  { label: "Liên hệ", href: ROUTES.contact },
];

// ============================================================================
// 1. DỮ LIỆU MẪU & LOGIC XỬ LÝ DỮ LIỆU
// ============================================================================

const HERO_STATS = [
  { value: "500+", label: "Bé đã có mái ấm" },
  { value: "98%", label: "Gia đình hài lòng" },
  { value: "24/7", label: "Hỗ trợ liên tục" },
];

const ABOUT_STATS = [
  { to: 1200, suffix: "+", label: "Bé được nhận nuôi" },
  { to: 5, suffix: "+", label: "Năm hoạt động" },
  { to: 10, suffix: "", label: "Đối tác đồng hành" },
  { to: 20, suffix: "", label: "Trạm cứu hộ" },
];

type Tag = { label: string; color: string; bg: string };
type Pet = { id: string; name: string; gender: "Male" | "Female" | "Unknown"; info: string; desc: string; img: string; shelter?: string | null; tags: Tag[] };

const TAG_COLORS = [
  { color: "#16A34A", bg: "#DCFCE7" }, { color: "#3B82F6", bg: "#DBEAFE" },
  { color: "#8B5CF6", bg: "#EDE9FE" }, { color: "#D97706", bg: "#FEF3C7" },
];

const ageOf = (dob?: string | null) => {
  if (!dob) return "Chưa rõ";
  const m = Math.max(0, (Date.now() - new Date(dob).getTime()) / 2629800000);
  const y = Math.floor(m / 12);
  return y > 0 ? `${y} tuổi` : m >= 1 ? `${Math.floor(m)} tháng tuổi` : "Sơ sinh";
};

const toCard = (p: any): Pet => ({
  id: p.id, name: p.name,
  gender: /^f/i.test(p.gender || "") ? "Female" : /^m/i.test(p.gender || "") ? "Male" : "Unknown",
  info: `${ageOf(p.dob)} · ${p.breed || "Chưa rõ giống"}`,
  desc: p.description || "Bé đang chờ một mái ấm yêu thương. Rất thân thiện, trung thành và thích đi dạo.",
  img: p.image || "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&q=80",
  shelter: p.shelterName,
  tags: [
    ...(p.isVaccinated ? [{ label: "Đã tiêm phòng", ...TAG_COLORS[0] }] : []),
    ...(p.isSpayedNeutered ? [{ label: "Đã triệt sản", ...TAG_COLORS[1] }] : []),
    ...(p.traits || []).slice(0, 2).map((label: string, i: number) => ({ label, ...TAG_COLORS[(i + 2) % 4] })),
  ].slice(0, 4)
});

const MOCK_PETS: Pet[] = [
  {
    id: "1", name: "Bella", gender: "Female", info: "4 tuổi · Siberian Husky",
    desc: "Bella là một cô chó husky xinh đẹp với đôi mắt xanh biếc. Bé rất thông minh, trung thành và thích đi dạo dài. Bella phù hợp với gia đình có lối sống năng động.",
    img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&q=80",
    tags: [{ label: "Đã tiêm phòng", ...TAG_COLORS[0] }, { label: "Đã triệt sản", ...TAG_COLORS[1] }, { label: "Thân thiện", ...TAG_COLORS[2] }, { label: "Yêu trẻ em", ...TAG_COLORS[3] }]
  }
];

const MOCK_SHELTERS = [
  {
    name: "Mái Ấm Bốn Chân", location: "Hà Nội, Việt Nam", since: 2025,
    desc: "Tổ chức phi lợi nhuận chuyên cứu hộ, chăm sóc và tìm nhà mới cho thú cưng bị bỏ rơi. Chúng tôi cung cấp dịch vụ y tế và hỗ trợ hành vi để các bé sẵn sàng về nhà mới.",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
    stats: [{ v: "47", l: "Bé đang chờ" }, { v: "214", l: "Đã nhận nuôi" }, { v: "94%", l: "Tỷ lệ thành công" }]
  },
  {
    name: "Trạm Cứu Hộ Sài Gòn", location: "TP. Hồ Chí Minh, Việt Nam", since: 2023,
    desc: "Nơi trú ẩn an toàn cho động vật lang thang tại TP.HCM. Sứ mệnh của chúng tôi là chữa lành những vết thương cả về thể chất lẫn tinh thần cho các bé.",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
    stats: [{ v: "62", l: "Bé đang chờ" }, { v: "310", l: "Đã nhận nuôi" }, { v: "89%", l: "Tỷ lệ thành công" }]
  }
];

const MOCK_MYTHS = [
  { title: "Chỉ thú cưng bị bệnh mới\nở trạm cứu hộ", desc: "Thú cưng tại trạm đều được gắn vi mạch, tẩy giun, tiêm phòng và triệt sản. Mọi quy trình y tế đều được thực hiện nghiêm ngặt theo lịch trình của bác sĩ thú y.", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80" },
  { title: "Thú cưng ở trạm\nthường có vấn đề hành vi", desc: "Phần lớn các bé đến trạm do hoàn cảnh của chủ cũ (chuyển nhà, dị ứng, kinh tế) chứ không phải do tính cách của bé. Nhiều bé đã quen nếp sống trong nhà.", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80" }
];

const MOCK_JOURNEYS = [
  { name: "Nguyễn Khánh Linh", info: "Nhận nuôi qua PawLife", desc: "Từ khi có Alice xuất hiện trong đời, tinh thần mình phấn chấn hẳn lên. Mình hiểu rằng mình không còn cô đơn và luôn có một người bạn bốn chân đợi mình ở nhà. Bé trở thành chỗ dựa tinh thần của mình. Khoảnh khắc tuyệt vời nhất là khi Alice đón mình đi làm về và quấn quýt dưới chân.", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
];

const FAQS = [
  { question: "Có thể trả lại thú cưng sau khi nhận nuôi không?", answer: "Có, chính sách của chúng tôi cho phép trả lại an toàn nếu hoàn cảnh của bạn thay đổi, nhằm đảm bảo môi trường tốt nhất cho bé." },
  { question: "Làm sao nếu tôi không tìm được tiếng nói chung với bé?", answer: "Chúng tôi cung cấp sự hỗ trợ và tư vấn từ các chuyên gia hành vi động vật để giúp bạn và bé làm quen trong giai đoạn chuyển đổi." },
  { question: "Cách tự tìm chủ mới cho thú cưng lang thang?", answer: "Bạn có thể chụp ảnh bé, đăng bài kèm thông tin chi tiết lên các hội nhóm yêu động vật, diễn đàn uy tín và ứng dụng PawLife để tăng cơ hội tìm nhà cho bé." },
];

const MOCK_PARTNERS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/1200px-Slack_Technologies_Logo.svg.png"
];

const PET_STEPS = [
  { icon: "QR", title: "Kích hoạt thẻ QR", desc: "Quét mã QR trên thẻ và\nđăng ký thông tin thú cưng", color: "#8B5CF6" },
  { icon: "Doc", title: "Hoàn thiện hồ sơ", desc: "Cập nhật thông tin cơ bản,\nhồ sơ y tế của bé", color: "#FBBF24" },
  { icon: "Shield", title: "Bật bảo vệ", desc: "Đảm bảo liên hệ khẩn cấp\nluôn được cập nhật", color: "#3B82F6" },
  { icon: "CheckCircle", title: "Duy trì định danh", desc: "Vui lòng luôn đeo thẻ QR\ncho thú cưng của bạn", color: "#10B981" },
] as const;

// ============================================================================
// 2. ICONS
// ============================================================================

const Icons = {
  Male: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5" /><line x1="13.5" y1="10.5" x2="21" y2="3" /><polyline points="16 3 21 3 21 8" /></svg>,
  Female: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="6" /><line x1="12" y1="16" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>,
  Check: ({ color }: { color: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  ArrowUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>,
  ArrowRightThin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Apple: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>,
  GooglePlay: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2.8v18.4a1 1 0 0 0 1.5.86l15-9.2a1 1 0 0 0 0-1.72l-15-9.2A1 1 0 0 0 4 2.8z"/></svg>,
  QR: ({ color = "#8B5CF6" }) => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  Doc: ({ color = "#FBBF24" }) => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  Shield: ({ color = "#3B82F6" }) => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  CheckCircle: ({ color = "#10B981" }) => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Verified: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
  Dot: () => <svg width="8" height="8" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981"><circle cx="12" cy="12" r="10" /></svg>,
  Mouse: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7" /><line x1="12" y1="6" x2="12" y2="10" /></svg>
};

const stepIcon = (key: (typeof PET_STEPS)[number]["icon"], color: string) => {
  const Cmp = Icons[key] as any;
  return <Cmp color={color} />;
};

// ============================================================================
// 3. COMPONENT DÙNG CHUNG & CAROUSEL LOGIC
// ============================================================================

const BrandLogo = ({ size = 32 }: { size?: number }) => (
  <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
    <div style={{ backgroundColor: "#EDE9FE", padding: "6px", borderRadius: "10px" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v1a2 2 0 0 1-2 2H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h2v3a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-3h2a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-2a2 2 0 0 1-2-2V5a3 3 0 0 0-3-3z"/>
        <circle cx="8.5" cy="11.5" r="1.5" fill="#8B5CF6"/><circle cx="15.5" cy="11.5" r="1.5" fill="#8B5CF6"/>
        <path d="M12 15c-1 0-2-.5-2-1.5s1-1.5 2-1.5 2 .5 2 1.5-1 1.5-2 1.5z" fill="#8B5CF6"/>
      </svg>
    </div>
    <span style={{ fontFamily: FONT_HEAD, fontSize: "22px", fontWeight: 800, color: COLOR.ink }}>Paw<span style={{ color: COLOR.brand }}>Life</span></span>
  </Link>
);

const ButtonLink = ({ href, children, variant = "primary", className = "", style, onClick }: any) => {
  const isPrimary = variant === "primary";
  return (
    <Link href={href} onClick={onClick} className={`inline-flex items-center justify-center text-center transition duration-200 hover:-translate-y-0.5 active:scale-95 ${className}`}
      style={{
        backgroundColor: isPrimary ? COLOR.brand : "#fff",
        color: isPrimary ? "#fff" : COLOR.ink,
        padding: "14px 28px",
        fontSize: "15px",
        fontWeight: 700,
        borderRadius: "999px",
        fontFamily: FONT_BODY,
        textDecoration: "none",
        border: variant === "outline-purple" ? `1px solid ${COLOR.purple}` : isPrimary ? "none" : `1px solid ${COLOR.border}`,
        boxShadow: isPrimary ? "0 8px 25px rgba(251,191,36,0.3)" : "0 4px 15px rgba(0,0,0,0.03)",
        whiteSpace: "nowrap",
        ...(variant === "outline-purple" ? { color: COLOR.purple } : {}),
        ...style
      }}>
      {children}
    </Link>
  );
};

const SectionHeading = ({ eyebrow, title, center = true }: { eyebrow: string; title: string; center?: boolean }) => (
  <div style={{ textAlign: center ? "center" : "left", marginBottom: "48px" }}>
    {eyebrow && <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ color: COLOR.purple, fontSize: "16px", fontWeight: 700, marginBottom: "8px", fontFamily: FONT_HEAD }}>{eyebrow}</motion.p>}
    <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ color: COLOR.ink, fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 900, fontFamily: FONT_HEAD, letterSpacing: "-1px", lineHeight: 1.2 }}>
      {title}
    </motion.h2>
  </div>
);

const CountUp = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0; const start = performance.now(); const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString("vi-VN")}{suffix}</span>;
};

// --- Custom Hooks & Carousel Elements ---
const useCarousel = (length: number) => {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((p) => (p + 1) % length);
  const prev = () => setIndex((p) => (p - 1 + length) % length);
  return { index, next, prev, setIndex };
};

const StackedCarouselControls = ({ onPrev, onNext, className = "", position = "left" }: { onPrev: () => void, onNext: () => void, className?: string, position?: "left"|"right" }) => (
  <div className={`flex flex-col gap-3 z-20 ${className}`}>
    <button onClick={position === "left" ? onNext : onPrev} aria-label="Next item" className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition active:scale-95">
      {position === "left" ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
    </button>
    <button onClick={position === "left" ? onPrev : onNext} aria-label="Previous item" className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition active:scale-95">
      {position === "left" ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
    </button>
  </div>
);

const CarouselPagination = ({ total, current }: { total: number, current: number }) => (
  <div className="flex gap-[6px] justify-center mt-10">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`h-[6px] rounded-full transition-all duration-300 ${i === current ? "w-8 bg-purple-400" : "w-[6px] bg-gray-300"}`} />
    ))}
  </div>
);

// ============================================================================
// 4. HIỆU ỨNG CON TRỎ & FLOATING BUTTON (GIỮ NGUYÊN)
// ============================================================================

const MagicCursorCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = !!useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth; let height = window.innerHeight;
    canvas.width = width; canvas.height = height;
    const colors = ["#FBBF24", "#F59E0B", "#FDE68A", "#D97706"];
    const MAX_PARTICLES = 260;
    class Particle {
      x: number; y: number; size: number; color: string; speedX: number; speedY: number; life: number; shape: number;
      constructor(x: number, y: number) {
        this.x = x; this.y = y; this.size = Math.random() * 6 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 3 - 1.5; this.speedY = Math.random() * 3 - 1.5;
        this.life = 1; this.shape = Math.random() < 0.4 ? 1 : 0;
      }
      update() { this.x += this.speedX; this.y += this.speedY; this.life -= 0.03; this.size *= 0.96; }
      draw() {
        ctx!.save(); ctx!.globalAlpha = Math.max(0, this.life); ctx!.fillStyle = this.color; ctx!.beginPath();
        if (this.shape === 1) {
          const r = this.size * 1.8; ctx!.translate(this.x, this.y); ctx!.moveTo(0, -r);
          ctx!.quadraticCurveTo(0, 0, r, 0); ctx!.quadraticCurveTo(0, 0, 0, r);
          ctx!.quadraticCurveTo(0, 0, -r, 0); ctx!.quadraticCurveTo(0, 0, 0, -r);
        } else { ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2); }
        ctx!.fill(); ctx!.restore();
      }
    }
    let particles: Particle[] = [];
    const addParticles = (x: number, y: number) => {
      if (particles.length > MAX_PARTICLES) return;
      for (let i = 0; i < 4; i++) particles.push(new Particle(x, y));
    };
    const handleMouseMove = (e: MouseEvent) => addParticles(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) addParticles(e.touches[0].clientX, e.touches[0].clientY); };
    const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
    window.addEventListener("mousemove", handleMouseMove); window.addEventListener("touchmove", handleTouchMove, { passive: true }); window.addEventListener("resize", handleResize);
    let rafId = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height); ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); }
      particles = particles.filter((p) => p.life > 0 && p.size > 0.1);
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("touchmove", handleTouchMove); window.removeEventListener("resize", handleResize); };
  }, [reduce]);
  if (reduce) return null;
  return <canvas ref={canvasRef} aria-hidden style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 9999 }} />;
};

const FloatingQrButton = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.8 }} className="fixed z-40" style={{ left: "max(16px, env(safe-area-inset-left))", bottom: "max(16px, env(safe-area-inset-bottom))" }}>
      <Link href={ROUTES.scan} aria-label="Quét QR thú cưng" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="relative flex items-center" style={{ textDecoration: "none" }}>
        <motion.span whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="relative flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)", boxShadow: "0 10px 28px rgba(245,158,11,0.45), 0 2px 6px rgba(0,0,0,0.12)", border: "2px solid rgba(255,255,255,0.8)" }}>
          <Icons.QR color="#fff" />
        </motion.span>
        <motion.span aria-hidden initial={false} animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }} transition={{ duration: 0.2 }} className="pointer-events-none ml-3 hidden whitespace-nowrap rounded-full px-4 py-2 sm:block"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", color: COLOR.ink, fontSize: "13px", fontWeight: 600, fontFamily: FONT_HEAD }}>
          Quét mã QR
        </motion.span>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// 5. CÁC SECTION TRANG CHỦ
// ============================================================================

// HEADER STICKY (Nền xám tím nhạt ở đầu trang, kính mờ khi cuộn)
const HeaderSection = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white/85 backdrop-blur-lg border-b border-gray-100 shadow-sm py-3" : "bg-[#F3F4F9] py-5"}`}>
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="text-[15px] font-semibold text-gray-800 hover:text-purple-500 transition-colors font-['Inter']">{l.label}</Link>
          ))}
          <ButtonLink href={ROUTES.signIn} variant="outline-purple" style={{ padding: "10px 24px" }}>Đăng nhập</ButtonLink>
        </nav>
      </div>
    </header>
  );
};

// HERO (Hình 1 - có icon chuột tưng tưng)
const HeroSection = () => (
  <section id="top" className="relative mx-auto flex min-h-[600px] w-full max-w-[1280px] flex-col items-center justify-between px-6 pt-[80px] lg:h-[800px] lg:flex-row lg:items-center">
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[-1]" style={{ backgroundImage: "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="z-10 flex w-full flex-col items-start pt-12 lg:w-1/2 lg:pt-0">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", padding: "6px 16px", borderRadius: "999px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
        <span style={{ fontSize: "14px", fontWeight: 600, color: COLOR.ink, fontFamily: FONT_BODY }}>Hơn 10.000 người nhận nuôi hạnh phúc</span>
      </div>
      <h1 style={{ fontSize: "clamp(48px, 6vw, 84px)", fontWeight: 900, lineHeight: 1.05, fontFamily: FONT_HEAD, letterSpacing: "-2px", marginBottom: "24px" }}>
        <span style={{ color: COLOR.purple }}>Đừng mua.</span><br />
        <span style={{ color: COLOR.ink }}>Hãy nhận nuôi.</span>
      </h1>
      <p style={{ fontSize: "17px", color: COLOR.body, maxWidth: "480px", lineHeight: 1.6, fontFamily: FONT_BODY, marginBottom: "40px" }}>
        Mỗi thú cưng đều xứng đáng có một mái ấm. Hãy tìm người bạn đồng hành hoàn hảo và trao cho bé cuộc sống xứng đáng.
      </p>
      <div className="mb-16 flex flex-wrap gap-4">
        <ButtonLink href={ROUTES.pets} variant="primary">Tìm người bạn của bạn</ButtonLink>
        <ButtonLink href="#about" variant="outline">Tìm hiểu thêm</ButtonLink>
      </div>
      <dl className="flex w-full max-w-[480px] items-center gap-10">
        {HERO_STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-start">
            <dd style={{ fontSize: "28px", fontWeight: 900, color: COLOR.ink, fontFamily: FONT_HEAD }}>{s.value}</dd>
            <dt style={{ fontSize: "14px", color: COLOR.muted, marginTop: "4px", fontFamily: FONT_BODY }}>{s.label}</dt>
          </div>
        ))}
      </dl>
    </motion.div>
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative z-10 flex h-[400px] w-full items-end justify-center lg:h-[800px] lg:w-1/2">
      <img src="/assets/chowchow.png" alt="Cute fluffy dog" className="absolute bottom-0 max-h-[110%] object-contain drop-shadow-2xl" />
    </motion.div>

    {/* Icon chuột cuộn nảy lên xuống */}
    <motion.a href="#about" aria-label="Cuộn xuống" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex">
      <Icons.Mouse />
    </motion.a>
  </section>
);

// ABOUT (Hình 2)
const AboutUsSection = () => (
  <section id="about" className="mx-auto mt-[120px] flex w-full max-w-[1100px] flex-col-reverse items-center gap-12 px-6 lg:flex-row lg:gap-24">
    <div className="relative h-[400px] w-full lg:h-[500px] lg:w-1/2">
      <motion.img initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80" alt="Dog 1" className="absolute left-0 top-0 h-[280px] w-[280px] rounded-full object-cover shadow-2xl" />
      <motion.img initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80" alt="Cat 1" className="absolute left-[200px] top-[-20px] h-[80px] w-[80px] rounded-full border-4 border-white object-cover shadow-lg" />
      <motion.img initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80" alt="Dog 2" className="absolute right-0 top-[120px] h-[160px] w-[160px] rounded-full border-4 border-white object-cover shadow-xl" />
      <motion.img initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80" alt="Husky" className="absolute bottom-0 left-[100px] h-[220px] w-[220px] rounded-full border-4 border-white object-cover shadow-2xl" />
      <motion.img initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=200&q=80" alt="Cat 2" className="absolute bottom-[40px] left-[-30px] h-[110px] w-[110px] rounded-full border-4 border-white object-cover shadow-lg" />
    </div>
    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex w-full flex-col lg:w-1/2">
      <SectionHeading eyebrow="Về chúng tôi" title="Chúng tôi là ai?" center={false} />
      <p style={{ color: COLOR.body, fontSize: "16px", lineHeight: 1.7, marginBottom: "40px", marginTop: "-20px" }}>
        Chúng tôi là một dự án thiện nguyện với mục tiêu chính là hỗ trợ các trạm cứu hộ tìm mái ấm mới cho các bé thú cưng kém may mắn.
      </p>
      <dl className="grid grid-cols-2 gap-x-12 gap-y-10">
        {ABOUT_STATS.map((stat, i) => (
          <div key={i}>
            <dd style={{ color: COLOR.brand, fontSize: "40px", fontWeight: 900, fontFamily: FONT_HEAD }}><CountUp to={stat.to} suffix={stat.suffix} /></dd>
            <dt style={{ color: COLOR.body, fontSize: "15px", marginTop: "4px" }}>{stat.label}</dt>
          </div>
        ))}
      </dl>
    </motion.div>
  </section>
);

// QR SYSTEM (Hình 3 & Card nổi bồng bềnh + Lớp mờ)
const QrSection = () => {
  return (
    <section id="qr" className="mx-auto mt-[160px] flex w-full max-w-[1100px] flex-col items-center px-6">
      <SectionHeading eyebrow="Hệ thống QR" title="Bảo mật danh tính thú cưng" />
      <div className="relative flex w-full flex-col items-center gap-10 lg:flex-row lg:items-end">
        {/* Cột Trái - Ảnh & Card nổi */}
        <div className="relative w-full lg:w-[45%]">
          <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80" alt="Cat" className="h-[500px] w-full rounded-[40px] object-cover" />
          
          {/* Card nổi bồng bềnh + Lớp gradient mờ chữ */}
          <motion.div 
            animate={{ y: [0, -12, 0] }} 
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} 
            className="absolute -bottom-6 -right-6 w-[260px] rounded-[24px] bg-white pt-6 px-6 pb-2 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1"><span className="text-xl font-bold text-gray-900">Max</span><Icons.Male /></div>
            <div className="text-sm text-gray-500 mb-4">3 tuổi · Golden Retriever</div>
            <div className="h-px bg-gray-100 my-4" />
            <div className="text-[10px] font-bold text-gray-400 mb-1">MÃ QR</div>
            <div className="text-sm font-semibold text-gray-900 mb-3">QR-2024-001234</div>
            <div className="text-[10px] font-bold text-gray-400 mb-1">MICROCHIP</div>
            <div className="text-sm font-semibold text-gray-900 mb-3">985112345678901</div>
            <div className="text-[10px] font-bold text-gray-400 mb-1">GHI CHÚ</div>
            <div className="text-sm font-semibold text-gray-900 mb-6">Thân thiện, thích ăn vặt</div>
            
            {/* Lớp phủ mờ (Fade Out Overlay) */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-[24px]"></div>
          </motion.div>
        </div>

        {/* Cột Phải - Giống Hình 3 */}
        <div className="flex w-full flex-col pl-0 lg:w-[55%] lg:pl-16 relative mt-12 lg:mt-0">
          <div className="rounded-[32px] border border-gray-100 bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-purple-50 p-2 rounded-xl"><Icons.QR color={COLOR.purple} /></div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-['Be_Vietnam_Pro']">Định danh QR</h3>
                <p className="text-gray-500 mt-1 text-[15px]">Định danh kỹ thuật số vĩnh viễn cho thú cưng</p>
              </div>
            </div>
            <ul className="flex flex-col gap-4">
              {[
                "ID thú cưng vĩnh viễn — không bao giờ tái sử dụng", 
                "Quyền sở hữu được liên kết & đóng dấu thời gian", 
                "Lịch sử chuyển chủ được ghi nhận, không ghi đè", 
                "Định danh tồn tại suốt vòng đời thú cưng"
              ].map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <Icons.Check color={COLOR.purple} />
                  <span className="text-gray-600 font-medium text-[15px]">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Pagination dots giống hình 3 */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="h-[6px] w-8 rounded-full bg-purple-400"></div>
            <div className="h-[6px] w-[6px] rounded-full bg-gray-200"></div>
            <div className="h-[6px] w-[6px] rounded-full bg-gray-200"></div>
          </div>

          <div className="flex gap-4">
            <ButtonLink href="#download" variant="primary" className="flex-1">Tải ứng dụng</ButtonLink>
            <ButtonLink href={ROUTES.qrShop} variant="outline" className="flex-1" style={{ borderColor: COLOR.brand, color: COLOR.brand }}>Mua thẻ QR</ButtonLink>
          </div>
        </div>
      </div>

      <div className="mt-[80px] grid w-full grid-cols-1 gap-8 md:grid-cols-4 lg:gap-4 text-center">
        {PET_STEPS.map((step, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="relative flex flex-col items-center">
            <div className="mb-6">{stepIcon(step.icon, step.color)}</div>
            <h4 className="text-[17px] font-bold text-gray-900 mb-3 font-['Be_Vietnam_Pro']">{step.title}</h4>
            <p className="text-[13px] text-gray-500 whitespace-pre-line leading-relaxed">{step.desc}</p>
            {idx < 3 && <div className="hidden md:block absolute top-4 right-[-16px]"><Icons.ArrowRightThin /></div>}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// OUR PETS (Phần gọi dữ liệu API 2000 dòng được khôi phục)
const PetsSection = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const { index, next, prev } = useCarousel(pets.length || 1);
  const [applyPet, setApplyPet] = useState<Pet | null>(null);

  // Tích hợp API chuẩn như code ban đầu
  useEffect(() => {
    axiosClient.get("/public/pets", { params: { limit: 12 } })
      .then((r) => {
        const mappedData = (r.data?.data ?? []).map(toCard);
        setPets(mappedData.length > 0 ? mappedData : MOCK_PETS);
      })
      .catch(() => setPets(MOCK_PETS));
  }, []);

  const pet = pets[index];
  if (!pet) return null;

  return (
    <section id="pets" className="mx-auto mt-[160px] flex w-full max-w-[1100px] flex-col items-center px-6 relative">
      <SectionHeading eyebrow="Thú cưng của chúng tôi" title="Tô màu cuộc sống của bé" />
      
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[60%] -left-16 hidden lg:flex" />

      <AnimatePresence mode="wait">
        <motion.div key={pet.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="flex w-full flex-col overflow-hidden bg-white lg:flex-row gap-12">
          <div className="h-[400px] w-full rounded-[40px] overflow-hidden lg:h-[500px] lg:w-1/2">
            <img src={pet.img} alt={pet.name} className="h-full w-full object-cover grayscale" />
          </div>
          <div className="flex w-full flex-col justify-center lg:w-1/2">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-3xl font-bold text-gray-900 m-0">{pet.name}</h3>
              {pet.gender === "Female" ? <Icons.Female /> : <Icons.Male />}
            </div>
            <p className="text-gray-500 mb-6">{pet.info}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{pet.desc}</p>
            <div className="flex flex-wrap gap-3 mb-10">
              {pet.tags.map((tag) => (
                <span key={tag.label} style={{ backgroundColor: tag.bg, color: tag.color, padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                  {tag.label}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              <ButtonLink href={`${ROUTES.pets}/${pet.id}`} variant="primary">Kết bạn ngay</ButtonLink>
              <button onClick={() => setApplyPet(pet)} className="inline-flex items-center justify-center transition duration-200 hover:-translate-y-0.5 active:scale-95 px-[28px] py-[14px] text-[15px] font-bold rounded-full bg-white text-[#FBBF24] border border-[#FBBF24] shadow-sm cursor-pointer">
                Đăng ký nhận nuôi
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <CarouselPagination total={pets.length} current={index} />
      
      {applyPet && <AdoptionFormModal pet={{ id: applyPet.id, name: applyPet.name, shelterName: applyPet.shelter }} onClose={() => setApplyPet(null)} />}
    </section>
  );
};

// VERIFIED SHELTERS
const SheltersSection = () => {
  const { index, next, prev } = useCarousel(MOCK_SHELTERS.length);
  const shelter = MOCK_SHELTERS[index];

  return (
    <section id="shelters" className="mx-auto mt-[160px] flex w-full max-w-[1100px] flex-col items-center px-6 relative">
      <SectionHeading eyebrow="" title="Trạm cứu hộ xác minh" />
      
      <StackedCarouselControls onNext={next} onPrev={prev} position="right" className="absolute top-[60%] -right-16 hidden lg:flex" />

      <AnimatePresence mode="wait">
        <motion.div key={shelter.name} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex w-full flex-col-reverse items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex w-full flex-col lg:w-[45%]">
            <div className="flex items-center gap-4 mb-6">
              <img src={shelter.img} alt="Logo" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[22px] font-bold text-gray-900">{shelter.name}</h3><Icons.Verified />
                </div>
                <p className="text-gray-500 mt-1 flex items-center gap-1 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {shelter.location}
                </p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8">{shelter.desc}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {shelter.stats.map((s: any) => (
                <div key={s.l}><div className="text-[22px] font-bold text-gray-900">{s.v}</div><div className="text-[12px] text-gray-500 mt-1">{s.l}</div></div>
              ))}
            </div>
            <div className="h-px w-full bg-gray-100 mb-8" />
            <div className="mb-10">
              <h4 className="text-[11px] font-bold text-gray-500 tracking-wider mb-4 uppercase">Trạng thái xác minh</h4>
              <ul className="flex flex-col gap-3">
                {[`Xác minh từ ${shelter.since}`, "Báo cáo hoạt động đầy đủ", "Cam kết kiểm tra hậu nhận nuôi"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-600 text-[14px]"><Icons.Dot /> {item}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-4">
              <ButtonLink href={ROUTES.shelters} variant="primary">Xem hồ sơ trạm</ButtonLink>
              <ButtonLink href={ROUTES.shelters} variant="outline" style={{ borderColor: COLOR.brand, color: COLOR.brand }}>Tất cả trạm</ButtonLink>
            </div>
          </div>
          <div className="w-full lg:w-[55%]">
            <img src={shelter.img} alt="Shelter" className="h-[600px] w-full rounded-[40px] object-cover shadow-lg" />
          </div>
        </motion.div>
      </AnimatePresence>
      <CarouselPagination total={MOCK_SHELTERS.length} current={index} />
    </section>
  );
};

// MYTHS (Ảnh 5 - Bỏ chữ nghiêng, bỏ overlay trắng)
const MythsSection = () => {
  const { index, next, prev } = useCarousel(MOCK_MYTHS.length);
  const myth = MOCK_MYTHS[index];

  return (
    <section id="myths" className="mx-auto mt-[160px] flex w-full max-w-[1100px] flex-col items-center px-6 relative">
      <SectionHeading eyebrow="Nhận nuôi" title="Những hiểu lầm thường gặp" />
      <div className="flex w-full items-center justify-between">
        
        <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="hidden lg:flex" />
        
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="relative flex w-full flex-col items-center justify-center lg:flex-row lg:gap-16">
            
            {/* Ảnh chó - không có overlay trắng ở dưới */}
            <img src={myth.img} alt="Myth" className="h-[400px] w-[400px] rounded-[40px] object-cover z-10 shadow-sm" />
            
            <div className="max-w-[400px] z-10 text-center lg:text-left mt-8 lg:mt-0">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 whitespace-pre-line">{myth.title}</h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">{myth.desc}</p>
            </div>
            
            {/* Chữ số thẳng, không dùng rotate */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[240px] font-black text-[#FBBF24] opacity-90 z-0 select-none hidden lg:block">
              {index + 1}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <CarouselPagination total={MOCK_MYTHS.length} current={index} />
    </section>
  );
};

// FAQ 
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`w-full rounded-2xl border border-gray-100 bg-white p-6 transition-shadow ${isOpen ? 'shadow-md' : 'shadow-sm'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between gap-4 text-left focus:outline-none">
        <span className="text-[17px] font-semibold text-gray-900 font-['Be_Vietnam_Pro']">{question}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}><Icons.ChevronDown /></motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pt-4 text-[15px] text-gray-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FaqSection = () => (
  <section id="faq" className="mx-auto mt-[160px] flex w-full max-w-[900px] flex-col items-center px-6">
    <SectionHeading eyebrow="" title="Hỏi đáp thường gặp" />
    <div className="flex w-full flex-col gap-4 mt-2">
      {FAQS.map((faq, i) => <FaqItem key={i} question={faq.question} answer={faq.answer} />)}
    </div>
  </section>
);

// REVIEWS (Ảnh 6 - Bổ sung Carousel dots ở dưới cùng)
const ReviewsSection = () => {
  const { index, next, prev } = useCarousel(MOCK_JOURNEYS.length);
  const review = MOCK_JOURNEYS[index];

  return (
    <section id="stories" className="mx-auto mt-[160px] flex w-full max-w-[1100px] flex-col items-center px-6 relative">
      <SectionHeading eyebrow="Đánh giá" title="Câu chuyện hạnh phúc" />
      
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[50%] -left-16 hidden lg:flex" />

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }} className="flex w-full flex-col lg:flex-row gap-16 items-stretch">
          <img src={review.img} alt="Happy story" className="h-[500px] w-full lg:w-[45%] rounded-[40px] object-cover shadow-lg" />
          <div className="flex flex-col lg:w-[55%] justify-between py-4">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <img src={review.avatar} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <h4 className="text-[19px] font-bold text-gray-900">{review.name}</h4>
                  <p className="text-[13px] text-gray-500">{review.info}</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-[16px]">{review.desc}</p>
            </div>
            <div className="mt-8">
              <ButtonLink href={ROUTES.stories} variant="outline" style={{ borderColor: COLOR.brand, color: COLOR.brand, padding: "12px 32px" }}>Đọc thêm</ButtonLink>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Pagination cho Review */}
      <CarouselPagination total={MOCK_JOURNEYS.length} current={index} />
    </section>
  );
};

// PARTNER LOGOS
const PartnerLogosSection = () => (
  <section className="mx-auto mt-[160px] w-full overflow-hidden border-y border-gray-100 py-12 bg-white">
    <div className="flex w-full animate-[infinite-scroll_25s_linear_infinite] items-center gap-24 whitespace-nowrap">
      {[...MOCK_PARTNERS, ...MOCK_PARTNERS, ...MOCK_PARTNERS].map((src, i) => (
        <img key={i} src={src} alt="Partner Logo" className="h-10 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition duration-300" />
      ))}
    </div>
    <style>{`@keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
  </section>
);

// DOWNLOAD APP 
const DownloadAppSection = () => (
  <section className="mx-auto mt-[160px] flex w-full max-w-[1100px] flex-col items-center justify-between gap-16 px-6 lg:flex-row">
    <div className="relative h-[600px] w-[300px] rounded-[40px] border-[8px] border-gray-900 bg-gray-50 shadow-2xl overflow-hidden flex-shrink-0">
      {/* <div className="absolute top-0 w-full h-6 bg-black rounded-b-[18px]" />  */}
      <div className="p-4 pt-10">
        <h4 className="text-[18px] font-bold mb-4 font-['Be_Vietnam_Pro'] text-gray-900">Thú cưng</h4>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl bg-white p-2 shadow-sm border border-gray-100">
              <div className="h-24 bg-gray-200 rounded-lg mb-2"/><div className="h-3 w-16 bg-gray-300 rounded mb-1"/><div className="h-2 w-12 bg-gray-200 rounded"/>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="flex w-full flex-col text-center lg:text-left">
      <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 font-['Be_Vietnam_Pro'] tracking-tight">Tải ứng dụng PawLife</h2>
      <p className="text-[17px] text-gray-500 mb-10 leading-relaxed max-w-[540px]">
        Trải nghiệm tương lai của việc nhận nuôi thú cưng ngay trên điện thoại của bạn. Tìm kiếm thú cưng, theo dõi hồ sơ nhận nuôi và kết nối với các trạm cứu hộ đã được xác minh - tất cả trong một ứng dụng tiện lợi.
      </p>
      <div className="flex flex-wrap justify-center lg:justify-start gap-4">
        <a href={IOS_APP_URL} className="flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3 text-white transition hover:bg-gray-800">
          <Icons.Apple />
          <div className="text-left"><div className="text-[10px] leading-tight">Tải về trên</div><div className="text-[17px] font-semibold leading-tight">App Store</div></div>
        </a>
        <a href={ANDROID_APP_URL} className="flex items-center gap-3 rounded-2xl bg-gray-900 px-6 py-3 text-white transition hover:bg-gray-800">
          <Icons.GooglePlay />
          <div className="text-left"><div className="text-[10px] leading-tight">Tải về trên</div><div className="text-[17px] font-semibold leading-tight">Google Play</div></div>
        </a>
      </div>
    </div>
  </section>
);

// FOOTER 
const FooterSection = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="w-full bg-[#FAFAFA] pt-24 pb-12 mt-[160px] relative border-t border-gray-100">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col lg:flex-row justify-between gap-16 px-6">
        
        <div className="flex flex-col items-start max-w-[320px]">
          <BrandLogo size={28} />
          <h2 className="text-[36px] font-bold text-gray-900 mt-8 mb-8 font-['Be_Vietnam_Pro'] leading-[1.2] tracking-tight">
            Đón một người bạn<br/>bốn chân về nhà
          </h2>
          <ButtonLink href={ROUTES.pets} variant="primary">Tìm bạn đồng hành</ButtonLink>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-16 lg:gap-24 pt-4">
          <div className="flex flex-col gap-6">
            <Link href="#about" className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">Về chúng tôi</Link>
            <Link href="#pets" className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">Thú cưng</Link>
            <Link href="#qr" className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">Cách hoạt động</Link>
          </div>
          
          <div className="flex flex-col gap-6">
            <Link href="#stories" className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">Đánh giá</Link>
            <Link href="#faq" className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">Hỏi đáp</Link>
            <Link href="#partners" className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">Đối tác</Link>
          </div>

          <div className="flex flex-col gap-6">
            <a href={CONTACT.phoneHref} className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`} className="text-[15px] text-gray-600 hover:text-gray-900 font-['Inter']">{CONTACT.email}</a>
            <div className="flex gap-4">
              <a href={SOCIALS.facebook} className="text-[#8B5CF6] hover:opacity-80"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
              <a href={SOCIALS.instagram} className="text-[#8B5CF6] hover:opacity-80"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
            </div>
          </div>
        </div>
      </div>

      <button onClick={scrollToTop} aria-label="Cuộn lên đầu trang" className="absolute right-8 top-16 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50 active:scale-95">
        <Icons.ArrowUp />
      </button>
    </footer>
  );
};

// ============================================================================
// 7. TRANG CHỦ (MAIN PAGE)
// ============================================================================

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#FFFFFF", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflowX: "clip", position: "relative" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: ${HEADER_HEIGHT}px; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
      `}</style>

      {/* Hiệu ứng gốc */}
      <MagicCursorCanvas />
      <FloatingQrButton />
      
      <HeaderSection />
      
      <main className="relative z-10 flex w-full flex-col items-center">
        <HeroSection />
        <AboutUsSection />
        <QrSection />
        <PetsSection />
        <SheltersSection />
        <MythsSection />
        <FaqSection />
        <ReviewsSection />
        <PartnerLogosSection />
        <DownloadAppSection />
      </main>
      
      <FooterSection />
    </div>
  );
}