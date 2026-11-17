'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/home/ScrollUnboxingHero.tsx
// Hero cuộn theo tiến độ, không dùng video. Hộp cam được vẽ bằng CSS:
// cuộn xuống → nắp hộp mở ra → viên tag được nhấc lên → hộp hạ xuống, tag đứng giữa màn hình.
// Lấy cảm hứng từ ImmersiveScrollHero của template icards.

import { useRef, useState } from 'react';
import Link from 'next/link';
import { History, Fingerprint, ShieldCheck } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  CẤU HÌNH                                                           */
/* ------------------------------------------------------------------ */
// Logo tạm: thay bằng logo chính thức khi có
export const BRAND_LOGO = '/assets/brand/logo-placeholder.svg';
const TAG_SRC = '/images/qr-tag-only.webp';
const CTA_HREF = '/the-qr';

const COLOR = { brand: '#E89B5A', brandDk: '#C97A3C', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };

const FEATURES = [
  { icon: History, title: 'PawHistory', text: 'Lưu trữ hồ sơ sức khoẻ' },
  { icon: Fingerprint, title: 'Pet ID', text: 'Một danh tính riêng cho bé' },
  { icon: ShieldCheck, title: 'An toàn', text: 'Liên lạc với chủ khi cần thiết' },
];

type Chapter = {
  range: [number, number];
  side: 'center' | 'left' | 'right';
  eyebrow: string;
  lines?: { text: string; accent?: boolean }[];
  features?: boolean;
  cta?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    range: [0, 0.14],
    side: 'center',
    eyebrow: 'QR Tag · Dành riêng cho thú cưng',
    lines: [{ text: 'Một chiếc tag nhỏ.' }, { text: 'Cả hồ sơ của bé.', accent: true }],
  },
  {
    range: [0.16, 0.44],
    side: 'left',
    eyebrow: 'Mở hộp',
    lines: [{ text: 'Bên trong là một danh tính riêng cho bé của bạn.' }],
  },
  { range: [0.5, 0.78], side: 'right', eyebrow: 'Ba điều tạo nên QR Tag', features: true },
  {
    range: [0.8, 1],
    side: 'center',
    eyebrow: 'Sẵn sàng đồng hành',
    lines: [{ text: 'Gắn tag cho bé, và luôn có người tìm được bé khi cần.' }],
    cta: true,
  },
];

const POS: Record<Chapter['side'], string> = {
  center: 'bottom-10 left-1/2 -translate-x-1/2 text-center w-[min(90vw,520px)]',
  left: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
  right: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-auto lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
};

