'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useVelocity,
  useAnimation,
  useInView,
  MotionValue,
} from "framer-motion";
import Link from "next/link";

// ============================================================================
// 0. CẤU HÌNH & HẰNG SỐ
// ============================================================================
const IOS_APP_URL = "https://apps.apple.com/vn/app/REPLACE_WITH_REAL_LINK";
const ANDROID_APP_URL: string | null = null;

const ROUTES = {
  scan: "/scan",
  qrShop: "/the-qr",
  pets: "/thu-cung",
  shelters: "/tram-cuu-ho",
  stories: "/cau-chuyen",
  privacy: "/chinh-sach-bao-mat",
  terms: "/dieu-khoan",
};

const SOCIALS = {
  facebook: "https://facebook.com/pawlife.vn",
  instagram: "https://instagram.com/pawlife.vn",
};

const CONTACT = {
  phone: "0901 234 567",
  phoneHref: "tel:+84901234567",
  email: "hello@pawlife.vn",
  address: "Quận 1, TP. Hồ Chí Minh",
};

const COLOR = {
  brand: "#F09E5B",
  brandSoft: "#FFF4EA",
  purple: "#9B7EFA",
  ink: "#111827",
  body: "#4B5563",
  muted: "#6B7280",
  faint: "#9CA3AF",
  line: "#F3F4F6",
  border: "#E5E7EB",
};

const FONT_HEAD = "'Be Vietnam Pro', sans-serif";
const FONT_BODY = "'Inter', 'Be Vietnam Pro', sans-serif";

const HEADER_HEIGHT = 76;

const NAV_LINKS = [
  { label: "Trang chủ", href: "#top" },
  { label: "Về chúng tôi", href: "#about" },
  { label: "Thẻ QR", href: "#qr" },
  { label: "Nhận nuôi", href: "#adopt" },
  { label: "Trạm cứu hộ", href: "#shelters" },
  { label: "Hỏi đáp", href: "#faq" },
];

// ============================================================================
// 1. DỮ LIỆU MẪU (mock data theo bối cảnh Việt Nam)
// ============================================================================
const HERO_STATS = [
  { value: "1.200+", label: "Bé đã có mái ấm" },
  { value: "98%", label: "Gia đình hài lòng" },
  { value: "24/7", label: "Hỗ trợ qua app" },
];

const ABOUT_STATS = [
  { to: 1200, suffix: "+", label: "Bé được nhận nuôi" },
  { to: 5, suffix: "+", label: "Năm hoạt động" },
  { to: 10, suffix: "", label: "Đối tác đồng hành" },
  { to: 20, suffix: "", label: "Trạm cứu hộ liên kết" },
];

type Tag = { label: string; color: string; bg: string };
type Pet = {
  name: string;
  gender: "Male" | "Female";
  info: string;
  desc: string;
  img: string;
  tags: Tag[];
};

const MOCK_ADOPTIONS: Pet[] = [
  {
    name: "Mực",
    gender: "Male",
    info: "4 tuổi • Husky Siberia",
    desc: "Mực có đôi mắt xanh rất cuốn hút, thông minh và trung thành. Bé thích những buổi đi dạo dài vào sáng sớm, hợp với gia đình có trẻ nhỏ và cần một không gian đủ rộng để vận động mỗi ngày.",
    img: "https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Đã triệt sản", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Tinh nghịch", color: "#2563EB", bg: "#DBEAFE" },
      { label: "Thân thiện với trẻ em", color: "#A16207", bg: "#FEF9C3" },
    ],
  },
  {
    name: "Bông",
    gender: "Female",
    info: "2 tuổi • Golden Retriever",
    desc: "Bông hiền và rất quấn người. Bé thích chơi bóng, nằm cạnh sofa mỗi tối và hòa đồng với cả chó mèo khác. Bông đang tìm một gia đình yêu thương để gắn bó lâu dài.",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Đã tiêm phòng", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Thân thiện", color: "#2563EB", bg: "#DBEAFE" },
      { label: "Biết đi vệ sinh đúng chỗ", color: "#A16207", bg: "#FEF9C3" },
    ],
  },
  {
    name: "Cu Tí",
    gender: "Male",
    info: "1 tuổi • Beagle lai",
    desc: "Cu Tí tò mò và tràn đầy năng lượng, thích khám phá mọi ngóc ngách trong nhà. Bé đang học các lệnh cơ bản và sẽ phát triển rất tốt nếu gặp người chủ kiên nhẫn huấn luyện.",
    img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Đã gắn microchip", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Năng động", color: "#2563EB", bg: "#DBEAFE" },
    ],
  },
];

type Shelter = {
  name: string;
  location: string;
  since: number;
  desc: string;
  img: string;
};

const MOCK_SHELTERS: Shelter[] = [
  {
    name: "Mái Ấm Bốn Chân",
    location: "Cầu Giấy, Hà Nội",
    since: 2025,
    desc: "Tổ chức phi lợi nhuận chuyên cứu hộ, chăm sóc và tìm nhà mới cho chó mèo bị bỏ rơi. Mỗi bé đều được thăm khám, tiêm phòng và theo dõi sức khỏe trước khi nhận nuôi.",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Trạm Cứu Hộ Sài Gòn Xanh",
    location: "TP. Thủ Đức, TP. Hồ Chí Minh",
    since: 2025,
    desc: "Nơi trú ẩn an toàn cho những bé chó mèo lang thang, bị bỏ rơi giữa lòng thành phố. Sứ mệnh của trạm là trao cho mỗi bé một cơ hội thứ hai để được yêu thương.",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Hy Vọng Đà Nẵng",
    location: "Liên Chiểu, Đà Nẵng",
    since: 2026,
    desc: "Tập trung điều trị, phục hồi và tìm mái ấm lâu dài cho những bé bị thương hoặc bị bỏ mặc tại khu vực miền Trung.",
    img: "https://images.unsplash.com/photo-1590159763121-7c1dc4dff2da?auto=format&fit=crop&w=800&q=80",
  },
];

const MOCK_MYTHS = [
  {
    title: "Chỉ thú bệnh mới\nở trạm cứu hộ",
    desc: "Thú cưng tại trạm được gắn microchip, tẩy giun, tiêm phòng và triệt sản theo lịch của bác sĩ thú y trước khi tìm nhà mới.",
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Thú ở trạm thường\ncó vấn đề hành vi",
    desc: "Phần lớn các bé đến trạm vì hoàn cảnh của chủ cũ như chuyển nhà, khó khăn kinh tế hay dị ứng, chứ không phải vì tính cách. Nhiều bé đã quen nếp sống trong nhà.",
    img: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Muốn nuôi giống thuần\nthì không thể nhận nuôi",
    desc: "Nhiều bé chó mèo thuần chủng cũng được cứu hộ và gửi tại trạm. Bạn chỉ cần đăng ký để trạm báo ngay khi có bé phù hợp với mong muốn của mình.",
    img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80",
  },
];

