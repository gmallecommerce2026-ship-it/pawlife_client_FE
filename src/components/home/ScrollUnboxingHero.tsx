'use client';
// src/components/home/ScrollUnboxingHero.tsx
// Hero 3D điều khiển bằng TAP (không còn scroll). Một khung 100svh, 3 lần chạm = 3 đoạn animation:
//   Tap 1 : v 0 → SCENE_END (0.6)  — mở hộp, tag bay + xoay, về chính giữa màn hình (dừng TRƯỚC khi lật ra mặt QR)
//   Tap 2 : v 0.6 → 1              — tag xoay ra mặt sau có QR, điện thoại hiện lên, quét, ra kết quả
//   Tap 3 : e 0 → 1                — banner mờ dần, điện thoại dịch sang trái, nội dung "Tải ứng dụng" hiện
// Khi cuộn tới hero thì trang bị ghim lại (không cuộn xuống tiếp được) cho đến khi tap 3 chạy xong; cuộn lên vẫn được.
// Sau tap 3 trang trở lại cuộn bình thường. Tap khi đang chạy animation sẽ bị bỏ qua.

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { History, Fingerprint, ShieldCheck, Pointer } from 'lucide-react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import PhoneScanDemo, { type DemoStage, PHONE_OUT_W, PHONE_OUT_H, SCREEN_W, SCREEN_H, BEZEL } from './PhoneScanDemo';
const UnboxingScene = dynamic(() => import('./UnboxingScene'), { ssr: false });

const CTA_HREF = '/the-qr';
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const COLOR = { brand: '#E89B5A', brandDk: '#C97A3C', cream: '#FFF8F3', ink: '#111827', muted: '#6B7280' };
const DESK_BASE = '#CDB39A';

/* ===== Thời lượng mỗi lần tap (giây) — tăng số = animation chậm hơn ===== */
const TAP_SECONDS = {
  open: 11,   // Tap 1: mở hộp → xoay → về giữa màn (v: 0 → SCENE_END). Mỗi chương chữ hiện ~1.8–2s
  scan: 8,    // Tap 2: lật QR → điện thoại hiện → quét → kết quả (v: SCENE_END → 1), CHƯA gồm SCAN_HOLD_SECONDS
  exit: 2.8,  // Tap 3: mờ banner → điện thoại dịch trái → hiện nội dung tải app (e: 0 → 1)
};
/* Kéo dài đoạn quét QR: giữ nguyên tiến độ ở giữa pha 'scan' (v = SCAN_HOLD_AT, nằm trong 0.8–0.86)
   thêm SCAN_HOLD_SECONDS giây rồi mới chạy tiếp sang 'locked' → màn kết quả. Chỉnh số giây để dài/ngắn hơn. */
const SCAN_HOLD_AT = 0.83;
const SCAN_HOLD_SECONDS = 1.5;

/* Gợi ý tap: ngón tay chạm 2 lần + gợn sóng. Hiện khi hero đang ở trong màn hình và chưa ai tap;
   cứ HINT_EVERY_MS (tính từ đầu lần hiện trước) lại hiện lại cho tới khi người dùng tap. */
const HINT_EVERY_MS = 10000;
const HINT_PLAY_MS = 2600;
const HINT_FIRST_DELAY_MS = 800;

/* ===== Mốc của đoạn exit (0 → 1) ===== */
const FADE_END = 0.3;                    // banner mờ hẳn
const MOVE_A = 0.3, MOVE_B = 0.75;       // điện thoại dịch chỗ
const FINALE_A = 0.4, FINALE_B = 0.8;    // nội dung "Tải ứng dụng" hiện
const HOME_AT = 0.72;
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
   0 → 0.6      : Tap 1 — các chương chạy hết, tag về vị trí cuối (chương CTA)
   0.62 → 0.70  : Tap 2 — tag xoay thêm nửa vòng ra mặt sau có QR
   0.72 → 1     : điện thoại hiện lên, quét, ra kết quả (giữ nguyên ở kết quả suốt đoạn exit) */
