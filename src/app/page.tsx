'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion, useInView, AnimatePresence, useAnimation, useMotionValue, animate } from "framer-motion";
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
  brand: "#FDB022", // Vàng cam chuẩn UI
  brandSoft: "#FEF3C7",
  purple: "#9B87F5", // Tím pastel
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
  { label: "Nhận nuôi", href: "thu-cung" },
  { label: "Quét QR", href: "scan" },
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
  Apple: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>,
  GooglePlay: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2.8v18.4a1 1 0 0 0 1.5.86l15-9.2a1 1 0 0 0 0-1.72l-15-9.2A1 1 0 0 0 4 2.8z" /></svg>,
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
    <div style={{ backgroundColor: "transparent", padding: "0px 6px", borderRadius: "10px" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLOR.purple}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.25 16.25h1.5L12 17z" />
        <path d="M16 14v.5" />
        <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" />
        <path d="M8 14v.5" />
        <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
      </svg>
    </div>
    <span style={{ fontFamily: FONT_HEAD, fontSize: "22px", fontWeight: 800, color: COLOR.ink }}>
      Paw<span style={{ color: COLOR.brand }}>Life</span>
    </span>
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
        borderRadius: "10px",
        fontFamily: FONT_BODY,
        textDecoration: "none",
        border: variant === "outline-purple" ? `2px solid ${COLOR.purple}` : isPrimary ? "none" : `2px solid ${COLOR.border}`,
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
  <div style={{ textAlign: center ? "center" : "left", marginBottom: "clamp(20px, 5vw, 48px)" }}>
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
  const [[index, dir], set] = useState<[number, number]>([0, 1]);
  const next = () => set(([p]) => [(p + 1) % length, 1]);
  const prev = () => set(([p]) => [(p - 1 + length) % length, -1]);
  return { index, dir, next, prev };
};

const slideVariants = {
  enter: (d: number) => ({ opacity: 0, x: 50 * d }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: -50 * d }),
};
// Đoạn văn dài: thu gọn 3 dòng trên mobile, PC hiện đủ (cần Tailwind >= 3.3 cho line-clamp)
const ClampText = ({ text, className = "" }: { text: string; className?: string }) => {
  const [open, setOpen] = useState(false);
  const long = text.length > 110;
  return (
    <div className={className}>
      <p className={!open && long ? "line-clamp-3 lg:line-clamp-none" : ""}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-1.5 text-[14px] font-semibold lg:hidden" style={{ color: COLOR.purple }}>
          {open ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

// Khối phụ: ẩn trên mobile cho tới khi bấm "Xem thêm", PC luôn hiện
const MobileMore = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={open ? "block" : "hidden lg:block"}>{children}</div>
      <button type="button" onClick={() => setOpen(!open)} className="mb-4 self-start text-[14px] font-semibold lg:hidden" style={{ color: COLOR.purple }}>
        {open ? "Thu gọn" : "Xem thêm"}
      </button>
    </>
  );
};

const BTN = { padding: "14px 12px", fontSize: "15px", fontWeight: 700, borderRadius: "15px", fontFamily: FONT_BODY, textDecoration: "none", whiteSpace: "nowrap" as const, cursor: "pointer" };
const PrimaryBtn = ({ href, onClick, children, className = "flex-1", style }: any) => (
  <motion.a href={href} onClick={onClick} whileHover={{ filter: "brightness(1.15)" }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}
    className={`${className} inline-flex items-center justify-center text-center text-white`}
    style={{ ...BTN, whiteSpace: "normal", backgroundColor: COLOR.brand, boxShadow: "0 8px 25px rgba(251,191,36,0.3)", ...style }}>
    {children}
  </motion.a>
);

const OutlineBtn = ({ href, onClick, children, className = "flex-1", style }: any) => (
  <motion.a href={href} onClick={onClick} initial={{ backgroundColor: "transparent", color: COLOR.brand }} whileHover={{ backgroundColor: COLOR.brand, color: "#fff" }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.3 }}
    className={`${className} inline-flex items-center justify-center text-center`}
    style={{ ...BTN, whiteSpace: "normal", border: `2px solid ${COLOR.brand}`, ...style }}>
    {children}
  </motion.a>
);
const SwipeArea = ({ onNext, onPrev, children, className = "" }: { onNext: () => void; onPrev: () => void; children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const active = useRef(false);
  const MAX = 64;   // độ chờn tối đa (px)
  const GAIN = 1.4; // >1 = nhạy hơn ngón tay lúc mới chạm
  const settle = () => animate(x, 0, { type: "spring", stiffness: 420, damping: 30 });

  return (
    <motion.div
      className={className}
      style={{ x, touchAction: "pan-y" }} // giữ cuộn dọc, bắt vuốt ngang
      onPanStart={(e, { offset }) => {
        active.current = (e as PointerEvent).pointerType !== "mouse" && Math.abs(offset.x) > Math.abs(offset.y);
      }}
      onPan={(_, { offset }) => {
        if (!active.current) return;
        const d = offset.x;
        x.set(Math.sign(d) * MAX * (1 - Math.exp(-(Math.abs(d) * GAIN) / MAX)));
      }}
      onPanEnd={(_, { offset, velocity }) => {
        if (!active.current) return;
        active.current = false;
        if (Math.abs(offset.x) > 60 || Math.abs(velocity.x) > 500) (offset.x < 0 ? onNext : onPrev)();
        settle();
      }}
      onPanSessionStart={() => x.stop()}
    >
      {children}
    </motion.div>
  );
};

const StackedCarouselControls = ({ onPrev, onNext, className = "", position = "left" }: { onPrev: () => void, onNext: () => void, className?: string, position?: "left" | "right" }) => (
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
  <div className="flex gap-[6px] justify-center mt-5 lg:mt-10">
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
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "2px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", color: COLOR.ink, fontSize: "13px", fontWeight: 600, fontFamily: FONT_HEAD }}>
          Quét mã QR
        </motion.span>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// 5. CÁC SECTION TRANG CHỦ
