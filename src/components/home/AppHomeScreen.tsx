'use client';
/* eslint-disable @next/next/no-img-element */
// Màn Home của app RN (app/(tabs)/index.tsx) dựng ở khung 390×844 (scrollY = 0).
import { motion } from 'framer-motion';
import { Bell, MapPin, Mars, Menu, Search, Venus } from 'lucide-react';

/* Chép ảnh từ app RN vào public/assets/app/:
   home_hero_1.png, scan-index.png, nutrition-icon.png, entry.png, health-icon.png, training-icon.png, location-solid-gray.png */
const A = '/assets/app';
const HERO = `${A}/home_hero_1.png`;

/* Chỉnh chữ ở đây cho khớp t() trong app */
const TEXT = {
  hello: 'Xin chào, Khánh Linh!',
  sub: 'Hôm nay bạn muốn làm gì cùng Mochi nè?',
  scanTitle: 'Tìm thấy thú cưng lạc?',
  scanSub: 'Quét để giúp bé tìm đường về',
  pawcare: 'Pawcare',
  nearby: 'Thú cưng gần bạn',
  viewAll: 'Xem tất cả',
};
const CARE = [
  { label: 'Dinh dưỡng', icon: 'nutrition-icon.png', entry: false },
  { label: 'Thủ tục', icon: 'entry.png', entry: true },
  { label: 'Sức khỏe', icon: 'health-icon.png', entry: false },
  { label: 'Huấn luyện', icon: 'training-icon.png', entry: false },
];
const PETS = [
  { name: 'Bella', female: true, age: '2', city: 'Hồ Chí Minh', img: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=400&q=80' },
  { name: 'Max', female: false, age: '3', city: 'Hà Nội', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Luna', female: true, age: '8 th', city: 'Đà Nẵng', img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&q=80' },
];

/* ===== Hằng số lấy từ index.tsx (màn 390 rộng) ===== */
const W = 390;
const TOP_INSET = 54;                                   // = chiều cao thanh trạng thái của demo
const AVATAR = 76;
const HEADER_TOP_PAD = TOP_INSET + 10;
const TITLE_LINE = 28, SUB_LINE = 20, SUB_GAP = 4;
const TEXT_TOP = HEADER_TOP_PAD + AVATAR + 12;
const CURVE_HEIGHT = 28;
const CURVE_VISIBLE = CURVE_HEIGHT - 5;
const HEADER_H = Math.round(Math.max(W * 0.78, HEADER_TOP_PAD + AVATAR + 12 + TITLE_LINE + SUB_GAP + SUB_LINE + CURVE_HEIGHT + 16)); // 304
const CARE_CIRCLE = Math.min(80, Math.floor((W - 48) * 0.22)); // 75
const CARE_ICON = Math.round(CARE_CIRCLE * 0.55);
const CARE_ICON_ENTRY = Math.round(CARE_CIRCLE * 0.4);
const PET_W = Math.round(W * 0.328);                     // 128
const PET_H = Math.round(PET_W * 1.74);                  // 223

/* shadow RN → CSS: blur = 2 × shadowRadius */
const sh = (x: number, y: number, blur: number, op: number, c = '232,155,90') => `${x}px ${y}px ${blur}px rgba(${c},${op})`;
const iconShadow = 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))';

const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-4 flex items-center justify-between px-6">
    <span className="text-[16px] font-semibold text-black">{title}</span>
    <span className="text-[14px] text-[#E89B5A]" style={{ fontWeight: 200 }}>{TEXT.viewAll}</span>
  </div>
);

