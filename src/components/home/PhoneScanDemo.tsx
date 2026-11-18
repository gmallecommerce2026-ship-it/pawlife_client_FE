'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/home/PhoneScanDemo.tsx
// iPhone giả lập: màn hình Scan (giống scan.tsx) → nhận diện → màn Scanned Pet (giống scanned-pet.tsx).
// Màn hình được dựng ở kích thước thiết kế 390×844 rồi scale cho vừa khung, nên mọi số đo px đều lấy từ app RN.

import { type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { AlertCircle, BatteryFull, Check, ChevronLeft, Signal, Wifi, X, Zap } from 'lucide-react';

import dynamic from 'next/dynamic';

const PhoneCamScene = dynamic(() => import('./UnboxingScene').then((m) => m.PhoneCamScene), { ssr: false });

export type DemoStage = 'off' | 'enter' | 'scan' | 'locked' | 'result';

/* ===== Chỉnh nội dung demo ở đây ===== */
const PET = {
    name: 'Mochi',
    image: '/assets/piglet.png', // đổi sang ảnh thú cưng đẹp hơn nếu có
    gender: 'female',
    breed: 'Heo cảnh',
    color: 'hồng',
    birthday: '12 tháng 3, 2024',
};
const TAG_URL = 'https://pawlife.vn/t/PL-00017';

const BRAND = '#E89B5A';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const SCREEN_W = 390;
export const SCREEN_H = 844;
export const BEZEL = 7;
const BOX = 288; // khung quét (giống BOX_SIZE trong scan.tsx)
const BOX_X = (SCREEN_W - BOX) / 2;
const BOX_Y = (SCREEN_H - BOX) / 2;
const PW = 256; // bề ngang màn hình điện thoại ở kích thước gốc
const PH = (PW * SCREEN_H) / SCREEN_W;
export const PHONE_OUT_W = PW + BEZEL * 2; // khung ngoài (dùng làm kích thước "ô" ở phần Tải ứng dụng)
export const PHONE_OUT_H = Math.round(PH + BEZEL * 2);



const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/* ---------------- Màn hình Scan ---------------- */
function ScanScreen({ stage }: { stage: DemoStage }) {
    const locked = stage === 'locked';
    return (
        <motion.div
            className="absolute inset-0 bg-black"
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.35 }}
        >
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.15, filter: 'blur(14px)' }}
                animate={{
                    opacity: 1,
                    scale: stage === 'enter' ? 1.08 : 1,
                    filter: stage === 'enter' ? 'blur(7px)' : 'blur(0px)', // mờ rồi lấy nét như camera thật
                }}
                transition={{ duration: 1.3, ease: EASE }}
            >
                <PhoneCamScene />
            </motion.div>

            {/* Lớp tối có lỗ khoét bo góc (y hệt Mask trong scan.tsx) */}
            <svg width={SCREEN_W} height={SCREEN_H} className="pointer-events-none absolute inset-0">
                <defs>
                    <mask id="pl-demo-mask" x="0" y="0" width="100%" height="100%">
                        <rect width="100%" height="100%" fill="#fff" />
                        <rect x={BOX_X} y={BOX_Y} width={BOX} height={BOX} rx={24} ry={24} fill="#000" />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#pl-demo-mask)" />
            </svg>

            {/* Pill "Cách quét" */}
            <div className="absolute left-0 right-0 flex justify-center" style={{ top: BOX_Y - 64 }}>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-5 py-2.5">
                    <AlertCircle size={16} color="#fff" />
                    <span className="text-[15px] font-medium text-white">Cách quét</span>
                </div>
            </div>

            {/* Khung quét: 4 góc cam + tia laser */}
            <motion.div
                className="absolute overflow-hidden"
                style={{ top: BOX_Y, left: BOX_X, width: BOX, height: BOX, borderRadius: 24 }}
                animate={{ scale: locked ? [1, 0.94, 1] : 1 }}
                transition={{ duration: 0.45, ease: EASE }}
            >
                {(
                    [
                        ['top', 'left'],
                        ['top', 'right'],
                        ['bottom', 'left'],
                        ['bottom', 'right'],
                    ] as const
                ).map(([v, h]) => (
                    <motion.span
                        key={v + h}
                        className="absolute"
                        style={
                            {
                                [v]: 0,
                                [h]: 0,
                                width: 64,
                                height: 64,
                                borderStyle: 'solid',
                                borderWidth: 0,
                                [`border${cap(v)}Width`]: 4,
                                [`border${cap(h)}Width`]: 4,
                                [`border${cap(v)}${cap(h)}Radius`]: 24,
                            } as CSSProperties
                        }
                        animate={{ borderColor: locked ? '#FFFFFF' : BRAND }}
                        transition={{ duration: 0.25 }}
                    />
                ))}
                <motion.div
                    className="absolute left-0 top-0 h-[2px] w-full opacity-90"
                    style={{ backgroundColor: BRAND, boxShadow: '0 0 12px 2px rgba(251,146,60,.8)' }}
                    animate={locked ? { opacity: 0 } : { y: [0, BOX - 4, 0], opacity: 0.9 }}
                    transition={locked ? { duration: 0.2 } : { duration: 3, ease: 'easeInOut', repeat: Infinity }}
                />
            </motion.div>

            {/* Chớp trắng khi nhận diện */}
            {locked && (
                <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 0.55 }}
                />
            )}

            {/* Dòng hướng dẫn */}
            <div className="absolute left-0 right-0 flex justify-center px-[60px]" style={{ top: BOX_Y + BOX + 40 }}>
                <p className="text-center text-[15px] leading-relaxed text-gray-300">
                    {locked ? 'Đã nhận diện mã QR…' : 'Đưa mã QR vào giữa khung hình để tự động quét'}
                </p>
            </div>

            {/* Nút quay lại */}
            <div className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-black/50" style={{ top: 67, left: 24 }}>
                <ChevronLeft size={24} color="#fff" />
            </div>

            {/* Nút flash dạng kính */}
            <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: 58 }}>
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md"
                    style={{ background: 'rgba(255,255,255,0.10)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.7)' }}
                >
                    <Zap size={26} color="#fff" />
                </div>
            </div>
        </motion.div>
    );
}

