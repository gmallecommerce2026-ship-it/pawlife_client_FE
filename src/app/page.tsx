'use client';

import React, { useState, useRef, useEffect, useMemo } from "react";
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

const IOS_APP_URL = "https://apps.apple.com/vn/app/REPLACE_WITH_REAL_LINK";
// Google Play: chưa có -> để null thì nút hiển thị "Sắp ra mắt"
const ANDROID_APP_URL: string | null = null;

// ============================================================================
// 1. DỮ LIỆU TĨNH (MOCK_DATA)
// ============================================================================
const Icons = {
  Male: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="14" r="5"></circle><line x1="13.5" y1="10.5" x2="21" y2="3"></line><polyline points="16 3 21 3 21 8"></polyline>
    </svg>
  ),
  Female: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="6"></circle><line x1="12" y1="16" x2="12" y2="22"></line><line x1="9" y1="19" x2="15" y2="19"></line>
    </svg>
  ),
  Check: ({ color }: { color: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  ChevronLeft: ({ style }: any) => (
    <svg style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: ({ style }: any) => (
    <svg style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  History: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Identity: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5c0-1.1.9-2 2-2h2"></path><path d="M17 3h2c1.1 0 2 .9 2 2v2"></path><path d="M21 17v2c0 1.1-.9 2-2 2h-2"></path><path d="M7 21H5c-1.1 0-2-.9-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="2"></rect>
    </svg>
  ),
};

const ExtraIcons = {
  ArrowRightThin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
  QR: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  Doc: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
};

const MOCK_DATA = {
  navItems: [
    { width: "68px", hasBg: false, title: "", minWidth: "52px" },
    { width: "77px", hasBg: false, title: "" },
    { width: "47px", hasBg: false, title: "" },
    { width: "47px", hasBg: false, title: "" },
    { width: "47px", hasBg: false, title: "" },
    { width: "84px", hasBg: true, title: "Trang chủ" },
    { width: "86px", hasBg: false, title: "Quét QR" },
    { width: "103px", hasBg: false, title: "Liên hệ", minWidth: "87px" },
  ] as { width: string; hasBg: boolean; title: string; minWidth?: string }[],
  shelterStats: [{ value: "47", w: "17px" }, { value: "214", w: "22px" }, { value: "94%", w: "27px" }],
  shelterLabels: [{ title: "Active Pets", w: "42px" }, { title: "Lifetime Adoptions", w: "73px", ml: "72px" }, { title: "Success Rate", w: "51px", ml: "42px" }],
  shelterGovernance: [
    { w: "82px", hSwitch: true, icon: "/assets/SvgAsset51.svg", title: "Verified since 2025", tw: "74px" },
    { w: "106px", hSwitch: false, icon: "/assets/SvgAsset50.svg", title: "Monthly report compliant", tw: "98px" },
    { w: "121px", hSwitch: false, icon: "/assets/SvgAsset49.svg", title: "Adoption enforcement active", tw: "113px" },
  ],
};

const MOCK_ADOPTIONS = [
  {
    name: "Max", gender: "Male", info: "4 years • Siberian Husky",
    desc: "Max is a beautiful husky with striking blue eyes. He's intelligent, loyal, and loves long walks. Max is great with families and needs an active home where he can exercise regularly.",
    img: "https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Neutered", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Playful", color: "#2563EB", bg: "#DBEAFE" },
      { label: "Good with kids", color: "#CA8A04", bg: "#FEF9C3" },
    ],
  },
  {
    name: "Bella", gender: "Female", info: "2 years • Golden Retriever",
    desc: "Bella is an incredibly sweet and affectionate Golden Retriever. She loves playing fetch, cuddling on the couch, and is wonderful with other pets. Looking for a loving forever home.",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Vaccinated", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Friendly", color: "#2563EB", bg: "#DBEAFE" },
      { label: "House-trained", color: "#CA8A04", bg: "#FEF9C3" },
    ],
  },
  {
    name: "Milo", gender: "Male", info: "1 year • Beagle Mix",
    desc: "Milo is a curious and energetic pup who loves to explore his surroundings. He is currently learning basic commands and would thrive with an owner willing to continue his training.",
    img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Microchipped", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Energetic", color: "#2563EB", bg: "#DBEAFE" },
    ],
  },
];

const MOCK_SHELTERS = [
  {
    name: "Happy Paws Sanctuary", location: "Hanoi, Vietnam",
    desc: "A dedicated animal welfare organization committed to rescuing, rehabilitating, and rehoming pets in need. We provide comprehensive care.",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Saigon Pet Rescue", location: "Ho Chi Minh City, Vietnam",
    desc: "Providing a safe haven for stray and abandoned animals in the heart of Saigon. Our mission is to give every pet a second chance at life and love.",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Da Nang Animal Hope", location: "Da Nang, Vietnam",
    desc: "Focusing on medical rehabilitation and finding forever homes for injured and neglected animals across the central region of Vietnam.",
    img: "https://images.unsplash.com/photo-1590159763121-7c1dc4dff2da?auto=format&fit=crop&w=800&q=80",
  },
];

const MOCK_MYTHS = [
  {
    title: "Only sick animals live\nin the shelters",
    desc: "Animals from shelters are microchipped, treated for parasites, vaccinated, sterilized. All operations are carried out strictly according to the schedule.",
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Shelter pets have\nbehavior issues",
    desc: "Most pets end up in shelters due to human issues (moving, finances, allergies), not because of the pet's behavior. Many are already house-trained and ready to love.",
    img: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "You can't find purebreds\nin shelters",
    desc: "Up to 25% of pets in animal shelters are purebreds. There are also many breed-specific rescues if you are looking for a particular type of companion.",
    img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80",
  },
];

