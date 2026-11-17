"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Hộp quà 3D nhìn từ trên xuống (camera thẳng đứng phía trên).
 * Nắp gắn bản lề ở cạnh xa (phía trên màn hình), mở tối đa 100°.
 * Hình học theo video mẫu: thân hộp màu, lót trắng bên trong, logo đặt thẳng (không xoay) trên nắp và đáy trong.
 *
 * progress: 0 = đóng, 1 = mở hết. Có thể gắn vào cuộn trang hoặc animation ở nơi dùng.
 */
export type InvitationBoxProps = {
  progress: number;
  /** cạnh ngang của hộp (px) */
  size?: number;
  /** màu thân và nắp hộp */
  color?: string;
  /** màu lót bên trong (đáy và mặt dưới nắp) */
  lining?: string;
  /** logo; để trống thì dùng logo mẫu */
  logo?: ReactNode;
};

const OPEN_DEG = 100;

/** Logo mẫu: đĩa trắng và vệt cam cong. Thay bằng logo thật qua prop `logo`. */
export function DefaultBoxLogo({ color = "#F28C28" }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden style={{ display: "block" }}>
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
      <path d="M 30 66 C 36 40, 62 30, 74 40 C 60 42, 48 52, 40 70 Z" fill={color} />
    </svg>
  );
}

const abs: CSSProperties = { position: "absolute" };

export function InvitationBox({ progress, size = 320, color = "#F28C28", lining = "#FBF7F0", logo }: InvitationBoxProps) {
  const p = Math.min(1, Math.max(0, progress));
  const W = size;
  const D = size * 0.96; // chiều sâu
  const H = size * 0.15; // chiều cao thân
  const R = size * 0.06; // bo góc mềm
  const lidDeg = p * OPEN_DEG;
  const logoNode = logo ?? <DefaultBoxLogo color={color} />;

  const logoBox: CSSProperties = {
    ...abs,
    left: "50%",
    top: "50%",
    width: "34%",
    height: "34%",
    transform: "translate(-50%, -50%)",
  };

  // Mặt thân: tâm các mặt nằm ở gốc (0,0,0), đặt bằng translate3d + rotate
  const wallShade = "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.06))";
  const wall = (w: number, h: number, t: string): CSSProperties => ({
    ...abs,
    left: -w / 2,
    top: -h / 2,
    width: w,
    height: h,
    background: `${wallShade}, ${color}`,
    transform: t,
    borderRadius: R * 0.5,
  });

  return (
    <div style={{ position: "relative", width: size, height: size, perspective: 1600 }} role="img" aria-label="Hộp quà">
      {/* bóng đổ dưới hộp, mờ dần khi nắp mở */}
      <div
        aria-hidden
        style={{
          ...abs,
          left: "50%",
          top: "50%",
          width: W * 1.02,
          height: D * 1.02,
          transform: "translate(-50%, -48%) translateZ(-4px)",
          borderRadius: R,
          background: "rgba(40,30,20,0.28)",
          filter: `blur(${size * 0.04}px)`,
          opacity: 1 - p * 0.5,
        }}
      />

      <div style={{ ...abs, left: "50%", top: "50%", width: 0, height: 0, transformStyle: "preserve-3d" }}>
        {/* đáy trong: lót trắng + logo */}
        <div
          style={{
            ...abs,
            left: -W / 2,
            top: -D / 2,
            width: W,
            height: D,
            borderRadius: R,
            background: `radial-gradient(ellipse at 50% 40%, #ffffff, ${lining} 70%)`,
            transform: "translateZ(0.5px)",
          }}
        >
          <div style={logoBox}>{logoNode}</div>
        </div>

        {/* bốn mặt thân */}
        <div style={wall(W, H, `translate3d(0, ${D / 2}px, ${H / 2}px) rotateX(90deg)`)} />
        <div style={wall(W, H, `translate3d(0, ${-D / 2}px, ${H / 2}px) rotateX(90deg)`)} />
        <div style={wall(D, H, `translate3d(${-W / 2}px, 0, ${H / 2}px) rotateY(90deg) rotateZ(90deg)`)} />
        <div style={wall(D, H, `translate3d(${W / 2}px, 0, ${H / 2}px) rotateY(90deg) rotateZ(90deg)`)} />

        {/* nắp: bản lề ở cạnh xa, xoay quanh trục ngang tại mép trên */}
        <div
          style={{
            ...abs,
            left: -W / 2,
            top: -D / 2,
            width: W,
            height: D,
            transformOrigin: "50% 0%",
            transform: `translateZ(${H}px) rotateX(${lidDeg}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* mặt ngoài nắp: màu hộp + logo thẳng */}
          <div
            style={{
              ...abs,
              inset: 0,
              borderRadius: R,
              background: `radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.22), transparent 60%), ${color}`,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 -6px 14px rgba(0,0,0,0.12)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div style={logoBox}>{logoNode}</div>
          </div>
          {/* mặt trong nắp: lót sáng, xoay sẵn để nhìn đúng chiều khi nắp mở */}
          <div
            style={{
              ...abs,
              inset: 0,
              borderRadius: R,
              background: `radial-gradient(ellipse at 50% 60%, #ffffff, ${lining} 75%)`,
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
        </div>
      </div>
    </div>
  );
}
