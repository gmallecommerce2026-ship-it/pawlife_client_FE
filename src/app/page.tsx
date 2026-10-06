'use client';

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// ============================================================================
// 1. DỮ LIỆU TĨNH (MOCK_DATA) - GIỮ NGUYÊN 100% VÀ THÊM DATA CAROUSEL
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
  )
}

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
  ],
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
      { label: "Good with kids", color: "#CA8A04", bg: "#FEF9C3" }
    ]
  },
  {
    name: "Bella", gender: "Female", info: "2 years • Golden Retriever",
    desc: "Bella is an incredibly sweet and affectionate Golden Retriever. She loves playing fetch, cuddling on the couch, and is wonderful with other pets. Looking for a loving forever home.",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Vaccinated", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Friendly", color: "#2563EB", bg: "#DBEAFE" },
      { label: "House-trained", color: "#CA8A04", bg: "#FEF9C3" }
    ]
  },
  {
    name: "Milo", gender: "Male", info: "1 year • Beagle Mix",
    desc: "Milo is a curious and energetic pup who loves to explore his surroundings. He is currently learning basic commands and would thrive with an owner willing to continue his training.",
    img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    tags: [
      { label: "Microchipped", color: "#16A34A", bg: "#DCFCE7" },
      { label: "Energetic", color: "#2563EB", bg: "#DBEAFE" }
    ]
  }
];

const MOCK_SHELTERS = [
  {
    name: "Happy Paws Sanctuary", location: "Hanoi, Vietnam",
    desc: "A dedicated animal welfare organization committed to rescuing, rehabilitating, and rehoming pets in need. We provide comprehensive care.",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Saigon Pet Rescue", location: "Ho Chi Minh City, Vietnam",
    desc: "Providing a safe haven for stray and abandoned animals in the heart of Saigon. Our mission is to give every pet a second chance at life and love.",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Da Nang Animal Hope", location: "Da Nang, Vietnam",
    desc: "Focusing on medical rehabilitation and finding forever homes for injured and neglected animals across the central region of Vietnam.",
    img: "https://images.unsplash.com/photo-1590159763121-7c1dc4dff2da?auto=format&fit=crop&w=800&q=80"
  }
];

const MOCK_MYTHS = [
  {
    title: "Only sick animals live\nin the shelters",
    desc: "Animals from shelters are microchipped, treated for parasites, vaccinated, sterilized. All operations are carried out strictly according to the schedule.",
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Shelter pets have\nbehavior issues",
    desc: "Most pets end up in shelters due to human issues (moving, finances, allergies), not because of the pet's behavior. Many are already house-trained and ready to love.",
    img: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "You can't find purebreds\nin shelters",
    desc: "Up to 25% of pets in animal shelters are purebreds. There are also many breed-specific rescues if you are looking for a particular type of companion.",
    img: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80"
  }
];

const MOCK_JOURNEYS = [
  {
    name: "Judy Smith", info: "adopted through Happy Paws Sanctuary",
    desc: "With the appearance of Alice in my life, there was a psychological upswing. I understand that I am not alone, and she brings joy to my everyday routine...",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Mark & Sarah", info: "adopted through Saigon Pet Rescue",
    desc: "Bringing Milo home was the best decision we ever made. He was shy at first, but now he is the most affectionate and energetic member of our small family...",
    img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Linh Tran", info: "adopted through Da Nang Animal Hope",
    desc: "I wasn't sure if I was ready for a cat, but when I met Mochi at the shelter, it was love at first sight. She completely changed my perspective on life...",
    img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  }
];

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

const CarouselDots = ({ total, current, onChange }: { total: number, current: number, onChange: (idx: number) => void }) => (
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
          cursor: "pointer"
        }}
      />
    ))}
  </div>
);

// ============================================================================
// 3. CÁC SECTION CHÍNH (TÍCH HỢP FRAMER MOTION PARALLAX)
// ============================================================================

const HeaderSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex justify-between items-center w-full max-w-[1350px] mx-auto px-4 lg:px-0 relative z-50"
    >
      <div style={{ padding: "10px", width: "60px", height: "55px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="text-2xl font-bold" style={{ color: "#F09E5B" }}>PawLife</div>
      </div>

      <div className="hidden lg:flex flex-row justify-end items-start gap-[8px] ml-[14px] w-[1110px]">
        <div style={{ gap: "8px", display: "flex", flexDirection: "row", justifyContent: "start", alignItems: "center", width: "608px" }}>
          {MOCK_DATA.navItems.map((item, idx) => (
            <NavItem key={idx} width={item.width} hasBg={item.hasBg} title={item.title} minWidth={item.minWidth} />
          ))}
        </div>
      </div>

      <div className="hidden lg:flex flex-row justify-between items-center ml-[24px] w-[178px] height-[32px] gap-[12px]">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ backgroundColor: "rgba(227,227,227,1)", borderRadius: "8px", border: "1px solid rgb(118,118,118)", height: "32px", minWidth: "89px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "8px", cursor: "pointer" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", minWidth: "51px", whiteSpace: "nowrap", color: "rgba(30,30,30,1)", lineHeight: "100%", fontWeight: "400" }}>Sign in</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ backgroundColor: "rgba(44,44,44,1)", borderRadius: "8px", border: "1px solid rgb(44,44,44)", height: "32px", minWidth: "89px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "8px", cursor: "pointer" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", minWidth: "63px", whiteSpace: "nowrap", color: "rgba(245,245,245,1)", lineHeight: "100%", fontWeight: "400" }}>Register</div>
        </motion.div>
      </div>

      <div className="lg:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </div>

      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-16 left-0 w-full bg-white shadow-lg p-4 flex flex-col gap-4 lg:hidden rounded-lg">
          {MOCK_DATA.navItems.map((item, idx) => (
            <div key={idx} style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "rgba(30,30,30,1)", fontWeight: "400", padding: "8px 0", borderBottom: "1px solid #eee" }}>{item.title}</div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const AboutUsSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Hiệu ứng Parallax cho từng ảnh ở các tốc độ khác nhau
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const y4 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y5 = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <div ref={ref} className="flex flex-col lg:flex-row justify-center items-center w-full max-w-[1100px] mx-auto mt-[60px] lg:mt-[120px] mb-[60px] px-4 lg:px-0" style={{ backgroundColor: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full lg:w-1/2 relative h-[350px] lg:h-[500px] flex justify-center items-center lg:block">
        <motion.img style={{ y: y1, boxShadow: "0px 15px 35px rgba(0,0,0,0.1)" }} src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80" alt="Main Dog" className="w-[200px] h-[200px] lg:w-[260px] lg:h-[260px] lg:absolute lg:top-[60px] lg:left-[90px] rounded-full object-cover z-10" />
        <motion.img style={{ y: y2, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }} src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80" alt="Top Right Pet" className="hidden lg:block absolute top-[40px] left-[310px] w-[65px] h-[65px] rounded-full object-cover z-5" />
        <motion.img style={{ y: y3, boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" }} src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=300&q=80" alt="Bottom Left Cat" className="hidden lg:block absolute top-[260px] left-[40px] w-[110px] h-[110px] rounded-full object-cover z-20" />
        <motion.img style={{ y: y4, boxShadow: "0px 15px 30px rgba(0,0,0,0.1)" }} src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80" alt="Right Dogs" className="hidden lg:block absolute top-[170px] left-[360px] w-[120px] h-[120px] rounded-full object-cover z-10" />
        <motion.img style={{ y: y5, boxShadow: "0px 20px 40px rgba(0,0,0,0.15)" }} src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=300&q=80" alt="Bottom Right Husky" className="hidden lg:block absolute top-[310px] left-[200px] w-[170px] h-[170px] rounded-full object-cover z-15" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 lg:pl-[60px] flex flex-col justify-center text-center lg:text-left mt-8 lg:mt-0"
      >
        <div style={{ color: "#8B5CF6", fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>About</div>
        <div style={{ color: "#0F172A", fontWeight: "800", fontSize: "42px", marginBottom: "20px", fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: "-0.5px" }}>Who we are?</div>
        <div className="mx-auto lg:mx-0" style={{ color: "#64748B", fontWeight: "400", fontSize: "14px", lineHeight: "1.7", marginBottom: "40px", maxWidth: "420px" }}>
          We are a charitable project whose primary goal is to help shelters find new owners for their pets.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "30px 40px" }}>
          {[
            { value: "1200+", label: "Adopted pets" },
            { value: "5+", label: "Years" },
            { value: "10", label: "Partners" },
            { value: "20", label: "Shelters" }
          ].map((stat, index) => (
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

const PetManagementSection = () => {
  return (
    <div className="flex flex-col items-center w-full mt-[60px] lg:mt-[100px] px-4 lg:px-0 overflow-x-hidden" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ color: "#F09E5B", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Thẻ QR cho thú cưng</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center" style={{ color: "#111827", fontSize: "32px", fontWeight: "700", marginBottom: "60px" }}>Quản lý thông tin pet cưng</motion.div>

      <div className="flex flex-col lg:flex-row items-center justify-center relative w-full lg:h-[380px] mb-[40px] lg:mb-[80px] gap-[40px] lg:gap-0">
        <div className="w-full lg:w-[860px] lg:h-full flex flex-col lg:flex-row justify-between items-center relative z-[2] gap-12 lg:gap-0">

          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative w-full max-w-[380px] lg:w-[380px] lg:h-[380px] mx-auto lg:mx-0">
            <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80" alt="Cat" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }} />
            <motion.div whileHover={{ y: -5 }} style={{ position: "absolute", bottom: "30px", right: "-30px", backgroundColor: "#fff", padding: "20px 24px", borderRadius: "24px", boxShadow: "0 15px 40px rgba(0,0,0,0.08)", width: "190px", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "16px", color: "#111827" }}>Piglet</span>
                <div style={{ transform: "scale(0.9)", marginLeft: "2px" }}><Icons.Male /></div>
              </div>
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

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="w-full lg:w-[430px] lg:h-full" style={{ backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "24px", padding: "36px", boxShadow: "0 10px 30px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
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

        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="static lg:absolute lg:left-[calc(50%+430px+30px)] flex flex-col lg:flex-row items-center gap-[30px] z-[1] lg:top-1/2 lg:-translate-y-1/2 mt-10 lg:mt-0">
          <div className="flex flex-col md:flex-row lg:flex-col gap-[36px] w-full max-w-[500px] lg:w-[260px] flex-shrink-0 px-4 lg:px-0">
            <div className="flex-1">
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}>
                <div style={{ marginTop: "2px" }}><Icons.Bell /></div>
                <div><div style={{ fontWeight: "700", fontSize: "13px", color: "#111827", marginBottom: "2px" }}>Chế độ lạc</div><div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "500" }}>Kích hoạt miễn phí khi pet cưng thất lạc</div></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Ai cũng có thể quét — không cần app", "Liên hệ chủ nuôi nhanh chóng"].map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><div style={{ marginTop: "2px", transform: "scale(0.8)" }}><Icons.Check color="#F59E0B" /></div><span style={{ fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>{text}</span></div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}>
                <div style={{ marginTop: "2px" }}><Icons.History /></div>
                <div><div style={{ fontWeight: "700", fontSize: "13px", color: "#111827", marginBottom: "2px" }}>PawHistory</div><div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "500" }}>Không chỉnh sửa - Không xóa bỏ</div></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Hồ sơ y tế trọn đời — chỉ bổ sung, không ghi đè", "Lịch sử nhận nuôi rõ ràng"].map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><div style={{ marginTop: "2px", transform: "scale(0.8)" }}><Icons.Check color="#22C55E" /></div><span style={{ fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>{text}</span></div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 lg:flex lg:flex-row justify-center items-start lg:gap-[24px] gap-x-[12px] gap-y-[40px] md:gap-[40px] mt-[40px] w-full max-w-[900px] px-4 lg:px-0">
        {[
          { icon: <ExtraIcons.QR />, title: "Kích hoạt thẻ", desc: "Quét mã QR trên app và\nđăng ký cho pet cưng" },
          { icon: <ExtraIcons.Doc />, title: "PawHistory", desc: "Thêm các mũi tiêm phòng và\nhồ sơ khám bệnh cho pet" },
          { icon: <ExtraIcons.Shield />, title: "Cập nhật thông tin", desc: "Đảm bảo thông tin chủ\nnuôi luôn chính xác" },
          { icon: <ExtraIcons.CheckCircle />, title: "An toàn", desc: "Luôn gắn thẻ QR cho pet\ncưng của bạn" }
        ].map((step, idx) => (
          <React.Fragment key={idx}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="flex flex-col items-center text-center w-full lg:w-[160px] mx-auto">
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
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronRight style={{ transform: "rotate(180deg)" }} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronLeft style={{ transform: "rotate(180deg)" }} /></motion.button>
        </div>

        <div className="flex flex-col w-full lg:w-[860px]">
          <div className="flex flex-col lg:flex-row w-full lg:h-[420px]" style={{ backgroundColor: "#fff", borderRadius: "32px", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.06)" }}>
            <div className="w-full lg:w-[50%] h-[300px] lg:h-full relative overflow-hidden">
              <motion.img
                key={currentPet.img}
                initial={{ opacity: 0.5, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                src={currentPet.img}
                alt="Adoption Pet"
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(30%)" }}
              />
            </div>
            <div className="w-full lg:w-[50%] p-[30px] lg:p-[48px_40px] flex flex-col">
              <motion.div key={`title-${currentPet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}><h3 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>{currentPet.name}</h3><div style={{ transform: "scale(0.9)" }}>{currentPet.gender === "Male" ? <Icons.Male /> : <Icons.Female />}</div></motion.div>
              <motion.div key={`info-${currentPet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ fontSize: "10px", color: "#9CA3AF", marginBottom: "20px", fontWeight: "500", letterSpacing: "0.2px" }}>{currentPet.info}</motion.div>
              <motion.p key={`desc-${currentPet.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.7", marginBottom: "24px", fontWeight: "500", paddingRight: "10px", minHeight: "80px" }}>{currentPet.desc}</motion.p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "auto" }}>
                {currentPet.tags.map((tag, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.3 + (i * 0.1) }} style={{ backgroundColor: tag.bg, color: tag.color, padding: "5px 12px", borderRadius: "20px", fontSize: "9px", fontWeight: "700" }}>{tag.label}</motion.div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "30px" }} className="sm:flex-row">
                <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, backgroundColor: "#F09E5B", color: "#fff", border: "none", padding: "14px 0", borderRadius: "10px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Xem thêm về {currentPet.name}</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} style={{ flex: 1, backgroundColor: "transparent", color: "#F09E5B", border: "1px solid #F09E5B", padding: "14px 0", borderRadius: "10px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Đăng ký nhận nuôi</motion.button>
              </div>
            </div>
          </div>
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
          <div className="flex flex-col-reverse lg:flex-row justify-between items-center lg:items-end gap-[27px] w-full max-w-[694px]">
            <div className="flex flex-col justify-start items-start w-full lg:w-[330px]">
              <motion.div key={`s-title-${currentShelter.name}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ display: "flex", justifyContent: "start", alignItems: "start", height: "29px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#F09E5B", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontWeight: "bold" }}>{currentShelter.name.charAt(0)}</div>
                <div style={{ marginTop: "1px", marginLeft: "9px", display: "flex", flexDirection: "column", gap: "6px", width: "160px" }}>
                  <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "rgba(0,0,0,1)", fontWeight: "600", whiteSpace: "nowrap" }}>{currentShelter.name}</div>
                  <div style={{ display: "flex", gap: "4px" }}><div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", color: "rgba(133,133,133,1)" }}>{currentShelter.location}</div></div>
                </div>
              </motion.div>
              <motion.div key={`s-desc-${currentShelter.name}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ marginTop: "14px", fontFamily: "'Urbanist', sans-serif", fontSize: "10px", width: "100%", color: "rgba(133,133,133,1)", lineHeight: "150%", minHeight: "45px" }}>
                {currentShelter.desc}
              </motion.div>
              <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px", width: "121px" }}>
                <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", color: "rgba(133,133,133,1)", fontWeight: "700" }}>GOVERNANCE STATUS</div>
                {MOCK_DATA.shelterGovernance.map((item, idx) => <GovernanceItem key={idx} width={item.w} heightSwitch={item.hSwitch} iconSrc={item.icon} title={item.title} minWidth={item.tw} />)}
              </div>
              <div className="flex w-full lg:w-[329px] gap-[9px] mt-[17px]">
                <motion.div whileHover={{ scale: 1.05 }} style={{ backgroundColor: "rgba(232,155,90,1)", flex: 1, height: "31px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", color: "rgba(255,255,255,1)", fontWeight: "600" }}>Xem thông tin</div></motion.div>
                <motion.div whileHover={{ scale: 1.05 }} style={{ border: "1px solid rgb(232,155,90)", flex: 1, height: "31px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}><div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Tất cả trạm</div></motion.div>
              </div>
            </div>

            <motion.img
              key={currentShelter.img}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-[337px] h-auto lg:h-[292px] rounded-[32px] object-cover"
              style={{ boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }}
              src={currentShelter.img}
              alt="Shelter Img"
            />
          </div>

          <div className="hidden lg:flex flex-col gap-[5px]">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <Icons.ChevronRight style={{ transform: "rotate(-90deg) scale(0.6)" }} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <Icons.ChevronRight style={{ transform: "rotate(90deg) scale(0.6)" }} />
            </motion.button>
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

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Parallax mượt mà cho con số khổng lồ (Số 1, 2, 3 mờ mờ ở phía sau)
  const numY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % MOCK_MYTHS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + MOCK_MYTHS.length) % MOCK_MYTHS.length);

  return (
    <div ref={ref} className="flex flex-col items-center w-full mt-[100px] lg:mt-[140px] px-4 lg:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "12px", color: "#F09E5B", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Myths</motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center" style={{ marginTop: "8px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "#111827", fontWeight: "700", marginBottom: "60px" }}>Những hiểu lầm cần được làm rõ</motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col items-center w-full max-w-[1050px]">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-[20px] lg:gap-[40px] w-full relative">
          <div className="hidden lg:flex flex-col gap-[8px] flex-shrink-0 z-10">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronRight /></motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ width: "32px", height: "32px", backgroundColor: "#fff", border: "1px solid #F3F4F6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}><Icons.ChevronLeft /></motion.button>
          </div>

          <div className="flex-shrink-0 flex items-center z-10">
            <motion.img
              key={currentMyth.img}
              initial={{ opacity: 0.5, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="w-[300px] lg:w-[360px] h-[300px] lg:h-[360px] object-cover rounded-[32px]"
              src={currentMyth.img}
              alt="Myths Pet"
            />
          </div>

          <motion.div key={`text-${currentIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[300px] lg:w-[260px] flex flex-col pb-[20px] text-center lg:text-left z-10">
            <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "22px", color: "#111827", fontWeight: "700", lineHeight: "1.2", marginBottom: "16px", whiteSpace: "pre-line", minHeight: "55px" }}>{currentMyth.title}</div>
            <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "11px", color: "#9CA3AF", lineHeight: "1.6", fontWeight: "500", minHeight: "90px" }}>{currentMyth.desc}</div>
          </motion.div>

          <motion.div
            style={{ y: numY }}
            className="flex-shrink-0 hidden lg:block absolute right-0"
          >
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "180px", color: "#F09E5B", fontWeight: "700", lineHeight: "1", transform: "rotate(10deg)", textShadow: "4px 4px 0px rgba(240,158,91,0.2)", transition: "all 0.3s ease", opacity: 0.2 }}>
              {currentIndex + 1}
            </div>
          </motion.div>
        </div>
        <CarouselDots total={MOCK_MYTHS.length} current={currentIndex} onChange={setCurrentIndex} />
      </motion.div>
    </div>
  );
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ width: "100%", maxWidth: "760px", border: "1px solid #E5E7EB", borderRadius: "12px", marginBottom: "12px", overflow: "hidden", backgroundColor: "#fff", boxShadow: isOpen ? "0 4px 15px rgba(0,0,0,0.03)" : "none" }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", cursor: "pointer" }}>
        <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "16px", color: "#111827", fontWeight: "700" }}>{question}</div>
        <div style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
      <div style={{ maxHeight: isOpen ? "200px" : "0px", padding: isOpen ? "0 24px 20px 24px" : "0 24px", opacity: isOpen ? 1 : 0, transition: "all 0.3s ease", fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "#6B7280", lineHeight: "1.6" }}>
        {answer}
      </div>
    </motion.div>
  );
};