const MOCK_JOURNEYS = [
  {
    name: "Judy Smith", info: "adopted through Happy Paws Sanctuary",
    desc: "With the appearance of Alice in my life, there was a psychological upswing. I understand that I am not alone, and she brings joy to my everyday routine...",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Mark & Sarah", info: "adopted through Saigon Pet Rescue",
    desc: "Bringing Milo home was the best decision we ever made. He was shy at first, but now he is the most affectionate and energetic member of our small family...",
    img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Linh Tran", info: "adopted through Da Nang Animal Hope",
    desc: "I wasn't sure if I was ready for a cat, but when I met Mochi at the shelter, it was love at first sight. She completely changed my perspective on life...",
    img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
];
const BrandLogo = ({ size = 36, fontSize = 24 }: { size?: number; fontSize?: number }) => (
  <Link
    href="/"
    aria-label="PawLife - Trang chủ"
    className="flex items-center"
    style={{ gap: "8px", textDecoration: "none" }}
  >
    <img
      src={require("../../public/assets/SvgAsset1.png").default.src}
      alt="PawLife logo"
      width={size}
      height={size}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
    <span
      style={{
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontSize,
        fontWeight: 800,
        letterSpacing: "-0.5px",
        lineHeight: 1,
        color: "#111827",
      }}
    >
      Paw<span style={{ color: "#F09E5B" }}>Life</span>
    </span>
  </Link>
);

// ----------------------------------------------------------------------------
//  NÚT TẢI APP (App Store / Google Play)
// ----------------------------------------------------------------------------
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
        <span style={{ fontSize: "10px", fontWeight: 500, opacity: 0.85, fontFamily: "'Inter', sans-serif" }}>{small}</span>
        <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: "nowrap" }}>{big}</span>
      </span>
      {badge && (
        <span
          style={{
            position: "absolute",
            top: "-10px",
            right: "-8px",
            backgroundColor: "#F09E5B",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "999px",
            fontFamily: "'Be Vietnam Pro', sans-serif",
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
    backgroundColor: disabled ? "#9CA3AF" : "#111827",
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
    <motion.a
      href={href!}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={baseStyle}
    >
      {inner}
    </motion.a>
  );
};


// ============================================================================
// 2. CÁC COMPONENT GIAO DIỆN NHỎ & COMPONENT DOTS
// ============================================================================
const NavItem = ({ width, hasBg, title, minWidth }: any) => (
  <motion.div whileHover={{ scale: 1.05 }} style={{ borderRadius: "8px", height: "32px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: width, ...(hasBg && { backgroundColor: "rgba(245,245,245,1)" }), cursor: "pointer" }}>
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", whiteSpace: "nowrap", color: "rgba(30,30,30,1)", lineHeight: "100%", fontWeight: "400", minWidth: minWidth }}>{title}</div>
  </motion.div>
);

const GovernanceItem = ({ width, heightSwitch, iconSrc, title, minWidth }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "5px", width: width, height: heightSwitch ? "8px" : "9px" }}>
    <img width="3px" height="3px" src={iconSrc} alt="icon" />
    <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "400", minWidth: minWidth }}>{title}</div>
  </div>
);

const CarouselDots = ({ total, current, onChange }: { total: number; current: number; onChange: (idx: number) => void }) => (
  <div className="flex justify-center items-center gap-[8px] mt-[24px]">
    {Array.from({ length: total }).map((_, idx) => (
      <div
        key={idx}
        onClick={() => onChange(idx)}
        style={{
          height: "8px",
          width: idx === current ? "28px" : "8px",
          borderRadius: "4px",
          backgroundColor: idx === current ? "#F09E5B" : "#D1D5DB",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
      />
    ))}
  </div>
);

// ============================================================================
// SWIPE AREA: chỉ hoạt động trên thiết bị cảm ứng (mobile/tablet)
// ============================================================================
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
        style={{ backgroundColor: "rgba(17,24,39,0.72)", color: "#fff", fontSize: "11px", fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif", backdropFilter: "blur(4px)" }}
      >
        <motion.span animate={reduce ? undefined : { x: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity }}>‹</motion.span>
        Vuốt để xem thêm
        <motion.span animate={reduce ? undefined : { x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>›</motion.span>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 3. CANVAS ANIMATION COMPONENT
// ============================================================================
const MagicCursorCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const colors = ["#F09E5B", "#FF9500", "#FFB36B", "#FFD6A8", "#FACC15"];

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
          const r = this.size * 1.8; ctx!.translate(this.x, this.y); ctx!.moveTo(0, -r); ctx!.quadraticCurveTo(0, 0, r, 0); ctx!.quadraticCurveTo(0, 0, 0, r); ctx!.quadraticCurveTo(0, 0, -r, 0); ctx!.quadraticCurveTo(0, 0, 0, -r);
        } else {
          ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }
        ctx!.fill(); ctx!.restore();
      }
    }

    let particles: Particle[] = [];
    const addParticles = (x: number, y: number) => { for (let i = 0; i < 4; i++) { particles.push(new Particle(x, y)); } };
    const handleMouseMove = (e: MouseEvent) => { addParticles(e.clientX, e.clientY); };
    const handleTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) { addParticles(e.touches[0].clientX, e.touches[0].clientY); } };
    const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize);

    let rafId = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height); ctx.globalCompositeOperation = "lighter";
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
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 9999 }} />;
};

const CURSOR_IMG = "/assets/images/minimal-dog-pack.png";
const CURSOR_SIZE = 56;
const CURSOR_HOTSPOT = { x: CURSOR_SIZE / 2, y: CURSOR_SIZE / 2 };
const AURA_SIZE = 96;
const CLICKABLE_SELECTOR = 'a, button, input, textarea, select, label, summary, [role="button"], .cursor-pointer, [style*="cursor: pointer"]';

