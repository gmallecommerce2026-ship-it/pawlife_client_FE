'use client';
// src/components/home/ScrollUnboxingHero.tsx
// Hero cuộn 6 chương. Hộp và vòng nằm trong một cảnh 3D duy nhất (UnboxingScene);
// phần này chỉ lo chữ, chỉ báo tiến độ và đọc tiến độ cuộn.

import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { History, Fingerprint, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';

import PhoneScanDemo, { type DemoStage } from './PhoneScanDemo';
const UnboxingScene = dynamic(() => import('./UnboxingScene'), { ssr: false });

export const BRAND_LOGO = '/assets/brand/logo-placeholder.svg';
const CTA_HREF = '/the-qr';
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const COLOR = { brand: '#E89B5A', brandDk: '#C97A3C', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };

const DESK_BASE = '#CDB39A';

/* Banner chỉ phát MỘT lần mỗi lần tải trang:
   - cuộn hết banner rồi đi xuống thì banner mờ dần (FADE_END = phần quãng thoát khỏi màn hình mà banner đã mờ hết, 0–1);
   - khi banner đã ra khỏi màn hình hoàn toàn và người dùng dừng cuộn, banner bị gỡ khỏi trang (và bù lại vị trí cuộn để nội dung không nhảy);
   - từ đó cuộn ngược lên không còn banner; chỉ tải lại trang (F5) mới hiện lại.
   Biến cấp module (không dùng localStorage) nên sống qua chuyển trang kiểu SPA nhưng mất khi tải lại. */
let heroDismissed = false;
const FADE_END = 0.75;
const IDLE_MS = 160; // dừng cuộn bao lâu thì mới gỡ banner (gỡ lúc đang quán tính cuộn trên mobile sẽ làm khựng)
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

/* Mỗi chương có khoảng cuộn riêng; giữa các chương không có chữ nào.
   range tính theo tiến độ cuộn của hero (0–1). Đoạn 0.57–0.86 là phần điện thoại quét thử. */
const CHAPTERS: Chapter[] = [
  {
    range: [0, 0.08],
    side: 'center',
    eyebrow: 'QR Tag · Dành riêng cho thú cưng',
    lines: [{ text: 'Một chiếc tag nhỏ.' }, { text: 'Cả hồ sơ của bé.', accent: true }],
  },
  {
    range: [0.11, 0.19],
    side: 'left',
    eyebrow: 'Mở hộp',
    lines: [{ text: 'Bên trong là một danh tính riêng cho bé của bạn.' }],
  },
  {
    range: [0.25, 0.3],
    side: 'right',
    eyebrow: 'Cất cánh',
    lines: [{ text: 'Từ hộp nhỏ,' }, { text: 'đến cổ bé yêu.', accent: true }],
  },
  { range: [0.355, 0.44], side: 'right', eyebrow: 'Ba điều tạo nên QR Tag', features: true },
  {
    range: [0.49, 0.54],
    side: 'left',
    eyebrow: 'Mặt sau',
    lines: [{ text: 'Mỗi tag một mã riêng,' }, { text: 'mỗi bé một hồ sơ.', accent: true }],
  },
  {
    range: [0.67, 0.85],
    side: 'demo',
    eyebrow: 'Quét thử',
    lines: [{ text: 'Chạm điện thoại vào tag,' }, { text: 'hồ sơ của bé hiện ra.', accent: true }],
  },
  {
    range: [0.92, 1],
    side: 'center',
    eyebrow: 'Sẵn sàng đồng hành',
    lines: [{ text: 'Gắn tag cho bé, và luôn có người tìm được bé khi cần.' }],
    cta: true,
  },
];

/* Tiến độ cảnh 3D: chạy hết chương "Mặt sau" (t = 0.82) trong 56% đầu, đứng yên lúc điện thoại quét thử,
   rồi chạy nốt phần CTA. */
const SCENE_A = 0.56;
const SCENE_B = 0.86;
const SCENE_T = 0.82;
const mapScene = (v: number) =>
  v <= SCENE_A ? (v * SCENE_T) / SCENE_A : v <= SCENE_B ? SCENE_T : SCENE_T + ((v - SCENE_B) / (1 - SCENE_B)) * (1 - SCENE_T);

/* Các giai đoạn của điện thoại theo tiến độ cuộn (tăng/giảm số để quét sớm/muộn hơn) */
/* Vòng xoay thêm của tag (sau khi tag đã về vị trí cuối): tiến độ cuộn SPIN_A → SPIN_B tương ứng 0 → 360°.
   Điện thoại chỉ hiện sau SPIN_B. */
const SPIN_A = 0.57;
const SPIN_B = 0.65;
const spinAmount = (v: number) => {
  const s = Math.min(1, Math.max(0, (v - SPIN_A) / (SPIN_B - SPIN_A)));
  return s * s * (3 - 2 * s); // vào chậm, ra chậm
};

const stageAt = (v: number): DemoStage =>
  v < 0.66 || v > SCENE_B ? 'off' : v < 0.7 ? 'enter' : v < 0.77 ? 'scan' : v < 0.81 ? 'locked' : 'result';

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

function ScrollUnboxingHeroBody({ onPassed }: { onPassed: (sectionHeight: number) => void }) {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0); // tiến độ cuộn, đọc trong cảnh 3D
  const spinRef = useRef(0);  // tiến độ cuộn, đọc trong cảnh 3D
  const [active, setActive] = useState(-1); // chương đang hiện chữ, -1 = không có chữ
  const [dot, setDot] = useState(0);
  const [stage, setStage] = useState<DemoStage>('off');
  const armedRef = useRef(false); // chỉ true khi người xem đã thật sự cuộn qua đoạn đầu (tránh hiện ngay khi tải lại giữa trang)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.5 });

  // Quãng thoát: 0 khi đáy banner chạm đáy màn hình (vừa cuộn hết banner), 1 khi đáy banner chạm đỉnh màn hình (banner ra khỏi màn hình)
  const { scrollYProgress: exitProgress } = useScroll({ target: containerRef, offset: ['end end', 'end start'] });
  const fade = useTransform(exitProgress, [0, FADE_END], [1, 0]);

  // Gỡ banner khi: người dùng đã THẤY nó, nay nó nằm hẳn phía trên màn hình, và đã dừng cuộn.
  // (Nếu tải lại trang rồi trình duyệt khôi phục vị trí cuộn ở giữa trang thì chưa tính là đã thấy → vẫn cho cuộn ngược lên xem.)
  useEffect(() => {
    let seen = false;
    let timer: number | undefined;
    const check = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        seen = true;
        window.clearTimeout(timer);
        return;
      }
      if (seen && r.bottom <= 0) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const el2 = containerRef.current;
          if (el2 && el2.getBoundingClientRect().bottom <= 0) onPassed(el2.offsetHeight);
        }, IDLE_MS);
      }
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [onPassed]);

  useMotionValueEvent(scrollYProgress, 'change', (raw) => {
    if (raw < 0.4) armedRef.current = true;
  });

  useMotionValueEvent(p, 'change', (v) => {
    progressRef.current = mapScene(v); // cảnh 3D dùng tiến độ đã ánh xạ, chữ và điện thoại dùng v
    spinRef.current = spinAmount(v);// cảnh 3D dùng tiến độ đã ánh xạ, chữ và điện thoại dùng v
    const st = armedRef.current ? stageAt(v) : 'off';
    setStage((prev) => (prev === st ? prev : st));
    const idx = CHAPTERS.findIndex((c) => v >= c.range[0] && v <= c.range[1]);
    setActive((prev) => (prev === idx ? prev : idx));
    let d = 0;
    CHAPTERS.forEach((c, i) => {
      if (v >= c.range[0] - 0.01) d = i;
    });
    setDot((prev) => (prev === d ? prev : d));
  });

  // Chỉ dựng nội dung động sau khi vào trình duyệt, tránh lệch HTML giữa máy chủ và trình duyệt
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chapter = active >= 0 ? CHAPTERS[active] : null;
  const barScale = useTransform(p, [0, 1], [0, 1]);

  return (
    <motion.section ref={containerRef} className="relative h-[560svh] w-full" style={{ backgroundColor: DESK_BASE, opacity: fade }} aria-label="Giới thiệu QR Tag">
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">

        {/* Vignette: mép khung tối hơn, trung tâm sáng hơn */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse 75% 65% at 50% 45%, rgba(0,0,0,0) 45%, rgba(40,22,10,0.55) 100%)' }} />

        {/* Cảnh 3D duy nhất: hộp + vòng */}
        {mounted && (
          <div className="pointer-events-none absolute inset-0">
            <UnboxingScene progressRef={progressRef} spinRef={spinRef} />
          </div>
        )}

        {/* iPhone quét QR → màn hình Scanned Pet */}
        <PhoneScanDemo stage={stage} />

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
      </div>
    </motion.section>
  );
}

export default function ScrollUnboxingHero() {
  const [gone, setGone] = useState(heroDismissed);

  const handlePassed = useCallback((sectionHeight: number) => {
    const html = document.documentElement;
    const prevAnchor = html.style.overflowAnchor;
    const prevBehavior = html.style.scrollBehavior;
    const y = window.scrollY;
    // Tắt scroll anchoring (tránh trình duyệt tự bù lần nữa) và smooth scroll (trang có html { scroll-behavior: smooth }) trong lúc đổi chỗ
    html.style.overflowAnchor = 'none';
    html.style.scrollBehavior = 'auto';
    heroDismissed = true;
    flushSync(() => setGone(true)); // gỡ banner ngay, đồng bộ
    // Banner nằm hẳn phía trên màn hình nên bù đúng chiều cao nó chiếm: nội dung đang xem giữ nguyên vị trí, không nhảy
    window.scrollTo(0, Math.max(0, y - sectionHeight));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        html.style.overflowAnchor = prevAnchor;
        html.style.scrollBehavior = prevBehavior;
      }),
    );
  }, []);

  if (gone) return null;
  return <ScrollUnboxingHeroBody onPassed={handlePassed} />;
}