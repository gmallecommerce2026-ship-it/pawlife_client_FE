/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { COLOR, FONT_HEAD } from "@/lib/site";

export function BrandLogo({ size = 32, fontSize = 20 }: { size?: number; fontSize?: number }) {
  return (
    <Link href="/" aria-label="PawLife - Trang chủ" className="flex items-center" style={{ gap: 8, textDecoration: "none" }}>
      <img src="/assets/SvgAsset1.png" alt="Logo PawLife" width={size} height={size} draggable={false} style={{ width: size, height: size, objectFit: "contain" }} />
      <span style={{ fontFamily: FONT_HEAD, fontSize, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1, color: COLOR.ink }}>
        Paw<span style={{ color: COLOR.brand }}>Life</span>
      </span>
    </Link>
  );
}