const PawCursor = () => (
  <svg viewBox="0 0 64 64" className="h-full w-full">
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
      done = true; setImgOk(ok); setReady(true);
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
      setPressing(true); const id = ++rippleId.current;
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
// 4. CÁC SECTION CHÍNH
// ============================================================================
const HEADER_HEIGHT = 76; // chiều cao spacer để nội dung bên dưới không bị che
const NAV_LINKS = ["Home", "Contact"];

const HeaderSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Khi menu mobile đang mở thì luôn hiện glass để chữ dễ đọc
  const glassOn = scrolled || menuOpen;

  const linkStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    color: "rgba(30,30,30,1)",
    fontWeight: 500,
    cursor: "pointer",
  };

  return (
    <>
      {/* Spacer giữ chỗ vì header là position: fixed */}
      <div style={{ height: HEADER_HEIGHT, width: "100%" }} aria-hidden />

      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed left-0 top-0 z-50 w-full"
      >
        {/* Lớp glass: fade bằng opacity (mượt hơn là transition backdrop-filter) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glassOn ? 1 : 0,
            transition: "opacity 0.35s ease",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 100%)",
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
            borderBottom: "1px solid rgba(255,255,255,0.65)",
            boxShadow:
              "0 8px 32px rgba(31,38,135,0.08), inset 0 -1px 0 rgba(0,0,0,0.04)",
          }}
        />

        {/* Nội dung header */}
        <div
          className="relative mx-auto flex w-full max-w-[1350px] items-center justify-between px-4 lg:px-0"
          style={{
            paddingTop: scrolled ? "10px" : "22px",
            paddingBottom: "10px",
            transition: "padding 0.35s ease",
          }}
        >
          <BrandLogo size={32} fontSize={20} />

          <div className="hidden lg:flex flex-row justify-end items-start gap-[8px] ml-[14px] w-[1110px]">
            <div
              style={{
                gap: "32px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "end",
                alignItems: "center",
                width: "100%",
                paddingRight: "40px",
              }}
            >
              {NAV_LINKS.map((l) => (
                <motion.div key={l} whileHover={{ y: -1, color: "#F09E5B" }} style={linkStyle}>
                  {l}
                </motion.div>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Menu"
            className="lg:hidden cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        {/* Menu mobile (cũng là glass) */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-3 mb-2 flex flex-col gap-1 rounded-2xl p-4 lg:hidden"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(18px) saturate(180%)",
              WebkitBackdropFilter: "blur(18px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            }}
          >
            {NAV_LINKS.map((l) => (
              <div
                key={l}
                onClick={() => setMenuOpen(false)}
                style={{ ...linkStyle, padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                {l}
              </div>
            ))}
          </motion.div>
        )}
      </motion.header>
    </>
  );
};

// ----------------------------------------------------------------------------
//  HERO BANNER
// ----------------------------------------------------------------------------
const HeroSection = () => {
  return (
    <div className="relative w-full max-w-[1350px] mx-auto px-4 lg:px-0 mt-[20px] lg:mt-[30px] flex flex-col lg:flex-row justify-between items-center h-auto lg:h-[calc(100vh-120px)] min-h-[600px] z-10 overflow-hidden pb-16 lg:pb-0">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-[-1] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)'
      }}></div>

      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-start w-full lg:w-1/2 z-10 relative pt-10 lg:pt-0">

        {/* Adopters Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '999px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', width: 'fit-content' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', fontFamily: "'Inter', sans-serif" }}>Join 10,000+ happy adopters</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 'clamp(60px, 8vw, 96px)', fontWeight: '900', lineHeight: '1.05', fontFamily: "'Be Vietnam Pro', sans-serif", marginTop: '40px', letterSpacing: '-2.5px' }}>
          <span style={{ color: '#9B7EFA' }}>Don't buy.</span><br />
          <span style={{ color: '#111827' }}>Adopt.</span>
        </h1>

        {/* Description */}
        <p style={{ marginTop: '30px', fontSize: '18px', color: '#6B7280', maxWidth: '480px', lineHeight: '1.6', fontFamily: "'Urbanist', sans-serif", fontWeight: '500' }}>
          Every pet deserves a loving home. Find your perfect companion and give them the life they deserve.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '50px', flexWrap: 'wrap' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ backgroundColor: '#F09E5B', color: '#fff', padding: '18px 36px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', boxShadow: '0 12px 30px rgba(240,158,91,0.3)', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Find Your Friend
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ backgroundColor: '#fff', color: '#111827', padding: '18px 36px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Learn More
          </motion.button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '60px', marginTop: '60px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#111827', fontFamily: "'Be Vietnam Pro', sans-serif" }}>500+</div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '6px', fontWeight: '500', fontFamily: "'Urbanist', sans-serif" }}>Pets adopted</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#111827', fontFamily: "'Be Vietnam Pro', sans-serif" }}>98%</div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '6px', fontWeight: '500', fontFamily: "'Urbanist', sans-serif" }}>Happy families</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#111827', fontFamily: "'Be Vietnam Pro', sans-serif" }}>24/7</div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '6px', fontWeight: '500', fontFamily: "'Urbanist', sans-serif" }}>Support</div>
          </div>
        </div>

      </motion.div>

      {/* Hero Image Block */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative w-full lg:w-1/2 h-[45vh] min-h-[350px] lg:h-full lg:max-h-[calc(100vh-150px)] flex justify-center lg:justify-end items-end z-10">
        <img
          src={require("../../public/assets/piglet.png").default.src}
          alt="Fluffy white dog"
          className="object-contain w-full h-full max-h-[100%] scale-110 translate-y-[5%] origin-bottom"
          style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.1))" }}
        />
      </motion.div>

      {/* Scroll Mouse Icon - ĐƯỢC CHUYỂN RA ĐÂY ĐỂ CĂN GIỮA TOÀN BỘ PHẦN HERO */}
      <div className="absolute bottom-2 lg:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
        <motion.svg animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} width="24" height="36" viewBox="0 0 24 36" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="32" rx="7"></rect>
          <line x1="12" y1="10" x2="12" y2="14"></line>
        </motion.svg>
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------------
//  ABOUT US: ẢNH TRÒN BAY LƠ LỬNG
// ----------------------------------------------------------------------------
type Bubble = { src: string; alt: string; size: number; top: number; left: number; z: number; scrollRange: [number, number]; depth: number; glow: string; delay: number; floatDistance: number; floatDuration: number; main?: boolean; };

