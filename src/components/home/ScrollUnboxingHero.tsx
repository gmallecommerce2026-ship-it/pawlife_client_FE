'use client';
// src/components/home/ScrollUnboxingHero.tsx
// Hero cuộn 6 chương. Hộp và vòng nằm trong một cảnh 3D duy nhất (UnboxingScene);
// phần này chỉ lo chữ, chỉ báo tiến độ và đọc tiến độ cuộn.

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { History, Fingerprint, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';

const UnboxingScene = dynamic(() => import('./UnboxingScene'), { ssr: false });

export const BRAND_LOGO = '/assets/brand/logo-placeholder.svg';
const CTA_HREF = '/the-qr';
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const COLOR = { brand: '#E89B5A', brandDk: '#C97A3C', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };

const DESK_BASE = '#CDB39A';
const FEATURES = [
  { icon: History, title: 'PawHistory', text: 'Lưu trữ hồ sơ sức khoẻ' },
  { icon: Fingerprint, title: 'Pet ID', text: 'Một danh tính riêng cho bé' },
  { icon: ShieldCheck, title: 'An toàn', text: 'Liên lạc với chủ khi cần thiết' },
];

type Side = 'center' | 'left' | 'right';
type Chapter = {
  range: [number, number];
  side: Side;
  eyebrow: string;
  lines?: { text: string; accent?: boolean }[];
  features?: boolean;
  cta?: boolean;
};

/* Mỗi chương có khoảng cuộn riêng; giữa các chương không có chữ nào. */
const CHAPTERS: Chapter[] = [
  {
    range: [0, 0.12],
    side: 'center',
    eyebrow: 'QR Tag · Dành riêng cho thú cưng',
    lines: [{ text: 'Một chiếc tag nhỏ.' }, { text: 'Cả hồ sơ của bé.', accent: true }],
  },
  {
    range: [0.16, 0.28],
    side: 'left',
    eyebrow: 'Mở hộp',
    lines: [{ text: 'Bên trong là một danh tính riêng cho bé của bạn.' }],
  },
  {
    range: [0.36, 0.44],
    side: 'right',
    eyebrow: 'Cất cánh',
    lines: [{ text: 'Từ hộp nhỏ,' }, { text: 'đến cổ bé yêu.', accent: true }],
  },
  { range: [0.52, 0.64], side: 'right', eyebrow: 'Ba điều tạo nên QR Tag', features: true },
  {
    range: [0.72, 0.8],
    side: 'left',
    eyebrow: 'Mặt sau',
    lines: [{ text: 'Mỗi tag một mã riêng,' }, { text: 'mỗi bé một hồ sơ.', accent: true }],
  },
  {
    range: [0.88, 1],
    side: 'center',
    eyebrow: 'Sẵn sàng đồng hành',
    lines: [{ text: 'Gắn tag cho bé, và luôn có người tìm được bé khi cần.' }],
    cta: true,
  },
];

const POS: Record<Side, string> = {
  center: 'bottom-14 left-1/2 -translate-x-1/2 text-center w-[min(90vw,520px)]',
  left: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
  right: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-auto lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
};

const MASK_FROM: Record<Side, string> = {
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  center: 'inset(0% 0% 100% 0%)',
};
const MASK_TO = 'inset(0% 0% 0% 0%)';

function RevealLine({ text, accent, side, delay }: { text: string; accent?: boolean; side: Side; delay: number }) {
  const words = text.split(' ');
  return (
    <motion.p
      className={`text-[26px] font-bold leading-tight sm:text-[34px] ${side === 'center' ? 'text-center' : ''}`}
      style={{ color: accent ? COLOR.brand : COLOR.ink }}
      initial={{ clipPath: MASK_FROM[side] }}
      animate={{ clipPath: MASK_TO }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="mr-[0.25em] inline-block"
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: delay + 0.25 + i * 0.05, ease: EASE_OUT }}
        >
          {w}
        </motion.span>
      ))}
    </motion.p>
  );
}

function ChapterBody({ c, index, total }: { c: Chapter; index: number; total: number }) {
  const fromX = c.side === 'right' ? 28 : -28;
  return (
    <>
      <motion.p
        className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]"
        style={{ color: COLOR.brand }}
        initial={{ opacity: 0, letterSpacing: '0.45em' }}
        animate={{ opacity: 1, letterSpacing: '0.18em' }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {c.eyebrow}
      </motion.p>

      {c.lines?.map((l, i) => (
        <RevealLine key={l.text} text={l.text} accent={l.accent} side={c.side} delay={0.1 + i * 0.3} />
      ))}

      {c.features && (
        <ul className="mt-2 space-y-4">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: fromX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: EASE_OUT }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#FFF1E4', color: COLOR.brand }}>
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-[17px] font-bold" style={{ color: COLOR.ink }}>{title}</span>
                <span className="block text-[14px]" style={{ color: COLOR.muted }}>{text}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      )}

      {c.cta && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: EASE_OUT }}>
          <Link
            href={CTA_HREF}
            className="mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-[15px] font-bold text-white shadow-lg transition hover:brightness-110"
            style={{ backgroundColor: COLOR.brand }}
          >
            Tìm hiểu QR Tag
          </Link>
        </motion.div>
      )}
    </>
  );
}

export default function ScrollUnboxingHero() {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0); // tiến độ cuộn, đọc trong cảnh 3D
  const [active, setActive] = useState(-1); // chương đang hiện chữ, -1 = không có chữ
  const [dot, setDot] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  useMotionValueEvent(p, 'change', (v) => {
    progressRef.current = v;
    const idx = CHAPTERS.findIndex((c) => v >= c.range[0] && v <= c.range[1]);
    setActive((prev) => (prev === idx ? prev : idx));
    let d = 0;
    CHAPTERS.forEach((c, i) => {
      if (v >= c.range[0] - 0.01) d = i;
    });
    setDot((prev) => (prev === d ? prev : d));
  });

  const chapter = active >= 0 ? CHAPTERS[active] : null;
  const barScale = useTransform(p, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[380svh] w-full" style={{ backgroundColor: DESK_BASE }} aria-label="Giới thiệu QR Tag">
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">

        {/* Cảnh 3D duy nhất: hộp + vòng */}
        <div className="pointer-events-none absolute inset-0">
          <UnboxingScene progressRef={progressRef} />
        </div>

        <img src={BRAND_LOGO} alt="PawLife" className="absolute left-6 top-24 h-9 w-auto lg:left-12" />
        <motion.div className="absolute left-0 top-0 h-[3px] w-full origin-left" style={{ scaleX: barScale, backgroundColor: COLOR.brand }} />

        {/* Chỉ báo tiến độ */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 lg:bottom-auto lg:left-auto lg:right-8 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-col">
          {CHAPTERS.map((c, i) => (
            <span
              key={c.eyebrow}
              className={`h-1.5 rounded-full transition-all duration-700 ${i === dot ? 'w-6' : 'w-1.5'}`}
              style={{ backgroundColor: i === dot ? COLOR.brand : '#D1D5DB' }}
            />
          ))}
        </div>

        {/* Chữ: một chương tại một thời điểm, luôn ở phía đối diện với vòng */}
        <AnimatePresence mode="wait">
          {chapter && active >= 0 && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.45 }}
              className={`absolute z-10 ${POS[chapter.side]}`}
            >
              <ChapterBody c={chapter} index={active} total={CHAPTERS.length} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