const MOCK_JOURNEYS = [
  {
    name: "Nguyễn Thu Hà",
    info: "nhận nuôi bé Bơ tại Mái Ấm Bốn Chân",
    desc: "Từ khi có Bơ, nhà mình rộn ràng hẳn. Sau những ngày làm việc mệt mỏi, được bé chạy ra đón ở cửa là mình thấy mọi thứ nhẹ đi rất nhiều. Mình không còn cảm giác cô đơn nữa.",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Anh Minh & chị Lan",
    info: "nhận nuôi bé Cu Tí tại Trạm Cứu Hộ Sài Gòn Xanh",
    desc: "Đưa Cu Tí về là quyết định đúng nhất của vợ chồng mình. Lúc đầu bé nhút nhát, giờ thì là thành viên tình cảm và nghịch ngợm nhất của gia đình nhỏ này.",
    img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Trần Khánh Linh",
    info: "nhận nuôi bé Mochi tại Hy Vọng Đà Nẵng",
    desc: "Ban đầu mình không chắc đã sẵn sàng nuôi mèo, nhưng gặp Mochi ở trạm là mình thương ngay. Bé đã thay đổi cách mình nhìn cuộc sống và thói quen sinh hoạt mỗi ngày.",
    img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
];

const FAQS = [
  {
    question: "Tại sao nên dùng thẻ QR PawLife?",
    answer:
      "Thẻ QR giúp định danh thú cưng vĩnh viễn, lưu hồ sơ y tế rõ ràng và có chế độ lạc: bất kỳ ai nhặt được bé đều có thể quét để liên hệ chủ nuôi mà không cần tải app.",
  },
  {
    question: "Thẻ QR có bị hỏng khi dính nước không?",
    answer:
      "Thẻ được làm từ chất liệu chống nước và chống xước, đủ bền cho sinh hoạt hằng ngày của thú cưng như tắm rửa, đi dưới mưa hay vui chơi ngoài trời.",
  },
  {
    question: "Thú cưng ở trạm cứu hộ có an toàn về sức khỏe không?",
    answer:
      "Các bé đều được gắn microchip, tẩy giun, tiêm phòng và triệt sản theo lịch của bác sĩ thú y trước khi tìm nhà mới. Hồ sơ y tế được lưu đầy đủ trong PawHistory.",
  },
  {
    question: "Kích hoạt chế độ lạc có mất phí không?",
    answer:
      "Không. Chế độ lạc được kích hoạt miễn phí ngay trên app khi thú cưng của bạn thất lạc, và người nhặt được chỉ cần quét thẻ là có thể liên hệ với bạn.",
  },
  {
    question: "Chuyển chủ cho thú cưng như thế nào?",
    answer:
      "Chủ cũ xác nhận chuyển quyền trên app, chủ mới quét thẻ để tiếp nhận. Toàn bộ hồ sơ PawHistory và lịch sử nhận nuôi được giữ nguyên, không bị chỉnh sửa hay xóa bỏ.",
  },
];

const MOCK_PARTNERS = [
  { name: "Thú Y Việt Pet", color: "#3B82F6" },
  { name: "Sài Gòn Pet Care", color: "#10B981" },
  { name: "Mái Ấm Xanh", color: "#F59E0B" },
  { name: "Bốn Chân Việt", color: "#8B5CF6" },
  { name: "Hà Nội Vet Clinic", color: "#EC4899" },
  { name: "Đà Nẵng Paws", color: "#14B8A6" },
];

const PET_STEPS = [
  { icon: "QR", title: "Kích hoạt thẻ", desc: "Quét mã QR trên app và\nđăng ký cho thú cưng" },
  { icon: "Doc", title: "PawHistory", desc: "Thêm mũi tiêm phòng và\nhồ sơ khám bệnh" },
  { icon: "Shield", title: "Cập nhật thông tin", desc: "Đảm bảo thông tin chủ\nnuôi luôn chính xác" },
  { icon: "CheckCircle", title: "Luôn an toàn", desc: "Gắn thẻ QR cho thú cưng\nmọi lúc mọi nơi" },
] as const;

// ============================================================================
// 2. ICON
// ============================================================================
const Icons = {
  Male: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Đực" role="img">
      <circle cx="10" cy="14" r="5" /><line x1="13.5" y1="10.5" x2="21" y2="3" /><polyline points="16 3 21 3 21 8" />
    </svg>
  ),
  Female: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Cái" role="img">
      <circle cx="12" cy="10" r="6" /><line x1="12" y1="16" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" />
    </svg>
  ),
  Check: ({ color }: { color: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Bell: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  History: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  ArrowRightThin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  QR: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Doc: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Shield: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Verified: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
  ),
};

const stepIcon = (key: (typeof PET_STEPS)[number]["icon"]) => {
  const Cmp = Icons[key];
  return <Cmp />;
};

const AppleIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 2.8v18.4a1 1 0 0 0 1.5.86l15-9.2a1 1 0 0 0 0-1.72l-15-9.2A1 1 0 0 0 4 2.8z" />
  </svg>
);

// ============================================================================
// 3. COMPONENT DÙNG CHUNG
// ============================================================================
const BrandLogo = ({ size = 36, fontSize = 24 }: { size?: number; fontSize?: number }) => (
  <Link href="/" aria-label="PawLife - Trang chủ" className="flex items-center" style={{ gap: "8px", textDecoration: "none" }}>
    <img
      src="/assets/SvgAsset1.png"
      alt="Logo PawLife"
      width={size}
      height={size}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
    <span style={{ fontFamily: FONT_HEAD, fontSize, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1, color: COLOR.ink }}>
      Paw<span style={{ color: COLOR.brand }}>Life</span>
    </span>
  </Link>
);

type ButtonVariant = "primary" | "outline" | "white" | "dark";

const BUTTON_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: COLOR.brand, color: "#fff", border: `1px solid ${COLOR.brand}`, boxShadow: "0 12px 30px rgba(240,158,91,0.3)" },
  outline: { backgroundColor: "transparent", color: COLOR.brand, border: `1px solid ${COLOR.brand}` },
  white: { backgroundColor: "#fff", color: COLOR.ink, border: "1px solid transparent", boxShadow: "0 8px 25px rgba(0,0,0,0.06)" },
  dark: { backgroundColor: COLOR.ink, color: "#fff", border: `1px solid ${COLOR.ink}` },
};

const ButtonLink = ({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const pad = size === "lg" ? "18px 36px" : size === "md" ? "13px 20px" : "9px 16px";
  const fs = size === "lg" ? "16px" : size === "md" ? "14px" : "13px";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center text-center transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${className}`}
      style={{
        ...BUTTON_STYLES[variant],
        padding: pad,
        fontSize: fs,
        fontWeight: 700,
        borderRadius: size === "lg" ? "16px" : "12px",
        fontFamily: FONT_BODY,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
};

const SectionHeading = ({ eyebrow, title, mb = 50 }: { eyebrow: string; title: string; mb?: number }) => (
  <>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{ color: COLOR.brand, fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px", fontFamily: FONT_HEAD }}
    >
      {eyebrow}
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="text-center"
      style={{ color: COLOR.ink, fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 700, marginBottom: `${mb}px`, fontFamily: FONT_HEAD, lineHeight: 1.25 }}
    >
      {title}
    </motion.h2>
  </>
);

const StoreButton = ({
  href,
  icon,
  small,
  big,
  badge,
}: {
  href: string | null;
  icon: React.ReactNode;
  small: string;
  big: string;
  badge?: string;
}) => {
  const disabled = !href;
  const inner = (
    <>
      {icon}
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, textAlign: "left" }}>
        <span style={{ fontSize: "11px", fontWeight: 500, opacity: 0.85, fontFamily: FONT_BODY }}>{small}</span>
        <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_HEAD, whiteSpace: "nowrap" }}>{big}</span>
      </span>
      {badge && (
        <span
          style={{
            position: "absolute",
            top: "-10px",
            right: "-8px",
            backgroundColor: COLOR.brand,
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "999px",
            fontFamily: FONT_HEAD,
            boxShadow: "0 4px 10px rgba(240,158,91,0.4)",
          }}
        >
          {badge}
        </span>
      )}
    </>
  );

  const baseStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 18px",
    borderRadius: "14px",
    backgroundColor: disabled ? "#9CA3AF" : COLOR.ink,
    color: "#fff",
    textDecoration: "none",
    minWidth: "168px",
    boxShadow: disabled ? "none" : "0 10px 24px rgba(17,24,39,0.18)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.75 : 1,
  };

  if (disabled) {
    return (
      <div aria-disabled="true" title="Sắp ra mắt" style={baseStyle}>
        {inner}
      </div>
    );
  }

  return (
    <motion.a href={href!} target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }} style={baseStyle}>
      {inner}
    </motion.a>
  );
};

// ----------------------------------------------------------------------------
//  Số đếm tăng dần khi cuộn tới
// ----------------------------------------------------------------------------
const CountUp = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = !!useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {val.toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
};

// ----------------------------------------------------------------------------
//  Carousel: hook, vuốt cảm ứng, điều khiển, bàn phím
// ----------------------------------------------------------------------------
const useCarousel = (length: number) => {
  const [index, setIndex] = useState(0);
  const next = () => setIndex((p) => (p + 1) % length);
  const prev = () => setIndex((p) => (p - 1 + length) % length);
  return { index, setIndex, next, prev };
};

const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsTouch(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isTouch;
};

const SwipeArea = ({
  onNext,
  onPrev,
  children,
  className = "w-full",
}: {
  onNext: () => void;
  onPrev: () => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const isTouch = useIsTouch();
  const reduce = !!useReducedMotion();
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!isTouch || !inView) return;
    setShowHint(true);
    if (!reduce) {
      controls.start({
        x: [0, -26, 20, -12, 0],
        transition: { duration: 1.2, delay: 0.5, ease: "easeInOut" },
      });
    }
    const t = window.setTimeout(() => setShowHint(false), 3500);
    return () => window.clearTimeout(t);
  }, [isTouch, inView, reduce, controls]);

  if (!isTouch) return <>{children}</>;

  return (
    <div ref={ref} className={`relative overflow-x-clip ${className}`}>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        dragSnapToOrigin
        animate={controls}
        onDragStart={() => setShowHint(false)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60 || info.velocity.x < -500) onNext();
          else if (info.offset.x > 60 || info.velocity.x > 500) onPrev();
        }}
        style={{ touchAction: "pan-y" }}
      >
        {children}
      </motion.div>
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: showHint ? 1 : 0, y: showHint ? 0 : 6 }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-1.5"
        style={{ backgroundColor: "rgba(17,24,39,0.72)", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: FONT_HEAD, backdropFilter: "blur(4px)" }}
      >
        <motion.span animate={reduce ? undefined : { x: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity }}>‹</motion.span>
        Vuốt để xem thêm
        <motion.span animate={reduce ? undefined : { x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>›</motion.span>
      </motion.div>
    </div>
  );
};

const Carousel = ({
  label,
  onNext,
  onPrev,
  children,
  className = "w-full",
}: {
  label: string;
  onNext: () => void;
  onPrev: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    role="region"
    aria-roledescription="carousel"
    aria-label={label}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
    }}
    className={`rounded-[32px] outline-none focus-visible:ring-2 focus-visible:ring-[#F09E5B]/60 ${className}`}
  >
    <SwipeArea onNext={onNext} onPrev={onPrev}>
      {children}
    </SwipeArea>
  </div>
);

const ArrowButton = ({ dir, onClick, label }: { dir: "prev" | "next"; onClick: () => void; label: string }) => (
  <motion.button
    type="button"
    aria-label={label}
    onClick={onClick}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.92 }}
    className="flex h-10 w-10 items-center justify-center"
    style={{ backgroundColor: "#fff", border: `1px solid ${COLOR.border}`, borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer" }}
  >
    {dir === "prev" ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
  </motion.button>
);

const CarouselControls = ({
  total,
  current,
  onChange,
  onPrev,
  onNext,
  label,
}: {
  total: number;
  current: number;
  onChange: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
  label: string;
}) => (
  <div className="mt-6 flex items-center justify-center gap-4">
    <ArrowButton dir="prev" onClick={onPrev} label={`${label}: mục trước`} />
    <div className="flex items-center">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange(idx)}
          aria-label={`${label}: đến mục ${idx + 1}`}
          aria-current={idx === current ? "true" : undefined}
          className="p-[7px]"
          style={{ cursor: "pointer", background: "none", border: "none" }}
        >
          <span
            style={{
              display: "block",
              height: "8px",
              width: idx === current ? "28px" : "8px",
              borderRadius: "4px",
              backgroundColor: idx === current ? COLOR.brand : "#D1D5DB",
              transition: "all 0.3s ease",
            }}
          />
        </button>
      ))}
    </div>
    <ArrowButton dir="next" onClick={onNext} label={`${label}: mục sau`} />
  </div>
);

