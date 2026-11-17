// src/lib/publicShelters.ts
// Gọi API shelter công khai (không cần đăng nhập). Dữ liệu thật từ backend.
import axiosClient from '@/lib/api/axiosClient';

export interface PublicShelterPet {
  id: string;
  name: string;
  gender?: string | null;
  dob?: string | null;
  breed?: any;
  species?: any;
  size?: string | null;
  weight?: number | null;
  images?: { url: string }[];
}

export interface PublicShelter {
  id: string;
  name: string;
  address: string;
  contactInfo?: string | null;
  emailAddress?: string | null;
  shelterType?: string | null;
  bio?: string | null;
  description?: string | null;
  policy?: string | null;
  website?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  isVerified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
  adoptedCount?: number;
  _count?: { pets: number };
  pets?: PublicShelterPet[];
}

/** Chuỗi song ngữ {vi, en} hoặc chuỗi thường → chuỗi hiển thị */
export const bilingual = (v: any): string => (!v ? '' : typeof v === 'string' ? v : v.vi || v.en || '');

/** Cùng cách hiển thị tuổi với trang /thu-cung */
export const petAgeLabel = (dob?: string | null) => {
  if (!dob) return 'Chưa rõ';
  const m = Math.max(0, (Date.now() - new Date(dob).getTime()) / 2629800000);
  const y = Math.floor(m / 12);
  return y > 0 ? `${y} tuổi` : m >= 1 ? `${Math.floor(m)} tháng` : 'Sơ sinh';
};

export const shelterSince = (s: PublicShelter) => new Date(s.verifiedAt || s.createdAt).getFullYear();

export const shelterCover = (s: PublicShelter) => s.coverUrl || s.avatarUrl || null;

export async function fetchShelters(): Promise<PublicShelter[]> {
  const res = await axiosClient.get('/shelters', { params: { limit: 50 } });
  return res.data?.data ?? [];
}

export async function fetchShelter(id: string): Promise<PublicShelter> {
  const res = await axiosClient.get(`/shelters/${id}`);
  return res.data;
}
