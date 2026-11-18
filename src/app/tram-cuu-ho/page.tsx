'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, ChevronLeft, MapPin } from 'lucide-react';
import { fetchShelters, shelterCover, shelterSince, PublicShelter } from '@/lib/publicShelters';

export default function ShelterListPage() {
  const [shelters, setShelters] = useState<PublicShelter[] | null>(null);

  useEffect(() => {
    fetchShelters().then(setShelters).catch(() => setShelters([]));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-16">
      <div className="sticky top-0 z-30 -mx-4 flex items-center gap-3 bg-white/95 px-4 pb-3 pt-4 backdrop-blur">
        <Link href="/" aria-label="Về trang chủ" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-[#111827]">Trạm cứu hộ</h1>
      </div>

      {shelters === null ? (
        <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-3xl bg-gray-100" />)}
        </div>
      ) : shelters.length === 0 ? (
        <p className="py-20 text-center text-gray-400">Chưa có trạm cứu hộ nào</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
          {shelters.map((s) => (
            <Link key={s.id} href={`/tram-cuu-ho/${s.id}`} className="group block overflow-hidden rounded-3xl border border-[#EBEBEB] bg-white transition hover:shadow-lg">
              <div className="relative aspect-[2/1] overflow-hidden bg-gradient-to-br from-[#FFF1E4] to-[#FFE0C2]">
                {shelterCover(s) && <img src={shelterCover(s)!} alt="" className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" />}
              </div>
              <div className="relative z-10 flex items-start gap-3 px-4 pb-4">
                <img src={s.avatarUrl || '/assets/piglet.png'} alt={s.name} className="-mt-8 h-16 w-16 shrink-0 rounded-full border-4 border-white bg-white object-cover shadow" />
                <div className="min-w-0 flex-1 pt-2">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-[#111827]">{s.name}</p>
                    {s.isVerified && <BadgeCheck size={16} className="shrink-0 text-[#3B82F6]" aria-label="Đã xác minh" />}
                  </div>
                  <p className="mt-1 flex items-start gap-1 text-xs text-[#8E8E93]"><MapPin size={12} className="mt-0.5 shrink-0" /><span className="line-clamp-2">{s.address}</span></p>
                  <p className="mt-2 text-xs text-[#4B5563]">
                    <span className="font-semibold text-[#111827]">{s._count?.pets ?? 0}</span> bé đang chờ
                    {s.isVerified && <> · Xác minh từ {shelterSince(s)}</>}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
