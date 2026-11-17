"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Hộp quà 3D (CSS 3D), nhìn từ trên xuống và nghiêng nhẹ để thấy độ dày thành hộp.
 *
 * Kích thước thật: hộp vuông 8 cm × 8 cm, thành dày 1 cm (tức chiều cao thân = size / 8).
 * Nắp có gờ cạnh thò xuống (lòi ra ở mặt dưới nắp) để gài vào thân khi đóng.
 * Màu nắp và thân dùng chung một màu phẳng, không tô bóng theo hướng sáng,
 * để mặt trên không bị lệch sắc so với các mặt còn lại.
 *
 * progress: 0 = đóng, 1 = mở hết (nắp lật 100° quanh bản lề ở cạnh xa).
 */
export type InvitationBoxProps = {
  progress: number;
  /** cạnh ngang (= cạnh dọc) của hộp, px. Tương ứng 8 cm */
  size?: number;
  /** màu thân và nắp hộp */
  color?: string;
  /** màu lót bên trong (đáy, thành trong và mặt trong nắp) */
  lining?: string;
  /** logo; để trống thì dùng logo mẫu */
  logo?: ReactNode;
  /** góc nghiêng nhìn từ phía trước-trên (độ), để thấy thành hộp */
  tilt?: number;
  /** đường kính lõm tròn ở giữa đáy, theo tỉ lệ với cạnh hộp (0 = không có lõm) */
  recessRatio?: number;
  /** chữ in trên mặt nắp: góc trên trái, góc trên phải, dòng mô tả dưới logo */
  brandName?: string;
  productName?: string;
  tagline?: string;
};

const OPEN_DEG = 100;
/** Hộp 8 cm, thành 1 cm: tỉ lệ chiều cao thân / cạnh */
const WALL_RATIO = 1 / 8;
/** Gờ cạnh của nắp thò xuống, khoảng 0.35 cm */
const SKIRT_RATIO = 0.35 / 8;
/** Gờ nằm lùi vào trong một chút so với mép ngoài, khoảng 0.12 cm */
const SKIRT_INSET_RATIO = 0.12 / 8;

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
const ONE_SIDED: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

