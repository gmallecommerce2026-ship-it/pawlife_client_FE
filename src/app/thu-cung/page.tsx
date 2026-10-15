'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, MapPin, ChevronLeft } from 'lucide-react';
import axiosClient from '@/lib/api/axiosClient';

type Filters = { province: string; petType: string; gender: string; sterilized: string; age: string; size: string };
const EMPTY: Filters = { province: '', petType: 'All', gender: '', sterilized: '', age: '', size: '' };
const PAGE = 24;

const ageYears = (dob?: string | null) => (dob ? (Date.now() - new Date(dob).getTime()) / 31557600000 : null);
const ageLabel = (dob?: string | null) => {
  if (!dob) return 'Chưa rõ';
  const m = Math.max(0, (Date.now() - new Date(dob).getTime()) / 2629800000);
  const y = Math.floor(m / 12);
  return y > 0 ? `${y} tuổi` : m >= 1 ? `${Math.floor(m)} tháng` : 'Sơ sinh';
};
const norm = (s: string) => s.toLowerCase().replace(/^(tỉnh|thành phố)\s+/i, '').trim();

function FilterModal({ initial, onApply, onClose }: { initial: Filters; onApply: (f: Filters) => void; onClose: () => void }) {
  const [f, setF] = useState<Filters>(initial);
  const [provinces, setProvinces] = useState<string[]>([]);
  const set = (k: keyof Filters, v: string, toggle = false) => setF((s) => ({ ...s, [k]: toggle && s[k] === v ? '' : v }));

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/').then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setProvinces(d.map((p: any) => p.name.replace(/^(Tỉnh|Thành phố)\s+/i, '').trim()).sort((a: string, b: string) => a.localeCompare(b, 'vi')));
    }).catch(() => {});
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const group = (title: string, key: keyof Filters, opts: [string, string][], optional = true) => (
    <div className="mt-5">
      <p className="mb-2.5 text-sm font-semibold text-black">{title} {optional && <span className="font-normal text-[#8E8E93]">(Không bắt buộc)</span>}</p>
      <div className="flex gap-2.5">
        {opts.map(([v, l]) => (
          <button key={v} type="button" onClick={() => set(key, v, optional)}
            className={`flex-1 rounded-full border px-3 py-2.5 text-sm ${f[key] === v ? 'border-[#E89B5A] bg-[#FFF8F3] text-[#E89B5A]' : 'border-[#E5E5E5] bg-white text-black'}`}>{l}</button>
        ))}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-[460px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <p className="text-sm font-semibold text-black">Vị trí</p>
          <button type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button>
        </div>
        <div className="px-6 pb-2">
          <select value={f.province} onChange={(e) => set('province', e.target.value)} className="h-12 w-full rounded-full border border-[#EBEBEB] bg-white px-4 text-sm outline-none focus:border-[#E89B5A]">
            <option value="">Tất cả Tỉnh/Thành phố</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-3">
          {group('Loại thú cưng', 'petType', [['All', '🐾 Tất cả'], ['Cat', '🐈 Mèo'], ['Dog', '🐕 Chó']], false)}
          {group('Giới tính', 'gender', [['Female', '♀ Cái'], ['Male', '♂ Đực']])}
          {group('Triệt sản', 'sterilized', [['Yes', 'Có'], ['No', 'Không']])}
          {group('Tuổi', 'age', [['Baby', 'Bé'], ['Young', 'Trẻ'], ['Adult', 'Lớn'], ['Senior', 'Già']])}
          {group('Kích thước', 'size', [['Small', 'Nhỏ'], ['Medium', 'Vừa'], ['Large', 'To']])}
        </div>
        <div className="flex flex-col gap-1 px-6 pb-4 pt-3">
          <button type="button" onClick={() => { onApply(f); onClose(); }} className="w-full rounded-full bg-[#E89B5A] py-3.5 text-base font-semibold text-white">Áp dụng</button>
          <button type="button" onClick={() => setF(EMPTY)} className="py-3 text-[15px] font-medium text-gray-500 underline">Xoá bộ lọc</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function PetListPage() {
  const [pets, setPets] = useState<any[] | null>(null);
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [showFilter, setShowFilter] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    axiosClient.get('/public/pets', { params: { limit: 500 } })
      .then((r) => setPets(r.data?.data ?? []))
      .catch(() => setPets([]));
  }, []);

  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setVisible(PAGE); }, [dq, filters]);

  const hasFilter = useMemo(() => JSON.stringify(filters) !== JSON.stringify(EMPTY), [filters]);

  const list = useMemo(() => {
    let r = pets ?? [];
    const kw = dq.trim().toLowerCase();
    if (kw) r = r.filter((p) => p.name?.toLowerCase().includes(kw) || p.breed?.toLowerCase().includes(kw));
    if (filters.province) { const t = norm(filters.province); r = r.filter((p) => (p.shelterAddress || '').toLowerCase().includes(t)); }
    if (filters.petType !== 'All') r = r.filter((p) => String(p.species || '').toUpperCase() === filters.petType.toUpperCase());
    if (filters.gender) r = r.filter((p) => String(p.gender || '').toLowerCase() === filters.gender.toLowerCase());
    if (filters.sterilized) r = r.filter((p) => !!p.isSpayedNeutered === (filters.sterilized === 'Yes'));
    if (filters.age) r = r.filter((p) => {
      const y = ageYears(p.dob);
      if (y === null) return false;
      return filters.age === 'Baby' ? y < 1 : filters.age === 'Young' ? y >= 1 && y < 3 : filters.age === 'Adult' ? y >= 3 && y <= 8 : y > 8;
    });
    if (filters.size) r = r.filter((p) => {
      if (p.size) return String(p.size).toUpperCase() === filters.size.toUpperCase();
      const w = Number(p.weight || 0);
      if (!w) return false;
      return filters.size === 'Small' ? w <= 10 : filters.size === 'Medium' ? w > 10 && w <= 25 : w > 25;
    });
    return r;
  }, [pets, dq, filters]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-16">
      <div className="sticky top-0 z-30 -mx-4 bg-white/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Về trang chủ" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"><ChevronLeft size={20} /></Link>
          <div className="flex h-12 flex-1 items-center rounded-full border border-[#EBEBEB] bg-[#F8F8F8] px-4">
            <Search size={18} className="text-[#8E8E93]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên hoặc giống thú cưng..." className="mx-3 flex-1 bg-transparent text-sm text-gray-800 outline-none" />
            {q && <button type="button" onClick={() => setQ('')} aria-label="Xoá"><X size={16} className="text-[#8E8E93]" /></button>}
            <button type="button" onClick={() => setShowFilter(true)} aria-label="Bộ lọc" className={`ml-1 rounded-full p-2 ${hasFilter ? 'bg-[#FFF8F3]' : ''}`}>
              <SlidersHorizontal size={18} className={hasFilter ? 'text-[#E89B5A]' : 'text-[#8E8E93]'} />
            </button>
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-[#111827]">Những bé đang chờ mái ấm</h1>
        {pets && <p className="text-sm text-[#8E8E93]">{list.length} bé phù hợp</p>}
      </div>

      {pets === null ? (
        <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-3xl bg-gray-100" />)}</div>
      ) : list.length === 0 ? (
        <p className="py-20 text-center text-gray-400">Không tìm thấy bé nào phù hợp</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-4 md:grid-cols-3 lg:grid-cols-4">
            {list.slice(0, visible).map((p) => {
              const g = String(p.gender || '').toLowerCase();
              return (
                <Link key={p.id} href={`/thu-cung/${p.id}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100">
                    <img src={p.image || '/assets/piglet.png'} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    {p.shelterName && (
                      <span className="absolute left-2.5 top-2.5 flex max-w-[85%] items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
                        <MapPin size={10} /><span className="truncate">{p.shelterName}</span>
                      </span>
                    )}
                  </div>
                  <div className="pt-3">
                    <p className="truncate text-base font-semibold text-black">{p.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[#8E8E93]">
                      <span className={g.startsWith('f') ? 'text-pink-400' : 'text-blue-400'}>{g.startsWith('f') ? '♀' : g.startsWith('m') ? '♂' : ''}</span> {ageLabel(p.dob)} · {p.breed || 'Chưa rõ giống'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          {visible < list.length && (
            <div className="mt-10 text-center">
              <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="rounded-full border border-[#E89B5A] px-8 py-3 text-sm font-bold text-[#E89B5A] transition hover:bg-[#FFF8F3]">Xem thêm</button>
            </div>
          )}
        </>
      )}
      {showFilter && <FilterModal initial={filters} onApply={setFilters} onClose={() => setShowFilter(false)} />}
    </div>
  );
}