const BUBBLES: Bubble[] = [
  { src: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80", alt: "Main Dog", size: 260, top: 60, left: 90, z: 10, scrollRange: [40, -40], depth: 16, glow: "#F09E5B", delay: 0.05, floatDistance: 12, floatDuration: 6, main: true },
  { src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80", alt: "Top Right Pet", size: 65, top: 40, left: 310, z: 5, scrollRange: [80, -80], depth: 34, glow: "#8B5CF6", delay: 0.35, floatDistance: 8, floatDuration: 3.8 },
  { src: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=300&q=80", alt: "Bottom Left Cat", size: 110, top: 260, left: 40, z: 20, scrollRange: [-50, 50], depth: 28, glow: "#EC4899", delay: 0.5, floatDistance: 10, floatDuration: 4.6 },
  { src: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80", alt: "Right Dogs", size: 120, top: 170, left: 360, z: 10, scrollRange: [100, -100], depth: 40, glow: "#3B82F6", delay: 0.65, floatDistance: 14, floatDuration: 5.2 },
  { src: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80", alt: "Bottom Right Husky", size: 170, top: 310, left: 200, z: 15, scrollRange: [-20, 20], depth: 22, glow: "#FACC15", delay: 0.8, floatDistance: 11, floatDuration: 5.8 },
];

const SPARKLES = [
  { top: 30, left: 60, size: 16, delay: 0, color: "#F09E5B" }, { top: 130, left: 18, size: 12, delay: 0.8, color: "#8B5CF6" }, { top: 8, left: 240, size: 14, delay: 1.4, color: "#FACC15" }, { top: 250, left: 468, size: 18, delay: 0.4, color: "#3B82F6" }, { top: 430, left: 110, size: 14, delay: 1.9, color: "#EC4899" }, { top: 470, left: 410, size: 12, delay: 1.1, color: "#F09E5B" },
];

const Sparkle = ({ top, left, size, delay, color, reduce }: { top: number; left: number; size: number; delay: number; color: string; reduce: boolean }) => (
  <motion.svg aria-hidden viewBox="0 0 24 24" width={size} height={size} className="pointer-events-none absolute" style={{ top, left, zIndex: 30 }} animate={reduce ? { opacity: 0.6 } : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 90, 180] }} transition={{ duration: 2.8, delay, repeat: Infinity, ease: "easeInOut" }}>
    <path d="M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z" fill={color} />
  </motion.svg>
);

const HeroBubble = ({ b, scrollProgress, mouseX, mouseY, reduce, isHovered }: { b: Bubble; scrollProgress: MotionValue<number>; mouseX: MotionValue<number>; mouseY: MotionValue<number>; reduce: boolean; isHovered?: boolean; }) => {
  const scrollY = useTransform(scrollProgress, [0, 1], b.scrollRange);
  const px = useTransform(mouseX, (v: number) => v * b.depth);
  const py = useTransform(mouseY, (v: number) => v * b.depth);
  const y = useTransform([scrollY, py], (v: number[]) => v[0] + v[1]);

  // Các biên độ random cho trạng thái Hover (Di chuyển từ 10-15px và Xoay ngẫu nhiên từ 5-15 độ)
  const rX = useRef((Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 10)).current;
  const rY = useRef((Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + 10)).current;
  const rRot = useRef((Math.random() > 0.5 ? 1 : -1) * (Math.random() * 10 + 5)).current;

  return (
    <motion.div className="absolute" style={{ top: b.top, left: b.left, width: b.size, height: b.size, zIndex: b.z, x: px, y }}>
      <motion.div className="relative h-full w-full" initial={reduce ? false : { scale: 0.2, opacity: 0, rotate: -14 }} whileInView={{ scale: 1, opacity: 1, rotate: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 120, damping: 14, delay: b.delay }} whileTap={{ scale: 1.12, rotate: 6 }}>
        <motion.span aria-hidden className="absolute -inset-3 rounded-full blur-xl" animate={reduce ? { opacity: 0.4 } : { opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.14, 0.95] }} transition={{ duration: b.floatDuration, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="relative h-full w-full" animate={reduce ? undefined : { y: [0, -b.floatDistance, 0], rotate: [-2, 2, -2] }} transition={{ duration: b.floatDuration, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}>
          {/* Sửa thẻ img thành motion.img để áp dụng shadow và translation mượt mà */}
          <motion.img
            src={b.src}
            alt={b.alt}
            draggable={false}
            className="relative h-full w-full select-none rounded-full object-cover ring-[5px] ring-white"
            initial={{ boxShadow: "0 18px 40px rgba(0,0,0,0.16)", x: 0, y: 0, rotate: 0 }}
            animate={isHovered ? {
              boxShadow: "0 6px 12px rgba(0,0,0,0.5)", // Shadow mỏng và đậm hơn
              x: [0, rX, -rX, 0],
              y: [0, rY, -rY, 0],
              rotate: [0, rRot, -rRot, 0]
            } : {
              boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
              x: 0,
              y: 0,
              rotate: 0
            }}
            transition={{
              boxShadow: { duration: 0.3 },
              x: isHovered ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5, ease: "easeOut" },
              y: isHovered ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5, ease: "easeOut" },
              rotate: isHovered ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5, ease: "easeOut" }
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const AboutUsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const mouseX = useSpring(mx, { stiffness: 70, damping: 14, mass: 0.6 });
  const mouseY = useSpring(my, { stiffness: 70, damping: 14, mass: 0.6 });

  const [isHovered, setIsHovered] = useState(false);

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5); my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handlePointerLeave = () => {
    mx.set(0); my.set(0);
    setIsHovered(false);
  };

  return (
    <div ref={ref} className="mx-auto mb-[60px] mt-[100px] flex w-full max-w-[1100px] flex-col items-center justify-center px-4 lg:mt-[160px] lg:flex-row lg:px-0" style={{ backgroundColor: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
      <div onPointerEnter={handlePointerEnter} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} className="relative flex h-[330px] w-full justify-center overflow-x-clip min-[420px]:h-[390px] sm:h-[450px] lg:h-[500px] lg:w-1/2 lg:justify-start">
        <div className="relative h-[500px] w-[500px] shrink-0 origin-top scale-[0.62] min-[420px]:scale-[0.74] sm:scale-[0.88] lg:scale-100">
          {SPARKLES.map((s, i) => <Sparkle key={i} {...s} reduce={reduce} />)}
          {BUBBLES.map((b) => <HeroBubble key={b.alt} b={b} scrollProgress={scrollYProgress} mouseX={mouseX} mouseY={mouseY} reduce={reduce} isHovered={isHovered} />)}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="mt-2 flex w-full flex-col justify-center text-center lg:mt-0 lg:w-1/2 lg:pl-[60px] lg:text-left">
        <div style={{ color: "#8B5CF6", fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>About</div>
        <div style={{ color: "#0F172A", fontWeight: "800", fontSize: "42px", marginBottom: "20px", fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: "-0.5px" }}>Who we are?</div>
        <div className="mx-auto lg:mx-0" style={{ color: "#64748B", fontWeight: "400", fontSize: "14px", lineHeight: "1.7", marginBottom: "40px", maxWidth: "420px" }}>
          We are a charitable project whose primary goal is to help shelters find new owners for their pets.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "30px 40px" }}>
          {[{ value: "1200+", label: "Adopted pets" }, { value: "5+", label: "Years" }, { value: "10", label: "Partners" }, { value: "20", label: "Shelters" }].map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.5 }} viewport={{ once: true }}>
              <div style={{ color: "#FF9500", fontSize: "32px", fontWeight: "800", marginBottom: "4px", fontFamily: "'Be Vietnam Pro', sans-serif" }}>{stat.value}</div>
              <div style={{ color: "#94A3B8", fontSize: "13px", fontWeight: "500" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ----------------------------------------------------------------------------
//  QUẢN LÝ THÔNG TIN PET CƯNG
// ----------------------------------------------------------------------------
const PetManagementSection = () => {
  return (
    <div className="mt-[60px] flex w-full flex-col items-center overflow-x-clip px-4 lg:mt-[100px] lg:px-0" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ color: "#F09E5B", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Thẻ QR cho thú cưng</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center" style={{ color: "#111827", fontSize: "32px", fontWeight: "700", marginBottom: "60px" }}>Quản lý thông tin pet cưng</motion.div>

      <div className="relative mb-[40px] flex w-full flex-col items-center gap-10 lg:mb-[80px]">
        <div className="relative z-[2] flex w-full flex-col items-center justify-between gap-12 lg:h-[380px] lg:w-[860px] lg:flex-row lg:gap-0">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative mx-auto aspect-square w-full max-w-[380px] lg:mx-0 lg:aspect-auto lg:h-[380px] lg:w-[380px]">
            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80" alt="Cat" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }} />
            {/* Đã gỡ bỏ whileHover và thay bằng animate tự động lặp lại (y đi từ 0 lên -12 và vòng lại 0) */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[24px] right-[-10px] z-10 w-[170px] sm:bottom-[30px] sm:right-[-30px] sm:w-[190px]"
              style={{ backgroundColor: "#fff", padding: "20px 24px", borderRadius: "24px", boxShadow: "0 15px 40px rgba(0,0,0,0.08)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}><span style={{ fontWeight: "700", fontSize: "16px", color: "#111827" }}>Piglet</span><div style={{ transform: "scale(0.9)", marginLeft: "2px" }}><Icons.Male /></div></div>
              <div style={{ fontSize: "10px", color: "#6B7280", fontWeight: "500" }}>2 tuổi • Siberian Husky</div>
              <div style={{ height: "1px", backgroundColor: "#F3F4F6", margin: "12px 0" }}></div>
              <div style={{ fontSize: "8px", fontWeight: "700", color: "#9CA3AF", marginBottom: "4px", letterSpacing: "0.5px" }}>QR NUMBER</div>
              <div style={{ fontSize: "12px", color: "#111827", marginBottom: "12px", fontWeight: "600", letterSpacing: "0.5px" }}>PL-00000</div>
              <div style={{ fontSize: "8px", fontWeight: "700", color: "#9CA3AF", marginBottom: "4px", letterSpacing: "0.5px" }}>TÌNH TRẠNG</div>
              <div style={{ fontSize: "12px", color: "#111827", fontWeight: "600" }}>An toàn</div>
              <div style={{ height: "1px", backgroundColor: "#F3F4F6", margin: "12px 0" }}></div>
              <div style={{ fontSize: "8px", fontWeight: "700", color: "#9CA3AF", marginBottom: "4px", letterSpacing: "0.5px" }}>GHI CHÚ</div>
              <div style={{ fontSize: "12px", color: "#111827", fontWeight: "600", lineHeight: "1.4" }}>Dễ thương, nhưng<br />hơi nhát người</div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full lg:h-full lg:w-[430px]" style={{ backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "24px", padding: "36px", boxShadow: "0 10px 30px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: "14px", marginBottom: "24px", alignItems: "flex-start" }}>
              <div style={{ marginTop: "2px" }}><ExtraIcons.QR /></div>
              <div><div style={{ fontWeight: "700", fontSize: "15px", color: "#111827", marginBottom: "4px" }}>Định danh pet</div><div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "500" }}>Một thẻ QR - Một danh tính vĩnh viễn</div></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", flexGrow: 1 }}>
              {["Quét QR để biết tình trạng thú cưng", "Bảo vệ thông tin chủ nuôi", "Chuyển chủ an toàn", "Một chiếc thẻ cho suốt vòng đời của thú cưng"].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ marginTop: "2px", transform: "scale(0.85)" }}><Icons.Check color="#A855F7" /></div>
                  <span style={{ fontSize: "12px", color: "#4B5563", lineHeight: "1.5", fontWeight: "500" }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, backgroundColor: "#F09E5B", color: "#fff", border: "none", padding: "12px 0", borderRadius: "10px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Tải app PawLife</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, backgroundColor: "transparent", color: "#F09E5B", border: "1px solid #F09E5B", padding: "12px 0", borderRadius: "10px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Mua thẻ QR</motion.button>
            </div>
          </motion.div>
        </div>

        <div className="z-[1] w-full max-w-[860px] min-[1480px]:absolute min-[1480px]:left-[calc(50%+460px)] min-[1480px]:top-1/2 min-[1480px]:w-[260px] min-[1480px]:max-w-none min-[1480px]:-translate-y-1/2">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="flex w-full flex-col gap-[36px] px-2 md:flex-row md:justify-center md:gap-[60px] min-[1480px]:flex-col min-[1480px]:justify-start min-[1480px]:gap-[36px] min-[1480px]:px-0">
            <div className="flex-1 md:max-w-[300px] min-[1480px]:max-w-none">
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}><div style={{ marginTop: "2px" }}><Icons.Bell /></div><div><div style={{ fontWeight: "700", fontSize: "13px", color: "#111827", marginBottom: "2px" }}>Chế độ lạc</div><div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "500" }}>Kích hoạt miễn phí khi pet cưng thất lạc</div></div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Ai cũng có thể quét — không cần app", "Liên hệ chủ nuôi nhanh chóng"].map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><div style={{ marginTop: "2px", transform: "scale(0.8)" }}><Icons.Check color="#F59E0B" /></div><span style={{ fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>{text}</span></div>
                ))}
              </div>
            </div>
            <div className="flex-1 md:max-w-[300px] min-[1480px]:max-w-none">
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}><div style={{ marginTop: "2px" }}><Icons.History /></div><div><div style={{ fontWeight: "700", fontSize: "13px", color: "#111827", marginBottom: "2px" }}>PawHistory</div><div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "500" }}>Không chỉnh sửa - Không xóa bỏ</div></div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Hồ sơ y tế trọn đời — chỉ bổ sung, không ghi đè", "Lịch sử nhận nuôi rõ ràng"].map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><div style={{ marginTop: "2px", transform: "scale(0.8)" }}><Icons.Check color="#22C55E" /></div><span style={{ fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>{text}</span></div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-[40px] grid w-full max-w-[900px] grid-cols-2 items-start gap-x-[12px] gap-y-[40px] px-4 md:gap-[40px] lg:flex lg:flex-row lg:justify-center lg:gap-[24px] lg:px-0">
        {[
          { icon: <ExtraIcons.QR />, title: "Kích hoạt thẻ", desc: "Quét mã QR trên app và\nđăng ký cho pet cưng" },
          { icon: <ExtraIcons.Doc />, title: "PawHistory", desc: "Thêm các mũi tiêm phòng và\nhồ sơ khám bệnh cho pet" },
          { icon: <ExtraIcons.Shield />, title: "Cập nhật thông tin", desc: "Đảm bảo thông tin chủ\nnuôi luôn chính xác" },
          { icon: <ExtraIcons.CheckCircle />, title: "An toàn", desc: "Luôn gắn thẻ QR cho pet\ncưng của bạn" },
        ].map((step, idx) => (
          <React.Fragment key={idx}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="mx-auto flex w-full flex-col items-center text-center lg:w-[160px]">
              <div style={{ marginBottom: "16px" }}>{step.icon}</div>
              <div style={{ fontWeight: "700", fontSize: "13px", color: "#111827", marginBottom: "8px" }}>{step.title}</div>
              <div style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.5", fontWeight: "500", whiteSpace: "pre-line" }}>{step.desc}</div>
            </motion.div>
            {idx < 3 && <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 + 0.1 }} className="hidden lg:block" style={{ marginTop: "16px" }}><ExtraIcons.ArrowRightThin /></motion.div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const AdoptionSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPet = MOCK_ADOPTIONS[currentIndex];
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % MOCK_ADOPTIONS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + MOCK_ADOPTIONS.length) % MOCK_ADOPTIONS.length);

  return (
    <div className="flex flex-col items-center w-full mt-[100px] lg:mt-[160px] px-4 lg:px-0" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ color: "#F09E5B", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Nhận nuôi cùng PawLife</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center" style={{ color: "#111827", fontSize: "32px", fontWeight: "700", marginBottom: "50px" }}>Tô điểm sắc màu cho một sinh mạng</motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col lg:flex-row items-center gap-[40px] w-full max-w-[940px] justify-center">
        <div className="hidden lg:flex flex-col gap-[12px]">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyItems: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronRight style={{ transform: "rotate(180deg)" }} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyItems: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronLeft style={{ transform: "rotate(180deg)" }} /></motion.button>
        </div>

        <div className="flex flex-col w-full lg:w-[860px]">
          <SwipeArea onNext={handleNext} onPrev={handlePrev}>
            <div className="flex flex-col lg:flex-row w-full lg:h-[420px]" style={{ backgroundColor: "#fff", borderRadius: "32px", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.06)" }}>
              <div className="w-full lg:w-[50%] h-[300px] lg:h-full relative overflow-hidden">
                <motion.img key={currentPet.img} initial={{ opacity: 0.5, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} src={currentPet.img} alt="Adoption Pet" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(30%)" }} />
              </div>
              <div className="w-full lg:w-[50%] p-[30px] lg:p-[48px_40px] flex flex-col">
                <motion.div key={`title-${currentPet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}><h3 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>{currentPet.name}</h3><div style={{ transform: "scale(0.9)" }}>{currentPet.gender === "Male" ? <Icons.Male /> : <Icons.Female />}</div></motion.div>
                <motion.div key={`info-${currentPet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ fontSize: "10px", color: "#9CA3AF", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.2px" }}>{currentPet.info}</motion.div>
                <motion.p key={`desc-${currentPet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.7", marginBottom: "24px", fontWeight: "500", paddingRight: "10px", minHeight: "80px" }}>{currentPet.desc}</motion.p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "auto" }}>
                  {currentPet.tags.map((tag, i) => <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }} style={{ backgroundColor: tag.bg, color: tag.color, padding: "5px 12px", borderRadius: "20px", fontSize: "9px", fontWeight: "700" }}>{tag.label}</motion.div>)}
                </div>
                <div className="flex flex-col sm:flex-row gap-[16px] mt-[30px]">
                  <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, backgroundColor: "#F09E5B", color: "#fff", border: "none", padding: "14px 0", borderRadius: "10px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Xem thêm về {currentPet.name}</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, backgroundColor: "transparent", color: "#F09E5B", border: "1px solid #F09E5B", padding: "14px 0", borderRadius: "10px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Đăng ký nhận nuôi</motion.button>
                </div>
              </div>
            </div>
          </SwipeArea>
          <CarouselDots total={MOCK_ADOPTIONS.length} current={currentIndex} onChange={setCurrentIndex} />
        </div>
      </motion.div>
    </div>
  );
};

const ShelterSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentShelter = MOCK_SHELTERS[currentIndex];
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % MOCK_SHELTERS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + MOCK_SHELTERS.length) % MOCK_SHELTERS.length);

  return (
    <div className="flex flex-col items-center w-full mt-[100px] lg:mt-[120px] px-4 lg:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ fontFamily: "'1FTV VIP Baby Doll', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", textTransform: "uppercase" }}>trạm cứu hộ</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center" style={{ marginTop: "14px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Trạm cứu hộ uy tín ở Việt Nam</motion.div>

      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col items-center w-full max-w-[745px] mt-[30px] lg:mt-[51px]">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-[26px] w-full">
          <SwipeArea onNext={handleNext} onPrev={handlePrev}>
            <div className="flex flex-col-reverse lg:flex-row justify-between items-center lg:items-end gap-[27px] w-full max-w-[694px]">
              <div className="flex flex-col justify-start items-start w-full lg:w-[330px]">
                <motion.div key={`s-title-${currentShelter.name}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ display: "flex", justifyContent: "start", alignItems: "start", height: "29px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#F09E5B", display: "flex", justifyItems: "center", alignItems: "center", color: "#fff", fontWeight: "bold", paddingLeft: "8px" }}>{currentShelter.name.charAt(0)}</div>
                  <div style={{ marginTop: "1px", marginLeft: "9px", display: "flex", flexDirection: "column", gap: "6px", width: "160px" }}>
                    <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "rgba(0,0,0,1)", fontWeight: "600", whiteSpace: "nowrap" }}>{currentShelter.name}</div>
                    <div style={{ display: "flex", gap: "4px" }}><div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", color: "rgba(133,133,133,1)" }}>{currentShelter.location}</div></div>
                  </div>
                </motion.div>
                <motion.div key={`s-desc-${currentShelter.name}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ marginTop: "14px", fontFamily: "'Urbanist', sans-serif", fontSize: "10px", width: "100%", color: "rgba(133,133,133,1)", lineHeight: "150%", minHeight: "45px" }}>{currentShelter.desc}</motion.div>
                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px", width: "121px" }}>
                  <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", color: "rgba(133,133,133,1)", fontWeight: "700" }}>GOVERNANCE STATUS</div>
                  {MOCK_DATA.shelterGovernance.map((item, idx) => <GovernanceItem key={idx} width={item.w} heightSwitch={item.hSwitch} iconSrc={item.icon} title={item.title} minWidth={item.tw} />)}
                </div>
                <div className="flex w-full lg:w-[329px] gap-[9px] mt-[17px]">
                  <motion.div whileHover={{ scale: 1.05 }} style={{ backgroundColor: "rgba(232,155,90,1)", flex: 1, height: "31px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", color: "rgba(255,255,255,1)", fontWeight: "600" }}>Xem thông tin</div></motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} style={{ border: "1px solid rgb(232,155,90)", flex: 1, height: "31px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Tất cả trạm</div></motion.div>
                </div>
              </div>

              <motion.img key={currentShelter.img} initial={{ opacity: 0.5, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full lg:w-[337px] h-auto lg:h-[292px] rounded-[32px] object-cover" style={{ boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }} src={currentShelter.img} alt="Shelter Img" />
            </div>
          </SwipeArea>

          <div className="hidden lg:flex flex-col gap-[5px]">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><Icons.ChevronRight style={{ transform: "rotate(-90deg) scale(0.6)" }} /></motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><Icons.ChevronRight style={{ transform: "rotate(90deg) scale(0.6)" }} /></motion.button>
          </div>
        </div>
        <CarouselDots total={MOCK_SHELTERS.length} current={currentIndex} onChange={setCurrentIndex} />
      </motion.div>
    </div>
  );
};

const MythsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMyth = MOCK_MYTHS[currentIndex];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % MOCK_MYTHS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + MOCK_MYTHS.length) % MOCK_MYTHS.length);

  return (
    <div ref={ref} className="flex flex-col items-center w-full mt-[100px] lg:mt-[140px] px-4 lg:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "12px", color: "#F09E5B", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Myths</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center" style={{ marginTop: "8px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "#111827", fontWeight: "700", marginBottom: "60px" }}>Những hiểu lầm cần được làm rõ</motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col items-center w-full max-w-[1050px]">
        <SwipeArea onNext={handleNext} onPrev={handlePrev}>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-[20px] lg:gap-[40px] w-full relative">
            <div className="hidden lg:flex flex-col gap-[8px] flex-shrink-0 z-10">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronRight /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronLeft /></motion.button>
            </div>
            <div className="flex-shrink-0 flex items-center z-10">
              <motion.img key={currentMyth.img} initial={{ opacity: 0.5, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-[300px] lg:w-[360px] h-[300px] lg:h-[360px] object-cover rounded-[32px]" src={currentMyth.img} alt="Myths Pet" />
            </div>
            <motion.div key={`text-${currentIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[300px] lg:w-[260px] flex flex-col pb-[20px] text-center lg:text-left z-10">
              <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "22px", color: "#111827", fontWeight: "700", lineHeight: "1.2", marginBottom: "16px", whiteSpace: "pre-line", minHeight: "55px" }}>{currentMyth.title}</div>
              <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "11px", color: "#9CA3AF", lineHeight: "1.6", fontWeight: "500", minHeight: "90px" }}>{currentMyth.desc}</div>
            </motion.div>
            <motion.div style={{ y: numY }} className="flex-shrink-0 hidden lg:block absolute right-0">
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "180px", color: "#F09E5B", fontWeight: "700", lineHeight: "1", transform: "rotate(10deg)", textShadow: "4px 4px 0px rgba(240,158,91,0.2)", transition: "all 0.3s ease", opacity: 0.2 }}>{currentIndex + 1}</div>
            </motion.div>
          </div>
        </SwipeArea>
        <CarouselDots total={MOCK_MYTHS.length} current={currentIndex} onChange={setCurrentIndex} />
      </motion.div>
    </div>
  );
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ width: "100%", maxWidth: "760px", border: "1px solid #E5E7EB", borderRadius: "12px", marginBottom: "12px", overflow: "hidden", backgroundColor: "#fff", boxShadow: isOpen ? "0 4px 15px rgba(0,0,0,0.03)" : "none" }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", cursor: "pointer" }}>
        <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "16px", color: "#111827", fontWeight: "700" }}>{question}</div>
        <div style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
      <div style={{ maxHeight: isOpen ? "200px" : "0px", padding: isOpen ? "0 24px 20px 24px" : "0 24px", opacity: isOpen ? 1 : 0, transition: "all 0.3s ease", fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "#6B7280", lineHeight: "1.6" }}>{answer}</div>
    </motion.div>
  );
};

