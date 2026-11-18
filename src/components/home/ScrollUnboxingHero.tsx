'use client';
// src/components/home/ScrollUnboxingHero.tsx
// Một khung ghim (sticky) duy nhất, cuộn điều khiển 3 pha:
//   A) 0 → MAIN_SPAN       : banner 3D + quét QR (các chương cũ)
//   B) exit 0 → 0.3        : banner mờ dần, điện thoại đứng yên giữa
//   C) exit 0.3 → 0.75     : điện thoại dịch sang trái, nội dung "Tải ứng dụng" mờ hiện
//   (exit 0.75 → 1 giữ nguyên một nhịp rồi trang mới cuộn tiếp bình thường)

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { History, Fingerprint, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import PhoneScanDemo, { type DemoStage, PHONE_OUT_W, PHONE_OUT_H, SCREEN_W, SCREEN_H, BEZEL } from './PhoneScanDemo';
const UnboxingScene = dynamic(() => import('./UnboxingScene'), { ssr: false });

const CTA_HREF = '/the-qr';
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const COLOR = { brand: '#E89B5A', brandDk: '#C97A3C', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };
const DESK_BASE = '#CDB39A';

/* ===== Độ dài cuộn (đơn vị: 1 màn hình) ===== */
const MAIN_SPAN = 5;     // đoạn banner + quét (tương đương 600svh cũ: 6 - 1 = 5)
const EXIT_SPAN = 2.5;   // đoạn mờ banner → dịch điện thoại → hiện nội dung. Tăng số này = cuộn lâu hơn
const TOTAL_SPAN = MAIN_SPAN + EXIT_SPAN;

/* ===== Mốc của đoạn exit (0 → 1) ===== */
const FADE_END = 0.3;                    // banner mờ hẳn
const MOVE_A = 0.3, MOVE_B = 0.75;       // điện thoại dịch chỗ
const FINALE_A = 0.4, FINALE_B = 0.8;    // nội dung "Tải ứng dụng" hiện
const HOME_AT = 0.72;                    
/* ===== Độ mượt khi cuộn nhanh =====
   Animation chạy theo một "con trỏ" đuổi theo vị trí cuộn thật, với tốc độ tối đa cố định.
   Cuộn nhanh cỡ nào thì animation cũng chỉ đi tối đa MAX_SCREENS_PER_SEC màn hình/giây
   (luôn đi hết quỹ đạo, không nhảy cóc). Cuộn chậm thì bám sát, chỉ trễ nhẹ theo SMOOTH_TAU. */
const MAX_SCREENS_PER_SEC = 1.6;  // giảm = chậm/mượt hơn khi cuộn nhanh, tăng = nhanh hơn
const SMOOTH_TAU = 0.12;          // giây; tăng = độ trễ êm lớn hơn
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Vị trí/tỉ lệ điện thoại so với TÂM khung ghim (CSS đã neo giữa, ở đây chỉ là độ lệch) */
function phonePose(vw: number, vh: number) {
  const desk = vw >= 1024;
  const maxH = desk ? vh * 0.8 : vh - 300;
  const pw = Math.round(Math.max(150, Math.min(300, (maxH * SCREEN_W) / SCREEN_H, vw * 0.7)));
  const s0 = (pw + BEZEL * 2) / PHONE_OUT_W;
  if (desk) return { s0, sF: s0, y0: 0, yF: 0, xF: -vw * 0.2 }; // cuối: tâm điện thoại ở ~30% bề ngang
  const h0 = PHONE_OUT_H * s0;
  const sF = Math.min(s0, (vh * 0.46) / PHONE_OUT_H);
  return { s0, sF, y0: vh / 2 - 56 - h0 / 2, yF: 84 + (PHONE_OUT_H * sF) / 2 - vh / 2, xF: 0 };
}

const FEATURES = [
  { icon: History, title: 'PawHistory', text: 'Lưu trữ hồ sơ sức khoẻ' },
  { icon: Fingerprint, title: 'Pet ID', text: 'Một danh tính riêng cho bé' },
  { icon: ShieldCheck, title: 'An toàn', text: 'Liên lạc với chủ khi cần thiết' },
];

type Side = 'center' | 'left' | 'right' | 'demo';
type Chapter = {
  range: [number, number];
  side: Side;
  eyebrow: string;
  lines?: { text: string; accent?: boolean }[];
  features?: boolean;
  cta?: boolean;
};

/* Trục cuộn v (0–1) của phần banner:
   0 → 0.6      : các chương cũ chạy hết, tag về vị trí cuối (chương CTA)
   0.62 → 0.70  : tag xoay thêm nửa vòng ra mặt sau có QR
   0.72 → 1     : điện thoại hiện lên, quét, ra kết quả (giữ nguyên ở kết quả suốt đoạn exit) */
const SCENE_END = 0.6;

const CHAPTERS: Chapter[] = [
  {
    range: [0, 0.072],
    side: 'center',
    eyebrow: 'QR Tag · Dành riêng cho thú cưng',
    lines: [{ text: 'Một chiếc tag nhỏ.' }, { text: 'Cả hồ sơ của bé.', accent: true }],
  },
  {
    range: [0.096, 0.168],
    side: 'left',
    eyebrow: 'Mở hộp',
    lines: [{ text: 'Bên trong là một danh tính riêng cho bé của bạn.' }],
  },
  {
    range: [0.216, 0.264],
    side: 'right',
    eyebrow: 'Cất cánh',
    lines: [{ text: 'Từ hộp nhỏ,' }, { text: 'đến cổ bé yêu.', accent: true }],
  },
  { range: [0.312, 0.384], side: 'right', eyebrow: 'Ba điều tạo nên QR Tag', features: true },
  {
    range: [0.432, 0.48],
    side: 'left',
    eyebrow: 'Mặt sau',
    lines: [{ text: 'Mỗi tag một mã riêng,' }, { text: 'mỗi bé một hồ sơ.', accent: true }],
  },
  {
    range: [0.528, 0.6],
    side: 'center',
    eyebrow: 'Sẵn sàng đồng hành',
    lines: [{ text: 'Gắn tag cho bé, và luôn có người tìm được bé khi cần.' }],
    cta: true,
  },
  {
    range: [0.77, 0.99],
    side: 'demo',
    eyebrow: 'Quét thử',
    lines: [{ text: 'Chạm điện thoại vào tag,' }, { text: 'hồ sơ của bé hiện ra.', accent: true }],
  },
];

/* Cảnh 3D chạy hết hành trình (t = 1) trong đoạn 0 → SCENE_END rồi đứng yên */
const mapScene = (v: number) => Math.min(1, v / SCENE_END);

/* Vòng xoay thêm: từ vị trí cuối (mặt trước) ra mặt sau = nửa vòng (π) */
const SPIN_A = 0.62;
const SPIN_B = 0.68;
const spinAmount = (v: number) => {
  const s = Math.min(1, Math.max(0, (v - SPIN_A) / (SPIN_B - SPIN_A)));
  return s * s * (3 - 2 * s) * 0.5; // 0 → 0.5 (0.5 tương ứng 180°)
};

const stageAt = (v: number): DemoStage =>
  v < 0.76 ? 'off' : v < 0.8 ? 'enter' : v < 0.86 ? 'scan' : v < 0.9 ? 'locked' : 'result';

const POS: Record<Side, string> = {
  center: 'bottom-14 left-1/2 -translate-x-1/2 text-center w-[min(90vw,520px)]',
  left: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-12 lg:right-auto lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
  right: 'bottom-24 left-5 right-5 text-left lg:bottom-auto lg:left-auto lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px]',
  demo: 'top-36 left-5 right-5 text-left lg:top-1/2 lg:left-12 lg:right-auto lg:-translate-y-1/2 lg:w-[300px]',
};

const MASK_FROM: Record<Side, string> = {
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  center: 'inset(0% 0% 100% 0%)',
  demo: 'inset(0% 100% 0% 0%)',
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

export default function ScrollUnboxingHero({ finale }: { finale?: ReactNode }) {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const spinRef = useRef(0);
  const eRef = useRef(0);
  const vpRef = useRef({ w: 1280, h: 800 });
  const [active, setActive] = useState(-1);
  const [dot, setDot] = useState(0);
  const [stage, setStage] = useState<DemoStage>('off');
  const [sceneOn, setSceneOn] = useState(true);
  const [finaleOn, setFinaleOn] = useState(false);
    const [home, setHome] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Vị trí điện thoại (độ lệch so với tâm khung) — set trực tiếp, không qua React state
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const ps = useMotionValue(1);
  const applyPhone = (e: number) => {
    const P = phonePose(vpRef.current.w, vpRef.current.h);
    const m = smooth((e - MOVE_A) / (MOVE_B - MOVE_A));
    px.set(P.xF * m);
    py.set(lerp(P.y0, P.yF, m));
    ps.set(lerp(P.s0, P.sF, m));
  };

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useMotionValue(scrollYProgress.get());
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const maxRate = MAX_SCREENS_PER_SEC / TOTAL_SPAN; // tiến độ (0–1) mỗi giây
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const cur = p.get();
      const diff = scrollYProgress.get() - cur;
      if (Math.abs(diff) > 1e-5) {
        let step = diff * (1 - Math.exp(-dt / SMOOTH_TAU));
        const cap = maxRate * dt;
        step = Math.max(-cap, Math.min(cap, step));
        p.set(cur + step);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p, scrollYProgress]);

  const vMV = useTransform(p, (x) => Math.min(1, (x * TOTAL_SPAN) / MAIN_SPAN));
  const eMV = useTransform(p, (x) => clamp01((x * TOTAL_SPAN - MAIN_SPAN) / EXIT_SPAN));
  const bannerOpacity = useTransform(eMV, [0, FADE_END], [1, 0]);
  const finaleOpacity = useTransform(eMV, [FINALE_A, FINALE_B], [0, 1]);
  const finaleY = useTransform(eMV, [FINALE_A, FINALE_B], [90, 0]); // parallax: nội dung trượt nhẹ từ dưới lên
  const barScale = vMV;

  useMotionValueEvent(p, 'change', (x) => {
    const v = Math.min(1, (x * TOTAL_SPAN) / MAIN_SPAN);
    const e = clamp01((x * TOTAL_SPAN - MAIN_SPAN) / EXIT_SPAN);
    progressRef.current = mapScene(v);
    spinRef.current = spinAmount(v);
    const st = stageAt(v);
    setStage((prev) => (prev === st ? prev : st));
    const idx = CHAPTERS.findIndex((c) => v >= c.range[0] && v <= c.range[1]);
    setActive((prev) => (prev === idx ? prev : idx));
    let d = 0;
    CHAPTERS.forEach((c, i) => {
      if (v >= c.range[0] - 0.01) d = i;
    });
    setDot((prev) => (prev === d ? prev : d));
    eRef.current = e;
    applyPhone(e);
    setSceneOn((prev) => (prev === e < FADE_END + 0.05 ? prev : e < FADE_END + 0.05));
    setFinaleOn((prev) => (prev === e > 0.5 ? prev : e > 0.5));
    setHome((prev) => (prev === e > HOME_AT ? prev : e > HOME_AT));
  });

  // Chỉ dựng nội dung động sau khi vào trình duyệt; đo viewport và đặt đúng vị trí điện thoại
  useEffect(() => {
    const measure = () => {
      vpRef.current = { w: window.innerWidth, h: window.innerHeight };
      applyPhone(eRef.current);
    };
    measure();
    setMounted(true);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuộn qua hết banner thì gỡ hẳn khỏi trang: cuộn ngược lên sẽ không hiện lại (chỉ reload mới có lại)
  const [dismissed, setDismissed] = useState(false);
  const anchorRef = useRef<{ el: Element; top: number } | null>(null);

  useEffect(() => {
    if (dismissed) return;
    const check = () => {
      const el = containerRef.current;
      if (!el || el.getBoundingClientRect().bottom > 0) return;
      const next = el.nextElementSibling ?? el.parentElement?.nextElementSibling;
      if (next) anchorRef.current = { el: next, top: next.getBoundingClientRect().top };
      setDismissed(true);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [dismissed]);

  // Bù lại phần chiều cao vừa bị gỡ để người dùng không bị nhảy vị trí
  useLayoutEffect(() => {
    if (!dismissed) return;
    const a = anchorRef.current;
    if (!a) return;
    const root = document.documentElement;
    root.style.overflowAnchor = 'none';
    const diff = a.el.getBoundingClientRect().top - a.top;
    if (diff) window.scrollBy(0, diff);
    requestAnimationFrame(() => requestAnimationFrame(() => { root.style.overflowAnchor = ''; }));
  }, [dismissed]);

  const heroInView = useInView(containerRef, { margin: '200px 0px 200px 0px' });
  const chapter = active >= 0 ? CHAPTERS[active] : null;

  if (dismissed) return null;

  return (
    <section ref={containerRef} className="relative w-full" style={{ height: `${(TOTAL_SPAN + 1) * 100}svh` }} aria-label="Giới thiệu QR Tag">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-white">

        {/* ===== LỚP BANNER (mờ dần khi exit) ===== */}
        <motion.div className="absolute inset-0" style={{ opacity: bannerOpacity, backgroundColor: DESK_BASE }}>
          {/* Vignette */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse 75% 65% at 50% 45%, rgba(0,0,0,0) 45%, rgba(40,22,10,0.55) 100%)' }} />

          {/* Cảnh 3D: dừng render khi banner đã mờ */}
          {mounted && (
            <div className="pointer-events-none absolute inset-0">
              <UnboxingScene progressRef={progressRef} spinRef={spinRef} paused={!heroInView || !sceneOn} />
            </div>
          )}

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

          {/* Chữ: một chương tại một thời điểm */}
          <AnimatePresence mode="wait">
            {mounted && chapter && active >= 0 && (
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
        </motion.div>

        {/* ===== ĐIỆN THOẠI: neo giữa khung bằng CSS, dịch chỗ bằng x/y/scale ===== */}
        {mounted && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20"
            style={{
              width: PHONE_OUT_W,
              height: PHONE_OUT_H,
              marginLeft: -PHONE_OUT_W / 2,
              marginTop: -PHONE_OUT_H / 2,
              x: px,
              y: py,
              scale: ps,
            }}
          >
            <PhoneScanDemo stage={stage} home={home} />
          </motion.div>
        )}

        {/* ===== NỘI DUNG "TẢI ỨNG DỤNG" (mờ hiện + parallax) ===== */}
        {finale && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 px-6 lg:inset-x-auto lg:bottom-auto lg:left-[55%] lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:px-0">
            <motion.div style={{ opacity: finaleOpacity, y: finaleY, pointerEvents: finaleOn ? 'auto' : 'none' }}>
              {finale}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}