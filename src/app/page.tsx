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
  brand: "#FDB022",
  brandSoft: "#FEF3C7",
  purple: "#9B87F5",
  ink: "#111827",
  body: "#6B7280",
  muted: "#9CA3AF",
  faint: "#D1D5DB",
  line: "#F3F4F6",
  border: "#E5E7EB",
};

const FONT_HEAD = "'Be Vietnam Pro', sans-serif";
const FONT_BODY = "'Inter', 'Be Vietnam Pro', sans-serif";
const HEADER_HEIGHT = 70;

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
    stats: [{ v: "47", l: "Bé chờ" }, { v: "214", l: "Đã nhận" }, { v: "94%", l: "Tỷ lệ" }]
  },
  {
    name: "Trạm Cứu Hộ Sài Gòn", location: "TP. Hồ Chí Minh, Việt Nam", since: 2023,
    desc: "Nơi trú ẩn an toàn cho động vật lang thang tại TP.HCM. Sứ mệnh của chúng tôi là chữa lành những vết thương cả về thể chất lẫn tinh thần cho các bé.",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
    stats: [{ v: "62", l: "Bé chờ" }, { v: "310", l: "Đã nhận" }, { v: "89%", l: "Tỷ lệ" }]
  }
];

const MOCK_MYTHS = [
  {
    title: "Chỉ thú cưng bị bệnh mới\nở trạm cứu hộ",
    desc: "Thú cưng tại trạm đều được gắn vi mạch, tẩy giun, tiêm phòng và triệt sản. Mọi quy trình y tế đều được thực hiện nghiêm ngặt theo lịch trình của bác sĩ thú y.",
    img: "/assets/piglet.png"
  },
  {
    title: "Thú cưng ở trạm\nthường có vấn đề hành vi",
    desc: "Phần lớn các bé đến trạm do hoàn cảnh của chủ cũ (chuyển nhà, dị ứng, kinh tế) chứ không phải do tính cách của bé. Nhiều bé đã quen nếp sống trong nhà.",
    img: "/assets/piglet.png"
  }
];