const FaqSection = () => {
  const faqs = [
    { question: "Tại sao nên dùng thẻ QR PawLife?", answer: "Thẻ QR PawLife giúp định danh thú cưng vĩnh viễn, lưu trữ hồ sơ y tế rõ ràng và đặc biệt có tính năng báo mất (chế độ lạc) giúp ai cũng có thể quét để liên hệ với chủ nuôi mà không cần phải tải app." },
    { question: "Thẻ QR có bị vô nước không?", answer: "Thẻ QR được thiết kế bằng chất liệu chống nước và chống xước cao cấp, đảm bảo độ bền trong mọi hoạt động hàng ngày của thú cưng như tắm rửa, đi mưa hay bơi lội." },
    { question: "Thú cưng trong trạm cứu hộ có bệnh không?", answer: "Hoàn toàn an toàn. Animals from shelters are microchipped, treated for parasites, vaccinated, sterilized. All operations are carried out strictly according to the schedule." },
  ];
  return (
    <div className="flex flex-col items-center w-full mt-[100px] lg:mt-[140px] px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center" style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "#111827", fontWeight: "700", marginBottom: "40px" }}>Thắc mắc & giải đáp</motion.div>
      <div className="w-full flex flex-col items-center">
        {faqs.map((faq, index) => <FaqItem key={index} question={faq.question} answer={faq.answer} />)}
      </div>
    </div>
  );
};