const SCENE_END = 0.6;

const CHAPTERS: Chapter[] = [
  {
    range: [0, 0.09],
    side: 'center',
    eyebrow: 'QR Tag · Dành riêng cho thú cưng',
    lines: [{ text: 'Một chiếc tag nhỏ.' }, { text: 'Cả hồ sơ của bé.', accent: true }],
  },
  {
    range: [0.096, 0.21],
    side: 'left',
    eyebrow: 'Mở hộp',
    lines: [{ text: 'Bên trong là một danh tính riêng cho bé của bạn.' }],
  },
  {
    range: [0.216, 0.30],
    side: 'right',
    eyebrow: 'Cất cánh',
    lines: [{ text: 'Từ hộp nhỏ,' }, { text: 'đến cổ bé yêu.', accent: true }],
  },
  { range: [0.312, 0.42], side: 'right', eyebrow: 'Ba điều tạo nên QR Tag', features: true },
  {
    range: [0.432, 0.52],
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
    range: [0.77, 1],
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
    </>
  );
}

export default function ScrollUnboxingHero({ finale }: { finale?: ReactNode }) {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const spinRef = useRef(0);
  const eRef = useRef(0);
  const vpRef = useRef({ w: 1280, h: 800 });
  const stepRef = useRef(0);          // số lần tap đã hoàn tất (0–3)
  const busyRef = useRef(false);      // đang chạy animation → bỏ qua tap
  const aliveRef = useRef(true);
  const ctrlRef = useRef<{ stop: () => void } | null>(null);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
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

  /* Hai "trục thời gian" thay cho scroll:
     vMV (0–1): banner + quét (Tap 1 chạy 0 → SCENE_END, Tap 2 chạy SCENE_END → 1)
     eMV (0–1): đoạn exit (Tap 3) */
  const vMV = useMotionValue(0);
  const eMV = useMotionValue(0);
  const bannerOpacity = useTransform(eMV, [0, FADE_END], [1, 0]);
  const finaleOpacity = useTransform(eMV, [FINALE_A, FINALE_B], [0, 1]);
  const finaleY = useTransform(eMV, [FINALE_A, FINALE_B], [90, 0]); // parallax: nội dung trượt nhẹ từ dưới lên
  const barScale = vMV;

  useMotionValueEvent(vMV, 'change', (v) => {
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
  });

  useMotionValueEvent(eMV, 'change', (e) => {
    eRef.current = e;
    applyPhone(e);
    setSceneOn((prev) => (prev === e < FADE_END + 0.05 ? prev : e < FADE_END + 0.05));
    setFinaleOn((prev) => (prev === e > 0.5 ? prev : e > 0.5));
    setHome((prev) => (prev === e > HOME_AT ? prev : e > HOME_AT));
  });

  /* Một lần tap = chạy đoạn animation kế tiếp */
  const advance = useCallback(() => {
    const s = stepRef.current;
    if (busyRef.current || s >= 3) return;
    busyRef.current = true;
    setBusy(true);
    const ctrl =
      s === 0 ? animate(vMV, SCENE_END, { duration: TAP_SECONDS.open, ease: 'linear' })
      : s === 1 ? (() => {
          // 0.6 → SCAN_HOLD_AT (tốc độ như cũ) → đứng yên SCAN_HOLD_SECONDS → SCAN_HOLD_AT → 1
          const rate = (1 - SCENE_END) / TAP_SECONDS.scan;
          const t1 = (SCAN_HOLD_AT - SCENE_END) / rate;
          const total = TAP_SECONDS.scan + SCAN_HOLD_SECONDS;
          return animate(vMV, [SCENE_END, SCAN_HOLD_AT, SCAN_HOLD_AT, 1], {
            duration: total,
            ease: 'linear',
            times: [0, t1 / total, (t1 + SCAN_HOLD_SECONDS) / total, 1],
          });
        })()
      : animate(eMV, 1, { duration: TAP_SECONDS.exit, ease: 'easeInOut' });
    ctrlRef.current = ctrl;
    ctrl.then(() => {
      if (!aliveRef.current) return;
      stepRef.current = s + 1;
      busyRef.current = false;
      setStep(s + 1);
      setBusy(false);
    });
  }, [vMV, eMV]);

  const onSectionClick = (e: MouseEvent<HTMLElement>) => {
    // Bấm vào link/nút (vd. "Tìm hiểu QR Tag", nút tải app) thì để nó làm việc của nó, không tính là tap chuyển cảnh
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea, [data-no-advance]')) return;
    advance();
  };
  const onSectionKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      if (stepRef.current < 3) e.preventDefault();
      advance();
    }
  };

  // Chỉ dựng nội dung động sau khi vào trình duyệt; đo viewport và đặt đúng vị trí điện thoại
  useEffect(() => {
    aliveRef.current = true;
    const measure = () => {
      vpRef.current = { w: window.innerWidth, h: window.innerHeight };
      applyPhone(eRef.current);
    };
    measure();
    setMounted(true);
    window.addEventListener('resize', measure);
    return () => {
      aliveRef.current = false;
      ctrlRef.current?.stop();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroInView = useInView(containerRef, { margin: '200px 0px 200px 0px' });
  const chapter = active >= 0 ? CHAPTERS[active] : null;
  const canTap = step < 3 && !busy;

  /* ===== GHIM TRANG: cuộn tới hero thì KHOÁ HẲN thanh cuộn (overflow: hidden) cho tới khi tap 3 xong =====
     Cách cũ (chặn sự kiện + kéo trang về bằng scrollTo mỗi lần scroll) bị giật vì trình duyệt cuộn rồi mình lại kéo ngược.
     Cách mới: chạm mốc là canh vị trí đúng MỘT lần rồi khoá overflow trên html + body → không còn cuộn thì không còn giật.
     Cuộn LÊN (lăn chuột lên, ↑/PageUp/Home, vuốt xuống) sẽ mở khoá để quay lại trang trên; cuộn xuống tới hero lần nữa thì khoá lại. */
  const unlockRef = useRef<() => void>(() => {});
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    let locked = false;
    let prev = { h: '', b: '', pr: '' };
    let lastScrollY = window.scrollY;
    let touchStartY = 0;

    const top = () => containerRef.current?.getBoundingClientRect().top ?? Infinity;

    const lock = () => {
      if (locked || stepRef.current >= 3) return;
      const t = top();
      if (!Number.isFinite(t)) return;
      if (t < -window.innerHeight * 0.5) return; // đã ở hẳn bên dưới hero (vd. reload giữa chừng) thì không kéo ngược lên
      // Canh đúng đỉnh hero một lần (instant vì html có scroll-behavior: smooth)
      if (Math.abs(t) > 0.5) window.scrollTo({ top: window.scrollY + t, behavior: 'instant' as ScrollBehavior });
      const sbw = window.innerWidth - html.clientWidth; // bù bề rộng thanh cuộn để trang không bị xô ngang khi ẩn nó
      prev = { h: html.style.overflow, b: body.style.overflow, pr: html.style.paddingRight };
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      if (sbw > 0) html.style.paddingRight = `${sbw}px`;
      locked = true;
      lastScrollY = window.scrollY;
    };
    const unlock = () => {
      if (!locked) return;
      html.style.overflow = prev.h;
      body.style.overflow = prev.b;
      html.style.paddingRight = prev.pr;
      locked = false;
      lastScrollY = window.scrollY;
    };
    unlockRef.current = unlock;

    // Đang cuộn xuống mà hero chạm đỉnh màn hình → khoá
    const onScroll = () => {
      const y = window.scrollY;
      const down = y >= lastScrollY;
      lastScrollY = y;
      if (!locked && down && stepRef.current < 3 && top() <= 2) lock();
    };
    // Lăn chuột: sắp vượt qua đỉnh hero thì dừng đúng đỉnh (không để trình duyệt cuộn lố rồi kéo lại)
    const onWheel = (e: WheelEvent) => {
      if (stepRef.current >= 3) return;
      if (locked) {
        if (e.deltaY < 0) unlock(); // muốn lên → trả cuộn cho trình duyệt
        else e.preventDefault();
        return;
      }
      if (e.deltaY <= 0) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      const t = top();
      if (t <= 2 || t <= dy) {
        if (t <= window.innerHeight) { e.preventDefault(); lock(); }
      }
    };
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0]?.clientY ?? 0; };
    const onTouchMove = (e: TouchEvent) => {
      if (stepRef.current >= 3 || !locked) return;
      const y = e.touches[0]?.clientY ?? touchStartY;
      if (y - touchStartY > 24) unlock();            // vuốt xuống (đọc ngược lên) → mở khoá
      else if (e.cancelable) e.preventDefault();      // vuốt lên (cuộn xuống) → chặn
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (stepRef.current >= 3 || !locked) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) unlock();
      else if (['ArrowDown', 'PageDown', 'End', ' '].includes(e.key)) e.preventDefault();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    onScroll();
    return () => {
      unlock();
      unlockRef.current = () => {};
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  // Tap 3 xong → mở khoá hẳn, trang cuộn bình thường
  useEffect(() => {
    if (step >= 3) unlockRef.current();
  }, [step]);

  /* ===== GỢI Ý TAP: hiện khi hero đang trong màn hình + đang chờ tap; lặp mỗi 10s nếu chưa ai làm gì ===== */
  const hintInView = useInView(containerRef, { amount: 0.6 });
  const [hintShow, setHintShow] = useState(false);
  useEffect(() => {
    if (!mounted || !canTap || !hintInView) {
      setHintShow(false);
      return;
    }
    let t1 = 0;
    let t2 = 0;
    const cycle = (wait: number) => {
      t1 = window.setTimeout(() => {
        setHintShow(true);
        t2 = window.setTimeout(() => {
          setHintShow(false);
          cycle(HINT_EVERY_MS - HINT_PLAY_MS);
        }, HINT_PLAY_MS);
      }, wait);
    };
    cycle(HINT_FIRST_DELAY_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [mounted, canTap, hintInView, step]);

  return (
    <section
      ref={containerRef}
      tabIndex={step < 3 ? 0 : -1}
      onClick={onSectionClick}
      onKeyDown={onSectionKeyDown}
      className={`relative h-[100svh] w-full select-none outline-none ${canTap ? 'cursor-pointer' : ''}`}
      style={{ touchAction: 'manipulation' }}
      aria-label="Giới thiệu QR Tag — chạm để xem tiếp"
    >
      <div className="relative h-full w-full overflow-hidden bg-white">

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

        {/* ===== GỢI Ý TAP: ngón tay chạm 2 lần + gợn sóng (không bắt sự kiện chuột) ===== */}
        <AnimatePresence>
          {hintShow && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[66%] z-40 -ml-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="relative h-20 w-20">
                {[0.84, 1.56].map((d) => (
                  <motion.span
                    key={d}
                    className="absolute left-[14px] top-[2px] h-10 w-10 rounded-full border-2"
                    style={{ borderColor: COLOR.brand, backgroundColor: 'rgba(232,155,90,0.18)' }}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 1.7], opacity: [0.95, 0] }}
                    transition={{ duration: 0.8, delay: d, ease: 'easeOut' }}
                  />
                ))}
                <motion.div
                  className="absolute left-[14px] top-[2px] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: [16, 0, 8, 0, 8, 0, 16], scale: [1, 1, 0.9, 1, 0.9, 1, 1], opacity: [0, 1, 1, 1, 1, 1, 0] }}
                  transition={{ duration: HINT_PLAY_MS / 1000 - 0.2, times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1], ease: 'easeInOut' }}
                >
                  <Pointer size={40} strokeWidth={1.6} fill="#fff" stroke={COLOR.ink} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}