// ============================================================================
// 4. HIỆU ỨNG CON TRỎ
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

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const colors = ["#F09E5B", "#FF9500", "#FFB36B", "#FFD6A8", "#FACC15"];
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
        } else {
          ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }
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

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize);

    let rafId = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); }
      particles = particles.filter((p) => p.life > 0 && p.size > 0.1);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [reduce]);

  if (reduce) return null;
  return <canvas ref={canvasRef} aria-hidden style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 9999 }} />;
};

const CURSOR_IMG = "/assets/images/minimal-dog-pack.png";
const CURSOR_SIZE = 56;
const CURSOR_HOTSPOT = { x: CURSOR_SIZE / 2, y: CURSOR_SIZE / 2 };
const AURA_SIZE = 96;
const CLICKABLE_SELECTOR = 'a, button, input, textarea, select, label, summary, [role="button"], .cursor-pointer, [style*="cursor: pointer"]';

const PawCursor = () => (
  <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
    <g fill="#F09E5B" stroke="#fff" strokeWidth="3" strokeLinejoin="round">
      <ellipse cx="32" cy="42" rx="14" ry="11" />
      <ellipse cx="14" cy="28" rx="6" ry="8" transform="rotate(-20 14 28)" />
      <ellipse cx="25" cy="17" rx="6" ry="8.5" transform="rotate(-6 25 17)" />
      <ellipse cx="39" cy="17" rx="6" ry="8.5" transform="rotate(6 39 17)" />
      <ellipse cx="50" cy="28" rx="6" ry="8" transform="rotate(20 50 28)" />
    </g>
    <ellipse cx="28" cy="38" rx="4" ry="2.5" fill="#fff" opacity="0.55" />
  </svg>
);

const CuteCursor = () => {
  const reduce = !!useReducedMotion();
  const [ready, setReady] = useState(false);
  const [imgOk, setImgOk] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  const sx = useSpring(mx, { stiffness: 500, damping: 35, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 500, damping: 35, mass: 0.4 });
  const x = useTransform(sx, (v: number) => v - CURSOR_HOTSPOT.x);
  const y = useTransform(sy, (v: number) => v - CURSOR_HOTSPOT.y);

  const ax = useSpring(mx, { stiffness: 130, damping: 20, mass: 0.7 });
  const ay = useSpring(my, { stiffness: 130, damping: 20, mass: 0.7 });
  const auraX = useTransform(ax, (v: number) => v - AURA_SIZE / 2);
  const auraY = useTransform(ay, (v: number) => v - AURA_SIZE / 2);

  const vx = useVelocity(sx);
  const tiltRaw = useTransform(vx, [-1800, 1800], [-16, 16]);
  const tilt = useSpring(tiltRaw, { stiffness: 200, damping: 18 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      setImgOk(ok);
      setReady(true);
    };
    const img = new Image();
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = CURSOR_IMG;
    const t = window.setTimeout(() => finish(false), 2000);
    return () => { done = true; window.clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timers: number[] = [];
    const onMove = (e: PointerEvent) => { if (e.pointerType === "touch") return; mx.set(e.clientX); my.set(e.clientY); setVisible(true); };
    const onOver = (e: MouseEvent) => { const t = e.target as Element | null; setHovering(!!(t && t.closest && t.closest(CLICKABLE_SELECTOR))); };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPressing(true);
      const id = ++rippleId.current;
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }]);
      timers.push(window.setTimeout(() => setRipples((r) => r.filter((i) => i.id !== id)), 800));
    };
    const onUp = () => setPressing(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [ready, mx, my]);

  if (!ready) return null;

  return (
    <>
      <style>{`html, html *, html *::before, html *::after { cursor: none !important; }`}</style>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0" style={{ x: auraX, y: auraY, width: AURA_SIZE, height: AURA_SIZE, zIndex: 9998 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.2 }}>
        <motion.div className="relative h-full w-full" animate={{ scale: pressing ? 0.7 : hovering ? 1.5 : 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
          <motion.span className="absolute inset-0 rounded-full blur-xl" style={{ background: "radial-gradient(circle, rgba(255,149,0,0.55) 0%, rgba(240,158,91,0.25) 45%, transparent 70%)" }} animate={reduce ? undefined : { scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
          <motion.span className="absolute inset-[18px] rounded-full border-2 border-dashed" style={{ borderColor: "rgba(240,158,91,0.75)" }} animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
        </motion.div>
      </motion.div>
      {ripples.map((r) => (
        <motion.span key={r.id} aria-hidden className="pointer-events-none fixed rounded-full" style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40, border: "3px solid #F09E5B", zIndex: 9997 }} initial={{ scale: 0.3, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} />
      ))}
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0" style={{ x, y, width: CURSOR_SIZE, height: CURSOR_SIZE, zIndex: 10000 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.15 }}>
        <motion.div className="h-full w-full" style={{ rotate: reduce ? 0 : tilt, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }} animate={{ scale: pressing ? 0.82 : hovering ? 1.25 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          {imgOk ? <img src={CURSOR_IMG} alt="" draggable={false} className="h-full w-full select-none object-contain" /> : <PawCursor />}
        </motion.div>
      </motion.div>
    </>
  );
};

// ============================================================================
// 5. CÁC SECTION
// ============================================================================

// ----------------------------------------------------------------------------
//  HEADER
// ----------------------------------------------------------------------------
const HeaderSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const glassOn = scrolled || menuOpen;

  const linkStyle: React.CSSProperties = {
    fontFamily: FONT_BODY,
    fontSize: "15px",
    color: "rgba(30,30,30,1)",
    fontWeight: 500,
    textDecoration: "none",
  };

  return (
    <>
      <div style={{ height: HEADER_HEIGHT, width: "100%" }} aria-hidden />

      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed left-0 top-0 z-50 w-full"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glassOn ? 1 : 0,
            transition: "opacity 0.35s ease",
            background: "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 100%)",
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
            borderBottom: "1px solid rgba(255,255,255,0.65)",
            boxShadow: "0 8px 32px rgba(31,38,135,0.08), inset 0 -1px 0 rgba(0,0,0,0.04)",
          }}
        />

        <div
          className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 lg:px-10 xl:px-16"
          style={{ paddingTop: scrolled ? "10px" : "20px", paddingBottom: "10px", transition: "padding 0.35s ease" }}
        >
          <BrandLogo size={32} fontSize={20} />

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <motion.a key={l.href} href={l.href} whileHover={{ y: -1, color: COLOR.brand }} style={linkStyle}>
                {l.label}
              </motion.a>
            ))}
            <ButtonLink href="#download" size="sm" variant="primary">Liên hệ</ButtonLink>
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="p-1 lg:hidden"
            style={{ cursor: "pointer", background: "none", border: "none", color: COLOR.ink }}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {menuOpen ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menu di động"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-3 mb-2 flex flex-col rounded-2xl p-4 lg:hidden"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(18px) saturate(180%)",
              WebkitBackdropFilter: "blur(18px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{ ...linkStyle, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3">
              <ButtonLink href="#download" variant="primary" className="w-full">Tải app PawLife</ButtonLink>
            </div>
          </motion.nav>
        )}
      </motion.header>
    </>
  );
};

