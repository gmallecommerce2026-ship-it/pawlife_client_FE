'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/home/ScrollUnboxingHero.tsx
// Hero cuộn theo tiến độ:
//  - Hộp 3D nhìn từ trên xuống (InvitationBox) mở nắp, viên QR Tag 3D nằm giữa hộp
//  - Tag bay ra khỏi hộp, tiến gần camera ở giữa banner, rồi mới bay cong sang trái/phải đan xen với chữ, đĩa tự lật theo tiến độ cuộn
//  - Chữ hiện bằng mặt nạ kéo, mỗi bên một hướng
//  - Nghiêng theo chuột (máy tính) và tốc độ cuộn; chỉ báo tiến độ có số chương

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

// Canvas 3D chỉ chạy trên trình duyệt
const QrTag3DCanvas = dynamic(() => import('./QrTag3DCanvas'), { ssr: false });

/* ------------------------------------------------------------------ */
/*  CẤU HÌNH                                                           */
/* ------------------------------------------------------------------ */
export const BRAND_LOGO = '/assets/brand/logo-placeholder.svg';
const CTA_HREF = '/the-qr';
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const COLOR = { brand: '#E89B5A', brandDk: '#C97A3C', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };

// Canvas 3D chiếm 56% chiều rộng màn cảnh, nên đơn vị y của quỹ đạo tính theo chiều cao đó
const TAG_BOX = 56;
const toY = (c: number) => (c - (50 + TAG_BOX / 2)) / (TAG_BOX / 100);

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

const POS: Record<Side, string> = {
  center: 'bottom-14 left-1/2 -translate-x-1/2 text-center w-[min(90vw,520px)]',
  left: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
  right: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-auto lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
};

/* ------------------------------------------------------------------ */
/*  QUỸ ĐẠO CỦA TAG (cong, không đi thẳng)                             */
/* ------------------------------------------------------------------ */
const SIDE_X = 62;  // lệch sang trái/phải (% chiều rộng tag)
const SIDE_C = 36;  // tâm dọc khi đứng bên
const P_CENTER = { x: 0, y: toY(50) }; // giữa hộp = giữa banner
const P_RIGHT = { x: SIDE_X, y: toY(SIDE_C) };
const P_LEFT = { x: -SIDE_X, y: toY(SIDE_C) };
const P_CTA = { x: 0, y: toY(46) };

// Mốc tiến độ của chuỗi mở đầu
const T_LID: [number, number] = [0.06, 0.24]; // nắp mở 0 → 100°
const T_SHOW: [number, number] = [0.19, 0.22]; // vòng hiện ra khi nắp đã hở đủ
const T_RISE: [number, number] = [0.25, 0.4]; // vòng bay ra khỏi hộp, tiến gần camera
const T_BOX_OUT: [number, number] = [0.44, 0.6]; // hộp mờ dần

type Pt = { t: number; x: number; y: number };
function arc(t0: number, t1: number, a: { x: number; y: number }, b: { x: number; y: number }, lift: number, steps = 12): Pt[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const u = i / steps;
    const e = u * u * (3 - 2 * u);
    return {
      t: t0 + (t1 - t0) * u,
      x: a.x + (b.x - a.x) * e,
      y: a.y + (b.y - a.y) * e - lift * Math.sin(Math.PI * u),
    };
  });
}

const PATH: Pt[] = [
  { t: 0, ...P_CENTER },
  { t: T_RISE[1], ...P_CENTER }, // nằm giữa hộp rồi nâng lên tại chỗ (chỉ phóng to, không đổi vị trí)
  ...arc(T_RISE[1], 0.5, P_CENTER, P_RIGHT, 16).slice(1),
  ...arc(0.5, 0.62, P_RIGHT, P_LEFT, 34).slice(1),
  { t: 0.8, ...P_LEFT },
  ...arc(0.8, 0.9, P_LEFT, P_CTA, 22).slice(1),
  { t: 1, ...P_CTA },
];
const PATH_T = PATH.map((q) => q.t);
const PATH_X = PATH.map((q) => `${q.x}%`);
const PATH_Y = PATH.map((q) => `${q.y}%`);

/* ------------------------------------------------------------------ */
/*  CHỮ: mặt nạ kéo từ phía tag đi ra                                 */
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
      transition={{ duration: 0.8, delay, ease: EASE_OUT }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="mr-[0.25em] inline-block"
          initial={{ opacity: 0, filter: 'blur(6px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: delay + 0.25 + i * 0.05 }}
        >
          {w}
        </motion.span>
      ))}
    </motion.p>
  );
}

function ChapterBody({ c, index }: { c: Chapter; index: number }) {
  const fromX = c.side === 'right' ? 28 : -28;
  return (
    <>
      <motion.p
        className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em]"
        style={{ color: COLOR.brand }}
        initial={{ opacity: 0, letterSpacing: '0.45em' }}
        animate={{ opacity: 1, letterSpacing: '0.18em' }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        {String(index + 1).padStart(2, '0')} · {c.eyebrow}
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
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: EASE_OUT }}
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
      logo={<img src={BRAND_LOGO} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
    />
  );
}