const FaqSection = () => {
  const faqs = [
    { question: "Tại sao nên dùng thẻ QR PawLife?", answer: "Thẻ QR PawLife giúp định danh thú cưng vĩnh viễn, lưu trữ hồ sơ y tế rõ ràng và đặc biệt có tính năng báo mất (chế độ lạc) giúp ai cũng có thể quét để liên hệ với chủ nuôi mà không cần phải tải app." },
    { question: "Thẻ QR có bị vô nước không?", answer: "Thẻ QR được thiết kế bằng chất liệu chống nước và chống xước cao cấp, đảm bảo độ bền trong mọi hoạt động hàng ngày của thú cưng như tắm rửa, đi mưa hay bơi lội." },
    { question: "Thú cưng trong trạm cứu hộ có bệnh không?", answer: "Hoàn toàn an toàn. Animals from shelters are microchipped, treated for parasites, vaccinated, sterilized. All operations are carried out strictly according to the schedule." }
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
        <div className="flex flex-col lg:flex-row justify-between items-center gap-[26px] w-full">
          <div className="hidden lg:flex flex-col gap-[5px]">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <Icons.ChevronRight style={{ transform: "rotate(-90deg) scale(0.6)" }} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
              <Icons.ChevronRight style={{ transform: "rotate(90deg) scale(0.6)" }} />
            </motion.button>
          </div>
          <motion.img
            key={currentJourney.img}
            initial={{ opacity: 0.5, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="w-[100%] max-w-[308px] h-auto lg:h-[294px] rounded-[32px] object-cover"
            style={{ boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }}
            src={currentJourney.img}
            alt="Journey"
          />
          <motion.div key={`text-${currentJourney.name}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex flex-col justify-start items-center lg:items-start text-center lg:text-left h-auto lg:h-[257px] flex-1">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} src={currentJourney.avatar} alt="Avatar" />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "12px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>{currentJourney.name}</div>
                <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", color: "rgba(133,133,133,1)" }}>{currentJourney.info}</div>
              </div>
            </div>
            <div style={{ marginTop: "16px", fontFamily: "'Urbanist', sans-serif", fontSize: "12px", width: "100%", maxWidth: "349px", color: "rgba(133,133,133,1)", lineHeight: "160%", minHeight: "75px" }}>
              "{currentJourney.desc}"
            </div>
            <motion.div whileHover={{ scale: 1.05 }} style={{ marginTop: "30px", lg: "99px", display: "flex", justifyContent: "center", alignItems: "center", width: "80px", height: "28px", borderRadius: "8px", border: "1px solid rgb(232,155,90)", cursor: "pointer" }}>
              <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Đọc thêm</div>
            </motion.div>
          </motion.div>
        </div>
        <CarouselDots total={MOCK_JOURNEYS.length} current={currentIndex} onChange={setCurrentIndex} />
      </motion.div>
    </div>
  );
};

const PartnerLogosSection = () => {
  const partners = [{ name: "PetRescue", color: "#3B82F6" }, { name: "HappyTails", color: "#10B981" }, { name: "VetCare Plus", color: "#F59E0B" }, { name: "FurryFriends", color: "#8B5CF6" }, { name: "Meow & Co.", color: "#EC4899" }, { name: "DoggoWorld", color: "#14B8A6" }];
  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="flex flex-col items-center w-full mt-[60px] pb-[120px] px-4 overflow-hidden">
      <style>{`
        @keyframes infinite-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .logo-track { display: flex; width: max-content; animation: infinite-scroll 25s linear infinite; }
        .logo-track:hover { animation-play-state: paused; }
      `}</style>
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

// ============================================================================
// 4. MAIN COMPONENT CHÍNH CỦA TRANG
// ============================================================================
export default function HomePageCleaned() {
  return (
    <div style={{ backgroundColor: "rgba(255,255,255,1)", width: "100%", display: "flex", justifyContent: "center", paddingTop: "22px", overflowX: "hidden" }}>
      <div className="flex flex-col items-center w-full max-w-[1440px]">
        <HeaderSection />
        <AboutUsSection />
        <PetManagementSection />
        <AdoptionSection />
        <ShelterSection />
        <MythsSection />
        <FaqSection />
        <JourneySection />
        <PartnerLogosSection />
      </div>
    </div>
  );
}