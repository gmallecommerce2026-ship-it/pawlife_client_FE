// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pawlife.vn";
const TITLE = "PawLife - Pet ID | Nhận nuôi thú cưng & thẻ QR định danh";
const DESC =
  "PawLife kết nối trạm cứu hộ với gia đình yêu động vật: nhận nuôi có trách nhiệm, thẻ QR định danh, hồ sơ PawHistory và chế độ báo lạc miễn phí.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE, // các trang con đã tự ghi "| PawLife" nên không cần template
  description: DESC,
  applicationName: "PawLife",
  itunes: { appId: "6760687982" }, // Next tự sinh thẻ apple-itunes-app
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "PawLife",
    url: SITE_URL,
    title: TITLE,
    description: DESC,
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }], // TODO: tạo ảnh này
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F09E5B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className={`${beVietnamPro.className} font-sans antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}