const MOCK_JOURNEYS = [
  { name: "Nguyễn Khánh Linh", info: "Nhận nuôi qua PawLife", desc: "Từ khi có Alice xuất hiện trong đời, tinh thần mình phấn chấn hẳn lên. Mình hiểu rằng mình không còn cô đơn và luôn có một người bạn bốn chân đợi mình ở nhà. Khoảnh khắc tuyệt vời nhất là khi bé đón mình đi làm về.", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
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
  Male: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5" /><line x1="13.5" y1="10.5" x2="21" y2="3" /><polyline points="16 3 21 3 21 8" /></svg>,
  Female: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="6" /><line x1="12" y1="16" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>,
  Check: ({ color }: { color: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  ArrowUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>,
  ArrowRightThin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Apple: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>,
  GooglePlay: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2.8v18.4a1 1 0 0 0 1.5.86l15-9.2a1 1 0 0 0 0-1.72l-15-9.2A1 1 0 0 0 4 2.8z" /></svg>,
  QR: ({ color = "#8B5CF6" }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  Doc: ({ color = "#FBBF24" }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  Shield: ({ color = "#3B82F6" }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  CheckCircle: ({ color = "#10B981" }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Verified: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
  Dot: () => <svg width="8" height="8" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981"><circle cx="12" cy="12" r="10" /></svg>,
  Mouse: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="7" /><line x1="12" y1="6" x2="12" y2="10" /></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
};

const stepIcon = (key: (typeof PET_STEPS)[number]["icon"], color: string) => {
  const Cmp = Icons[key] as any;
  return <Cmp color={color} />;
};

// ============================================================================
// 3. COMPONENT DÙNG CHUNG & CAROUSEL LOGIC
// ============================================================================

const BrandLogo = ({ size = 28 }: { size?: number }) => (
  <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
    <div style={{ backgroundColor: "transparent", padding: "0px 6px", borderRadius: "10px" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLOR.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.25 16.25h1.5L12 17z" />
        <path d="M16 14v.5" />
        <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" />
        <path d="M8 14v.5" />
        <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
      </svg>
    </div>
    <span style={{ fontFamily: FONT_HEAD, fontSize: "20px", fontWeight: 800, color: COLOR.ink }}>
      Paw<span style={{ color: COLOR.brand }}>Life</span>
    </span>
  </Link>
);

const SectionHeading = ({ eyebrow, title, center = true }: { eyebrow: string; title: string; center?: boolean }) => (
  <div style={{ textAlign: center ? "center" : "left", marginBottom: "clamp(16px, 3.5vw, 32px)" }}>
    {eyebrow && <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ color: COLOR.purple, fontSize: "14px", fontWeight: 700, marginBottom: "6px", fontFamily: FONT_HEAD }}>{eyebrow}</motion.p>}
    <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ color: COLOR.ink, fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 900, fontFamily: FONT_HEAD, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
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

const ClampText = ({ text, className = "" }: { text: string; className?: string }) => {
  const [open, setOpen] = useState(false);
  const long = text.length > 110;
  return (
    <div className={className}>
      <p className={!open && long ? "line-clamp-3 lg:line-clamp-none" : ""}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-1.5 text-[13px] font-semibold lg:hidden" style={{ color: COLOR.purple }}>
          {open ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

const MobileMore = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={open ? "block" : "hidden lg:block"}>{children}</div>
      <button type="button" onClick={() => setOpen(!open)} className="mb-4 self-start text-[13px] font-semibold lg:hidden" style={{ color: COLOR.purple }}>
        {open ? "Thu gọn" : "Xem thêm"}
      </button>
    </>
  );
};

const BTN = { padding: "12px 20px", fontSize: "14px", fontWeight: 700, borderRadius: "12px", fontFamily: FONT_BODY, textDecoration: "none", whiteSpace: "nowrap" as const, cursor: "pointer" };
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
  const MAX = 64;
  const GAIN = 1.4;
  const settle = () => animate(x, 0, { type: "spring", stiffness: 420, damping: 30 });

  return (
    <motion.div
      className={className}
      style={{ x, touchAction: "pan-y" }}
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
  <div className={`flex flex-col gap-2 z-20 ${className}`}>
    <button onClick={position === "left" ? onNext : onPrev} aria-label="Next item" className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition active:scale-95">
      {position === "left" ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
    </button>
    <button onClick={position === "left" ? onPrev : onNext} aria-label="Previous item" className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition active:scale-95">
      {position === "left" ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
    </button>
  </div>
);

const CarouselPagination = ({ total, current }: { total: number, current: number }) => (
  <div className="flex gap-[6px] justify-center mt-5 lg:mt-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`h-[5px] rounded-full transition-all duration-300 ${i === current ? "w-6 bg-purple-400" : "w-[5px] bg-gray-300"}`} />
    ))}
  </div>
);

// ============================================================================
// 4. HIỆU ỨNG CON TRỎ & FLOATING BUTTON 
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
        this.x = x; this.y = y; this.size = Math.random() * 5 + 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 2 - 1; this.speedY = Math.random() * 2 - 1;
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
          style={{ width: 50, height: 50, background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)", boxShadow: "0 8px 20px rgba(245,158,11,0.4), 0 2px 5px rgba(0,0,0,0.12)", border: "2px solid rgba(255,255,255,0.8)" }}>
          <Icons.QR color="#fff" />
        </motion.span>
        <motion.span aria-hidden initial={false} animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }} transition={{ duration: 0.2 }} className="pointer-events-none ml-3 hidden whitespace-nowrap rounded-full px-3 py-1.5 sm:block"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "2px solid rgba(255,255,255,0.7)", boxShadow: "0 6px 16px rgba(0,0,0,0.08)", color: COLOR.ink, fontSize: "12px", fontWeight: 600, fontFamily: FONT_HEAD }}>
          Quét mã QR
        </motion.span>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// 5. CÁC SECTION TRANG CHỦ
// ============================================================================

export const HeaderSection = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-400 ${scrolled ? "py-2" : "py-4"}`}>
      {/* Background Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-400"
        style={{
          opacity: scrolled ? 0 : 1,
          backgroundColor: '#F3F4F9',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-400"
        style={{
          opacity: scrolled ? 1 : 0,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
        }}
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
      </div>

      <div className="relative mx-auto flex w-full items-center justify-between px-6 z-10 max-w-[1392px]">
        <BrandLogo />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group relative py-1 text-[14px] font-semibold text-gray-800 hover:text-[#9B87F5] transition-colors font-['Inter']"
            >
              {l.label}
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
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 700,
              borderRadius: "12px",
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

        {/* Mobile Hamburger Icon */}
        <button
          className="lg:hidden flex items-center justify-center p-2 rounded-lg bg-white/50 hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              closed: {
                opacity: 0,
                height: 0,
                transition: { duration: 0.3, staggerChildren: 0.05, staggerDirection: -1 }
              },
              open: {
                opacity: 1,
                height: "auto",
                transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98], staggerChildren: 0.1, delayChildren: 0.1 }
              }
            }}
            className="absolute top-full left-0 w-full overflow-hidden lg:hidden"
          >
            {/* Tấm nền kính mờ */}
            <div className="bg-white/70 backdrop-blur-2xl border-t border-white/50 shadow-[0_30px_60px_rgba(0,0,0,0.08)] px-6 py-6 rounded-b-[24px]">
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((l) => (
                  <motion.div
                    key={l.label}
                    variants={{
                      closed: { opacity: 0, y: -15, filter: "blur(4px)" },
                      open: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4 } }
                    }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-3.5 text-[16px] font-semibold text-gray-800 hover:text-[#9B87F5] border-b border-gray-900/5 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Nút Đăng nhập */}
                <motion.div
                  variants={{
                    closed: { opacity: 0, y: -10, scale: 0.95 },
                    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
                  }}
                  className="mt-4"
                >
                  <Link
                    href={ROUTES.signIn}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full justify-center py-4 bg-gradient-to-r from-[#9B87F5] to-[#8B5CF6] text-white rounded-2xl font-bold text-[15px] shadow-[0_8px_20px_rgba(139,92,246,0.3)] active:scale-95 transition-all"
                  >
                    Đăng nhập
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const HeroSection = () => (
  <section id="top" className="relative mx-auto flex min-h-[500px] w-full max-w-[1392px] lg:px-20 flex-col items-center justify-between px-6 pt-[70px] lg:h-[80vh] lg:min-h-[550px] lg:max-h-[700px] lg:flex-row lg:items-center">
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[-2]" style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
    <div className="pointer-events-none absolute -left-10 top-[20%] z-[-1] h-[400px] w-[500px] rounded-full bg-gradient-to-tr from-transparent via-[#FDE68A]/40 to-[#FBBF24]/10 blur-[80px]" />

    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="z-10 flex w-full flex-col items-start pt-10 lg:w-1/2 lg:pt-0">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", padding: "6px 14px", borderRadius: "999px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: COLOR.ink, fontFamily: FONT_BODY }}>Hơn 10.000 người nhận nuôi hạnh phúc</span>
      </div>
      <h1 className="text-[length:clamp(32px,5vw,60px)] lg:text-[length:clamp(40px,4.5vw,64px)]"
        style={{ fontWeight: 900, lineHeight: 1.1, fontFamily: FONT_HEAD, letterSpacing: "-1.5px", marginBottom: "20px" }}>
        <span style={{ color: COLOR.purple }}>Đừng mua.</span><br />
        <span style={{ color: COLOR.ink }}>Hãy nhận nuôi.</span>
      </h1>
      <p style={{ fontSize: "15px", color: COLOR.body, maxWidth: "420px", lineHeight: 1.6, fontFamily: FONT_BODY, marginBottom: "32px" }}>
        Mỗi thú cưng đều xứng đáng có một mái ấm. Hãy tìm người bạn đồng hành hoàn hảo và trao cho bé cuộc sống xứng đáng.
      </p>

      <div className="mb-8 lg:mb-12 flex flex-wrap gap-4 items-center">
        <motion.a
          href={ROUTES.pets}
          initial={{ backgroundPosition: "0% 50%", scale: 1 }}
          whileHover={{ scale: 1.05, backgroundPosition: "100% 50%" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center justify-center text-center text-white"
          style={{
            padding: "12px 24px", fontSize: "14px", fontWeight: 700, borderRadius: "12px", fontFamily: FONT_BODY, textDecoration: "none", whiteSpace: "nowrap",
            backgroundImage: "linear-gradient(to right, #FDB022 0%, #FDC555 50%, #FDB022 100%)", backgroundSize: "200% auto", boxShadow: "0 8px 20px rgba(253, 176, 34, 0.4)", cursor: "pointer",
          }}
        >
          Tìm người bạn của bạn
        </motion.a>

        <motion.a
          href="#about"
          whileHover={{ borderColor: COLOR.purple }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center justify-center text-center bg-white"
          style={{
            padding: "12px 24px", fontSize: "14px", fontWeight: 700, borderRadius: "12px", fontFamily: FONT_BODY, textDecoration: "none", whiteSpace: "nowrap",
            border: `2px solid ${COLOR.border}`, color: COLOR.ink, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", cursor: "pointer",
          }}
        >
          Tìm hiểu thêm
        </motion.a>
      </div>

      <dl className="flex w-full max-w-[420px] items-center gap-5 sm:gap-8">
        {HERO_STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-start">
            <dd style={{ fontSize: "24px", fontWeight: 900, color: COLOR.ink, fontFamily: FONT_HEAD }}>{s.value}</dd>
            <dt style={{ fontSize: "13px", color: COLOR.muted, marginTop: "4px", fontFamily: FONT_BODY }}>{s.label}</dt>
          </div>
        ))}
      </dl>
    </motion.div>

    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
      className="relative z-10 flex h-[320px] w-full items-end justify-center sm:h-[400px] lg:h-[600px] lg:w-1/2">
      <div className="pointer-events-none absolute right-[10%] top-[25%] z-[-1] h-[220px] w-[220px] rounded-full bg-gradient-to-tr from-transparent via-[#FEF3C7]/40 to-[#FDE68A]/20 blur-[60px] lg:h-[350px] lg:w-[350px] lg:blur-[90px]" />
      <img src="/assets/piglet.png" alt="Cute fluffy dog"
        className="absolute bottom-0 w-full max-w-[400px] max-h-[105%] origin-bottom scale-100 object-contain object-bottom drop-shadow-xl lg:w-[110%] lg:max-w-none lg:scale-[1.05] lg:object-center" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-[80px] w-full bg-gradient-to-t from-[#FFFFFF] via-[#FFFFFF]/80 to-transparent sm:h-[120px] lg:h-[200px]" />
    </motion.div>

    <motion.a href="#about" aria-label="Cuộn xuống" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex z-30">
      <Icons.Mouse />
    </motion.a>
  </section>
);

const FloatingImage = ({ src, alt, wrapperClass, shadowClass, delay, isHovered }: any) => {
  const controls = useAnimation();
  useEffect(() => {
    if (isHovered) {
      const random = (min: number, max: number) => Math.random() * (max - min) + min;
      const generateKeyframes = (min: number, max: number) => [null, random(min, max), random(min, max), random(min, max)];
      controls.start({
        x: generateKeyframes(-12, 12), y: generateKeyframes(-12, 12), rotate: generateKeyframes(-8, 8),
        transition: { duration: random(5, 8), ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }
      });
    } else { controls.stop(); }
  }, [isHovered, controls]);

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay, duration: 0.8 }} className={wrapperClass}>
      <motion.img src={src} alt={alt} animate={controls} className={`h-full w-full rounded-full object-cover transition-shadow duration-500 ${isHovered ? shadowClass : 'shadow-none'}`} />
    </motion.div>
  );
};

const AboutUsSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <section id="about" className="mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] lg:px-20 flex-col-reverse items-center gap-10 px-6 lg:flex-row lg:gap-16">
      <div className="relative h-[340px] w-full lg:h-[400px] lg:w-1/2 xl:h-[460px]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <FloatingImage src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80" alt="Dog 1" wrapperClass="absolute left-0 top-0 h-[220px] w-[220px] xl:h-[260px] xl:w-[260px]" shadowClass="shadow-xl" delay={0} isHovered={isHovered} />
        <FloatingImage src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80" alt="Cat 1" wrapperClass="absolute left-[180px] top-[-10px] h-[70px] w-[70px] xl:left-[210px] xl:top-[-16px] xl:h-[80px] xl:w-[80px]" shadowClass="shadow-md" delay={0.1} isHovered={isHovered} />
        <FloatingImage src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80" alt="Dog 2" wrapperClass="absolute right-0 top-[80px] h-[130px] w-[130px] xl:top-[100px] xl:h-[150px] xl:w-[150px]" shadowClass="shadow-lg" delay={0.2} isHovered={isHovered} />
        <FloatingImage src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80" alt="Husky" wrapperClass="absolute bottom-0 left-[80px] h-[180px] w-[180px] xl:left-[100px] xl:h-[210px] xl:w-[210px]" shadowClass="shadow-xl" delay={0.3} isHovered={isHovered} />
        <FloatingImage src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=200&q=80" alt="Cat 2" wrapperClass="absolute bottom-[30px] left-[-20px] h-[90px] w-[90px] xl:bottom-[40px] xl:left-[-24px] xl:h-[100px] xl:w-[100px]" shadowClass="shadow-md" delay={0.4} isHovered={isHovered} />
      </div>
      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex w-full flex-col lg:w-1/2">
        <SectionHeading eyebrow="Về chúng tôi" title="Chúng tôi là ai?" center={false} />
        <p style={{ color: COLOR.body, fontSize: "14px", lineHeight: 1.6, marginBottom: "32px", marginTop: "-16px" }}>
          Chúng tôi là một dự án thiện nguyện với mục tiêu chính là hỗ trợ các trạm cứu hộ tìm mái ấm mới cho các bé thú cưng kém may mắn.
        </p>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8">
          {ABOUT_STATS.map((stat, i) => (
            <div key={i}>
              <dd style={{ color: COLOR.brand, fontSize: "32px", fontWeight: 900, fontFamily: FONT_HEAD }}><CountUp to={stat.to} suffix={stat.suffix} /></dd>
              <dt style={{ color: COLOR.body, fontSize: "14px", marginTop: "4px" }}>{stat.label}</dt>
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
    points: ["ID thú cưng vĩnh viễn", "Quyền sở hữu được liên kết", "Lịch sử chuyển chủ ghi nhận", "Tồn tại suốt vòng đời"]
  },
  {
    icon: "Doc", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    title: "Hồ sơ sức khỏe", sub: "Sổ y tế số luôn đi cùng bé",
    pet: { name: "Luna", female: true, info: "1 tuổi · Labrador", qr: "QR-2024-001235", chip: "985112345678902", note: "Đã tiêm đủ mũi cơ bản" },
    points: ["Lưu lịch sử tiêm phòng", "Nhắc lịch tái khám tự động", "Chia sẻ hồ sơ nhanh chóng", "Ghi chú bệnh lý sẵn sàng"]
  },
  {
    icon: "Shield", img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80",
    title: "Bảo vệ thất lạc", sub: "Giúp bé về nhà nhanh hơn",
    pet: { name: "Rocky", female: false, info: "4 tuổi · Siberian Husky", qr: "QR-2024-001236", chip: "985112345678903", note: "Hay sợ tiếng pháo" },
    points: ["Quét QR thấy thông tin chủ", "Thông báo tức thì khi quét", "Bật chế độ thất lạc nhanh", "Không cần cài ứng dụng"]
  },
] as const;

const QrSlide = ({ s }: { s: (typeof QR_SLIDES)[number] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full min-w-full shrink-0 flex-col gap-4 lg:flex-row lg:gap-8">
      <div className="relative w-full lg:w-[45%]">
        <img src={s.img} alt={s.title} className="h-[220px] w-full rounded-[24px] object-cover sm:h-[300px] lg:h-[380px] lg:rounded-[32px] xl:h-[440px]" />
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="absolute bottom-3 right-3 w-[180px] overflow-hidden rounded-[16px] bg-white p-3 shadow-xl lg:-bottom-4 lg:-right-4 lg:w-[220px] lg:rounded-[20px] lg:px-5 lg:pb-2 lg:pt-4">
          <div className="mb-1 flex items-center gap-1.5"><span className="text-base font-bold text-gray-900 lg:text-lg">{s.pet.name}</span>{s.pet.female ? <Icons.Female /> : <Icons.Male />}</div>
          <div className="mb-1.5 text-[12px] text-gray-500 lg:mb-3 lg:text-[13px]">{s.pet.info}</div>
          <div className="my-1.5 h-px bg-gray-100 lg:my-3" />
          <div className="mb-0.5 text-[9px] font-bold text-gray-400">MÃ QR</div>
          <div className="text-[12px] font-semibold text-gray-900 lg:mb-2 lg:text-[13px]">{s.pet.qr}</div>
          <div className="hidden lg:block">
            <div className="mb-0.5 text-[9px] font-bold text-gray-400">MICROCHIP</div>
            <div className="mb-2 text-[13px] font-semibold text-gray-900">{s.pet.chip}</div>
            <div className="mb-0.5 text-[9px] font-bold text-gray-400">GHI CHÚ</div>
            <div className="mb-4 text-[13px] font-semibold text-gray-900">{s.pet.note}</div>
            <div className="absolute bottom-0 left-0 h-12 w-full rounded-b-[20px] bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>
        </motion.div>
      </div>

      <div className="relative flex w-full flex-col lg:w-[55%] lg:justify-center lg:pl-10">
        <div className="mb-4 rounded-[20px] border border-gray-100 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.03)] lg:mb-6 lg:rounded-[24px] lg:p-6">
          <div className="mb-3 flex items-start gap-2.5 lg:mb-4 lg:gap-3">
            <div className="rounded-lg bg-purple-50 p-2">{stepIcon(s.icon, COLOR.purple)}</div>
            <div>
              <h3 className="text-base font-bold text-gray-900 lg:text-lg font-['Be_Vietnam_Pro']">{s.title}</h3>
              <p className="mt-0.5 text-[13px] text-gray-500">{s.sub}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5 lg:gap-3">
            {s.points.map((t, i) => (
              <li key={t} className={`items-center gap-2 ${i > 1 && !open ? "hidden lg:flex" : "flex"}`}>
                <span className="shrink-0"><Icons.Check color={COLOR.purple} /></span>
                <span className="text-[13px] font-medium text-gray-600 lg:text-[14px]">{t}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setOpen(!open)} className="mt-2 text-[13px] font-semibold lg:hidden" style={{ color: COLOR.purple }}>
            {open ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
        <div className="flex gap-2.5 lg:gap-3">
          <motion.a href="#download" whileHover={{ filter: "brightness(1.15)" }} whileTap={{ scale: 0.95 }} className="flex-1 inline-flex items-center justify-center text-center text-white"
            style={{ ...BTN, backgroundColor: COLOR.brand, boxShadow: "0 6px 20px rgba(251,191,36,0.25)" }}>Tải ứng dụng</motion.a>
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
    <section id="qr" className="mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Hệ thống QR" title="Bảo mật danh tính thú cưng" />
      <div className="relative w-full">
        <div className="w-full overflow-hidden lg:-mb-4 lg:pb-4">
          <SwipeArea onNext={next} onPrev={prev} className="w-full">
            <motion.div animate={{ x: `-${index * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex w-full flex-row">
              {QR_SLIDES.map((s) => <QrSlide key={s.title} s={s} />)}
            </motion.div>
          </SwipeArea>
        </div>
        <StackedCarouselControls onNext={next} onPrev={prev} position="right" className="absolute -right-12 top-1/2 hidden -translate-y-1/2 lg:flex" />
      </div>
      <CarouselPagination total={QR_SLIDES.length} current={index} />

      <div className="mt-8 grid w-full grid-cols-2 gap-x-4 gap-y-6 text-center md:grid-cols-4 lg:mt-[50px] lg:gap-4">
        {PET_STEPS.map((step, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="relative flex flex-col items-center">
            <div className="mb-2.5 lg:mb-4 scale-90 lg:scale-100">{stepIcon(step.icon, step.color)}</div>
            <h4 className="mb-1.5 text-[14px] font-bold text-gray-900 lg:mb-2 lg:text-[15px] font-['Be_Vietnam_Pro']">{step.title}</h4>
            <p className="text-[12px] leading-relaxed text-gray-500 md:whitespace-pre-line">{step.desc}</p>
            {idx < 3 && <div className="absolute right-[-12px] top-4 hidden md:block"><Icons.ArrowRightThin /></div>}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const DWELL_MS = 5000;
const FADE_DESKTOP_MS = 300;
const FADE_MOBILE_MS = 2000;

const ColorRevealImage = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [canHover, setCanHover] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update(); mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (canHover || !inView || revealed) return;
    let t: ReturnType<typeof setTimeout>;
    const start = () => { clearTimeout(t); t = setTimeout(() => setRevealed(true), DWELL_MS); };
    start(); window.addEventListener("scroll", start, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", start); };
  }, [canHover, inView, revealed]);

  return (
    <div ref={ref} className={className} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <img src={src} alt={alt} className="h-full w-full object-cover"
        style={{ filter: canHover ? (hovered ? "grayscale(0)" : "grayscale(1)") : (revealed ? "grayscale(0)" : "grayscale(1)"), transition: `filter ${canHover ? FADE_DESKTOP_MS : FADE_MOBILE_MS}ms ease-in-out`, willChange: "filter" }} />
    </div>
  );
};

const PetsSection = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const { index, dir, next, prev } = useCarousel(pets.length || 1);
  const [applyPet, setApplyPet] = useState<Pet | null>(null);

  useEffect(() => {
    axiosClient.get("/public/pets", { params: { limit: 12 } }).then((r) => {
      const mappedData = (r.data?.data ?? []).map(toCard);
      setPets(mappedData.length > 0 ? mappedData : MOCK_PETS);
    }).catch(() => setPets(MOCK_PETS));
  }, []);

  const pet = pets[index];
  if (!pet) return null;

  return (
    <section id="pets" className="relative mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Thú cưng của chúng tôi" title="Tô màu cuộc sống của bé" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[55%] left-4 hidden lg:flex" />

      <SwipeArea onNext={next} onPrev={prev} className="w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={pet.id} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
            className="flex w-full flex-col gap-4 overflow-hidden bg-white lg:flex-row lg:gap-10">
            <ColorRevealImage src={pet.img} alt={pet.name} className="h-[220px] w-full overflow-hidden rounded-[24px] sm:h-[300px] lg:h-[380px] lg:w-1/2 lg:rounded-[32px] xl:h-[440px]" />
            <div className="flex w-full flex-col justify-center lg:w-1/2">
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="m-0 text-xl font-bold text-gray-900 lg:text-2xl">{pet.name}</h3>
                {pet.gender === "Female" ? <Icons.Female /> : <Icons.Male />}
              </div>
              <p className="mb-2.5 text-[13px] text-gray-500 lg:mb-4 lg:text-[14px]">{pet.info}</p>
              <ClampText text={pet.desc} className="mb-3 leading-relaxed text-gray-600 text-[14px] lg:mb-6" />
              <div className="mb-4 flex flex-wrap gap-2 lg:mb-8 lg:gap-2.5">
                {pet.tags.map((tag) => (
                  <span key={tag.label} style={{ backgroundColor: tag.bg, color: tag.color, padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>{tag.label}</span>
                ))}
              </div>
              <div className="flex gap-2.5 lg:gap-3">
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

const SheltersSection = () => {
  const { index, dir, next, prev } = useCarousel(MOCK_SHELTERS.length);
  const shelter = MOCK_SHELTERS[index];

  return (
    <section id="shelters" className="relative mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="" title="Trạm cứu hộ xác minh" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="right" className="absolute top-[55%] right-4 hidden lg:flex" />

      <SwipeArea onNext={next} onPrev={prev} className="w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={shelter.name} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
            className="flex w-full flex-col-reverse items-center gap-5 lg:flex-row lg:items-start lg:gap-10">
            <div className="flex w-full flex-col lg:w-[45%]">
              <div className="mb-3 flex items-center gap-3 lg:mb-4">
                <img src={shelter.img} alt="Logo" className="h-12 w-12 rounded-full object-cover lg:h-14 lg:w-14" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[18px] font-bold text-gray-900 lg:text-[20px]">{shelter.name}</h3><Icons.Verified />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-gray-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {shelter.location}
                  </p>
                </div>
              </div>
              <ClampText text={shelter.desc} className="mb-3 text-[14px] leading-relaxed text-gray-600 lg:mb-6" />
              <div className="mb-4 grid grid-cols-3 gap-3 lg:mb-6">
                {shelter.stats.map((s: any) => (
                  <div key={s.l}><div className="text-[18px] font-bold text-gray-900 lg:text-[20px]">{s.v}</div><div className="mt-0.5 text-[11px] text-gray-500 lg:text-[12px]">{s.l}</div></div>
                ))}
              </div>
              <MobileMore>
                <div className="mb-3 h-px w-full bg-gray-100 lg:mb-5" />
                <div className="mb-4 lg:mb-6">
                  <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 lg:text-[11px]">Trạng thái xác minh</h4>
                  <ul className="flex flex-col gap-2">
                    {[`Xác minh từ ${shelter.since}`, "Báo cáo hoạt động", "Kiểm tra hậu nhận nuôi"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[13px] text-gray-600"><Icons.Dot /> {item}</li>
                    ))}
                  </ul>
                </div>
              </MobileMore>
              <div className="flex gap-2.5 lg:gap-3">
                <PrimaryBtn href={ROUTES.shelters}>Xem hồ sơ</PrimaryBtn>
                <OutlineBtn href={ROUTES.shelters}>Tất cả trạm</OutlineBtn>
              </div>
            </div>
            <div className="w-full lg:w-[55%]">
              <img src={shelter.img} alt="Shelter" className="h-[200px] w-full rounded-[24px] object-cover shadow-md sm:h-[300px] lg:h-[380px] lg:rounded-[32px] xl:h-[420px]" />
            </div>
          </motion.div>
        </AnimatePresence>
      </SwipeArea>

      <CarouselPagination total={MOCK_SHELTERS.length} current={index} />
    </section>
  );
};

const MythsSection = () => {
  const { index, next, prev } = useCarousel(MOCK_MYTHS.length);

  return (
    <section id="myths" className="relative mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Nhận nuôi" title="Những hiểu lầm thường gặp" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[50%] left-4 z-20 hidden lg:flex" />

      <div className="w-full overflow-hidden mt-4 lg:mt-8">
        <SwipeArea onNext={next} onPrev={prev} className="w-full">
          <motion.div animate={{ x: `-${index * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex w-full items-center">
            {MOCK_MYTHS.map((myth, idx) => (
              <div key={idx} className="relative flex w-full min-w-full shrink-0 flex-col items-center justify-center lg:flex-row lg:justify-between lg:gap-8 px-4 lg:px-12 py-8">

                {/* 1. Ảnh Piglet Cutout */}
                <div className="z-10 w-full lg:w-[40%] flex justify-center lg:justify-start">
                  <img
                    src={myth.img}
                    alt="Myth"
                    className="h-[260px] sm:h-[350px] lg:h-[450px] xl:h-[500px] object-contain object-bottom drop-shadow-2xl origin-bottom scale-100 lg:scale-110"
                  />
                </div>

                {/* 2. Nội dung Title & Text lệch nhau */}
                <div className="z-10 mt-8 w-full text-center lg:mt-0 lg:w-[50%] lg:text-left flex flex-col justify-center relative">
                  <h3 className="mb-4 whitespace-pre-line text-2xl font-black text-[#111827] lg:mb-6 lg:text-[38px] lg:leading-[1.25] font-['Be_Vietnam_Pro'] tracking-tight">
                    {myth.title}
                  </h3>

                  {/* Khối text được đẩy lùi vào trong để tạo tỷ lệ lệch */}
                  <div className="lg:ml-[15%] lg:pr-12">
                    <ClampText text={myth.desc} className="text-[15px] leading-relaxed text-gray-500 lg:text-[16px]" />
                  </div>
                </div>

                {/* 3. Số thứ tự khổng lồ (Giant Number) */}
                <div className="absolute right-0 top-1/2 z-0 hidden -translate-y-1/2 select-none text-[150px] lg:text-[250px] font-black text-[#FDB022] lg:block leading-none tracking-tighter" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  {idx + 1}
                </div>

              </div>
            ))}
          </motion.div>
        </SwipeArea>
      </div>

      <CarouselPagination total={MOCK_MYTHS.length} current={index} />
    </section>
  );
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`w-full rounded-[16px] border border-gray-100 bg-white transition-shadow overflow-hidden ${isOpen ? 'shadow-md' : 'shadow-sm'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left focus:outline-none">
        <span className="text-[15px] font-semibold text-gray-900 font-['Be_Vietnam_Pro'] lg:text-[16px]">{question}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}><Icons.ChevronDown /></motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-[14px] text-gray-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FaqSection = () => (
  <section id="faq" className="mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] lg:px-20 flex-col items-center px-6">
    <SectionHeading eyebrow="" title="Hỏi đáp thường gặp" />
    <div className="flex w-full flex-col gap-3 mt-1 lg:max-w-4xl">
      {FAQS.map((faq, i) => <FaqItem key={i} question={faq.question} answer={faq.answer} />)}
    </div>
  </section>
);

const ReviewsSection = () => {
  const { index, dir, next, prev } = useCarousel(MOCK_JOURNEYS.length);
  const review = MOCK_JOURNEYS[index];
  return (
    <section id="stories" className="relative mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] flex-col items-center px-6 lg:px-20">
      <SectionHeading eyebrow="Đánh giá" title="Câu chuyện hạnh phúc" />
      <StackedCarouselControls onNext={next} onPrev={prev} position="left" className="absolute top-[55%] left-4 hidden lg:flex" />

      <SwipeArea onNext={next} onPrev={prev} className="w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={index} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
            className="flex w-full flex-col items-stretch gap-5 lg:flex-row lg:gap-12">
            <img src={review.img} alt="Happy story" className="h-[220px] w-full rounded-[24px] object-cover shadow-md sm:h-[300px] lg:h-[380px] lg:w-[45%] lg:rounded-[32px] xl:h-[440px]" />
            <div className="flex flex-col justify-between py-0 lg:w-[55%] lg:py-2">
              <div>
                <div className="mb-3 flex items-center gap-3 lg:mb-6">
                  <img src={review.avatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover lg:h-14 lg:w-14" />
                  <div>
                    <h4 className="text-[17px] font-bold text-gray-900 lg:text-[18px]">{review.name}</h4>
                    <p className="text-[12px] text-gray-500 lg:text-[13px]">{review.info}</p>
                  </div>
                </div>
                <ClampText text={review.desc} className="text-[14px] leading-relaxed text-gray-600 lg:text-[15px]" />
              </div>
              <div className="mt-4 flex lg:mt-6">
                <OutlineBtn href={ROUTES.stories} className="w-full lg:w-auto" style={{ padding: "12px 24px" }}>Đọc thêm</OutlineBtn>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </SwipeArea>
      <CarouselPagination total={MOCK_JOURNEYS.length} current={index} />
    </section>
  );
};

const PartnerLogosSection = () => (
  <section className="mx-auto mt-16 sm:mt-20 lg:mt-[100px] w-full overflow-hidden border-y border-gray-100 py-10 bg-white">
    <div className="flex w-full animate-[infinite-scroll_25s_linear_infinite] items-center gap-16 whitespace-nowrap lg:gap-24">
      {[...MOCK_PARTNERS, ...MOCK_PARTNERS, ...MOCK_PARTNERS].map((src, i) => (
        <img key={i} src={src} alt="Partner Logo" className="h-8 object-contain opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition duration-300 lg:h-10" />
      ))}
    </div>
    <style>{`@keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
  </section>
);

const DownloadAppSection = () => {
  const phoneMockPets = [
    { name: "Max", gender: "male", info: "2 tuổi · G. Retriever", id: "QR-001234", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80", status: "Available", statusColor: "bg-green-100 text-green-700", dot: "bg-green-500" },
    { name: "Luna", gender: "female", info: "1 tuổi · L. Retriever", id: "QR-001235", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80", status: "Pending", statusColor: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    { name: "Rocky", gender: "male", info: "4 tuổi · S. Husky", id: "QR-001236", img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80", status: "Hold", statusColor: "bg-red-100 text-red-700", dot: "bg-red-500" },
    { name: "Whiskers", gender: "female", info: "5 tuổi · Maine Coon", id: "QR-001237", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80", status: "Available", statusColor: "bg-green-100 text-green-700", dot: "bg-green-500" },
  ];

  return (
    <section className="mx-auto mt-16 sm:mt-20 lg:mt-[100px] flex w-full max-w-[1392px] lg:px-20 flex-col items-center justify-between gap-10 px-6 lg:flex-row lg:gap-20">
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <div className="absolute -right-8 -top-8 h-60 w-60 rounded-full bg-gradient-to-tr from-transparent via-[#FDE68A]/60 to-[#FBBF24]/30 blur-[50px] z-0 pointer-events-none" />
        <div className="relative z-10 h-[540px] w-[270px] rounded-[40px] border-[10px] border-[#F8F9FA] bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-gray-900 z-20" />
          <div className="flex h-full w-full flex-col bg-white p-4 pt-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[18px] font-bold text-gray-900 font-['Be_Vietnam_Pro'] tracking-tight">Thú cưng</h4>
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <div className="relative">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#F97316] ring-2 ring-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                <span>Đang hiển thị 11 bé</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {phoneMockPets.map((pet, i) => (
                <div key={i} className="flex flex-col rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm">
                  <div className="relative h-[85px] w-full mb-1.5">
                    <img src={pet.img} alt={pet.name} className="h-full w-full rounded-lg object-cover" />
                    <div className={`absolute right-1 top-1 flex items-center gap-1 rounded-full px-1.5 py-0.5 ${pet.statusColor} bg-opacity-90 backdrop-blur-sm`}>
                      <span className={`h-1 w-1 rounded-full ${pet.dot}`} />
                      <span className="text-[7px] font-bold tracking-wide">{pet.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[11px] font-bold text-gray-900 truncate">{pet.name}</span>
                    {pet.gender === "male" ? (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5" /><line x1="13.5" y1="10.5" x2="21" y2="3" /><polyline points="16 3 21 3 21 8" /></svg>
                    ) : (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="6" /><line x1="12" y1="16" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>
                    )}
                  </div>
                  <span className="text-[8px] text-gray-500 px-1 mt-0.5 truncate">{pet.info}</span>
                  <div className="mt-1 flex px-1 pb-1">
                    <span className="text-[7px] text-gray-400 font-medium tracking-wide">ID: {pet.id}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col text-center lg:text-left">
        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 font-['Be_Vietnam_Pro'] tracking-tight">Tải ứng dụng PawLife</h2>
        <p className="text-[15px] text-gray-500 mb-8 leading-relaxed max-w-[500px] mx-auto lg:mx-0">
          Trải nghiệm tương lai của việc nhận nuôi thú cưng ngay trên điện thoại. Tìm kiếm thú cưng, theo dõi hồ sơ nhận nuôi và kết nối với các trạm cứu hộ đã xác minh - tất cả trong một ứng dụng.
        </p>
        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
          <a href={IOS_APP_URL} className="flex items-center gap-2.5 rounded-[16px] bg-gray-900 px-5 py-3 text-white transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-95 shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
            <Icons.Apple />
            <div className="text-left flex flex-col justify-center">
              <div className="text-[9px] leading-none text-gray-300 mb-1 font-medium">Download on the</div>
              <div className="text-[16px] font-semibold leading-none">App Store</div>
            </div>
          </a>
          <a href={ANDROID_APP_URL} className="flex items-center gap-2.5 rounded-[16px] bg-gray-900 px-5 py-3 text-white transition-all hover:bg-gray-800 hover:scale-[1.02] active:scale-95 shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
            <Icons.GooglePlay />
            <div className="text-left flex flex-col justify-center">
              <div className="text-[9px] leading-none text-gray-300 mb-1 font-medium">GET IT ON</div>
              <div className="text-[16px] font-semibold leading-none">Google Play</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export const FooterSection = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FAFAFA] pt-16 pb-2 mt-16 sm:mt-20 lg:mt-[100px] relative border-t border-gray-100">
      <div className="flex w-full flex-col lg:flex-row px-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col items-start min-w-[300px]">
          <BrandLogo size={24} />
          <h2 className="text-[32px] font-bold text-gray-900 mt-6 mb-6 font-['Be_Vietnam_Pro'] leading-[1.2] tracking-tight">
            Đón một người bạn<br />bốn chân về nhà
          </h2>
          <motion.a href={ROUTES.pets} whileHover={{ filter: "brightness(1.15)" }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}
            className="inline-flex items-center justify-center text-center text-white"
            style={{ backgroundColor: COLOR.brand, padding: "12px 24px", fontSize: "14px", fontWeight: 700, borderRadius: "12px", fontFamily: FONT_BODY, textDecoration: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(251,191,36,0.3)" }}>
            Tìm bạn đồng hành
          </motion.a>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row justify-between lg:justify-around gap-10 sm:gap-12 pt-12 lg:pt-[70px] lg:pl-16">
          <div className="flex flex-col gap-4">
            <Link href="#about" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Về chúng tôi</Link>
            <Link href="#pets" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Thú cưng</Link>
            <Link href="#qr" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Cách hoạt động</Link>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="#stories" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Đánh giá</Link>
            <Link href="#faq" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Hỏi đáp</Link>
            <Link href="#partners" className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">Đối tác</Link>
          </div>
          <div className="flex flex-col gap-4">
            <a href={CONTACT.phoneHref} className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`} className="text-[14px] text-gray-600 hover:text-gray-900 transition-colors font-['Inter']">{CONTACT.email}</a>
            <div className="flex gap-3 pt-1">
              <a href={SOCIALS.facebook} className="text-[#8B5CF6] hover:opacity-80 transition-opacity"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
              <a href={SOCIALS.instagram} className="text-[#8B5CF6] hover:opacity-80 transition-opacity"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg></a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-12 pt-4 border-t border-gray-200">
        <p className="px-8 text-[13px] text-gray-400 font-['Inter'] text-center">
          © {year} PawLife. Tất cả các quyền được bảo lưu.
        </p>
      </div>

      <button onClick={scrollToTop} aria-label="Cuộn lên đầu trang" className="absolute right-6 top-10 flex h-[40px] w-[40px] items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50 active:scale-95">
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