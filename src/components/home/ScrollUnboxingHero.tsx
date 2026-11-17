'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/home/ScrollUnboxingHero.tsx
// Hero cuộn điện ảnh, 6 chương, mỗi chương một khoảng cuộn riêng (không chồng lên nhau):
//  - Hộp 3D mở nắp, vòng nằm sẵn trong lõm đáy hộp
//  - Vòng nhấc khỏi lõm, bay theo quỹ đạo cong (Catmull-Rom) với chiều sâu, lật mặt theo mốc cuộn
//  - Chữ chỉ hiện khi vòng đã ở phía đối diện, không bao giờ đè lên vòng
//  - Camera "dolly" nhẹ và bóng sáng phía sau vòng theo độ gần của vòng

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { History, Fingerprint, ShieldCheck } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion';
import { InvitationBox } from '@/components/invitation/box/InvitationBox';
import { RING_SCREEN_FRACTION } from './ringConfig';

// Canvas 3D chỉ chạy trên trình duyệt
const QrTag3DCanvas = dynamic(() => import('./QrTag3DCanvas'), { ssr: false });

/* ------------------------------------------------------------------ */
/*  CẤU HÌNH                                                           */
/* ------------------------------------------------------------------ */
export const BRAND_LOGO = '/assets/brand/logo-placeholder.svg';
// Logo trên hộp lấy đúng logo trên vòng
const RING_LOGO = '/images/qr-tag-only.webp';
const CTA_HREF = '/the-qr';
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const COLOR = { brand: '#E89B5A', brandDk: '#C97A3C', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };

// Hộp 8 cm chiếm 80% cảnh; vòng (tag) chiếm 48% cảnh; lõm đáy hộp khớp đúng đường kính vòng
const BOX_SCALE = 0.8;
const TAG_BOX = 48;
const RING_IN_BOX = (RING_SCREEN_FRACTION * TAG_BOX) / (BOX_SCALE * 100);
const RECESS_RATIO = RING_IN_BOX * 1.03;
const BOX_TILT = 30;

const DESK_BASE = '#CDB39A';
const DESK_BG = [
  "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(255,246,236,0.55), rgba(255,246,236,0) 70%)",
  "radial-gradient(ellipse 120% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,36,20,0.42) 100%)",
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.006 0.32' numOctaves='5' seed='11'/><feColorMatrix values='0 0 0 0 0.38  0 0 0 0 0.25  0 0 0 0 0.14  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\")",
].join(', ');

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

/* Mỗi chương có khoảng cuộn riêng; ngoài các khoảng này không có chữ nào hiện ra. */
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

/* ------------------------------------------------------------------ */
/*  QUỸ ĐẠO: các mốc (tiến độ, giá trị) nối bằng Catmull-Rom          */
/*  → đường cong trơn, lấy mẫu dày để chuyển động không khựng          */
/* ------------------------------------------------------------------ */
type Key = [number, number];

function curve(keys: Key[], n = 360): { t: number[]; v: number[] } {
  const t: number[] = [];
  const v: number[] = [];
  const last = keys.length - 1;
  for (let s = 0; s <= n; s++) {
    const T = s / n;
    let i = 0;
    while (i < last - 1 && T > keys[i + 1][0]) i++;
    const [t0, P1] = keys[i];
    const [t1, P2] = keys[i + 1];
    const P0 = keys[Math.max(0, i - 1)][1];
    const P3 = keys[Math.min(last, i + 2)][1];
    const u = (T - t0) / (t1 - t0 || 1);
    const val =
      0.5 *
      (2 * P1 +
        (-P0 + P2) * u +
        (2 * P0 - 5 * P1 + 4 * P2 - P3) * u * u +
        (-P0 + 3 * P1 - 3 * P2 + P3) * u * u * u);
    t.push(T);
    v.push(val);
  }
  return { t, v };
}