// ============================================================================

// HEADER STICKY (Đầu trang: Tím sần -> Khi cuộn: Kính trong suốt)
export const HeaderSection = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-400 ${scrolled ? "py-3" : "py-5"}`}>

      {/* 1. TRẠNG THÁI Ở ĐẦU TRANG: Nền màu tím nhạt/sần */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-400"
        style={{
          opacity: scrolled ? 0 : 1,
          backgroundColor: '#F3F4F9', // Màu tím sần nhạt giống phần đầu trang
        }}
      />

      {/* 2. TRẠNG THÁI KHI CUỘN: Kính cực trong (Đọc được chữ phía sau) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-400"
        style={{
          opacity: scrolled ? 1 : 0,
          backgroundColor: 'rgba(255, 255, 255, 0.02)', // Gần như vô hình (chỉ 2% trắng)
          backdropFilter: 'blur(2px) saturate(150%)', // Giảm blur xuống 12px để nhìn xuyên thấu rõ hơn
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)', // Viền dưới siêu mỏng
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' // Bóng cực nhẹ để phân tách
        }}
      >
        {/* Vệt highlight cực mỏng ở viền trên cùng */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
      </div>

      {/* NỘI DUNG HEADER */}
      <div className="relative mx-auto flex w-full items-center justify-between px-6 z-10">
        <BrandLogo />
        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group relative py-1 text-[15px] font-semibold text-gray-800 hover:text-[#9B87F5] transition-colors font-['Inter']"
            >
              {l.label}
              {/* Thanh gạch chân chạy từ trái sang phải */}
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-[#9B87F5] transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
          <motion.a
            href={ROUTES.signIn}
            initial={{ backgroundColor: "transparent", color: COLOR.purple }}
            whileHover={{ backgroundColor: COLOR.purple, color: "#fff" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 inline-flex items-center justify-center text-center"
            style={{
              padding: "12px 20px",
              fontSize: "15px",
              fontWeight: 700,
              borderRadius: "15px",
              fontFamily: FONT_BODY,
              textDecoration: "none",
              whiteSpace: "nowrap",
              border: `2px solid ${COLOR.purple}`,
              cursor: "pointer",
            }}
          >
            Đăng nhập
          </motion.a>
        </nav>
      </div>
    </header>
  );
};

// HERO (Hình 1 - có icon chuột tưng tưng, nút Gradient Scale & Ánh sáng vàng nhạt, ảnh to hơn và mờ dần dưới đáy)
const HeroSection = () => (
  <section id="top" className="relative mx-auto flex min-h-[600px] w-full max-w-[1392px] lg:px-20 flex-col items-center justify-between px-6 pt-[80px] lg:h-[800px] lg:flex-row lg:items-center">

    {/* Background Grid - Kẻ ô vuông màu cực nhạt (0.02 opacity) */}
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[-2]" style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

    {/* Vầng sáng vàng phía sau phần text */}
    <div className="pointer-events-none absolute -left-10 top-[20%] z-[-1] h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-transparent via-[#FDE68A]/40 to-[#FBBF24]/10 blur-[100px]" />

    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="z-10 flex w-full flex-col items-start pt-12 lg:w-1/2 lg:pt-0">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", padding: "6px 16px", borderRadius: "999px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
        <span style={{ fontSize: "14px", fontWeight: 600, color: COLOR.ink, fontFamily: FONT_BODY }}>Hơn 10.000 người nhận nuôi hạnh phúc</span>
      </div>
      <h1 className="text-[length:clamp(36px,10.5vw,48px)] lg:text-[length:clamp(48px,6vw,84px)]"
        style={{ fontWeight: 900, lineHeight: 1.05, fontFamily: FONT_HEAD, letterSpacing: "-2px", marginBottom: "24px" }}>
        <span style={{ color: COLOR.purple }}>Đừng mua.</span><br />
        <span style={{ color: COLOR.ink }}>Hãy nhận nuôi.</span>
      </h1>
      <p style={{ fontSize: "17px", color: COLOR.body, maxWidth: "480px", lineHeight: 1.6, fontFamily: FONT_BODY, marginBottom: "40px" }}>
        Mỗi thú cưng đều xứng đáng có một mái ấm. Hãy tìm người bạn đồng hành hoàn hảo và trao cho bé cuộc sống xứng đáng.
      </p>

      <div className="mb-10 lg:mb-16 flex flex-wrap gap-4 items-center">
        {/* NÚT 1: Scale khối & Text + Đảo chiều Gradient Cam */}
        <motion.a
          href={ROUTES.pets}
          initial={{ backgroundPosition: "0% 50%", scale: 1 }}
          whileHover={{
            scale: 1.08,
            backgroundPosition: "100% 50%"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center justify-center text-center text-white"
          style={{
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: 700,
            borderRadius: "15px",
            fontFamily: FONT_BODY,
            textDecoration: "none",
            whiteSpace: "nowrap",
            backgroundImage: "linear-gradient(to right, #FDB022 0%, #FDC555 50%, #FDB022 100%)",
            backgroundSize: "200% auto",
            boxShadow: "0 10px 25px rgba(253, 176, 34, 0.4)",
            cursor: "pointer",
          }}
        >
          Tìm người bạn của bạn
        </motion.a>

        {/* NÚT 2: Đứng im + Đổi viền tím & chữ tím khi hover */}
        <motion.a
          href="#about"
          whileHover={{
            borderColor: COLOR.purple,
          }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center justify-center text-center bg-white"
          style={{
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: 700,
            borderRadius: "15px",
            fontFamily: FONT_BODY,
            textDecoration: "none",
            whiteSpace: "nowrap",
            border: `2px solid ${COLOR.border}`,
            color: COLOR.ink,
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            cursor: "pointer",
          }}
        >
          Tìm hiểu thêm
        </motion.a>
      </div>

      <dl className="flex w-full max-w-[480px] items-center gap-6 sm:gap-10">
        {HERO_STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-start">
            <dd style={{ fontSize: "28px", fontWeight: 900, color: COLOR.ink, fontFamily: FONT_HEAD }}>{s.value}</dd>
            <dt style={{ fontSize: "14px", color: COLOR.muted, marginTop: "4px", fontFamily: FONT_BODY }}>{s.label}</dt>
          </div>
        ))}
      </dl>
    </motion.div>

    {/* Cột phải: Hình ảnh thú cưng */}
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
      className="relative z-10 flex h-[360px] w-full items-end justify-center sm:h-[480px] lg:h-[800px] lg:w-1/2">

      {/* Vầng sáng: nhỏ hơn trên mobile */}
      <div className="pointer-events-none absolute right-[10%] top-[25%] z-[-1] h-[280px] w-[280px] rounded-full bg-gradient-to-tr from-transparent via-[#FEF3C7]/40 to-[#FDE68A]/20 blur-[80px] lg:h-[450px] lg:w-[450px] lg:blur-[120px]" />

      {/* Mobile: vừa khung, không scale, không tràn. PC (lg:): y nguyên 120% + scale 1.15 */}
      <img src="/assets/piglet.png" alt="Cute fluffy dog"
        className="absolute bottom-0 w-full max-w-[460px] max-h-full origin-bottom scale-100 object-contain object-bottom drop-shadow-2xl lg:w-[120%] lg:max-w-none lg:max-h-[125%] lg:scale-[1.15] lg:object-center" />

      {/* Lớp mờ: mỏng trên mobile để không che ảnh */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-[110px] w-full bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/80 to-transparent sm:h-[160px] lg:h-[360px]" />
    </motion.div>

    {/* Icon chuột cuộn nảy lên xuống */}
    <motion.a href="#about" aria-label="Cuộn xuống" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex z-30">
      <Icons.Mouse />
    </motion.a>
  </section>
);

// COMPONENT ẢNH NỔI BỒNG BỀNH
const FloatingImage = ({ src, alt, wrapperClass, shadowClass, delay, isHovered }: any) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      // Hàm tạo số ngẫu nhiên trong khoảng min-max
      const random = (min: number, max: number) => Math.random() * (max - min) + min;

      // Tạo mảng keyframe, 'null' ở đầu mảng giúp animation luôn bắt đầu từ vị trí đang đứng hiện tại
      const generateKeyframes = (min: number, max: number) => [
        null,
        random(min, max),
        random(min, max),
        random(min, max),
      ];

      controls.start({
        x: generateKeyframes(-18, 18), // Di chuyển ngang ngẫu nhiên +-18px
        y: generateKeyframes(-18, 18), // Di chuyển dọc ngẫu nhiên +-18px
        rotate: generateKeyframes(-12, 12), // Xoay ngẫu nhiên +-12 độ
        transition: {
          duration: random(5, 8), // Tốc độ di chuyển ngẫu nhiên để các ảnh không bị đều nhau
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror"
        }
      });
    } else {
      // Dừng ngay lập tức và giữ nguyên trạng thái tọa độ, góc xoay hiện tại
      controls.stop();
    }
  }, [isHovered, controls]);

  return (
    // Wrapper bọc ngoài lo hiệu ứng trượt lên khi vừa cuộn tới (Scroll Reveal)
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={wrapperClass}
    >
      {/* Thẻ img bên trong lo hiệu ứng bay lơ lửng. Điều kiện bật tắt shadow êm ái khi hover */}
      <motion.img
        src={src}
        alt={alt}
        animate={controls}
        className={`h-full w-full rounded-full object-cover transition-shadow duration-500 ${isHovered ? shadowClass : 'shadow-none'}`}
      />
    </motion.div>
  );
};

// ABOUT (Hình 2 - Tích hợp hiệu ứng quỹ đạo ngẫu nhiên và Shadow khi hover)
const AboutUsSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="about" className="mx-auto mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] lg:px-20 flex-col-reverse items-center gap-12 px-6 lg:flex-row lg:gap-24">
      {/* Container bắt sự kiện chuột */}
      <div
        className="relative h-[400px] w-full lg:h-[500px] lg:w-1/2 xl:h-[600px] xl:h-[600px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <FloatingImage
          src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80"
          alt="Dog 1"
          wrapperClass="absolute left-0 top-0 h-[280px] w-[280px] xl:h-[336px] xl:w-[336px]"
          shadowClass="shadow-2xl"
          delay={0}
          isHovered={isHovered}
        />
        <FloatingImage
          src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80"
          alt="Cat 1"
          wrapperClass="absolute left-[200px] top-[-20px] h-[80px] w-[80px] xl:left-[240px] xl:top-[-24px] xl:h-[96px] xl:w-[96px]"
          shadowClass="shadow-lg"
          delay={0.1}
          isHovered={isHovered}
        />
        <FloatingImage
          src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80"
          alt="Dog 2"
          wrapperClass="absolute right-0 top-[120px] h-[160px] w-[160px] xl:top-[144px] xl:h-[192px] xl:w-[192px]"
          shadowClass="shadow-xl"
          delay={0.2}
          isHovered={isHovered}
        />
        <FloatingImage
          src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80"
          alt="Husky"
          wrapperClass="absolute bottom-0 left-[100px] h-[220px] w-[220px] xl:left-[120px] xl:h-[264px] xl:w-[264px]"
          shadowClass="shadow-2xl"
          delay={0.3}
          isHovered={isHovered}
        />
        <FloatingImage
          src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=200&q=80"
          alt="Cat 2"
          wrapperClass="absolute bottom-[40px] left-[-30px] h-[110px] w-[110px] xl:bottom-[48px] xl:left-[-36px] xl:h-[132px] xl:w-[132px]"
          shadowClass="shadow-lg"
          delay={0.4}
          isHovered={isHovered}
        />
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
};

const QR_SLIDES = [
  {
    icon: "QR", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
    title: "Định danh QR", sub: "Định danh kỹ thuật số vĩnh viễn cho thú cưng",
    pet: { name: "Max", female: false, info: "3 tuổi · Golden Retriever", qr: "QR-2024-001234", chip: "985112345678901", note: "Thân thiện, thích ăn vặt" },
    points: ["ID thú cưng vĩnh viễn — không bao giờ tái sử dụng", "Quyền sở hữu được liên kết & đóng dấu thời gian", "Lịch sử chuyển chủ được ghi nhận, không ghi đè", "Định danh tồn tại suốt vòng đời thú cưng"]
  },
  {
    icon: "Doc", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    title: "Hồ sơ sức khỏe", sub: "Sổ y tế số luôn đi cùng bé",
    pet: { name: "Luna", female: true, info: "1 tuổi · Labrador", qr: "QR-2024-001235", chip: "985112345678902", note: "Đã tiêm đủ mũi cơ bản" },
    points: ["Lưu lịch sử tiêm phòng và tẩy giun", "Nhắc lịch tiêm, tái khám tự động", "Chia sẻ hồ sơ với bác sĩ chỉ bằng một lần quét", "Ghi chú dị ứng, bệnh lý luôn sẵn sàng"]
  },
  {
    icon: "Shield", img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80",
    title: "Bảo vệ khi thất lạc", sub: "Giúp bé về nhà nhanh hơn",
    pet: { name: "Rocky", female: false, info: "4 tuổi · Siberian Husky", qr: "QR-2024-001236", chip: "985112345678903", note: "Hay sợ tiếng pháo" },
    points: ["Quét QR là thấy ngay thông tin liên hệ chủ nuôi", "Thông báo tức thì khi có người quét thẻ", "Bật chế độ thất lạc để lan tỏa cảnh báo", "Người tìm thấy không cần cài ứng dụng"]
  },
] as const;

const QrSlide = ({ s }: { s: (typeof QR_SLIDES)[number] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full min-w-full shrink-0 flex-col gap-4 lg:flex-row lg:gap-10">
      {/* Trái: ảnh + card nổi (mobile: gọn, nằm trong ảnh) */}
      <div className="relative w-full lg:w-[45%]">
        <img src={s.img} alt={s.title} className="h-[200px] w-full rounded-[28px] object-cover sm:h-[300px] lg:h-[500px] lg:rounded-[40px] xl:h-[600px]" />
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="absolute bottom-3 right-3 w-[190px] overflow-hidden rounded-[20px] bg-white p-4 shadow-2xl lg:-bottom-6 lg:-right-6 lg:w-[260px] lg:rounded-[24px] lg:px-6 lg:pb-2 lg:pt-6">
          <div className="mb-1 flex items-center gap-2"><span className="text-lg font-bold text-gray-900 lg:text-xl">{s.pet.name}</span>{s.pet.female ? <Icons.Female /> : <Icons.Male />}</div>
          <div className="mb-2 text-[13px] text-gray-500 lg:mb-4 lg:text-sm">{s.pet.info}</div>
          <div className="my-2 h-px bg-gray-100 lg:my-4" />
          <div className="mb-1 text-[10px] font-bold text-gray-400">MÃ QR</div>
          <div className="text-[13px] font-semibold text-gray-900 lg:mb-3 lg:text-sm">{s.pet.qr}</div>
          <div className="hidden lg:block">
            <div className="mb-1 text-[10px] font-bold text-gray-400">MICROCHIP</div>
            <div className="mb-3 text-sm font-semibold text-gray-900">{s.pet.chip}</div>
            <div className="mb-1 text-[10px] font-bold text-gray-400">GHI CHÚ</div>
            <div className="mb-6 text-sm font-semibold text-gray-900">{s.pet.note}</div>
            <div className="absolute bottom-0 left-0 h-16 w-full rounded-b-[24px] bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Phải */}
      <div className="relative flex w-full flex-col lg:w-[55%] lg:justify-center lg:pl-16">
        <div className="mb-4 rounded-[24px] border border-gray-100 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.04)] lg:mb-8 lg:rounded-[32px] lg:p-10">
          <div className="mb-4 flex items-start gap-3 lg:mb-6 lg:gap-4">
            <div className="rounded-xl bg-purple-50 p-2">{stepIcon(s.icon, COLOR.purple)}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 lg:text-xl font-['Be_Vietnam_Pro']">{s.title}</h3>
              <p className="mt-1 text-[14px] text-gray-500 lg:text-[15px]">{s.sub}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-3 lg:gap-4">
            {s.points.map((t, i) => (
              <li key={t} className={`items-center gap-3 ${i > 1 && !open ? "hidden lg:flex" : "flex"}`}>
                <span className="shrink-0"><Icons.Check color={COLOR.purple} /></span>
                <span className="text-[14px] font-medium text-gray-600 lg:text-[15px]">{t}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setOpen(!open)} className="mt-3 text-[14px] font-semibold lg:hidden" style={{ color: COLOR.purple }}>
            {open ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
        <div className="flex gap-3 lg:gap-4">
          <motion.a href="#download" whileHover={{ filter: "brightness(1.15)" }} whileTap={{ scale: 0.95 }} className="flex-1 inline-flex items-center justify-center text-center text-white"
            style={{ ...BTN, backgroundColor: COLOR.brand, boxShadow: "0 8px 25px rgba(251,191,36,0.3)" }}>Tải ứng dụng</motion.a>
          <motion.a href={ROUTES.qrShop} initial={{ backgroundColor: "transparent", color: COLOR.brand }} whileHover={{ backgroundColor: COLOR.brand, color: "#fff" }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.3 }}
            className="flex-1 inline-flex items-center justify-center text-center" style={{ ...BTN, border: `2px solid ${COLOR.brand}` }}>Mua thẻ QR</motion.a>
        </div>
      </div>
    </div>
  );
};

const QrSection = () => {
  const { index, next, prev } = useCarousel(QR_SLIDES.length);
  return (
    <section id="qr" className="mx-auto mt-16 sm:mt-24 lg:mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Hệ thống QR" title="Bảo mật danh tính thú cưng" />
      <div className="relative w-full">
        <div className="w-full overflow-hidden lg:-mb-6 lg:pb-6">
          <SwipeArea onNext={next} onPrev={prev} className="w-full">
            <motion.div animate={{ x: `-${index * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex w-full flex-row">
              {QR_SLIDES.map((s) => <QrSlide key={s.title} s={s} />)}
            </motion.div>
          </SwipeArea>
        </div>
        <StackedCarouselControls onNext={next} onPrev={prev} position="right" className="absolute -right-16 top-1/2 hidden -translate-y-1/2 lg:flex" />
      </div>
      <CarouselPagination total={QR_SLIDES.length} current={index} />

      {/* 4 bước: 2 hàng x 2 cột trên mobile */}
      <div className="mt-10 grid w-full grid-cols-2 gap-x-4 gap-y-8 text-center md:grid-cols-4 lg:mt-[80px] lg:gap-4">
        {PET_STEPS.map((step, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="relative flex flex-col items-center">
            <div className="mb-3 lg:mb-6">{stepIcon(step.icon, step.color)}</div>
            <h4 className="mb-2 text-[15px] font-bold text-gray-900 lg:mb-3 lg:text-[17px] font-['Be_Vietnam_Pro']">{step.title}</h4>
            <p className="text-[12px] leading-relaxed text-gray-500 md:whitespace-pre-line lg:text-[13px]">{step.desc}</p>
            {idx < 3 && <div className="absolute right-[-16px] top-4 hidden md:block"><Icons.ArrowRightThin /></div>}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// OUR PETS (Phần gọi dữ liệu API 2000 dòng được khôi phục)
const PetsSection = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const { index, dir, next, prev } = useCarousel(pets.length || 1);
  const [applyPet, setApplyPet] = useState<Pet | null>(null);

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
    <section id="pets" className="relative mx-auto mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Thú cưng của chúng tôi" title="Tô màu cuộc sống của bé" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[60%] left-4 hidden lg:flex" />

      <SwipeArea onNext={next} onPrev={prev} className="w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={pet.id} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
            className="flex w-full flex-col gap-5 overflow-hidden bg-white lg:flex-row lg:gap-12">
            <div className="h-[220px] w-full overflow-hidden rounded-[28px] sm:h-[320px] lg:h-[500px] lg:w-1/2 lg:rounded-[40px] xl:h-[600px]">
              <img src={pet.img} alt={pet.name} className="h-full w-full object-cover grayscale" />
            </div>
            <div className="flex w-full flex-col justify-center lg:w-1/2">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="m-0 text-2xl font-bold text-gray-900 lg:text-3xl">{pet.name}</h3>
                {pet.gender === "Female" ? <Icons.Female /> : <Icons.Male />}
              </div>
              <p className="mb-3 text-gray-500 lg:mb-6">{pet.info}</p>
              <ClampText text={pet.desc} className="mb-4 leading-relaxed text-gray-600 lg:mb-8" />
              <div className="mb-5 flex flex-wrap gap-2 lg:mb-10 lg:gap-3">
                {pet.tags.map((tag) => (
                  <span key={tag.label} style={{ backgroundColor: tag.bg, color: tag.color, padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>{tag.label}</span>
                ))}
              </div>
              <div className="flex gap-3 lg:gap-4">
                <PrimaryBtn href={`${ROUTES.pets}/${pet.id}`}>Kết bạn ngay</PrimaryBtn>
                <OutlineBtn onClick={() => setApplyPet(pet)}>Đăng ký nhận nuôi</OutlineBtn>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </SwipeArea>

      <CarouselPagination total={pets.length} current={index} />
      {applyPet && <AdoptionFormModal pet={{ id: applyPet.id, name: applyPet.name, shelterName: applyPet.shelter }} onClose={() => setApplyPet(null)} />}
    </section>
  );
};

// VERIFIED SHELTERS
const SheltersSection = () => {
  const { index, dir, next, prev } = useCarousel(MOCK_SHELTERS.length);
  const shelter = MOCK_SHELTERS[index];

  return (
    <section id="shelters" className="relative mx-auto mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="" title="Trạm cứu hộ xác minh" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="right" className="absolute top-[60%] right-4 hidden lg:flex" />

      <SwipeArea onNext={next} onPrev={prev} className="w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={shelter.name} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
            className="flex w-full flex-col-reverse items-center gap-5 lg:flex-row lg:items-start lg:gap-16">
            {/* Chữ */}
            <div className="flex w-full flex-col lg:w-[45%]">
              <div className="mb-3 flex items-center gap-4 lg:mb-6">
                <img src={shelter.img} alt="Logo" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[22px] font-bold text-gray-900">{shelter.name}</h3><Icons.Verified />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {shelter.location}
                  </p>
                </div>
              </div>
              <ClampText text={shelter.desc} className="mb-4 leading-relaxed text-gray-600 lg:mb-8" />
              <div className="mb-4 grid grid-cols-3 gap-4 lg:mb-8">
                {shelter.stats.map((s: any) => (
                  <div key={s.l}><div className="text-[22px] font-bold text-gray-900">{s.v}</div><div className="mt-1 text-[12px] text-gray-500">{s.l}</div></div>
                ))}
              </div>

              {/* Mobile: ẩn đến khi bấm "Xem thêm" — PC luôn hiện */}
              <MobileMore>
                <div className="mb-4 h-px w-full bg-gray-100 lg:mb-8" />
                <div className="mb-4 lg:mb-10">
                  <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Trạng thái xác minh</h4>
                  <ul className="flex flex-col gap-3">
                    {[`Xác minh từ ${shelter.since}`, "Báo cáo hoạt động đầy đủ", "Cam kết kiểm tra hậu nhận nuôi"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[14px] text-gray-600"><Icons.Dot /> {item}</li>
                    ))}
                  </ul>
                </div>
              </MobileMore>

              <div className="flex gap-3 lg:gap-4">
                <PrimaryBtn href={ROUTES.shelters}>Xem hồ sơ trạm</PrimaryBtn>
                <OutlineBtn href={ROUTES.shelters}>Tất cả trạm</OutlineBtn>
              </div>
            </div>
            {/* Ảnh */}
            <div className="w-full lg:w-[55%]">
              <img src={shelter.img} alt="Shelter" className="h-[180px] w-full rounded-[28px] object-cover shadow-lg sm:h-[300px] lg:h-[600px] lg:rounded-[40px]" />
            </div>
          </motion.div>
        </AnimatePresence>
      </SwipeArea>

      <CarouselPagination total={MOCK_SHELTERS.length} current={index} />
    </section>
  );
};

// MYTHS (Khắc phục lỗi đè nút, gióng thẳng hàng nút bên trái với section Pets)
const MythsSection = () => {
  const { index, next, prev } = useCarousel(MOCK_MYTHS.length);

  return (
    <section id="myths" className="relative mx-auto mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Nhận nuôi" title="Những hiểu lầm thường gặp" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[50%] left-4 z-20 hidden lg:flex" />

      <div className="w-full overflow-hidden">
        <SwipeArea onNext={next} onPrev={prev} className="w-full">
          <motion.div animate={{ x: `-${index * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex w-full">
            {MOCK_MYTHS.map((myth, idx) => (
              <div key={idx} className="relative flex w-full min-w-full shrink-0 flex-col items-center justify-center lg:flex-row lg:gap-16">
                <img src={myth.img} alt="Myth" className="z-10 h-[220px] w-full rounded-[28px] object-cover shadow-sm sm:h-[320px] lg:h-[500px] lg:w-[46%] lg:shrink-0 lg:rounded-[40px] xl:h-[600px]" />
                <div className="z-10 mt-4 w-full text-center lg:mt-0 lg:max-w-[460px] lg:text-left">
                  <h3 className="mb-2 whitespace-pre-line text-2xl font-bold text-gray-900 lg:mb-4 lg:text-3xl">{myth.title}</h3>
                  <ClampText text={myth.desc} className="text-[15px] leading-relaxed text-gray-500" />
                </div>
                <div className="absolute right-0 top-1/2 z-0 hidden -translate-y-1/2 select-none text-[240px] font-black text-[#FBBF24] opacity-90 lg:block">{idx + 1}</div>
              </div>
            ))}
          </motion.div>
        </SwipeArea>
      </div>

      <CarouselPagination total={MOCK_MYTHS.length} current={index} />
    </section>
  );
};

// FAQ 
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`w-full rounded-2xl border border-gray-100 bg-white transition-shadow overflow-hidden ${isOpen ? 'shadow-md' : 'shadow-sm'}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left focus:outline-none"
      >
        <span className="text-[17px] font-semibold text-gray-900 font-['Be_Vietnam_Pro']">{question}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}><Icons.ChevronDown /></motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="px-6 pb-6 text-[15px] text-gray-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FaqSection = () => (
  <section id="faq" className="mx-auto mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] lg:px-20 flex-col items-center px-6">
    <SectionHeading eyebrow="" title="Hỏi đáp thường gặp" />
    <div className="flex w-full flex-col gap-4 mt-2">
      {FAQS.map((faq, i) => <FaqItem key={i} question={faq.question} answer={faq.answer} />)}
    </div>
  </section>
);

// REVIEWS (Ảnh 6 - Bổ sung Carousel dots ở dưới cùng)
const ReviewsSection = () => {
  const { index, dir, next, prev } = useCarousel(MOCK_JOURNEYS.length);
  const review = MOCK_JOURNEYS[index];

  return (
    <section id="stories" className="relative mx-auto mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Đánh giá" title="Câu chuyện hạnh phúc" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[50%] left-4 hidden lg:flex" />

      <SwipeArea onNext={next} onPrev={prev} className="w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={index} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
            className="flex w-full flex-col items-stretch gap-5 lg:flex-row lg:gap-16">
            <img src={review.img} alt="Happy story" className="h-[220px] w-full rounded-[28px] object-cover shadow-lg sm:h-[320px] lg:h-[500px] lg:w-[45%] lg:rounded-[40px] xl:h-[600px]" />
            <div className="flex flex-col justify-between py-0 lg:w-[55%] lg:py-4">
              <div>
                <div className="mb-3 flex items-center gap-4 lg:mb-8">
                  <img src={review.avatar} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <h4 className="text-[19px] font-bold text-gray-900">{review.name}</h4>
                    <p className="text-[13px] text-gray-500">{review.info}</p>
                  </div>
                </div>
                <ClampText text={review.desc} className="text-[16px] leading-relaxed text-gray-600" />
              </div>
              <div className="mt-4 flex lg:mt-8">
                <OutlineBtn href={ROUTES.stories} className="w-full lg:w-auto" style={{ padding: "14px 28px" }}>Đọc thêm</OutlineBtn>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </SwipeArea>

      <CarouselPagination total={MOCK_JOURNEYS.length} current={index} />
    </section>
  );
};

// PARTNER LOGOS
const PartnerLogosSection = () => (
  <section className="mx-auto mt-16 sm:mt-24 lg:mt-[160px] w-full overflow-hidden border-y border-gray-100 py-12 bg-white">
    <div className="flex w-full animate-[infinite-scroll_25s_linear_infinite] items-center gap-24 whitespace-nowrap">
      {[...MOCK_PARTNERS, ...MOCK_PARTNERS, ...MOCK_PARTNERS].map((src, i) => (
        <img key={i} src={src} alt="Partner Logo" className="h-10 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition duration-300" />
      ))}
    </div>
    <style>{`@keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
  </section>
);

// DOWNLOAD APP (Nâng cấp giao diện điện thoại chuẩn UI có ánh vàng)
const DownloadAppSection = () => {
  // Dữ liệu giả lập cho màn hình điện thoại
  const phoneMockPets = [
    { name: "Max", gender: "male", info: "2 tuổi · G. Retriever", id: "QR-001234", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80", status: "Available", statusColor: "bg-green-100 text-green-700", dot: "bg-green-500" },
    { name: "Luna", gender: "female", info: "1 tuổi · L. Retriever", id: "QR-001235", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80", status: "Pending", statusColor: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    { name: "Rocky", gender: "male", info: "4 tuổi · Siberian Husky", id: "QR-001236", img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80", status: "Hold", statusColor: "bg-red-100 text-red-700", dot: "bg-red-500" },
    { name: "Whiskers", gender: "female", info: "5 tuổi · Maine Coon", id: "QR-001237", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80", status: "Available", statusColor: "bg-green-100 text-green-700", dot: "bg-green-500" },
  ];

  return (
    <section className="mx-auto mt-16 sm:mt-24 lg:mt-[160px] flex w-full max-w-[1392px] lg:px-20 flex-col items-center justify-between gap-12 lg:gap-66 px-6 lg:flex-row">
      {/* Cột trái: Mockup Điện Thoại */}
      <div className="relative flex-shrink-0">
        {/* Khối ánh sáng vàng (Glow effect) ở góc trên bên phải */}
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-gradient-to-tr from-transparent via-[#FDE68A]/60 to-[#FBBF24]/30 blur-[60px] z-0 pointer-events-none" />

        {/* Khung điện thoại */}
        <div className="relative z-10 h-[640px] w-[320px] rounded-[48px] border-[12px] border-[#F8F9FA] bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-gray-900 z-20" />

          {/* Nội dung UI Điện thoại */}
          <div className="flex h-full w-full flex-col bg-white p-5 pt-14">

            {/* Header App */}
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[20px] font-bold text-gray-900 font-['Be_Vietnam_Pro'] tracking-tight">Thú cưng</h4>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <div className="relative">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  <span className="absolute 1 top-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#F97316] ring-2 ring-white" />
                </div>
              </div>
            </div>

            {/* Sub-header Filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <span>Đang hiển thị 11 bé</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              </div>
            </div>

            {/* Grid Thú cưng */}
            <div className="grid grid-cols-2 gap-3">
              {phoneMockPets.map((pet, i) => (
                <div key={i} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
                  <div className="relative h-[110px] w-full mb-2">
                    <img src={pet.img} alt={pet.name} className="h-full w-full rounded-xl object-cover" />
                    <div className={`absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full px-1.5 py-0.5 ${pet.statusColor} bg-opacity-90 backdrop-blur-sm`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pet.dot}`} />
                      <span className="text-[8px] font-bold tracking-wide">{pet.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[13px] font-bold text-gray-900">{pet.name}</span>
                    {pet.gender === "male" ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5" /><line x1="13.5" y1="10.5" x2="21" y2="3" /><polyline points="16 3 21 3 21 8" /></svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="6" /><line x1="12" y1="16" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-500 px-1 mt-0.5">{pet.info}</span>
                  <div className="mt-2 flex px-1 pb-1">
                    <span className="text-[8px] text-gray-400 font-medium tracking-wide">ID: {pet.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lớp mờ ở đáy màn hình điện thoại mô phỏng scroll */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Cột phải: Text & Button */}
      <div className="flex w-full flex-col text-center lg:text-left">
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 font-['Be_Vietnam_Pro'] tracking-tight">Tải ứng dụng PawLife</h2>
        <p className="text-[17px] text-gray-500 mb-10 leading-relaxed max-w-[540px]">
          Trải nghiệm tương lai của việc nhận nuôi thú cưng ngay trên điện thoại của bạn. Tìm kiếm thú cưng, theo dõi hồ sơ nhận nuôi và kết nối với các trạm cứu hộ đã được xác minh - tất cả trong một ứng dụng tiện lợi.
        </p>
        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          <a href={IOS_APP_URL} className="flex items-center gap-3 rounded-[20px] bg-gray-900 px-6 py-3.5 text-white transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
            <Icons.Apple />
            <div className="text-left flex flex-col justify-center">
              <div className="text-[10px] leading-none text-gray-300 mb-1 font-medium">Download on the</div>
              <div className="text-[18px] font-semibold leading-none">App Store</div>
            </div>
          </a>
          <a href={ANDROID_APP_URL} className="flex items-center gap-3 rounded-[20px] bg-gray-900 px-6 py-3.5 text-white transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
            <Icons.GooglePlay />
            <div className="text-left flex flex-col justify-center">
              <div className="text-[10px] leading-none text-gray-300 mb-1 font-medium">GET IT ON</div>
              <div className="text-[18px] font-semibold leading-none">Google Play</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

// FOOTER (Full width, không padding giới hạn, 3 cột dàn đều giữa)
export const FooterSection = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FAFAFA] pt-20 pb-2 mt-16 sm:mt-24 lg:mt-[160px] relative border-t border-gray-100">

      {/* Vùng nội dung chính: Bỏ max-w, dùng px linh hoạt cho 2 bên mép */}
      <div className="flex w-full flex-col lg:flex-row px-8">

        {/* Cột trái: Logo + Slogan + Nút */}
        <div className="flex flex-col items-start min-w-[320px]">
          <BrandLogo size={28} />
          <h2 className="text-[40px] font-bold text-gray-900 mt-8 mb-8 font-['Be_Vietnam_Pro'] leading-[1.2] tracking-tight">
            Đón một người bạn<br />bốn chân về nhà
          </h2>
          <motion.a
            href={ROUTES.pets}
            whileHover={{ filter: "brightness(1.15)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center justify-center text-center text-white"
            style={{
              backgroundColor: COLOR.brand,
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: 700,
              borderRadius: "15px",
              fontFamily: FONT_BODY,
              textDecoration: "none",
              whiteSpace: "nowrap",
              cursor: "pointer",
              boxShadow: "0 8px 25px rgba(251,191,36,0.3)"
            }}
          >
            Tìm bạn đồng hành
          </motion.a>
        </div>

        {/* Cột phải: Chiếm toàn bộ phần còn lại (flex-1) và dàn đều các khối link ra giữa (justify-around) */}
        <div className="flex-1 flex flex-col sm:flex-row justify-between lg:justify-around gap-12 sm:gap-16 pt-16 lg:pt-[84px] lg:pl-20">

          <div className="flex flex-col gap-5">
            <Link href="#about" className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Về chúng tôi</Link>
            <Link href="#pets" className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Thú cưng</Link>
            <Link href="#qr" className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Cách hoạt động</Link>
          </div>

          <div className="flex flex-col gap-5">
            <Link href="#stories" className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Đánh giá</Link>
            <Link href="#faq" className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Hỏi đáp</Link>
            <Link href="#partners" className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Đối tác</Link>
          </div>

          <div className="flex flex-col gap-5">
            <a href={CONTACT.phoneHref} className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`} className="text-[16px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">{CONTACT.email}</a>
            <div className="flex gap-4 pt-1">
              <a href={SOCIALS.facebook} className="text-[#8B5CF6] hover:opacity-80 transition-opacity"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
              <a href={SOCIALS.instagram} className="text-[#8B5CF6] hover:opacity-80 transition-opacity"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
            </div>
          </div>

        </div>
      </div>

      {/* Dòng Copyright ở dưới cùng (kéo dài đường viền 100%) */}
      <div className="w-full mt-16 pt-2 border-t border-gray-200">
        <p className="px-8 lg:px-[10%] text-[14px] text-gray-400 font-['Inter'] text-center lg:text-center">
          © {year} PawLife. Tất cả các quyền được bảo lưu.
        </p>
      </div>

      <button onClick={scrollToTop} aria-label="Cuộn lên đầu trang" className="absolute right-8 top-12 flex h-[48px] w-[48px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50 active:scale-95">
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