/* ---------------- Màn hình Scanned Pet (trạng thái an toàn) ---------------- */
const Rise = ({ i, children, className, style }: { i: number; children: React.ReactNode; className?: string; style?: CSSProperties }) => (
    <motion.div
        className={className}
        style={style}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: EASE }}
    >
        {children}
    </motion.div>
);

function ResultScreen() {
    const label = 'text-[16px] font-medium text-black mb-[12.5px]';
    const value = 'text-[14px] text-[#8E8E93] capitalize';
    return (
        <motion.div
            className="absolute inset-0 overflow-hidden bg-white"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.65, ease: EASE }}
        >
            {/* nút đóng */}
            <div className="absolute flex h-8 w-8 items-center justify-center" style={{ top: 48, right: 24 }}>
                <X size={14} color="#111" />
            </div>

            <div style={{ paddingTop: 80 }}>
                {/* Ảnh hero */}
                <Rise i={0} className="px-6 pt-4">
                    <div className="rounded-[32px] bg-white" style={{ boxShadow: '4px 4px 5px rgba(0,0,0,0.25)' }}>
                        <div className="relative h-[210px] w-full overflow-hidden rounded-[24px] bg-gray-200">
                            <img src={PET.image} alt={PET.name} className="h-full w-full object-cover" />
                            <div className="absolute bottom-2 flex w-full items-center justify-center">
                                {[0, 1, 2].map((d) => (
                                    <span key={d} className="mx-[2px] h-[5px] rounded-full" style={{ width: d === 0 ? 14 : 5, backgroundColor: d === 0 ? BRAND : 'rgba(255,255,255,.7)' }} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="py-5 text-center text-[24px] font-medium text-gray-800">Bé {PET.name} nè!</p>
                </Rise>

                {/* Thông tin */}
                <Rise i={1} className="px-5">
                    <div className="mx-auto w-fit rounded-[16px] border border-[#D9D9D9] bg-white px-7 pb-9 pt-5">
                        <div className="mb-7 flex justify-between gap-6">
                            <div className="w-1/2">
                                <p className={label}>Giới tính</p>
                                <p className={value}>{PET.gender === 'female' ? 'cái' : 'đực'}</p>
                            </div>
                            <div className="w-1/2">
                                <p className={label}>Giống</p>
                                <p className={value}>{PET.breed}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                            <div className="w-1/2">
                                <p className={label}>Màu sắc</p>
                                <p className={value}>{PET.color}</p>
                            </div>
                            <div className="w-1/2">
                                <p className={label}>Ngày sinh</p>
                                <p className={value}>{PET.birthday}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative -top-5 mx-auto w-4/5 rounded-full border border-[#D9D9D9] bg-[#FAFAFA] px-2.5 py-[6px] text-center text-[14px] leading-5 text-[#757575]">
                        {PET.name} đang an toàn
                    </div>
                </Rise>

                <Rise i={2} className="-mt-4 px-5">
                    <div className="mt-5 w-full rounded-[16px] border border-[#D9D9D9] bg-[#FAFAFA] px-9 py-[13px] text-center text-[14px] leading-6 text-[#757575]">
                        Vì lý do bảo mật, thông tin liên hệ của chủ nhân chỉ hiển thị khi thú cưng bị báo mất.
                    </div>
                    <p className="pb-4 pt-4 text-center text-[14px] text-[#8E8E93] underline">Có gì đó không đúng? Báo cáo tại đây</p>
                </Rise>
            </div>
        </motion.div>
    );
}

/* ---------------- Khung iPhone ---------------- */
const ISLAND_W: Record<DemoStage, number> = { off: 126, enter: 126, scan: 176, locked: 196, result: 126 };

export default function PhoneScanDemo({ stage }: { stage: DemoStage }) {
    const pw = PW;
    const ph = PH;
    const scale = pw / SCREEN_W;
    const on = stage !== 'off';
    const showResult = stage === 'result';
    const screenR = 48 * scale;
    const outerR = screenR + BEZEL;

    return (
        <div
            className="pointer-events-none relative"
            style={{ perspective: 1200, width: PHONE_OUT_W, height: PHONE_OUT_H }}
        >
            <AnimatePresence>
                {on && (
                    <motion.div
                        key="phone"
                        className="relative"
                        style={{ width: pw + BEZEL * 2, height: ph + BEZEL * 2 }}
                        initial={{ opacity: 0, y: 90, scale: 0.8, rotateX: 28, filter: 'blur(14px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                        exit={{ opacity: 0, y: -40, scale: 0.92, filter: 'blur(10px)' }}
                        transition={{ duration: 0.9, ease: EASE }}
                    >
                        {/* Quầng sáng cam phía sau */}
                        <div
                            className="absolute -z-10"
                            style={{ inset: '-35%', background: 'radial-gradient(closest-side, rgba(232,155,90,.55), rgba(232,155,90,0))' }}
                        />
                        {/* Sóng lan ra khi điện thoại hiện */}
                        {[0, 1].map((i) => (
                            <motion.span
                                key={i}
                                className="absolute inset-0 border-2"
                                style={{ borderRadius: outerR, borderColor: BRAND }}
                                initial={{ opacity: 0.55, scale: 0.92 }}
                                animate={{ opacity: 0, scale: 1.4 }}
                                transition={{ duration: 1.4, delay: 0.35 + i * 0.3, ease: 'easeOut' }}
                            />
                        ))}

                        {/* Thân máy */}
                        <div
                            className="absolute inset-0"
                            style={{
                                borderRadius: outerR,
                                background: 'linear-gradient(145deg,#2c2c30,#0b0b0d)',
                                boxShadow: '0 40px 80px -20px rgba(40,22,10,.65), inset 0 0 0 1.5px rgba(255,255,255,.18), inset 0 0 0 5px #050506',
                            }}
                        />
                        {/* Nút bên hông */}
                        <span className="absolute -left-[2px] rounded-l bg-[#1a1a1d]" style={{ top: ph * 0.2, width: 3, height: ph * 0.05 }} />
                        <span className="absolute -left-[2px] rounded-l bg-[#1a1a1d]" style={{ top: ph * 0.28, width: 3, height: ph * 0.08 }} />
                        <span className="absolute -right-[2px] rounded-r bg-[#1a1a1d]" style={{ top: ph * 0.27, width: 3, height: ph * 0.12 }} />

                        {/* Màn hình */}
                        <div className="absolute overflow-hidden bg-black" style={{ top: BEZEL, left: BEZEL, width: pw, height: ph, borderRadius: screenR }}>
                            <div className="relative overflow-hidden" style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                                <AnimatePresence initial={false}>
                                    {showResult ? <ResultScreen key="result" /> : <ScanScreen key="scan" stage={stage} />}
                                </AnimatePresence>

                                {/* Thanh trạng thái */}
                                <motion.div
                                    className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-10"
                                    style={{ height: 54, paddingTop: 6 }}
                                    animate={{ color: showResult ? '#000000' : '#FFFFFF' }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <span className="pl-3 text-[17px] font-semibold">9:41</span>
                                    <span className="flex items-center gap-1.5 pr-1">
                                        <Signal size={17} />
                                        <Wifi size={17} />
                                        <BatteryFull size={24} />
                                    </span>
                                </motion.div>

                                {/* Dynamic Island: giãn ra khi quét */}
                                <motion.div
                                    className="absolute z-50 flex items-center justify-center overflow-hidden rounded-full bg-black"
                                    style={{ top: 11, left: '50%', x: '-50%', height: 37 }}
                                    animate={{ width: ISLAND_W[stage] }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {stage === 'scan' || stage === 'enter' ? (
                                            <motion.span key="scan" className="flex items-center gap-2 text-[12px] font-medium text-white" initial={{ opacity: 0 }} animate={{ opacity: stage === 'scan' ? 1 : 0 }} exit={{ opacity: 0 }}>
                                                <motion.i className="block h-2 w-2 rounded-full" style={{ backgroundColor: BRAND }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                                                Đang quét…
                                            </motion.span>
                                        ) : stage === 'locked' ? (
                                            <motion.span key="locked" className="flex items-center gap-1.5 text-[12px] font-medium text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <Check size={13} color={BRAND} strokeWidth={3} />
                                                Đã nhận diện
                                            </motion.span>
                                        ) : null}
                                    </AnimatePresence>
                                    <span className="absolute right-[14px] h-[10px] w-[10px] rounded-full bg-[#10131c]" />
                                </motion.div>

                                {/* Home indicator */}
                                <motion.div
                                    className="absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-full"
                                    animate={{ backgroundColor: showResult ? '#111111' : '#FFFFFF' }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}