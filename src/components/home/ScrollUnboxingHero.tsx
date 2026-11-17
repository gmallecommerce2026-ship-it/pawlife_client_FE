'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/home/ScrollUnboxingHero.tsx
// Hero cuộn theo tiến độ, dựng bằng code (không dùng video).
// Hộp mở ra → tag bay lên giữa màn → tag bay sang trái/phải đan xen với chữ,
// lật mặt trước/sau khi đổi bên, chữ hiện theo từng từ.

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
export const BRAND_LOGO = '/assets/brand/logo-placeholder.svg'; // logo tạm
const TAG_SRC = '/images/qr-tag-only.webp';
const CTA_HREF = '/the-qr';
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

// Đan xen trái / phải: chữ bên nào thì tag bay sang bên kia
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

/* Chữ hiện theo từng từ: mờ + trượt lên + rõ dần */
function RevealLine({ text, accent, delay, center }: { text: string; accent?: boolean; delay: number; center: boolean }) {
  const words = text.split(' ');
  return (
    <p
      className={`text-[26px] font-bold leading-tight sm:text-[34px] ${center ? 'text-center' : ''}`}
      style={{ color: accent ? COLOR.brand : COLOR.ink }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="mr-[0.25em] inline-block"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: delay + i * 0.07, ease: EASE_OUT }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  );
}

function ChapterBody({ c }: { c: Chapter }) {
  const center = c.side === 'center';
  const fromX = c.side === 'right' ? 28 : -28; // chữ bên phải trượt từ phải vào, và ngược lại
  return (
    <>
      <motion.p
        className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]"
        style={{ color: COLOR.brand }}
        initial={{ opacity: 0, letterSpacing: '0.45em' }}
        animate={{ opacity: 1, letterSpacing: '0.18em' }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        {c.eyebrow}
      </motion.p>

      {c.lines?.map((l, i) => (
        <RevealLine key={l.text} text={l.text} accent={l.accent} center={center} delay={0.1 + i * 0.25} />
      ))}

      {c.features && (
        <ul className="mt-2 space-y-4">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: fromX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.14, ease: EASE_OUT }}
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
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: EASE_OUT }}>
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
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  useMotionValueEvent(p, 'change', (v) => {
    let idx = 0;
    CHAPTERS.forEach((c, i) => { if (v >= c.range[0] - 0.01) idx = i; });
    setActive((prev) => (prev === idx ? prev : idx));
  });

  /* Nắp hộp mở ra phía sau */
  const lidRot = useTransform(p, [0.1, 0.36], [0, -110]);

  /* Tag: trong hộp → nhô lên → bay giữa màn → bay trái/phải đan xen */
  const tagOpacity = useTransform(p, [0.08, 0.16], [0, 1]);
  const tagTop = useTransform(p, [0.12, 0.38, 0.5, 0.8], ['40%', '24%', '40%', '46%']);
  const tagScale = useTransform(p, [0.12, 0.38, 0.5, 0.8], [0.94, 1, 1.2, 1.2]);
  const tagX = useTransform(p, [0.44, 0.5, 0.58, 0.76, 0.84], ['0%', '0%', '-62%', '-62%', '0%']);
  // Lật mặt: lật khi đổi bên (mặt sau là thẻ Pet ID), rồi lật về mặt trước ở cuối
  const tagFlip = useTransform(p, [0.44, 0.5, 0.6, 0.76, 0.84], [0, 0, 180, 180, 360]);
  const tagTilt = useTransform(p, [0.5, 0.6, 0.72, 0.84], [0, 10, -6, 0]);
  // Phần tag nằm dưới miệng hộp bị cắt, nên tag trông như được lấy ra từ trong hộp
  const clipBottom = useTransform(p, [0.12, 0.3], [41, 0]);
  const tagClip = useMotionTemplate`inset(0 0 ${clipBottom}% 0)`;

  /* Hộp hạ xuống và mờ đi khi tag đã ra giữa màn */
  const boxOpacity = useTransform(p, [0.44, 0.6], [1, 0]);
  const boxY = useTransform(p, [0.44, 0.6], ['0%', '40%']);
  const shadowOpacity = useTransform(p, [0.44, 0.6], [0.3, 0]);

  const chapter = CHAPTERS[active];

  return (
    <section ref={containerRef} className="relative h-[330svh] w-full" style={{ backgroundColor: COLOR.cream }} aria-label="Giới thiệu QR Tag">
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        <img src={BRAND_LOGO} alt="PawLife" className="absolute left-6 top-24 h-9 w-auto lg:left-12" />
        <motion.div className="absolute left-0 top-0 h-[3px] w-full origin-left" style={{ scaleX: p, backgroundColor: COLOR.brand }} />

        {/* Cảnh: hộp + tag */}
        <div className="relative w-[min(78vw,420px)] -translate-y-[6svh] lg:translate-y-0" style={{ aspectRatio: '1 / 1', perspective: 1000 }}>
          <motion.div
            className="absolute bottom-[2%] left-[12%] right-[12%] h-[8%] rounded-full bg-black blur-xl"
            style={{ opacity: shadowOpacity }}
          />

          {/* Hộp */}
          <motion.div className="absolute inset-0" style={{ opacity: boxOpacity, y: boxY }}>
            <div className="absolute left-[10%] right-[10%] top-[24%] h-[26%] rounded-md bg-white shadow-inner" />
            <div
              className="absolute left-[6%] right-[6%] top-[26%] bottom-[4%] rounded-[18px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(160deg, #F5AE72 0%, ${COLOR.brand} 45%, ${COLOR.brandDk} 100%)` }}
            >
              <div className="absolute left-1/2 top-[38%] flex h-[26%] w-[44%] -translate-x-1/2 items-center justify-center rounded-full bg-white/95 shadow">
                <img src={BRAND_LOGO} alt="" className="h-[60%] w-auto" />
              </div>
            </div>
            <motion.div
              className="absolute left-[4%] right-[4%] top-[22%] h-[22%] rounded-[16px] shadow-md"
              style={{ rotateX: lidRot, transformOrigin: 'top center', background: `linear-gradient(180deg, #F7B77F 0%, ${COLOR.brand} 100%)` }}
            />
          </motion.div>

          {/* Tag: hai mặt, lật bằng rotateY. clip-path nằm ở lớp con để không làm phẳng 3D của lớp lật */}
          <motion.div
            className="absolute left-0 right-0 mx-auto w-[46%]"
            style={{
              top: tagTop,
              y: '-50%',
              x: tagX,
              scale: tagScale,
              rotateY: tagFlip,
              rotateX: tagTilt,
              opacity: tagOpacity,
              transformStyle: 'preserve-3d',
            }}
          >
            <motion.div style={{ clipPath: tagClip, backfaceVisibility: 'hidden' }}>
              <img
                src={TAG_SRC}
                alt="QR Tag"
                className="w-full select-none"
                style={{ filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.18))' }}
              />
            </motion.div>
            {/* Mặt sau */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full text-center shadow-[0_18px_24px_rgba(0,0,0,0.18)]"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                background: 'radial-gradient(circle at 30% 25%, #FFFFFF, #FFE7D0 70%)',
              }}
            >
              <img src={BRAND_LOGO} alt="" className="w-[38%]" />
              <p className="text-[13px] font-bold" style={{ color: COLOR.ink }}>Pet ID</p>
              <p className="w-[70%] text-[10px] leading-tight" style={{ color: COLOR.muted }}>Một danh tính riêng cho bé</p>
            </div>
          </motion.div>
        </div>

        {/* Chương chữ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
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