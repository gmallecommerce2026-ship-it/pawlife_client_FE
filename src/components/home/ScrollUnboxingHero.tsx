'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/home/ScrollUnboxingHero.tsx
// Hero cuộn theo tiến độ: kéo chuột/vuốt → video mở hộp tua theo, rồi chuyển sang ảnh sản phẩm
// và các chương chữ. Lấy cảm hứng từ ImmersiveScrollHero của template icards.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { History, Fingerprint, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  CẤU HÌNH - đổi asset và nội dung ở đây                              */
/* ------------------------------------------------------------------ */
// Logo tạm: thay bằng logo chính thức khi có (đặt file vào public/ rồi sửa đường dẫn này)
export const BRAND_LOGO = '/assets/brand/logo-placeholder.svg';
const VIDEO_SRC = '/videos/qr-tag-unboxing.mp4';
const POSTER_SRC = '/images/qr-tag-poster.jpg';
const PRODUCT_SRC = '/images/qr-tag.webp';
const CTA_HREF = '/the-qr';

const COLOR = { brand: '#E89B5A', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };

// Video mở hộp chiếm 0 → VIDEO_END của tiến độ cuộn; sau đó chuyển sang ảnh sản phẩm
const VIDEO_END = 0.5;

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
    range: [0.16, 0.46],
    side: 'left',
    eyebrow: 'Mở hộp',
    lines: [{ text: 'Bên trong là một danh tính riêng cho bé của bạn.' }],
  },
  {
    range: [0.5, 0.78],
    side: 'right',
    eyebrow: 'Ba điều tạo nên QR Tag',
    features: true,
  },
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
  left: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-16 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[340px]',
  right: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-auto lg:right-16 lg:top-1/2 lg:-translate-y-1/2 lg:w-[340px]',
};

function ChapterBody({ c }: { c: Chapter }) {
  return (
    <>
      <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: COLOR.brand }}>{c.eyebrow}</p>
      {c.lines?.map((l) => (
        <p
          key={l.text}
          className="text-[26px] font-bold leading-tight sm:text-[34px]"
          style={{ color: l.accent ? COLOR.brand : COLOR.ink }}
        >
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

/* Bản tĩnh cho người dùng bật "giảm chuyển động": không ghim, không tua */
function StaticVersion() {
  return (
    <section className="w-full px-6 py-16" style={{ backgroundColor: COLOR.cream }}>
      <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-10 lg:flex-row">
        <img src={PRODUCT_SRC} alt="QR Tag dành riêng cho thú cưng" className="w-full max-w-[420px] rounded-[32px] object-contain" />
        <div className="flex flex-col gap-6">
          {CHAPTERS.map((c) => (
            <div key={c.eyebrow}><ChapterBody c={c} /></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ScrollUnboxingHero() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  // Tua video theo tiến độ cuộn (chỉ trong giai đoạn mở hộp)
  useMotionValueEvent(p, 'change', (v) => {
    const vid = videoRef.current;
    if (vid && vid.duration && Number.isFinite(vid.duration)) {
      const ratio = Math.min(Math.max(v / VIDEO_END, 0), 1);
      const t = ratio * Math.max(vid.duration - 0.05, 0);
      if (Math.abs(vid.currentTime - t) > 0.02) vid.currentTime = t;
    }
    let idx = 0;
    CHAPTERS.forEach((c, i) => { if (v >= c.range[0] - 0.01) idx = i; });
    setActive((prev) => (prev === idx ? prev : idx));
  });

  const videoOpacity = useTransform(p, [VIDEO_END - 0.04, VIDEO_END + 0.04], [1, 0]);
  const productOpacity = useTransform(p, [VIDEO_END - 0.04, VIDEO_END + 0.04], [0, 1]);
  const productScale = useTransform(p, [VIDEO_END, 1], [0.96, 1.03]);

  if (reduceMotion) return <StaticVersion />;

  const chapter = CHAPTERS[active];

  return (
    <section ref={containerRef} className="relative h-[330svh] w-full" style={{ backgroundColor: COLOR.cream }} aria-label="Giới thiệu QR Tag">
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        {/* Logo tạm */}
        <img src={BRAND_LOGO} alt="PawLife" className="absolute left-6 top-24 h-9 w-auto lg:left-12" />

        {/* Thanh tiến độ */}
        <motion.div className="absolute left-0 top-0 h-[3px] w-full origin-left" style={{ scaleX: p, backgroundColor: COLOR.brand }} />

        {/* Khung media 9:16 */}
        <div className="relative w-[min(78vw,340px)] overflow-hidden rounded-[32px] shadow-2xl" style={{ aspectRatio: '9 / 16', maxHeight: '70svh' }}>
          <motion.video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => { if (videoRef.current) videoRef.current.currentTime = 0; }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: videoOpacity }}
          />
          <motion.img
            src={PRODUCT_SRC}
            alt="QR Tag"
            className="absolute inset-0 h-full w-full object-contain p-8"
            style={{ opacity: productOpacity, scale: productScale, backgroundColor: COLOR.cream }}
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