// Vòng: x, y theo % chiều rộng/cao của vòng; z theo px (đưa về phía camera); tilt theo độ
const RING_X = curve([[0, 0], [0.22, 0], [0.3, 0], [0.4, -75], [0.52, -75], [0.66, -12], [0.72, 75], [0.8, 75], [0.9, 0], [1, 0]]);
const RING_Y = curve([[0, 0], [0.22, 0], [0.3, -6], [0.4, -14], [0.52, -4], [0.66, 0], [0.72, 6], [0.8, -4], [0.9, -18], [1, -18]]);
const RING_Z = curve([[0, 0], [0.22, 0], [0.3, 120], [0.4, 240], [0.52, 340], [0.66, 260], [0.72, 340], [0.8, 280], [0.9, 200], [1, 200]]);
// Xoay ngang theo quỹ đạo: vòng nghiêng vào trong khi bay, tạo cảm giác điện ảnh
const RING_YAW = curve([[0, 0], [0.3, 0], [0.4, -28], [0.52, -34], [0.66, -10], [0.72, 30], [0.8, 20], [0.9, 0], [1, 0]]);
const RING_TILT = curve([[0, BOX_TILT], [0.22, BOX_TILT], [0.3, 18], [0.4, 4], [0.52, 0], [0.7, 0], [0.8, -6], [0.9, 0], [1, 0]]);
// Camera "dolly": cảnh tiến nhẹ khi vòng bay gần, lùi lại khi vòng về giữa
const CAM = curve([[0, 1], [0.3, 1.02], [0.5, 1.06], [0.75, 1.03], [1, 1.0]]);