// ----------------------------------------------------------------------------
//  HERO (Cập nhật giống hệt thiết kế 3 cột)
// ----------------------------------------------------------------------------
const HeroSection = () => (
  <section
    id="top"
    aria-labelledby="hero-title"
    className="relative z-10 mx-auto mt-0 lg:mt-[10px] flex min-h-[600px] w-full max-w-[1440px] flex-col items-center justify-between overflow-visible px-4 pb-16 lg:h-[calc(100vh-140px)] lg:max-h-[850px] lg:flex-row lg:items-center lg:px-10 xl:px-16 lg:pb-0"
  >
    {/* Grid Background mờ */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[-1]"
      style={{
        backgroundImage: "linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
      }}
    />

    {/* Cột 1: Thông điệp (Desktop Only) */}
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="flex w-full flex-col items-start pr-0 pt-6 mb-12 lg:pt-0 lg:mb-0 lg:pr-6 lg:w-[26%]"
    >
      <p style={{ fontSize: "14px", fontWeight: 700, color: COLOR.ink, fontFamily: FONT_HEAD, marginBottom: "20px" }}>
        Ủng hộ nhận nuôi chó mèo
      </p>
      <h2 style={{ fontSize: "clamp(32px, 3.2vw, 44px)", fontWeight: 800, lineHeight: 1.2, fontFamily: FONT_HEAD, letterSpacing: "-1px", marginBottom: "20px" }}>
        <span style={{ color: COLOR.purple }}>Nhận nuôi</span>
        <br />
        <span style={{ color: COLOR.ink }}>cùng PawLife</span>
      </h2>
      <p style={{ fontSize: "14px", color: COLOR.ink, lineHeight: 1.6, fontFamily: FONT_BODY, fontWeight: 500, marginBottom: "40px" }}>
        Một bé thú cưng không chỉ cần một nơi để ở, mà cần một người hiểu, chăm sóc và sẵn sàng đồng hành trong những năm tháng phía trước. Hãy nhận nuôi có trách nhiệm vì mỗi sinh mạng đều đáng quý.
      </p>
      <a
        href="#download"
        style={{ fontSize: "15px", fontWeight: 700, color: COLOR.ink, fontFamily: FONT_HEAD, textDecoration: "none" }}
        className="transition-colors hover:text-[#F09E5B]"
      >
        Tải app PawLife
      </a>
    </motion.div>

    {/* Cột 2: Nội dung chính */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="relative z-10 flex w-full flex-col items-start pt-8 lg:w-[44%] lg:pt-0"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", padding: "8px 18px", borderRadius: "999px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: `1px solid ${COLOR.line}`, width: "fit-content", marginBottom: "32px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} aria-hidden />
        <span style={{ fontSize: "12px", fontWeight: 700, color: COLOR.muted, fontFamily: FONT_HEAD }}>
          Hơn 1.200 gia đình đã tìm thấy người bạn bốn chân
        </span>
      </div>

      <h1
        id="hero-title"
        style={{ fontSize: "clamp(36px, 8vw, 68px)", fontWeight: 900, lineHeight: 1.05, fontFamily: FONT_HEAD, letterSpacing: "-1.5px", marginBottom: "24px" }}
      >
        <span style={{ color: COLOR.purple }}>Đừng mua.</span>
        <br />
        <span style={{ color: COLOR.ink }}>Hãy nhận nuôi.</span>
      </h1>

      <p style={{ fontSize: "14px", color: COLOR.muted, maxWidth: "440px", lineHeight: 1.7, fontFamily: FONT_BODY, fontWeight: 500, marginBottom: "40px" }}>
        Mỗi bé thú cưng đều xứng đáng có một mái ấm. Hãy tìm người bạn đồng hành phù hợp và trao cho bé cuộc sống mà bé xứng đáng có.
      </p>

      {/* Buttons chuẩn form viên nhộng (Pill shape) */}
      <div className="mb-14 flex flex-wrap gap-4">
        <Link
          href="#adopt"
          className="inline-flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: COLOR.brand, color: "#fff", padding: "14px 28px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, fontFamily: FONT_BODY, textDecoration: "none", boxShadow: "0 10px 25px rgba(240,158,91,0.3)" }}
        >
          Tìm người bạn của bạn
        </Link>
        <Link
          href="#about"
          className="inline-flex items-center justify-center transition hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: "#fff", color: COLOR.ink, padding: "14px 28px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, fontFamily: FONT_BODY, textDecoration: "none", border: `1px solid ${COLOR.border}`, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}
        >
          Tìm hiểu thêm
        </Link>
      </div>

      {/* Stats */}
      <dl className="flex w-full max-w-[440px] items-center justify-between gap-4">
        {HERO_STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-start">
            <dt className="sr-only">{s.label}</dt>
            <dd style={{ fontSize: "26px", fontWeight: 900, color: COLOR.ink, fontFamily: FONT_HEAD, margin: 0 }}>{s.value}</dd>
            <div aria-hidden style={{ fontSize: "11px", color: COLOR.muted, marginTop: "6px", fontWeight: 600, fontFamily: FONT_BODY }}>{s.label}</div>
          </div>
        ))}
      </dl>
    </motion.div>

    {/* Cột 3: Hình bé cún */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative z-10 mt-12 flex h-[35vh] min-h-[300px] w-full items-center justify-center lg:mt-0 lg:h-full lg:w-[30%] lg:justify-end"
    >
      <img
        src="/assets/piglet.png"
        alt="Thú cưng đang chờ nhận nuôi"
        className="h-full w-full object-contain"
        style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.12))", transform: "scale(1.3) translateY(2%)" }}
      />
    </motion.div>

    <a
      href="#about"
      aria-label="Cuộn xuống phần Về chúng tôi"
      className="absolute bottom-2 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center sm:flex lg:bottom-6"
    >
      <motion.svg animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} width="24" height="36" viewBox="0 0 24 36" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="5" y="2" width="14" height="32" rx="7" />
        <line x1="12" y1="10" x2="12" y2="14" />
      </motion.svg>
    </a>
  </section>
);

// ----------------------------------------------------------------------------
//  VỀ CHÚNG TÔI: ẢNH TRÒN BAY LƠ LỬNG
// ----------------------------------------------------------------------------
type Bubble = { src: string; alt: string; size: number; top: number; left: number; z: number; scrollRange: [number, number]; depth: number; glow: string; delay: number; floatDistance: number; floatDuration: number };

