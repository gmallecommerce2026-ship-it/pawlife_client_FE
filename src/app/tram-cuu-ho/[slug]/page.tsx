'use client';
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BadgeCheck, ChevronLeft, MapPin, Search, X, Mail, Phone, ShieldCheck, Mars, Venus } from 'lucide-react';
import { fetchShelter, bilingual, petAgeLabel, shelterCover, PublicShelter } from '@/lib/publicShelters';

type Tab = 'pets' | 'info';
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');

export default function ShelterProfilePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  // Mở từ trang chủ (?from=home) thì nút back về thẳng trang chủ, còn lại về danh sách trạm
  const { from } = React.use(searchParams);
  const backHref = from === 'home' ? '/' : '/tram-cuu-ho';
  const backLabel = from === 'home' ? 'Về trang chủ' : 'Về danh sách trạm';
  // undefined = đang tải, null = không tìm thấy
  const [shelter, setShelter] = useState<PublicShelter | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('pets');
  const [q, setQ] = useState('');

  useEffect(() => {
    let alive = true;
    setShelter(undefined);
    fetchShelter(slug)
      .then((s) => alive && setShelter(s))
      .catch(() => alive && setShelter(null));
    return () => { alive = false; };
  }, [slug]);

  // Link cũ dạng /tram-cuu-ho/<uuid> hoặc slug đã đổi -> chuyển về slug chuẩn
  useEffect(() => {
    if (shelter && shelter.slug && shelter.slug !== slug) {
      router.replace(`/tram-cuu-ho/${shelter.slug}${from ? `?from=${from}` : ''}`);
    }
  }, [shelter, slug, from, router]);

  const pets = useMemo(() => {
    const all = shelter?.pets ?? [];
    const kw = q.trim().toLowerCase();
    if (!kw) return all;
    return all.filter((p) => p.name?.toLowerCase().includes(kw) || bilingual(p.breed).toLowerCase().includes(kw));
  }, [shelter, q]);

  if (shelter === undefined) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6">
        <div className="aspect-[2/1] max-h-[340px] w-full animate-pulse rounded-3xl bg-gray-100 sm:aspect-[3/1]" />
        <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (shelter === null) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 py-24 text-center">
        <p className="text-lg font-semibold text-[#111827]">Không tìm thấy trạm cứu hộ này</p>
        <Link href="/tram-cuu-ho" className="mt-4 rounded-full border border-[#E89B5A] px-6 py-2.5 text-sm font-bold text-[#E89B5A]">Xem tất cả trạm</Link>
      </div>
    );
  }

  const cover = shelterCover(shelter);
  const petCount = shelter._count?.pets ?? shelter.pets?.length ?? 0;
  const description = shelter.description || shelter.bio || '';

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-16">
      <div className="sticky top-0 z-30 -mx-4 flex items-center gap-3 bg-white/95 px-4 pb-3 pt-4 backdrop-blur">
        <Link href={backHref} aria-label={backLabel} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <p className="truncate text-base font-semibold text-[#111827]">{shelter.name}</p>
      </div>

      {/* Cover: dùng tỉ lệ thay vì chiều cao cố định để banner ngang không bị crop quá nhiều */}
      <div className="relative aspect-[2/1] max-h-[340px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF1E4] to-[#FFE0C2] sm:aspect-[3/1]">
        {cover && <img src={cover} alt="" className="h-full w-full object-cover object-center" />}
      </div>

      {/* Hero: relative z-10 để nổi lên trên cover */}
      <div className="relative z-10 flex items-start gap-4 px-2">
        <div className="-mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md md:-mt-12 md:h-24 md:w-24">
          <img
            src={shelter.avatarUrl || '/assets/piglet.png'}
            alt={shelter.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Tên nằm hoàn toàn dưới mép cover, giống app */}
        <div className="min-w-0 flex-1 pt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-xl font-semibold text-[#111827] md:text-2xl">{shelter.name}</h1>
            {shelter.isVerified && (
              <BadgeCheck size={18} className="shrink-0 text-[#3B82F6]" aria-label="Đã xác minh" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <p><span className="font-bold text-[#111827]">{petCount}</span> <span className="text-[#111827]">thú cưng</span></p>
            <span className="text-xs font-extrabold">•</span>
            <p><span className="font-bold text-[#111827]">{shelter.adoptedCount ?? 0}</span> <span className="text-[#111827]">đã nhận nuôi</span></p>
          </div>
        </div>
      </div>

      {/* Loại trạm + bio giống app */}
      <div className="mt-3 px-2">
        <p className="text-xs text-[#8E8E93]">{shelter.shelterType || 'Animal Shelter & Rescue'}</p>
        {shelter.bio && <p className="mt-1 line-clamp-3 text-sm leading-5 text-black">{shelter.bio}</p>}
      </div>

      <div className="mt-5 flex gap-2 rounded-full bg-[#F6F6F6] p-1">
        {([['pets', `Thú cưng (${petCount})`], ['info', 'Giới thiệu']] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${tab === k ? 'bg-[#E89B5A] text-white shadow' : 'text-[#4B5563]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'pets' ? (
        <>
          <div className="mt-5 flex h-12 items-center rounded-full border border-[#EBEBEB] bg-[#F8F8F8] px-4">
            <Search size={18} className="text-[#8E8E93]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên hoặc giống thú cưng..."
              className="mx-3 flex-1 bg-transparent text-sm text-gray-800 outline-none"
            />
            {q && <button type="button" onClick={() => setQ('')} aria-label="Xoá"><X size={16} className="text-[#8E8E93]" /></button>}
          </div>

          {pets.length === 0 ? (
            <p className="py-20 text-center text-gray-400">
              {(shelter.pets?.length ?? 0) === 0 ? 'Trạm chưa có bé nào đang chờ nhận nuôi' : 'Không tìm thấy bé nào phù hợp'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-5 md:grid-cols-3 lg:grid-cols-4">
              {pets.map((p) => {
                const g = String(p.gender || '').toLowerCase();
                return (
                  <Link key={p.id} href={`/thu-cung/${p.id}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100">
                      <img src={p.images?.[0]?.url || '/assets/piglet.png'} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    </div>
                    <div className="pt-3">
                      <p className="truncate text-base font-semibold text-black">{p.name}</p>
                      <p className="mt-0.5 truncate text-xs text-[#8E8E93]">
                        {g.startsWith('f') ? <Venus size={14} strokeWidth={3} className="mr-0.5 inline-block -translate-y-px text-pink-400" aria-label="Cái" /> : g.startsWith('m') ? <Mars size={14} strokeWidth={3} className="mr-0.5 inline-block -translate-y-px text-blue-400" aria-label="Đực" /> : null} {petAgeLabel(p.dob)} · {bilingual(p.breed) || 'Chưa rõ giống'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 space-y-7 px-2">
          <section>
            <h2 className="mb-2 text-base font-semibold text-[#111827]">Giới thiệu</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#4B5563]">{description || 'Trạm chưa có phần giới thiệu.'}</p>
          </section>

          {shelter.policy && (
            <section>
              <h2 className="mb-2 text-base font-semibold text-[#111827]">Chính sách nhận nuôi</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#4B5563]">{shelter.policy}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#111827]">Liên hệ</h2>
            <ul className="space-y-3 text-sm text-[#4B5563]">
              {shelter.contactInfo && <li className="flex items-center gap-3"><Phone size={16} className="text-[#E89B5A]" /> {shelter.contactInfo}</li>}
              {shelter.emailAddress && <li className="flex items-center gap-3"><Mail size={16} className="text-[#E89B5A]" /> <a href={`mailto:${shelter.emailAddress}`} className="underline">{shelter.emailAddress}</a></li>}
              {shelter.address && <li className="flex items-center gap-3"><MapPin size={16} className="text-[#E89B5A]" /> {shelter.address}</li>}
              {shelter.website && <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#E89B5A]" /> <a href={shelter.website} target="_blank" rel="noreferrer" className="underline">{shelter.website}</a></li>}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#111827]">Thông tin</h2>
            <ul className="space-y-2 text-sm text-[#4B5563]">
              <li>Tham gia từ {fmt(shelter.createdAt)}</li>
              {shelter.isVerified && <li>Đã xác minh{shelter.verifiedAt ? ` từ ${fmt(shelter.verifiedAt)}` : ''}</li>}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}