/* ------------------------------------------------------------------ */
/*  CHỮ: mặt nạ kéo từ phía vòng đi ra                                 */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  HỘP: chỉ component này render lại khi nắp chuyển động              */
/* ------------------------------------------------------------------ */
function ScrollBox({ open, size }: { open: MotionValue<number>; size: number }) {
  const [v, setV] = useState(open.get());
  useMotionValueEvent(open, 'change', (n) => setV(n));
  return (
    <InvitationBox
      progress={v}
      size={size}
      color={COLOR.brand}
      lining="#FFFDF9"
      logo={<img src={RING_LOGO} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
      tilt={BOX_TILT}
      recessRatio={RECESS_RATIO}
    />
  );
}

/* ------------------------------------------------------------------ */
export default function ScrollUnboxingHero() {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0); // tiến độ cuộn, đọc trong vòng lặp render 3D
  const sceneRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1); // chương đang hiện chữ, -1 = không có chữ
  const [dot, setDot] = useState(0); // chấm chỉ báo tiến độ
  const [boxSize, setBoxSize] = useState(330);

  // Hộp co giãn theo bề rộng cảnh
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxSize(Math.round(e.contentRect.width * BOX_SCALE)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  useMotionValueEvent(p, 'change', (v) => {
    progressRef.current = v;
    // chữ chỉ hiện khi đang nằm trong khoảng của chương, các khoảng không chồng nhau
    const idx = CHAPTERS.findIndex((c) => v >= c.range[0] && v <= c.range[1]);
    setActive((prev) => (prev === idx ? prev : idx));
    let d = 0;
    CHAPTERS.forEach((c, i) => {
      if (v >= c.range[0] - 0.01) d = i;
    });
    setDot((prev) => (prev === d ? prev : d));
  });

  /* Hộp: nắp mở, rồi hộp mờ đi và trôi ra khi vòng đã bay khỏi */
  const lidOpen = useTransform(p, [0.03, 0.2], [0, 1], { clamp: true });
  const boxOpacity = useTransform(p, [0.3, 0.4], [1, 0]);
  const boxY = useTransform(p, [0.3, 0.4], ['0%', '26%']);
  const boxScale = useTransform(p, [0.3, 0.4], [1, 0.88]);

  /* Vòng: hiện dần khi nắp hở, quỹ đạo cong theo mốc */
  const tagOpacity = useTransform(p, [0.12, 0.26], [0, 1], { clamp: true });
  const tagX = useTransform(p, RING_X.t, RING_X.v.map((x) => `${x}%`));
  const tagY = useTransform(p, RING_Y.t, RING_Y.v.map((y) => `${y}%`));
  const tagZ = useTransform(p, RING_Z.t, RING_Z.v);
  const tagRotX = useTransform(p, RING_TILT.t, RING_TILT.v);
  const tagRotY = useTransform(p, RING_YAW.t, RING_YAW.v);
  const camScale = useTransform(p, CAM.t, CAM.v);

  // bóng đổ trên đáy hộp khi vòng còn nằm sát; khi bay lên, bóng mờ và lệch xa
  const shadowOpacity = useTransform(tagZ, [0, 120, 220], [0.35, 0.12, 0.06]);
  const shadowY = useTransform(tagZ, [0, 220], ['4%', '16%']);
  const shadowScale = useTransform(tagZ, [0, 220], [0.9, 0.62]);
  // quầng sáng phía sau vòng sáng dần khi vòng tiến gần camera
  const glowOpacity = useTransform(tagZ, [0, 200], [0, 0.55]);
  // Hiệu ứng độ sâu trường ảnh: nền mờ dần khi vòng tiến gần camera
  const boxBlur = useTransform(tagZ, [0, 340], ['blur(0px)', 'blur(3px)']);

  /* Nghiêng theo chuột và tốc độ cuộn */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 20 });
  const sy = useSpring(my, { stiffness: 70, damping: 20 });
  const scrollVel = useSpring(useVelocity(p), { stiffness: 80, damping: 30 });
  const sceneRotY = useTransform([sx, scrollVel], ([a, v]: number[]) => a * 8 + Math.max(-3, Math.min(3, v)) * 3);
  const sceneRotX = useTransform([sy, scrollVel], ([b, v]: number[]) => -b * 6 + Math.max(-3, Math.min(3, v)) * -2);

  const onPointerMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const chapter = active >= 0 ? CHAPTERS[active] : null;

  return (
    <section
      ref={containerRef}
      onMouseMove={onPointerMove}
      className="relative h-[380svh] w-full"
      style={{ backgroundColor: DESK_BASE }}
      aria-label="Giới thiệu QR Tag"
    >
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        {/* Nền mặt bàn: vân gỗ bằng nhiễu SVG, ánh sáng từ trên và vignette */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: DESK_BG }} />
        <img src={BRAND_LOGO} alt="PawLife" className="absolute left-6 top-24 h-9 w-auto lg:left-12" />
        <motion.div className="absolute left-0 top-0 h-[3px] w-full origin-left" style={{ scaleX: p, backgroundColor: COLOR.brand }} />

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

        {/* Cảnh: nghiêng theo chuột/cuộn, camera dolly nhẹ */}
        <motion.div
          ref={sceneRef}
          className="relative w-[min(78vw,420px)] -translate-y-[6svh] lg:translate-y-0"
          style={{ aspectRatio: '1 / 1', perspective: 1000, scale: camScale }}
        >
          <motion.div className="absolute inset-0" style={{ rotateX: sceneRotX, rotateY: sceneRotY, transformStyle: 'preserve-3d' }}>
            {/* Hộp 3D nhìn từ trên xuống */}
            <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: boxOpacity, y: boxY, scale: boxScale, filter: boxBlur }}>
              <ScrollBox open={lidOpen} size={boxSize} />
            </motion.div>

            {/* Vòng 3D: nằm trong lõm, bay theo quỹ đạo cong */}
            <motion.div
              className="absolute left-0 right-0 mx-auto aspect-square"
              style={{ width: `${TAG_BOX}%`, top: '50%', x: tagX, y: tagY, z: tagZ, rotateX: tagRotX, rotateY: tagRotY, opacity: tagOpacity }}
            >
              {/* Quầng sáng sau vòng: đi cùng vòng, sáng dần khi vòng tiến gần camera */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: '-25%',
                  right: '-25%',
                  top: '-25%',
                  bottom: '-25%',
                  opacity: glowOpacity,
                  background: 'radial-gradient(circle, rgba(255,214,170,0.9) 0%, rgba(255,214,170,0) 62%)',
                }}
              />
              <motion.div
                aria-hidden
                className="absolute rounded-full bg-black blur-xl"
                style={{ left: '34%', right: '34%', top: '34%', bottom: '34%', opacity: shadowOpacity, y: shadowY, scale: shadowScale }}
              />
              <QrTag3DCanvas progressRef={progressRef} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Chữ: một chương tại một thời điểm, luôn ở phía đối diện với vòng */}
        <AnimatePresence mode="wait">
          {chapter && active >= 0 && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.45 }}
              className={`absolute ${POS[chapter.side]}`}
            >
              <ChapterBody c={chapter} index={active} total={CHAPTERS.length} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}