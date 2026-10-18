export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pawlife.vn";
export const IOS_APP_URL = "https://apps.apple.com/vn/app/pawlife-pet-id/id6760687982";
export const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.annguyen.pawlife&hl=en";

export const ROUTES = {
  home: "/",
  scan: "/scan",
  qrShop: "/the-qr",
  pets: "/thu-cung",
  shelters: "/tram-cuu-ho",
  stories: "/cau-chuyen",
  contact: "/lien-he",
  support: "/ho-tro",
  deleteAccount: "/xoa-tai-khoan",
  privacy: "/chinh-sach-bao-mat",
  terms: "/dieu-khoan",
};

export const CONTACT = {
  phone: "0901 234 567",
  phoneHref: "tel:+84901234567",
  email: "hello@pawlife.vn",
  privacyEmail: "privacy@pawlife.vn", // TODO: tạo hộp thư riêng cho yêu cầu dữ liệu
  address: "Quận 1, TP. Hồ Chí Minh",
  hours: "8:00 – 18:00, Thứ 2 – Thứ 7",
};

export const SOCIALS = {
  facebook: "https://facebook.com/pawlife.vn",
  instagram: "https://instagram.com/pawlife.vn",
};

export const COLOR = {
  brand: "#F09E5B",
  brandSoft: "#FFF4EA",
  purple: "#9B7EFA",
  ink: "#111827",
  body: "#4B5563",
  muted: "#6B7280",
  faint: "#9CA3AF",
  line: "#F3F4F6",
  border: "#E5E7EB",
};

export const FONT_HEAD = "'Be Vietnam Pro', sans-serif";
export const FONT_BODY = "'Inter', 'Be Vietnam Pro', sans-serif";
export const HEADER_HEIGHT = 76;
export const LEGAL_UPDATED = "18/10/2026";