const JourneySection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentJourney = MOCK_JOURNEYS[currentIndex];
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % MOCK_JOURNEYS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + MOCK_JOURNEYS.length) % MOCK_JOURNEYS.length);

  return (
    <div className="flex flex-col items-center w-full mt-[100px] lg:mt-[148px] pb-[100px] px-4 lg:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ fontFamily: "'1FTV VIP Baby Doll', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", textTransform: "uppercase" }}>Hành trình hạnh phúc</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center" style={{ marginTop: "14px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Lan tỏa yêu thương</motion.div>

      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col items-center w-full max-w-[735px] mt-[40px]">
        <SwipeArea onNext={handleNext} onPrev={handlePrev}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-[26px] w-full">
            <div className="hidden lg:flex flex-col gap-[5px]">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><Icons.ChevronRight style={{ transform: "rotate(-90deg) scale(0.6)" }} /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><Icons.ChevronRight style={{ transform: "rotate(90deg) scale(0.6)" }} /></motion.button>
            </div>
            <motion.img key={currentJourney.img} initial={{ opacity: 0.5, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-[100%] max-w-[308px] h-auto lg:h-[294px] rounded-[32px] object-cover" style={{ boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }} src={currentJourney.img} alt="Journey" />
            <motion.div key={`text-${currentJourney.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex flex-col justify-start items-center lg:items-start text-center lg:text-left h-auto lg:h-[257px] flex-1">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><img style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} src={currentJourney.avatar} alt="Avatar" /><div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "12px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>{currentJourney.name}</div><div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", color: "rgba(133,133,133,1)" }}>{currentJourney.info}</div></div></div>
              <div style={{ marginTop: "16px", fontFamily: "'Urbanist', sans-serif", fontSize: "12px", width: "100%", maxWidth: "349px", color: "rgba(133,133,133,1)", lineHeight: "160%", minHeight: "75px" }}>&quot;{currentJourney.desc}&quot;</div>
              <motion.div whileHover={{ scale: 1.05 }} style={{ marginTop: "30px", display: "flex", justifyContent: "center", alignItems: "center", width: "80px", height: "28px", borderRadius: "8px", border: "1px solid rgb(232,155,90)", cursor: "pointer" }}><div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Đọc thêm</div></motion.div>
            </motion.div>
          </div>
        </SwipeArea>
        <CarouselDots total={MOCK_JOURNEYS.length} current={currentIndex} onChange={setCurrentIndex} />
      </motion.div>
    </div>
  );
};

const PartnerLogosSection = () => {
  const partners = [{ name: "PetRescue", color: "#3B82F6" }, { name: "HappyTails", color: "#10B981" }, { name: "VetCare Plus", color: "#F59E0B" }, { name: "FurryFriends", color: "#8B5CF6" }, { name: "Meow & Co.", color: "#EC4899" }, { name: "DoggoWorld", color: "#14B8A6" }];
  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="flex flex-col items-center w-full mt-[60px] px-4 overflow-hidden">
      <style>{`@keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .logo-track { display: flex; width: max-content; animation: infinite-scroll 25s linear infinite; } .logo-track:hover { animation-play-state: paused; }`}</style>
      <div style={{ fontFamily: "'1FTV VIP Baby Doll', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", textTransform: "uppercase" }}>Đối tác đồng hành</div>
      <div className="text-center" style={{ marginTop: "14px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600", marginBottom: "50px" }}>Mạng lưới kết nối của PawLife</div>

      <div className="w-full max-w-[1200px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[50px] lg:w-[150px] h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[50px] lg:w-[150px] h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        <div className="logo-track items-center gap-[40px] lg:gap-[80px] py-[20px]">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {partners.map((p, idx) => (
                <div key={`${i}-${idx}`} className="flex items-center gap-[12px] cursor-pointer opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: `${p.color}20`, display: "flex", justifyContent: "center", alignItems: "center" }}><span style={{ color: p.color, fontWeight: "900", fontSize: "20px" }}>{p.name.charAt(0)}</span></div>
                  <span style={{ fontSize: "22px", fontWeight: "700", color: "#4B5563", fontFamily: "'Urbanist', sans-serif", whiteSpace: "nowrap" }}>{p.name}</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------------
//  FOOTER BANNER 
// ----------------------------------------------------------------------------
const FooterSection = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const linkStyle: React.CSSProperties = {
    color: "#4B5563",
    fontSize: "16px",
    textDecoration: "none",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div className="w-full bg-[#F8F9FA] flex justify-center pt-[80px] pb-[60px] px-8 lg:px-[60px] relative mt-[100px]">
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row justify-between items-start gap-12">
        {/* Left Column: Logo, slogan & tải app */}
        <div className="flex flex-col max-w-[420px]">
          <BrandLogo size={40} fontSize={26} />

          <h2
            style={{
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: "46px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.15,
              marginTop: "32px",
              marginBottom: "28px",
              letterSpacing: "-1px",
            }}
          >
            Take a tail into
            <br />
            your family
          </h2>

          <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "13px", fontWeight: 600, color: "#6B7280", marginBottom: "14px" }}>
            Tải app PawLife - pet id
          </div>
          <div className="flex flex-wrap gap-[16px] pt-[8px]">
            <StoreButton href={IOS_APP_URL} icon={<AppleIcon />} small="Tải về trên" big="App Store" />
            <StoreButton href={ANDROID_APP_URL} icon={<PlayIcon />} small="Tải về trên" big="Google Play" badge="Sắp ra mắt" />
          </div>
        </div>

        {/* Right Columns: Links & Info */}
        <div className="flex flex-col sm:flex-row gap-[60px] lg:gap-[120px] mt-[40px] lg:mt-[85px] w-full lg:w-auto pr-0 lg:pr-[60px]">
          <div className="flex flex-col gap-[20px]">
            <a href="#" style={linkStyle}>About</a>
            <a href="#" style={linkStyle}>Pets</a>
            <a href="#" style={linkStyle}>How it works?</a>
          </div>
          <div className="flex flex-col gap-[20px]">
            <a href="#" style={linkStyle}>Reviews</a>
            <a href="#" style={linkStyle}>FAQ</a>
            <a href="#" style={linkStyle}>Partners</a>
          </div>
          <div className="flex flex-col gap-[20px]">
            <span style={{ color: "#4B5563", fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>+ (380) 63 567 65 75</span>
            <span style={{ color: "#4B5563", fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>hello@pawlife.vn</span>
            <div className="flex gap-[16px] mt-[4px]">
              <a href="#" aria-label="Facebook" style={{ color: "#9B7EFA", transition: "opacity 0.2s" }} className="hover:opacity-80">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" style={{ color: "#9B7EFA", transition: "opacity 0.2s" }} className="hover:opacity-80">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        aria-label="Lên đầu trang"
        className="absolute right-[30px] top-[40px] lg:right-[80px] lg:top-[80px]"
        style={{ width: "52px", height: "52px", backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </div>
  );
};

const FloatingQrButton = () => {
  const reduce = !!useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.8 }}
      className="fixed z-40"
      style={{
        left: "max(16px, env(safe-area-inset-left))",
        bottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      <Link
        href="/scan"
        aria-label="Quét QR"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="relative flex items-center"
        style={{ textDecoration: "none" }}
      >
        {/* Vòng sóng toả ra thu hút sự chú ý */}
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
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3z" />
            <path d="M21 14v3" />
            <path d="M14 21h3" />
            <path d="M21 21h0.01" />
          </svg>
        </motion.span>

        {/* Nhãn trượt ra khi hover (chỉ hiện trên desktop) */}
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
            color: "#111827",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "'Be Vietnam Pro', sans-serif",
          }}
        >
          Quét QR thú cưng
        </motion.span>
      </Link>
    </motion.div>
  );
};


// ============================================================================
// 5. MAIN COMPONENT CHÍNH CỦA TRANG
// ============================================================================
export default function HomePageCleaned() {
  return (
    <div style={{ backgroundColor: "rgba(255,255,255,1)", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", overflowX: "clip", position: "relative" }}>
      <MagicCursorCanvas />
      <CuteCursor />
      <FloatingQrButton />
      {/* Main Content Wrapper - Bị giới hạn độ rộng */}
      <div className="flex flex-col items-center w-full max-w-[1440px] relative z-10">
        <HeaderSection />

        {/* Component Hero Mới - Đã được thêm vào và đẩy phần About xuống dưới */}
        <HeroSection />

        <AboutUsSection />
        <PetManagementSection />
        <AdoptionSection />
        <ShelterSection />
        <MythsSection />
        <FaqSection />
        <JourneySection />
        <PartnerLogosSection />
      </div>

      {/* Footer Section - Nằm ngoài box 1440px để màu nền Full Width */}
      <FooterSection />
    </div>
  );
}