const BUBBLES: Bubble[] = [
  { src: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80", alt: "Chú chó Golden Retriever", size: 260, top: 60, left: 90, z: 10, scrollRange: [40, -40], depth: 16, glow: "#F09E5B", delay: 0.05, floatDistance: 12, floatDuration: 6 },
  { src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80", alt: "Chú mèo nhìn thẳng ống kính", size: 65, top: 40, left: 310, z: 5, scrollRange: [80, -80], depth: 34, glow: "#8B5CF6", delay: 0.35, floatDistance: 8, floatDuration: 3.8 },
  { src: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=300&q=80", alt: "Chú mèo con trong vòng tay", size: 110, top: 260, left: 40, z: 20, scrollRange: [-50, 50], depth: 28, glow: "#EC4899", delay: 0.5, floatDistance: 10, floatDuration: 4.6 },
  { src: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80", alt: "Chú chó Beagle", size: 120, top: 170, left: 360, z: 10, scrollRange: [100, -100], depth: 40, glow: "#3B82F6", delay: 0.65, floatDistance: 14, floatDuration: 5.2 },
  { src: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80", alt: "Chú chó Husky", size: 170, top: 310, left: 200, z: 15, scrollRange: [-20, 20], depth: 22, glow: "#FACC15", delay: 0.8, floatDistance: 11, floatDuration: 5.8 },
];

const SPARKLES = [
  { top: 30, left: 60, size: 16, delay: 0, color: "#F09E5B" },
  { top: 130, left: 18, size: 12, delay: 0.8, color: "#8B5CF6" },
  { top: 8, left: 240, size: 14, delay: 1.4, color: "#FACC15" },
  { top: 250, left: 468, size: 18, delay: 0.4, color: "#3B82F6" },
  { top: 430, left: 110, size: 14, delay: 1.9, color: "#EC4899" },
  { top: 470, left: 410, size: 12, delay: 1.1, color: "#F09E5B" },
];

const Sparkle = ({ top, left, size, delay, color, reduce }: { top: number; left: number; size: number; delay: number; color: string; reduce: boolean }) => (
  <motion.svg
    aria-hidden
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className="pointer-events-none absolute"
    style={{ top, left, zIndex: 30 }}
    animate={reduce ? { opacity: 0.6 } : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 90, 180] }}
    transition={{ duration: 2.8, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <path d="M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z" fill={color} />
  </motion.svg>
);

const HeroBubble = ({
  b,
  scrollProgress,
  mouseX,
  mouseY,
  reduce,
  isHovered,
}: {
  b: Bubble;
  scrollProgress: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  reduce: boolean;
  isHovered?: boolean;
}) => {
  const scrollY = useTransform(scrollProgress, [0, 1], b.scrollRange);
  const px = useTransform(mouseX, (v: number) => v * b.depth);
  const py = useTransform(mouseY, (v: number) => v * b.depth);
  const y = useTransform([scrollY, py], (v: number[]) => v[0] + v[1]);

  const rnd = useMemo(
    () => ({
      x: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 10),
      y: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 10),
      rot: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 10 + 5),
    }),
    []
  );

  return (
    <motion.div className="absolute" style={{ top: b.top, left: b.left, width: b.size, height: b.size, zIndex: b.z, x: px, y }}>
      <motion.div
        className="relative h-full w-full"
        initial={reduce ? false : { scale: 0.2, opacity: 0, rotate: -14 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: b.delay }}
        whileTap={{ scale: 1.12, rotate: 6 }}
      >
        <motion.span
          aria-hidden
          className="absolute -inset-3 rounded-full blur-xl"
          style={{ backgroundColor: b.glow, opacity: 0.3 }}
          animate={reduce ? { opacity: 0.4 } : { opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.14, 0.95] }}
          transition={{ duration: b.floatDuration, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="relative h-full w-full"
          animate={reduce ? undefined : { y: [0, -b.floatDistance, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: b.floatDuration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.img
            src={b.src}
            alt={b.alt}
            draggable={false}
            loading="lazy"
            className="relative h-full w-full select-none rounded-full object-cover ring-[5px] ring-white"
            initial={{ boxShadow: "0 18px 40px rgba(0,0,0,0.16)", x: 0, y: 0, rotate: 0 }}
            animate={
              isHovered
                ? { boxShadow: "0 6px 12px rgba(0,0,0,0.5)", x: [0, rnd.x, -rnd.x, 0], y: [0, rnd.y, -rnd.y, 0], rotate: [0, rnd.rot, -rnd.rot, 0] }
                : { boxShadow: "0 18px 40px rgba(0,0,0,0.16)", x: 0, y: 0, rotate: 0 }
            }
            transition={{
              boxShadow: { duration: 0.3 },
              x: isHovered ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5, ease: "easeOut" },
              y: isHovered ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5, ease: "easeOut" },
              rotate: isHovered ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5, ease: "easeOut" },
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const AboutUsSection = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mouseX = useSpring(mx, { stiffness: 70, damping: 14, mass: 0.6 });
  const mouseY = useSpring(my, { stiffness: 70, damping: 14, mass: 0.6 });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  };

  return (
    <section
      id="about"
      ref={ref}
      aria-labelledby="about-title"
      className="mx-auto mb-[60px] mt-[100px] flex w-full max-w-[1100px] flex-col items-center justify-center px-4 lg:mt-[160px] lg:flex-row lg:px-0"
      style={{ backgroundColor: "#ffffff", fontFamily: FONT_BODY }}
    >
      <div
        onPointerEnter={() => setIsHovered(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative flex h-[330px] w-full justify-center overflow-x-clip min-[420px]:h-[390px] sm:h-[450px] lg:h-[500px] lg:w-1/2 lg:justify-start"
      >
        <div className="relative h-[500px] w-[500px] shrink-0 origin-top scale-[0.62] min-[420px]:scale-[0.74] sm:scale-[0.88] lg:scale-100">
          {SPARKLES.map((s, i) => <Sparkle key={i} {...s} reduce={reduce} />)}
          {BUBBLES.map((b) => (
            <HeroBubble key={b.alt} b={b} scrollProgress={scrollYProgress} mouseX={mouseX} mouseY={mouseY} reduce={reduce} isHovered={isHovered} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mt-2 flex w-full flex-col justify-center text-center lg:mt-0 lg:w-1/2 lg:pl-[60px] lg:text-left"
      >
        <p style={{ color: "#8B5CF6", fontWeight: 600, fontSize: "16px", marginBottom: "8px" }}>Về chúng tôi</p>
        <h2 id="about-title" style={{ color: "#0F172A", fontWeight: 800, fontSize: "clamp(30px, 4vw, 42px)", marginBottom: "20px", fontFamily: FONT_HEAD, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          Chúng tôi là ai?
        </h2>
        <p className="mx-auto lg:mx-0" style={{ color: "#64748B", fontSize: "15px", lineHeight: 1.7, marginBottom: "40px", maxWidth: "440px" }}>
          PawLife là dự án phi lợi nhuận kết nối các trạm cứu hộ với những gia đình yêu động vật, giúp mỗi bé tìm được mái ấm trọn đời và được chăm sóc có trách nhiệm.
        </p>
        <dl className="mx-auto grid max-w-[420px] grid-cols-2 gap-x-10 gap-y-8 lg:mx-0">
          {ABOUT_STATS.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.5 }} viewport={{ once: true }}>
              <dd style={{ color: "#FF9500", fontSize: "32px", fontWeight: 800, marginBottom: "4px", fontFamily: FONT_HEAD, margin: 0 }}>
                <CountUp to={stat.to} suffix={stat.suffix} />
              </dd>
              <dt style={{ color: "#64748B", fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>{stat.label}</dt>
            </motion.div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
};

// ----------------------------------------------------------------------------
//  THẺ QR & QUẢN LÝ THÔNG TIN PET
// ----------------------------------------------------------------------------
const FeatureColumn = ({
  icon,
  title,
  subtitle,
  items,
  checkColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: string[];
  checkColor: string;
}) => (
  <div className="h-full rounded-[20px] border border-[#F3F4F6] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
    <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}>
      <div style={{ marginTop: "2px" }}>{icon}</div>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: "15px", color: COLOR.ink, marginBottom: "2px", fontFamily: FONT_HEAD }}>{title}</h3>
        <p style={{ fontSize: "12px", color: COLOR.muted, fontWeight: 500 }}>{subtitle}</p>
      </div>
    </div>
    <ul style={{ display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((text) => (
        <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ marginTop: "3px" }}><Icons.Check color={checkColor} /></span>
          <span style={{ fontSize: "13px", color: COLOR.muted, fontWeight: 500, lineHeight: 1.5 }}>{text}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PetManagementSection = () => (
  <section
    id="qr"
    aria-labelledby="qr-title"
    className="mt-[60px] flex w-full flex-col items-center overflow-x-clip px-4 lg:mt-[100px] lg:px-0"
    style={{ fontFamily: FONT_HEAD }}
  >
    <SectionHeading eyebrow="Thẻ QR cho thú cưng" title="Quản lý thông tin thú cưng trong một chiếc thẻ" mb={60} />
    <span id="qr-title" className="sr-only">Quản lý thông tin thú cưng</span>

    <div className="relative mb-[40px] flex w-full flex-col items-center gap-10 lg:mb-[80px]">
      <div className="relative z-[2] flex w-full flex-col items-center justify-between gap-12 lg:min-h-[380px] lg:w-[860px] lg:flex-row lg:gap-0">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto aspect-square w-full max-w-[380px] lg:mx-0 lg:aspect-auto lg:h-[380px] lg:w-[380px]"
        >
          <img
            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"
            alt="Chú mèo đeo thẻ QR PawLife"
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
          />
          <div
            className="pet-float-card absolute bottom-[24px] right-[-8px] z-10 w-[190px] sm:bottom-[30px] sm:right-[-16px] sm:w-[210px]"
            style={{ backgroundColor: "#fff", padding: "20px 22px", borderRadius: "24px", boxShadow: "0 15px 40px rgba(0,0,0,0.08)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
              <span style={{ fontWeight: 700, fontSize: "17px", color: COLOR.ink }}>Piglet</span>
              <Icons.Male />
            </div>
            <div style={{ fontSize: "12px", color: COLOR.muted, fontWeight: 500 }}>2 tuổi • Husky Siberia</div>
            <div style={{ height: "1px", backgroundColor: COLOR.line, margin: "12px 0" }} />
            <div style={{ fontSize: "10px", fontWeight: 700, color: COLOR.faint, marginBottom: "4px", letterSpacing: "0.5px" }}>MÃ QR</div>
            <div style={{ fontSize: "13px", color: COLOR.ink, marginBottom: "12px", fontWeight: 600, letterSpacing: "0.5px" }}>PL-024817</div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: COLOR.faint, marginBottom: "4px", letterSpacing: "0.5px" }}>TÌNH TRẠNG</div>
            <div style={{ fontSize: "13px", color: COLOR.ink, fontWeight: 600 }}>An toàn</div>
            <div style={{ height: "1px", backgroundColor: COLOR.line, margin: "12px 0" }} />
            <div style={{ fontSize: "10px", fontWeight: 700, color: COLOR.faint, marginBottom: "4px", letterSpacing: "0.5px" }}>GHI CHÚ</div>
            <div style={{ fontSize: "13px", color: COLOR.ink, fontWeight: 600, lineHeight: 1.4 }}>Hiền lành, nhưng hơi nhát người lạ</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex w-full flex-col lg:w-[430px] lg:self-stretch"
          style={{ backgroundColor: "#fff", border: `1px solid ${COLOR.line}`, borderRadius: "24px", padding: "36px", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}
        >
          <div style={{ display: "flex", gap: "14px", marginBottom: "24px", alignItems: "flex-start" }}>
            <div style={{ marginTop: "2px" }}><Icons.QR /></div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "17px", color: COLOR.ink, marginBottom: "4px" }}>Định danh thú cưng</h3>
              <p style={{ fontSize: "13px", color: COLOR.muted, fontWeight: 500 }}>Một thẻ QR - Một danh tính vĩnh viễn</p>
            </div>
          </div>
          <ul style={{ display: "flex", flexDirection: "column", gap: "14px", flexGrow: 1, listStyle: "none", padding: 0, margin: 0 }}>
            {[
              "Quét QR để biết tình trạng thú cưng",
              "Bảo vệ thông tin của chủ nuôi",
              "Chuyển chủ an toàn, minh bạch",
              "Một chiếc thẻ cho suốt vòng đời của thú cưng",
            ].map((text) => (
              <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ marginTop: "3px" }}><Icons.Check color="#A855F7" /></span>
                <span style={{ fontSize: "14px", color: COLOR.body, lineHeight: 1.5, fontWeight: 500 }}>{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <ButtonLink href="#download" variant="primary" className="flex-1">Tải app PawLife</ButtonLink>
            <ButtonLink href={ROUTES.qrShop} variant="outline" className="flex-1">Mua thẻ QR</ButtonLink>
          </div>
        </motion.div>
      </div>

      <div className="w-full max-w-[860px]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <FeatureColumn
            icon={<Icons.Bell />}
            title="Chế độ lạc"
            subtitle="Kích hoạt miễn phí khi thú cưng thất lạc"
            items={["Ai cũng có thể quét, không cần cài app", "Liên hệ chủ nuôi nhanh chóng"]}
            checkColor="#F59E0B"
          />
          <FeatureColumn
            icon={<Icons.History />}
            title="PawHistory"
            subtitle="Không chỉnh sửa - Không xóa bỏ"
            items={["Hồ sơ y tế trọn đời, chỉ bổ sung không ghi đè", "Lịch sử nhận nuôi rõ ràng"]}
            checkColor="#22C55E"
          />
        </motion.div>
      </div>
    </div>

    <ol className="mt-[40px] grid w-full max-w-[900px] grid-cols-2 items-start gap-x-[12px] gap-y-[40px] px-4 md:gap-[40px] lg:flex lg:flex-row lg:justify-center lg:gap-[24px] lg:px-0" style={{ listStyle: "none", padding: 0 }}>
      {PET_STEPS.map((step, idx) => (
        <React.Fragment key={step.title}>
          <motion.li
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="mx-auto flex w-full flex-col items-center text-center lg:w-[170px]"
          >
            <div style={{ marginBottom: "16px" }}>{stepIcon(step.icon)}</div>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: COLOR.ink, marginBottom: "8px" }}>{step.title}</h3>
            <p style={{ fontSize: "13px", color: COLOR.muted, lineHeight: 1.5, fontWeight: 500, whiteSpace: "pre-line" }}>{step.desc}</p>
          </motion.li>
          {idx < PET_STEPS.length - 1 && (
            <motion.li
              aria-hidden
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 + 0.1 }}
              className="hidden lg:block"
              style={{ marginTop: "16px", listStyle: "none" }}
            >
              <Icons.ArrowRightThin />
            </motion.li>
          )}
        </React.Fragment>
      ))}
    </ol>
  </section>
);

// ----------------------------------------------------------------------------
//  NHẬN NUÔI
// ----------------------------------------------------------------------------
const AdoptionSection = () => {
  const { index, setIndex, next, prev } = useCarousel(MOCK_ADOPTIONS.length);
  const pet = MOCK_ADOPTIONS[index];

  return (
    <section
      id="adopt"
      className="mt-[100px] flex w-full flex-col items-center px-4 lg:mt-[160px] lg:px-0"
      style={{ fontFamily: FONT_HEAD }}
    >
      <SectionHeading eyebrow="Nhận nuôi cùng PawLife" title="Tô điểm sắc màu cho một sinh mạng" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-[900px] flex-col"
      >
        <Carousel label="Danh sách thú cưng cần nhận nuôi" onNext={next} onPrev={prev}>
          <article
            className="flex w-full flex-col overflow-hidden bg-white lg:min-h-[420px] lg:flex-row"
            style={{ borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.06)" }}
          >
            <div className="relative h-[300px] w-full overflow-hidden lg:h-auto lg:w-1/2">
              <motion.img
                key={pet.img}
                initial={{ opacity: 0.5, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                src={pet.img}
                alt={`Bé ${pet.name}, ${pet.info}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              />
            </div>
            <div className="flex w-full flex-col p-[28px] lg:w-1/2 lg:p-[44px_40px]">
              <motion.div key={`title-${pet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "24px", fontWeight: 700, color: COLOR.ink, margin: 0 }}>{pet.name}</h3>
                {pet.gender === "Male" ? <Icons.Male /> : <Icons.Female />}
              </motion.div>
              <motion.p key={`info-${pet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ fontSize: "13px", color: COLOR.muted, marginBottom: "18px", fontWeight: 500 }}>
                {pet.info}
              </motion.p>
              <motion.p key={`desc-${pet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} style={{ fontSize: "14px", color: COLOR.body, lineHeight: 1.7, marginBottom: "22px", fontWeight: 500, minHeight: "96px" }}>
                {pet.desc}
              </motion.p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "auto" }}>
                {pet.tags.map((tag, i) => (
                  <motion.span key={`${pet.name}-${tag.label}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }} style={{ backgroundColor: tag.bg, color: tag.color, padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                    {tag.label}
                  </motion.span>
                ))}
              </div>
              <div className="mt-[28px] flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={ROUTES.pets} variant="primary" className="flex-1">Xem thêm về {pet.name}</ButtonLink>
                <ButtonLink href={ROUTES.pets} variant="outline" className="flex-1">Đăng ký nhận nuôi</ButtonLink>
              </div>
            </div>
          </article>
        </Carousel>
        <CarouselControls total={MOCK_ADOPTIONS.length} current={index} onChange={setIndex} onPrev={prev} onNext={next} label="Thú cưng" />
      </motion.div>
    </section>
  );
};

// ----------------------------------------------------------------------------
//  TRẠM CỨU HỘ
// ----------------------------------------------------------------------------
const ShelterSection = () => {
  const { index, setIndex, next, prev } = useCarousel(MOCK_SHELTERS.length);
  const shelter = MOCK_SHELTERS[index];
  const governance = [
    `Đã xác minh từ năm ${shelter.since}`,
    "Báo cáo hoạt động hằng tháng đầy đủ",
    "Cam kết kiểm tra sau nhận nuôi",
  ];

  return (
    <section id="shelters" className="mt-[100px] flex w-full flex-col items-center px-4 lg:mt-[120px] lg:px-0">
      <SectionHeading eyebrow="Trạm cứu hộ" title="Các trạm cứu hộ uy tín tại Việt Nam" mb={0} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-[30px] flex w-full max-w-[780px] flex-col items-center lg:mt-[48px]"
      >
        <Carousel label="Danh sách trạm cứu hộ" onNext={next} onPrev={prev}>
          <article className="flex w-full flex-col-reverse items-center justify-between gap-[28px] p-2 lg:flex-row lg:items-center lg:p-4">
            <div className="flex w-full flex-col items-start lg:w-[360px]">
              <motion.div key={`s-title-${shelter.name}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div aria-hidden style={{ width: "36px", height: "36px", flexShrink: 0, borderRadius: "50%", backgroundColor: COLOR.brand, display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontWeight: 700, fontFamily: FONT_HEAD }}>
                  {shelter.name.charAt(0)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <h3 style={{ fontFamily: FONT_HEAD, fontSize: "17px", color: "#000", fontWeight: 600, margin: 0 }}>{shelter.name}</h3>
                  <p style={{ fontFamily: FONT_BODY, fontSize: "12px", color: "#6B7280" }}>{shelter.location}</p>
                </div>
              </motion.div>

              <motion.p key={`s-desc-${shelter.name}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ marginTop: "16px", fontFamily: FONT_BODY, fontSize: "14px", color: COLOR.body, lineHeight: 1.6, minHeight: "92px" }}>
                {shelter.desc}
              </motion.p>

              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ fontFamily: FONT_HEAD, fontSize: "11px", color: COLOR.muted, fontWeight: 700, letterSpacing: "0.5px" }}>TRẠNG THÁI XÁC MINH</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "6px", listStyle: "none", padding: 0, margin: 0 }}>
                  {governance.map((g) => (
                    <li key={g} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT_BODY, fontSize: "13px", color: "#111827" }}>
                      <Icons.Verified />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex w-full gap-3">
                <ButtonLink href={ROUTES.shelters} variant="primary" size="sm" className="flex-1">Xem thông tin</ButtonLink>
                <ButtonLink href={ROUTES.shelters} variant="outline" size="sm" className="flex-1">Tất cả trạm</ButtonLink>
              </div>
            </div>

            <motion.img
              key={shelter.img}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-[240px] w-full rounded-[32px] object-cover lg:h-[320px] lg:w-[337px]"
              style={{ boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }}
              src={shelter.img}
              alt={`Không gian tại ${shelter.name}`}
              loading="lazy"
            />
          </article>
        </Carousel>
        <CarouselControls total={MOCK_SHELTERS.length} current={index} onChange={setIndex} onPrev={prev} onNext={next} label="Trạm cứu hộ" />
      </motion.div>
    </section>
  );
};

// ----------------------------------------------------------------------------
//  NHỮNG HIỂU LẦM
// ----------------------------------------------------------------------------
const MythsSection = () => {
  const { index, setIndex, next, prev } = useCarousel(MOCK_MYTHS.length);
  const myth = MOCK_MYTHS[index];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section id="myths" ref={ref} className="mt-[100px] flex w-full flex-col items-center px-4 lg:mt-[140px] lg:px-0">
      <SectionHeading eyebrow="Hiểu lầm thường gặp" title="Những hiểu lầm cần được làm rõ" mb={60} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-[1000px] flex-col items-center"
      >
        <Carousel label="Những hiểu lầm về nhận nuôi" onNext={next} onPrev={prev}>
          <article className="relative flex w-full flex-col items-center justify-center gap-[24px] lg:flex-row lg:gap-[56px]">
            <motion.img
              key={myth.img}
              initial={{ opacity: 0.5, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="z-10 h-[300px] w-[300px] flex-shrink-0 rounded-[32px] object-cover lg:h-[360px] lg:w-[360px]"
              src={myth.img}
              alt="Thú cưng được nhận nuôi từ trạm cứu hộ"
              loading="lazy"
            />
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="z-10 flex w-full max-w-[340px] flex-col pb-[20px] text-center lg:w-[300px] lg:text-left"
            >
              <h3 style={{ fontFamily: FONT_HEAD, fontSize: "24px", color: COLOR.ink, fontWeight: 700, lineHeight: 1.3, marginBottom: "16px", whiteSpace: "pre-line", minHeight: "62px" }}>
                {myth.title}
              </h3>
              <p style={{ fontFamily: FONT_BODY, fontSize: "14px", color: COLOR.muted, lineHeight: 1.65, fontWeight: 500, minHeight: "110px" }}>
                {myth.desc}
              </p>
            </motion.div>
            <motion.div aria-hidden style={{ y: numY }} className="absolute right-0 hidden flex-shrink-0 lg:block">
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "180px", color: COLOR.brand, fontWeight: 700, lineHeight: 1, transform: "rotate(10deg)", textShadow: "4px 4px 0px rgba(240,158,91,0.2)", opacity: 0.2 }}>
                {index + 1}
              </div>
            </motion.div>
          </article>
        </Carousel>
        <CarouselControls total={MOCK_MYTHS.length} current={index} onChange={setIndex} onPrev={prev} onNext={next} label="Hiểu lầm" />
      </motion.div>
    </section>
  );
};

// ----------------------------------------------------------------------------
//  HỎI ĐÁP
// ----------------------------------------------------------------------------
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const uid = useId();
  const panelId = `faq-panel-${uid}`;
  const buttonId = `faq-button-${uid}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ width: "100%", maxWidth: "760px", border: `1px solid ${COLOR.border}`, borderRadius: "12px", marginBottom: "12px", overflow: "hidden", backgroundColor: "#fff", boxShadow: isOpen ? "0 4px 15px rgba(0,0,0,0.03)" : "none" }}
    >
      <h3 style={{ margin: 0 }}>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          style={{ cursor: "pointer", background: "none", border: "none" }}
        >
          <span style={{ fontFamily: FONT_HEAD, fontSize: "16px", color: COLOR.ink, fontWeight: 700, lineHeight: 1.4 }}>{question}</span>
          <span style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.3s ease" }}
      >
        <div style={{ overflow: "hidden" }}>
          <p style={{ padding: "0 24px 20px 24px", fontFamily: FONT_BODY, fontSize: "15px", color: COLOR.muted, lineHeight: 1.65 }}>{answer}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FaqSection = () => (
  <section id="faq" className="mt-[100px] flex w-full flex-col items-center px-4 lg:mt-[140px]">
    <SectionHeading eyebrow="Hỏi đáp" title="Thắc mắc & giải đáp" mb={40} />
    <div className="flex w-full flex-col items-center">
      {FAQS.map((faq) => <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />)}
    </div>
  </section>
);

// ----------------------------------------------------------------------------
//  CÂU CHUYỆN NHẬN NUÔI
// ----------------------------------------------------------------------------
const JourneySection = () => {
  const { index, setIndex, next, prev } = useCarousel(MOCK_JOURNEYS.length);
  const journey = MOCK_JOURNEYS[index];

  return (
    <section id="stories" className="mt-[100px] flex w-full flex-col items-center px-4 pb-[40px] lg:mt-[148px] lg:px-0">
      <SectionHeading eyebrow="Hành trình hạnh phúc" title="Lan tỏa yêu thương" mb={40} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-[780px] flex-col items-center"
      >
        <Carousel label="Câu chuyện từ các gia đình nhận nuôi" onNext={next} onPrev={prev}>
          <figure className="m-0 flex w-full flex-col items-center gap-[28px] p-2 lg:flex-row lg:justify-between">
            <motion.img
              key={journey.img}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-[260px] w-full max-w-[320px] rounded-[32px] object-cover lg:h-[300px]"
              style={{ boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }}
              src={journey.img}
              alt={`${journey.name} cùng thú cưng sau khi nhận nuôi`}
              loading="lazy"
            />
            <motion.div
              key={`text-${journey.name}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
            >
              <figcaption style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
                <img style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }} src={journey.avatar} alt="" loading="lazy" />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontFamily: FONT_HEAD, fontSize: "15px", color: "#000", fontWeight: 600 }}>{journey.name}</span>
                  <span style={{ fontFamily: FONT_BODY, fontSize: "12px", color: COLOR.muted }}>{journey.info}</span>
                </div>
              </figcaption>
              <blockquote style={{ margin: "18px 0 0", fontFamily: FONT_BODY, fontSize: "15px", maxWidth: "380px", color: COLOR.body, lineHeight: 1.65, minHeight: "110px" }}>
                &ldquo;{journey.desc}&rdquo;
              </blockquote>
              <div className="mt-6">
                <ButtonLink href={ROUTES.stories} variant="outline" size="sm">Đọc thêm</ButtonLink>
              </div>
            </motion.div>
          </figure>
        </Carousel>
        <CarouselControls total={MOCK_JOURNEYS.length} current={index} onChange={setIndex} onPrev={prev} onNext={next} label="Câu chuyện" />
      </motion.div>
    </section>
  );
};

// ----------------------------------------------------------------------------
//  ĐỐI TÁC
// ----------------------------------------------------------------------------
const PartnerLogosSection = () => (
  <motion.section
    id="partners"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1 }}
    className="mt-[60px] flex w-full flex-col items-center overflow-hidden px-4"
  >
    <style>{`
  @keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .logo-track { display: flex; width: max-content; animation: infinite-scroll 25s linear infinite; }
  .logo-track:hover { animation-play-state: paused; }
`}</style>
    <SectionHeading eyebrow="Đối tác đồng hành" title="Mạng lưới kết nối của PawLife" mb={44} />

    <div className="relative w-full max-w-[1200px] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[50px] bg-gradient-to-r from-white to-transparent lg:w-[150px]" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[50px] bg-gradient-to-l from-white to-transparent lg:w-[150px]" />
      <ul className="logo-track items-center" style={{ listStyle: "none", margin: 0, padding: "20px 0" }}>
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {MOCK_PARTNERS.map((p) => (
              <li
                key={`${copy}-${p.name}`}
                aria-hidden={copy === 1}
                className="mr-[40px] flex cursor-pointer items-center gap-[12px] opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 lg:mr-[80px]"
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: `${p.color}20`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <span style={{ color: p.color, fontWeight: 900, fontSize: "20px", fontFamily: FONT_HEAD }}>{p.name.charAt(0)}</span>
                </div>
                <span style={{ fontSize: "20px", fontWeight: 700, color: COLOR.body, fontFamily: FONT_HEAD, whiteSpace: "nowrap" }}>{p.name}</span>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
    </div>
  </motion.section>
);

// ----------------------------------------------------------------------------
//  FOOTER
// ----------------------------------------------------------------------------
const FooterSection = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const linkStyle: React.CSSProperties = { color: COLOR.body, fontSize: "15px", textDecoration: "none", fontFamily: FONT_BODY };
  const year = new Date().getFullYear();

  return (
    <footer id="download" className="relative mt-[100px] flex w-full flex-col items-center bg-[#F8F9FA] px-6 pb-[32px] pt-[80px] lg:px-[60px]">
      <div className="flex w-full max-w-[1200px] flex-col items-start justify-between gap-12 lg:flex-row">
        <div className="flex max-w-[440px] flex-col">
          <BrandLogo size={40} fontSize={26} />

          <h2 style={{ fontFamily: FONT_HEAD, fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, color: COLOR.ink, lineHeight: 1.2, marginTop: "32px", marginBottom: "28px", letterSpacing: "-1px" }}>
            Đón một người bạn
            <br />
            bốn chân về nhà
          </h2>

          <p style={{ fontFamily: FONT_HEAD, fontSize: "14px", fontWeight: 600, color: COLOR.muted, marginBottom: "14px" }}>Tải app PawLife - Pet ID</p>
          <div className="flex flex-wrap gap-[16px] pt-[8px]">
            <StoreButton href={IOS_APP_URL} icon={<AppleIcon />} small="Tải về trên" big="App Store" />
            <StoreButton href={ANDROID_APP_URL} icon={<PlayIcon />} small="Tải về trên" big="Google Play" badge="Sắp ra mắt" />
          </div>
        </div>

        <nav aria-label="Liên kết chân trang" className="mt-[10px] flex w-full flex-col gap-[48px] sm:flex-row lg:mt-[85px] lg:w-auto lg:gap-[100px] lg:pr-[60px]">
          <div className="flex flex-col gap-[18px]">
            <a href="#about" style={linkStyle}>Về chúng tôi</a>
            <a href="#adopt" style={linkStyle}>Nhận nuôi</a>
            <a href="#qr" style={linkStyle}>Cách hoạt động</a>
          </div>
          <div className="flex flex-col gap-[18px]">
            <a href="#stories" style={linkStyle}>Đánh giá</a>
            <a href="#faq" style={linkStyle}>Hỏi đáp</a>
            <a href="#partners" style={linkStyle}>Đối tác</a>
          </div>
          <div className="flex flex-col gap-[18px]">
            <a href={CONTACT.phoneHref} style={linkStyle}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`} style={linkStyle}>{CONTACT.email}</a>
            <span style={{ ...linkStyle }}>{CONTACT.address}</span>
            <div className="mt-[4px] flex gap-[16px]">
              <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook PawLife" style={{ color: COLOR.purple }} className="transition-opacity hover:opacity-80">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram PawLife" style={{ color: COLOR.purple }} className="transition-opacity hover:opacity-80">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-[56px] flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: COLOR.border }}>
        <p style={{ fontFamily: FONT_BODY, fontSize: "13px", color: COLOR.muted }}>© {year} PawLife. Bảo lưu mọi quyền.</p>
        <div className="flex gap-6">
          <Link href={ROUTES.terms} style={{ ...linkStyle, fontSize: "13px" }}>Điều khoản sử dụng</Link>
          <Link href={ROUTES.privacy} style={{ ...linkStyle, fontSize: "13px" }}>Chính sách bảo mật</Link>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Lên đầu trang"
        className="absolute right-[24px] top-[32px] flex h-[52px] w-[52px] items-center justify-center lg:right-[80px] lg:top-[80px]"
        style={{ backgroundColor: "#fff", border: `1px solid ${COLOR.border}`, borderRadius: "16px", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </footer>
  );
};

// ----------------------------------------------------------------------------
//  NÚT QR NỔI
// ----------------------------------------------------------------------------
const FloatingQrButton = () => {
  const reduce = !!useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.8 }}
      className="fixed z-40"
      style={{ left: "max(16px, env(safe-area-inset-left))", bottom: "max(16px, env(safe-area-inset-bottom))" }}
    >
      <Link
        href={ROUTES.scan}
        aria-label="Quét QR thú cưng"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="relative flex items-center"
        style={{ textDecoration: "none" }}
      >
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute left-0 top-0 rounded-full"
            style={{ width: 56, height: 56, border: "2px solid #F09E5B" }}
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        <motion.span
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #F7B27C 0%, #F09E5B 100%)",
            boxShadow: "0 10px 28px rgba(240,158,91,0.45), 0 2px 6px rgba(0,0,0,0.12)",
            border: "2px solid rgba(255,255,255,0.8)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3z" />
            <path d="M21 14v3" />
            <path d="M14 21h3" />
            <path d="M21 21h0.01" />
          </svg>
        </motion.span>

        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none ml-3 hidden whitespace-nowrap rounded-full px-4 py-2 sm:block"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            color: COLOR.ink,
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: FONT_HEAD,
          }}
        >
          Quét QR thú cưng
        </motion.span>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// 6. TRANG CHỦ
// ============================================================================
export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#fff", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflowX: "clip", position: "relative" }}>
      <style>{`
  html { scroll-behavior: smooth; }
  section[id], footer[id] { scroll-margin-top: ${HEADER_HEIGHT + 8}px; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
  a:focus-visible, button:focus-visible { outline: 2px solid ${COLOR.brand}; outline-offset: 3px; border-radius: 8px; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

  @keyframes pet-float {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50%      { transform: translate3d(0, -12px, 0); }
  }
  .pet-float-card {
    animation: pet-float 4s ease-in-out infinite;
    will-change: transform;
    backface-visibility: hidden;
  }
`}</style>

      <MagicCursorCanvas />
      <CuteCursor />
      <FloatingQrButton />

      <main className="relative z-10 flex w-full max-w-[1440px] flex-col items-center">
        <HeaderSection />
        <HeroSection />
        <AboutUsSection />
        <PetManagementSection />
        <AdoptionSection />
        <ShelterSection />
        <MythsSection />
        <FaqSection />
        <JourneySection />
        <PartnerLogosSection />
      </main>

      <FooterSection />
    </div>
  );
}