/* ------------------------------------------------------------------ */
export default function ScrollUnboxingHero() {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0); // tiến độ cuộn, đọc trong vòng lặp render 3D
  const sceneRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [boxSize, setBoxSize] = useState(330);

  // Hộp co giãn theo bề rộng cảnh (78vw, tối đa 420px)
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxSize(Math.round(e.contentRect.width * 0.8)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  useMotionValueEvent(p, 'change', (v) => {
    progressRef.current = v;
    let idx = 0;
    CHAPTERS.forEach((c, i) => { if (v >= c.range[0] - 0.01) idx = i; });
    setActive((prev) => (prev === idx ? prev : idx));
  });

  /* Hộp: tiến độ mở nắp (0 → 1), sau đó mờ dần */
  const lidOpen = useTransform(p, [T_LID[0], T_LID[1]], [0, 1], { clamp: true });
  const boxOpacity = useTransform(p, T_BOX_OUT, [1, 0]);
  const boxY = useTransform(p, T_BOX_OUT, ['0%', '26%']);
  const boxX = useTransform(p, T_BOX_OUT, ['0%', '-26%']);
  const boxScale = useTransform(p, T_BOX_OUT, [1, 0.88]);

  /* Tag: hiện khi nắp hở, nằm giữa hộp, rồi tiến gần camera ở giữa banner */
  const tagOpacity = useTransform(p, T_SHOW, [0, 1]);
  const tagX = useTransform(p, PATH_T, PATH_X);
  const tagY = useTransform(p, PATH_T, PATH_Y);
  // 0.9 ≈ vừa vặn nằm trong hộp; 1.3 = đã bay lên gần camera
  const tagScale = useTransform(p, [T_SHOW[0], T_RISE[0], T_RISE[1], 0.5, 0.62, 0.9, 1], [0.84, 0.9, 1.3, 1.25, 1.25, 1.3, 1.3]);
  // bóng trên đáy hộp: đậm khi vòng còn nằm sát, nhạt và lệch xa khi vòng đã nâng lên
  const tagShadowOpacity = useTransform(p, [T_RISE[0], T_RISE[1], T_BOX_OUT[1]], [0.3, 0.2, 0]);
  const tagShadowY = useTransform(p, T_RISE, ['2%', '9%']);
  const tagShadowScale = useTransform(p, T_RISE, [0.86, 0.96]);

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

  const chapter = CHAPTERS[active];

  return (
    <section ref={containerRef} onMouseMove={onPointerMove} className="relative h-[330svh] w-full" style={{ backgroundColor: COLOR.cream }} aria-label="Giới thiệu QR Tag">
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        <img src={BRAND_LOGO} alt="PawLife" className="absolute left-6 top-24 h-9 w-auto lg:left-12" />
        <motion.div className="absolute left-0 top-0 h-[3px] w-full origin-left" style={{ scaleX: p, backgroundColor: COLOR.brand }} />

        {/* Chỉ báo tiến độ */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 lg:bottom-auto lg:left-auto lg:right-8 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-col">
          {CHAPTERS.map((c, i) => (
            <span key={c.eyebrow} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-6' : 'w-1.5'}`} style={{ backgroundColor: i === active ? COLOR.brand : '#D1D5DB' }} />
          ))}
        </div>

        {/* Cảnh: nghiêng theo chuột/cuộn */}
        <div ref={sceneRef} className="relative w-[min(78vw,420px)] -translate-y-[6svh] lg:translate-y-0" style={{ aspectRatio: '1 / 1', perspective: 1000 }}>
          <motion.div className="absolute inset-0" style={{ rotateX: sceneRotX, rotateY: sceneRotY, transformStyle: 'preserve-3d' }}>
            {/* Hộp 3D nhìn từ trên xuống */}
            <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: boxOpacity, y: boxY, x: boxX, scale: boxScale }}>
              <ScrollBox open={lidOpen} size={boxSize} />
            </motion.div>

            {/* Tag 3D: nằm giữa hộp, bay ra gần camera rồi đi theo quỹ đạo */}
            <motion.div
              className="absolute left-0 right-0 mx-auto aspect-square"
              style={{ width: `${TAG_BOX}%`, top: '50%', x: tagX, y: tagY, scale: tagScale, opacity: tagOpacity }}
            >
              <motion.div
                aria-hidden
                className="absolute rounded-full bg-black blur-xl"
                style={{ left: '34%', right: '34%', top: '34%', bottom: '34%', opacity: tagShadowOpacity, y: tagShadowY, scale: tagShadowScale }}
              />
              <QrTag3DCanvas progressRef={progressRef} />
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.35 }}
            className={`absolute ${POS[chapter.side]}`}
          >
            <ChapterBody c={chapter} index={active} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