export function InvitationBox({
  progress,
  size = 320,
  color = "#E89B5A",
  lining = "#FFFDF9",
  logo,
  tilt = 30,
  recessRatio = 0,
  brandName = "PawLife",
  productName = "Pet QR Tag",
  tagline = "The QR tag dành cho thú cưng",
}: InvitationBoxProps) {
  const p = Math.min(1, Math.max(0, progress));
  const W = size;
  const D = size; // vuông
  const H = size * WALL_RATIO; // chiều cao thành
  const SK = size * SKIRT_RATIO; // chiều sâu gờ nắp
  const IN = size * SKIRT_INSET_RATIO; // độ lùi gờ vào trong
  const lidDeg = p * OPEN_DEG;
  const logoNode = logo ?? <DefaultBoxLogo color={color} />;
  const RD = size * recessRatio; // đường kính lõm
  const hasRecess = RD > 0;
  /* Độ dày bìa 2 mm (hộp 8 cm), khe gập, và hai tai ghim ở hai cạnh nắp */
  const T = size * 0.025;
  const CREASE = Math.max(1.5, T * 0.5);
  const EAR_W = size * 0.1;
  const creaseBg = "linear-gradient(to bottom, rgba(120,55,15,0.5), rgba(255,255,255,0.35))";
  const faceText = (x: CSSProperties): CSSProperties => ({ ...abs, color: "#FFFFFF", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap", ...x });
  /* Lỗ khoét ở mặt trong nắp, giữa cạnh gấp phía trước: nửa hình tròn có lớp nhựa trong */
  const lidInner = (
    <div
      aria-hidden
      style={{
        ...abs,
        left: "50%",
        bottom: 0,
        width: size * 0.1,
        height: size * 0.05,
        transform: "translateX(-50%)",
        borderRadius: `${size * 0.05}px ${size * 0.05}px 0 0`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(225,225,225,0.5))",
        boxShadow: "inset 0 0 0 1px rgba(60,40,20,0.2)",
      }}
    />
  );
  /* Mặt ngoài nắp: chữ, khe gập ở bản lề và ở cạnh gấp phía trước */
  const lidFace = (
    <>
      <div aria-hidden style={{ ...abs, left: 0, top: 0, width: W, height: CREASE, background: creaseBg }} />
      <div aria-hidden style={{ ...abs, left: 0, top: D - IN, width: W, height: CREASE, background: creaseBg }} />
      <div style={faceText({ left: size * 0.06, top: size * 0.05, fontSize: size * 0.034, fontWeight: 500, letterSpacing: "0.02em" })}>{brandName}</div>
      <div style={faceText({ right: size * 0.06, top: size * 0.055, fontSize: size * 0.027, fontWeight: 400, letterSpacing: "0.02em" })}>{productName}</div>
      <div style={faceText({ left: 0, right: 0, bottom: size * 0.05, textAlign: "center", fontSize: size * 0.02, fontWeight: 400, opacity: 0.85 })}>{tagline}</div>
    </>
  );

  const logoBox: CSSProperties = {
    ...abs,
    left: "50%",
    top: "50%",
    width: "34%",
    height: "34%",
    transform: "translate(-50%, -50%)",
  };

  /* Một mặt phẳng đặt tâm tại gốc, sau đó dịch/xoay bằng `t`. */
  const plane = (w: number, h: number, t: string, bg: string, extra?: CSSProperties): CSSProperties => ({
    ...abs,
    left: -w / 2,
    top: -h / 2,
    width: w,
    height: h,
    background: bg,
    transform: t,
    ...extra,
  });

  /* Mặt có hai phía: ngoài (màu hộp) và trong (lót). Cùng vị trí, mặt trong lật ngược pháp tuyến. */
  const panel = (w: number, h: number, t: string, outer: CSSProperties, inner: CSSProperties, children?: ReactNode, innerChildren?: ReactNode) => (
    <>
      <div style={plane(w, h, t, color, { ...ONE_SIDED, ...outer })}>{children}</div>
      <div style={plane(w, h, `${t} rotateY(180deg)`, lining, { ...ONE_SIDED, ...inner })}>{innerChildren}</div>
    </>
  );

  return (
    <div style={{ position: "relative", width: size, height: size, perspective: 2400 }} role="img" aria-label="Hộp quà">
      {/* bóng đổ dưới hộp, mờ dần khi nắp mở */}
      <div
        aria-hidden
        style={{
          ...abs,
          left: "50%",
          top: "50%",
          width: W * 1.04,
          height: D * 1.04,
          transform: "translate(-50%, -50%) translateZ(-4px)",
          borderRadius: size * 0.02,
          background: "rgba(40,30,20,0.3)",
          filter: `blur(${size * 0.04}px)`,
          opacity: 1 - p * 0.5,
        }}
      />

      {/* Gốc hộp: nghiêng để thấy thành, giữ nguyên vị trí tâm */}
      <div
        style={{
          ...abs,
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt}deg)`,
        }}
      >
        {/* Đáy trong: lót trắng, logo đặt thẳng */}
        <div
          style={plane(W, D, "translateZ(0.5px)", lining, {
            background: `radial-gradient(ellipse at 50% 40%, #ffffff, ${lining} 70%)`,
          })}
        >
          {hasRecess ? (
            /* Lõm tròn vừa khít vòng: đáy lõm hơi tối, mép trong có bóng để nhìn như bị đào xuống */
            <div
              aria-hidden
              style={{
                ...abs,
                left: "50%",
                top: "50%",
                width: RD,
                height: RD,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: "radial-gradient(circle at 50% 42%, #F3EBE1, #E9DDCF 80%)",
                boxShadow: "inset 0 2px 3px rgba(60,40,20,0.28), inset 0 0 0 1px rgba(60,40,20,0.06)",
              }}
            />
          ) : (
            <div style={logoBox}>{logoNode}</div>
          )}
        </div>

        {/* Bốn thành ngoài, dày H (1 cm). Mặt ngoài màu hộp, mặt trong màu lót. */}
        {panel(W, H, `translate3d(0, ${D / 2}px, ${H / 2}px) rotateX(-90deg)`, {}, { background: lining })}
        {panel(W, H, `translate3d(0, ${-D / 2}px, ${H / 2}px) rotateX(90deg)`, {}, { background: lining })}
        {panel(D, H, `translate3d(${-W / 2}px, 0, ${H / 2}px) rotateY(-90deg) rotateZ(90deg)`, {}, { background: color })}
        {panel(D, H, `translate3d(${W / 2}px, 0, ${H / 2}px) rotateY(90deg) rotateZ(90deg)`, {}, { background: color })}

        {/* Viền đỉnh thành hộp: bìa dày 2 mm, cùng màu cam */}
        <div style={plane(W, T, `translate3d(0, ${D / 2 - T / 2}px, ${H + 0.5}px)`, color, {})} />
        <div style={plane(W, T, `translate3d(0, ${-D / 2 + T / 2}px, ${H + 0.5}px)`, color, {})} />
        <div style={plane(T, D, `translate3d(${-W / 2 + T / 2}px, 0, ${H + 0.5}px)`, color, {})} />
        <div style={plane(T, D, `translate3d(${W / 2 - T / 2}px, 0, ${H + 0.5}px)`, color, {})} />

        {/* Nắp: bản lề ở cạnh xa (y âm), mở 0 → 100° quanh trục ngang. Gốc nắp đặt tại bản lề, ở độ cao H. */}
        <div
          style={{
            ...abs,
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `translate3d(0, ${-D / 2}px, ${H}px) rotateX(${lidDeg}deg)`,
          }}
        >
          {/* Mặt nắp: tâm đặt ở nửa sau nắp (y = +D/2 từ bản lề) */}
          {panel(
            W,
            D,
            `translate3d(0, ${D / 2}px, 0)`,
            {},
            { background: `radial-gradient(ellipse at 50% 60%, #ffffff, ${lining} 75%)` },
            lidFace,
            lidInner,
          )}
          {/* Logo nằm trên mặt ngoài nắp, đặt thẳng */}
          <div
            style={plane(W, D, `translate3d(0, ${D / 2}px, 0.5px)`, "transparent", {
              ...ONE_SIDED,
              background: "transparent",
            })}
          >
            <div style={logoBox}>{logoNode}</div>
          </div>

          {/* Mép ngoài nắp dày 2 mm */}
          {panel(W, T, `translate3d(0, ${D}px, ${-T / 2}px) rotateX(-90deg)`, {}, { background: lining })}
          {panel(D, T, `translate3d(${-W / 2}px, ${D / 2}px, ${-T / 2}px) rotateY(-90deg) rotateZ(90deg)`, {}, { background: color })}
          {panel(D, T, `translate3d(${W / 2}px, ${D / 2}px, ${-T / 2}px) rotateY(90deg) rotateZ(90deg)`, {}, { background: color })}
          {/* Hai tai ghim ở hai cạnh nắp, bám ra ngoài thành hộp và chạy xuống theo chiều cao hộp */}
          {/* Hai tai ghim: nối vào đầu cạnh gấp trước, bè ra hai bên, hạ xuống theo chiều cao hộp */}
          {panel(EAR_W, H, `translate3d(${-(W / 2 - IN + EAR_W / 2)}px, ${D - IN}px, ${-H / 2}px) rotateX(-90deg)`, {}, { background: color })}
          {panel(EAR_W, H, `translate3d(${W / 2 - IN + EAR_W / 2}px, ${D - IN}px, ${-H / 2}px) rotateX(-90deg)`, {}, { background: color })}

          {/* Gờ cạnh nắp thò xuống để gài vào thân khi đóng (4 cạnh) */}
          {panel(W - 2 * IN, SK, `translate3d(0, ${D - IN}px, ${-SK / 2}px) rotateX(-90deg)`, {}, { background: lining })}
          {panel(W - 2 * IN, SK, `translate3d(0, ${IN}px, ${-SK / 2}px) rotateX(90deg)`, {}, { background: lining })}
          {panel(D - 2 * IN, SK, `translate3d(${-(W / 2 - IN)}px, ${D / 2}px, ${-SK / 2}px) rotateY(-90deg) rotateZ(90deg)`, {}, { background: color })}
          {panel(D - 2 * IN, SK, `translate3d(${W / 2 - IN}px, ${D / 2}px, ${-SK / 2}px) rotateY(90deg) rotateZ(90deg)`, {}, { background: color })}
        </div>
      </div>
    </div>
  );
}