function ChapterBody({ c }: { c: Chapter }) {
  return (
    <>
      <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: COLOR.brand }}>{c.eyebrow}</p>
      {c.lines?.map((l) => (
        <p key={l.text} className="text-[26px] font-bold leading-tight sm:text-[34px]" style={{ color: l.accent ? COLOR.brand : COLOR.ink }}>
          {l.text}
        </p>
      ))}
      {c.features && (
        <ul className="mt-2 space-y-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#FFF1E4', color: COLOR.brand }}>
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-[17px] font-bold" style={{ color: COLOR.ink }}>{title}</span>
                <span className="block text-[14px]" style={{ color: COLOR.muted }}>{text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {c.cta && (
        <Link
          href={CTA_HREF}
          className="mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-[15px] font-bold text-white shadow-lg transition hover:brightness-110"
          style={{ backgroundColor: COLOR.brand }}
        >
          Tìm hiểu QR Tag
        </Link>
      )}
    </>
  );
}

export default function ScrollUnboxingHero() {
  const containerRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  useMotionValueEvent(p, 'change', (v) => {
    let idx = 0;
    CHAPTERS.forEach((c, i) => { if (v >= c.range[0] - 0.01) idx = i; });
    setActive((prev) => (prev === idx ? prev : idx));
  });

  /* ---- Nắp hộp: mở ra phía sau từ 0.10 → 0.36 ---- */
  const lidRot = useTransform(p, [0.1, 0.36], [0, -110]);

  /* ---- Tag: nằm trong hộp → nhô lên → đưa ra giữa màn hình ---- */
  const tagOpacity = useTransform(p, [0.08, 0.16], [0, 1]);
  const tagTop = useTransform(p, [0.12, 0.38, 0.5, 0.66], ['40%', '22%', '22%', '50%']);
  const tagScale = useTransform(p, [0.12, 0.38, 0.66], [0.94, 1, 1.25]);
  const tagRot = useTransform(p, [0.66, 0.82, 1], [0, 8, 0]);
  // Phần tag nằm dưới miệng hộp bị cắt, nên tag trông như được lấy ra từ trong hộp
  const clipBottom = useTransform(p, [0.12, 0.3], [41, 0]);
  const tagClip = useMotionTemplate`inset(0 0 ${clipBottom}% 0)`;

  /* ---- Hộp: hạ xuống và mờ đi sau khi tag đã ra giữa màn hình ---- */
  const boxOpacity = useTransform(p, [0.44, 0.6], [1, 0]);
  const boxY = useTransform(p, [0.44, 0.6], ['0%', '40%']);
  const shadowOpacity = useTransform(p, [0.44, 0.6], [0.3, 0]);

  const chapter = CHAPTERS[active];

  return (
    <section ref={containerRef} className="relative h-[330svh] w-full" style={{ backgroundColor: COLOR.cream }} aria-label="Giới thiệu QR Tag">
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        {/* Logo tạm */}
        <img src={BRAND_LOGO} alt="PawLife" className="absolute left-6 top-24 h-9 w-auto lg:left-12" />

        {/* Thanh tiến độ */}
        <motion.div className="absolute left-0 top-0 h-[3px] w-full origin-left" style={{ scaleX: p, backgroundColor: COLOR.brand }} />

        {/* Cảnh: hộp + tag */}
        <div
          className="relative w-[min(78vw,420px)] -translate-y-[6svh] lg:translate-y-0"
          style={{ aspectRatio: '1 / 1', perspective: 900 }}
        >
          {/* Bóng dưới hộp */}
          <motion.div
            className="absolute bottom-[2%] left-[12%] right-[12%] h-[8%] rounded-full bg-black blur-xl"
            style={{ opacity: shadowOpacity }}
          />

          {/* Hộp */}
          <motion.div className="absolute inset-0" style={{ opacity: boxOpacity, y: boxY }}>
            {/* Lòng hộp (lộ ra khi nắp mở) */}
            <div className="absolute left-[10%] right-[10%] top-[24%] h-[26%] rounded-md bg-white shadow-inner" />

            {/* Thân hộp */}
            <div
              className="absolute left-[6%] right-[6%] top-[26%] bottom-[4%] rounded-[18px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(160deg, #F5AE72 0%, ${COLOR.brand} 45%, ${COLOR.brandDk} 100%)` }}
            >
              {/* Logo tạm trên mặt hộp */}
              <div className="absolute left-1/2 top-[38%] flex h-[26%] w-[44%] -translate-x-1/2 items-center justify-center rounded-full bg-white/95 shadow">
                <img src={BRAND_LOGO} alt="" className="h-[60%] w-auto" />
              </div>
            </div>

            {/* Nắp hộp: hinge ở mép trên */}
            <motion.div
              className="absolute left-[4%] right-[4%] top-[22%] h-[22%] rounded-[16px] shadow-md"
              style={{
                rotateX: lidRot,
                transformOrigin: 'top center',
                background: `linear-gradient(180deg, #F7B77F 0%, ${COLOR.brand} 100%)`,
              }}
            />
          </motion.div>

          {/* Tag: nằm trên hộp, bị cắt dưới miệng hộp lúc còn trong hộp */}
          <motion.img
            src={TAG_SRC}
            alt="QR Tag"
            className="absolute left-1/2 w-[46%] select-none"
            style={{
              top: tagTop,
              x: '-50%',
              y: '-50%',
              scale: tagScale,
              rotate: tagRot,
              opacity: tagOpacity,
              clipPath: tagClip,
              filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.18))',
            }}
          />
        </div>

        {/* Chương chữ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className={`absolute ${POS[chapter.side]}`}
          >
            <ChapterBody c={chapter} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}