export default function AppHomeScreen() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-white"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif", lineHeight: 'normal' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ===== HEADER ===== */}
      <div className="absolute left-0 top-0 w-full overflow-hidden" style={{ height: HEADER_H, backgroundColor: '#FFDDA2' }}>
        <img src={HERO} alt="" className="h-full w-full object-cover" />
      </div>
      {/* Thân trang: bo 2 góc trên, lấn lên ảnh hero CURVE_VISIBLE px (giống lớp mask góc trong app) */}
      <div
        className="absolute left-0 w-full overflow-hidden bg-white"
        style={{ top: HEADER_H - CURVE_VISIBLE, bottom: 0, borderTopLeftRadius: CURVE_VISIBLE, borderTopRightRadius: CURVE_VISIBLE }}
      >
        <div className="absolute left-0 w-full" style={{ top: CURVE_VISIBLE, background: '#FCF8ED', paddingBottom: 84 }}>
          <div className="pb-6" style={{ background: 'linear-gradient(180deg,#FFFFFF,#FCF8ED)' }}>
            <div className="px-6 mt-2">
              {/* Thẻ quét */}
              <div className="relative flex items-center" style={{ borderRadius: 32, backgroundColor: '#FFFFFF', padding: '0 18px', boxShadow: sh(0, 0, 10, 0.36) }}>
                <div className="absolute inset-0" style={{ borderRadius: 32, background: 'linear-gradient(to bottom right,#FFFFFF 30%,#FCF8ED 80%)' }} />
                <div className="relative flex items-center justify-center overflow-hidden rounded-2xl" style={{ width: 64, height: 64, marginRight: 18, flexShrink: 0 }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right,rgb(255,244,230),rgba(255,232,204,0.52))' }} />
                  <img src={`${A}/scan-index.png`} alt="" className="relative" style={{ width: 21, height: 21 }} />
                </div>
                <div className="relative my-[20px] min-w-0 flex-1">
                  <p className="whitespace-nowrap text-[18px] font-semibold leading-7 text-gray-900">{TEXT.scanTitle}</p>
                  <p className="mt-1 whitespace-nowrap text-[14px] leading-5 text-gray-500">{TEXT.scanSub}</p>
                </div>
              </div>

              {/* Pawcare */}
              <div className="mt-[38px]">
                <p className="mb-4 text-[16px] font-semibold text-gray-900">{TEXT.pawcare}</p>
                <div className="flex justify-between">
                  {CARE.map((c) => (
                    <div key={c.label} className="-ml-1 flex w-[22%] flex-col items-center">
                      <div className="relative mb-3 flex items-center justify-center" style={{ width: CARE_CIRCLE, height: CARE_CIRCLE }}>
                        <div className="z-10 flex h-full w-full items-center justify-center rounded-full bg-white" style={{ boxShadow: sh(0, 0, 20, 0.25) }}>
                          <img src={`${A}/${c.icon}`} alt="" style={{ width: c.entry ? CARE_ICON_ENTRY : CARE_ICON, height: c.entry ? CARE_ICON_ENTRY : CARE_ICON, objectFit: 'contain' }} />
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-center text-xs font-medium text-gray-500">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pets near you */}
            <div className="mt-[38px]">
              <SectionHeader title={TEXT.nearby} />
              <div className="flex overflow-hidden">
                <div style={{ width: 24, flexShrink: 0 }} />
                {PETS.map((p) => (
                  <div key={p.name} className="relative mr-3 mt-1 shrink-0 overflow-hidden rounded-[24px] bg-white" style={{ width: PET_W, height: PET_H, boxShadow: sh(3, 3, 8, 0.3) }}>
                    <img src={p.img} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end px-3 pb-[14px]" style={{ height: '50%', background: 'linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.15) 50%,rgba(0,0,0,0.7) 100%)' }}>
                      <div className="mb-1 flex items-center">
                        <span className="mb-0.5 shrink truncate text-[17px] font-semibold tracking-tight text-white">{p.name}</span>
                        <span className="ml-2 flex shrink-0 items-center rounded-full border border-white/40 bg-white/20 px-2 py-0.5 backdrop-blur-md">
                          {p.female ? <Venus size={12} color="#fff" /> : <Mars size={12} color="#fff" />}
                          <span className="ml-1 text-[11px] font-bold text-white">{p.age}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={13} color="#fff" fill="#fff" />
                        <span className="ml-1 flex-1 truncate text-xs font-medium text-white/95">{p.city}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Avatar + icon + chữ chào (đè lên header) ===== */}
      <div className="absolute left-0 top-0 flex w-full items-start justify-between px-6" style={{ paddingTop: HEADER_TOP_PAD }}>
        <div style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, boxShadow: '0 4px 2px rgba(0,0,0,0.1)' }}>
          <div className="h-full w-full overflow-hidden" style={{ background: '#ffedd5', border: '2.5px solid #FFFFFF', borderRadius: 1000 }}>
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" alt="" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-5" style={{ filter: iconShadow }}>
          <Search size={26} color="#fff" strokeWidth={2} />
          <span className="relative">
            <Bell size={26} color="#fff" fill="#fff" strokeWidth={2} />
            <span className="absolute right-0.5 top-0 h-2.5 w-2.5 rounded-full border border-white bg-[#E89B5A]" />
          </span>
          <Menu size={26} color="#fff" strokeWidth={2} />
        </div>
      </div>
      <div className="absolute" style={{ top: TEXT_TOP, left: 20, width: W - 48 }}>
        <p className="truncate text-[20px] font-semibold text-white" style={{ lineHeight: `${TITLE_LINE}px` }}>{TEXT.hello}</p>
        <p className="truncate text-[14px] font-medium tracking-tight text-white" style={{ marginTop: SUB_GAP, lineHeight: `${SUB_LINE}px` }}>{TEXT.sub}</p>
      </div>
    </motion.div>
  );
}