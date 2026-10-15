'use client';
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PawPrint, Cake, QrCode, Syringe, Stethoscope, Smile, HeartHandshake, Check, X, Lock, Eye, ChevronLeft } from 'lucide-react';
import axiosClient from '@/lib/api/axiosClient';
import AdoptionFormModal from '@/components/adoption/AdoptionFormModal';
import { localizeHistoryDescription, localizeHistoryTitle, formatAgeFromDob } from '@/utils/pawHistoryLocalize';

const show = (v: any): string => (!v ? '' : typeof v === 'string' ? v : v.vi || v.en || '');
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');
const ageLabel = (dob?: string | null) => {
  if (!dob) return 'Chưa rõ';
  const m = Math.max(0, (Date.now() - new Date(dob).getTime()) / 2629800000);
  const y = Math.floor(m / 12);
  return y > 0 ? `${y} tuổi` : m >= 1 ? `${Math.floor(m)} tháng tuổi` : 'Sơ sinh';
};
const TRAIT = [{ bg: '#FBF7EB', c: '#E8A53C' }, { bg: '#E8F1FF', c: '#5A90DA' }, { bg: '#EBFFE2', c: '#77C852' }];
const HIST: Record<string, { I: React.ElementType; bg: string; c: string }> = {
  BIRTH: { I: Cake, bg: '#FFF4EC', c: '#F2A465' }, CREATED: { I: QrCode, bg: '#EAE7FB', c: '#885BF2' },
  QR_LINKED: { I: QrCode, bg: '#EAE7FB', c: '#885BF2' }, VACCINE: { I: Syringe, bg: '#E3F0FF', c: '#5A90DA' },
  DENTAL_CARE: { I: Smile, bg: '#E8FFD8', c: '#5FA83D' }, ANNUAL_CHECKUP: { I: Stethoscope, bg: '#E8FFD8', c: '#5FA83D' },
  UNDER_SHELTER_CARE: { I: HeartHandshake, bg: '#FFE4F0', c: '#D6447A' }, WAS_UNDER_SHELTER_CARE: { I: HeartHandshake, bg: '#FFE4F0', c: '#D6447A' },
};
const MED_TYPE: Record<string, string> = { VACCINATION: 'Tiêm chủng', ANNUAL_CHECKUP: 'Khám tổng quát', DENTAL_CARE: 'Khám răng miệng', OTHER: 'Khác' };
const MED_STATUS: Record<string, { l: string; cls: string }> = {
  PENDING: { l: '⏱ Đang xác minh', cls: 'bg-[#FFF8E5] text-[#E8A53C] border-[#FFE1C2]' },
  VERIFIED: { l: '✓ Đã xác minh', cls: 'bg-[#EBFFE2] text-[#77C852] border-[#D1F5BF]' },
  DISPUTED: { l: '⚠ Đang tranh chấp', cls: 'bg-[#FFE2E2] text-[#FF5A5A] border-[#FFB4B4]' },
};
const card = 'bg-white rounded-2xl border border-gray-200 shadow-sm p-6';

export default function PublicPetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    axiosClient.get(`/public/pets/${id}`).then((r) => setPet(r.data)).catch(() => setPet(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-[1200px] p-6"><div className="h-[520px] animate-pulse rounded-2xl bg-gray-100" /></div>;
  if (!pet) return (
    <div className="mx-auto max-w-2xl py-24 text-center">
      <p className="mb-4 text-gray-500">Không tìm thấy bé này, hoặc bé đã có mái ấm.</p>
      <Link href="/#adopt" className="font-medium text-[#E89B5A] hover:underline">Quay về danh sách</Link>
    </div>
  );

  const images: string[] = (pet.images ?? []).map((i: any) => (typeof i === 'string' ? i : i?.url)).filter(Boolean);
  const main = images[imgIdx] || pet.avatarUrl || null;
  const g = String(pet.gender || '').toLowerCase();
  const genderLabel = g.startsWith('f') ? 'cái' : g.startsWith('m') ? 'đực' : 'không rõ';
  const traits: any[] = Array.isArray(pet.traitsList) && pet.traitsList.length ? pet.traitsList.map((t: any) => t?.name ?? t) : pet.traits ?? [];
  const goodWith: any[] = pet.goodWith ?? [];
  const badWith: any[] = pet.badWith ?? [];
  const reqs: any[] = pet.adoptionRequirements ?? [];
  const vaccinated = pet.vaccinationStatus ? pet.vaccinationStatus === 'VACCINATED' : pet.isVaccinated !== false;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6">
      <div className="flex flex-col items-start gap-7 lg:flex-row">
        {/* TRÁI */}
        <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[420px]">
          <div className="flex items-center gap-3">
            <Link href="/#adopt" className="text-gray-400 hover:text-gray-700"><ChevronLeft size={26} /></Link>
            <h1 className="truncate text-3xl font-bold text-[#0D062D]">{pet.name}</h1>
            <span className="truncate text-lg text-[#8E8E93]">({show(pet.breed) || 'Chưa rõ'})</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="relative h-[320px] w-full bg-gray-100">
              {main ? <img src={main} alt={pet.name} className="absolute inset-0 h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300"><PawPrint size={40} /></div>}
              <span className="absolute right-4 top-4 rounded-lg bg-[#DEFFDF] px-3.5 py-1.5 text-sm font-semibold text-[#00AC47]">Chờ nhận nuôi</span>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((u, i) => (
                  <button key={u + i} type="button" onClick={() => setImgIdx(i)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${i === imgIdx ? 'border-[#E89B5A]' : 'border-transparent'}`}>
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2.5 p-5">
              {[['Giới tính', genderLabel, '#E2EFF8'], ['Tuổi', ageLabel(pet.dob), '#FEFACA'], ['Cân nặng', pet.weight != null ? `${pet.weight} kg` : '—', '#F9E6EC']].map(([l, v, bg]) => (
                <div key={l} className="flex flex-col items-center gap-1.5 rounded-2xl py-3.5" style={{ background: bg }}>
                  <span className="text-[13px] text-gray-500">{l}</span><span className="text-[15px] font-semibold text-black">{v}</span>
                </div>
              ))}
            </div>
          </div>
          {pet.shelter && (
            <div className={card}>
              <p className="mb-1 text-xs font-bold text-gray-400">TRẠM CỨU HỘ</p>
              <p className="text-sm font-semibold text-gray-900">{pet.shelter.name}</p>
              {pet.shelter.address && <p className="text-xs text-gray-500">{pet.shelter.address}</p>}
            </div>
          )}
          <button type="button" onClick={() => setApplying(true)} className="w-full rounded-full bg-[#E89B5A] py-3.5 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5">
            Đăng ký nhận nuôi {pet.name}
          </button>
        </div>

        {/* PHẢI */}
        <div className="grid min-w-0 flex-1 grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <div className={`${card} flex flex-col gap-6`}>
            <div>
              <p className="mb-3 text-sm font-medium text-black">Về {pet.name}</p>
              <p className="text-sm leading-relaxed text-[#8E8E93]">{show(pet.description) || 'Chưa có mô tả cho bé này.'}</p>
              {traits.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {traits.map((t, i) => <span key={i} className="rounded-full border px-3 py-1 text-[11px] font-medium" style={{ background: TRAIT[i % 3].bg, borderColor: TRAIT[i % 3].c, color: TRAIT[i % 3].c }}>{show(t)}</span>)}
                </div>
              )}
            </div>
            {(goodWith.length > 0 || badWith.length > 0) && (
              <div>
                <p className="mb-2 text-sm font-medium text-black">Hành vi của {pet.name}</p>
                {goodWith.length > 0 && <p className="mb-1 flex items-start gap-1.5 text-[12px]"><Check size={13} className="mt-0.5 shrink-0 text-[#77C852]" /><span><b className="text-[#77C852]">Hợp với: </b><span className="text-[#8E8E93]">{goodWith.map(show).join(', ')}</span></span></p>}
                {badWith.length > 0 && <p className="flex items-start gap-1.5 text-[12px]"><X size={13} className="mt-0.5 shrink-0 text-[#FE7D66]" /><span><b className="text-[#FE7D66]">Không phù hợp: </b><span className="text-[#8E8E93]">{badWith.map(show).join(', ')}</span></span></p>}
              </div>
            )}
            <div>
              <p className="mb-3 text-sm font-medium text-black">Yêu cầu nhận nuôi</p>
              {reqs.length ? <div className="flex flex-wrap gap-2">{reqs.map((r, i) => <span key={r.id ?? i} className="rounded-full border border-gray-200 px-3 py-1 text-[12px] text-gray-600">{show(r.label)}</span>)}</div>
                : <p className="text-sm text-[#8E8E93]">Chưa có yêu cầu nhận nuôi.</p>}
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-black">Chăm sóc sức khỏe</p>
              <div className="flex gap-3">
                {([[Syringe, 'Tiêm chủng', vaccinated ? 'Đã tiêm phòng' : 'Chưa tiêm'], [pet.isSpayedNeutered ? Check : X, 'Trạng thái', pet.isSpayedNeutered ? 'Đã triệt sản' : 'Chưa triệt sản']] as any[]).map(([I, l, v]) => (
                  <div key={l} className="flex h-[50px] flex-1 items-center gap-3 rounded-full bg-[#F7F7F7] px-2">
                    <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-white"><I size={18} className="text-[#E89B5A]" /></div>
                    <div className="min-w-0"><p className="text-[12px] text-[#8E8E93]">{l}</p><p className="truncate text-[13px] font-medium text-black">{v}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className={card}>
              <p className="mb-4 text-sm font-medium text-black">PawHistory | Hành trình</p>
              {(pet.pawHistory ?? []).map((h: any, i: number, arr: any[]) => {
                const cfg = HIST[h.type] ?? { I: Cake, bg: '#F5F5F5', c: '#8E8E93' };
                const last = i === arr.length - 1;
                return (
                  <div key={h.id ?? i} className="flex min-h-[48px]">
                    <div className="relative mr-2.5 w-6 shrink-0">
                      {!last && <div className="absolute w-px bg-gray-200" style={{ top: 26, bottom: -4, left: 11.5 }} />}
                      <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full" style={{ background: cfg.bg }}><cfg.I size={12} style={{ color: cfg.c }} /></div>
                    </div>
                    <div className={`flex-1 ${last ? '' : 'pb-3'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12px] font-medium text-black">{localizeHistoryTitle(h)}</p>
                        <span className="shrink-0 text-[10px] text-[#8E8E93]">{h.type === 'BIRTH' ? formatAgeFromDob(h.date) || fmt(h.date) : fmt(h.date)}</span>
                      </div>
                      {h.description && <p className="mt-0.5 text-[10px] text-[#8E8E93]">{localizeHistoryDescription(h.description)}</p>}
                    </div>
                  </div>
                );
              })}
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F5F5F5] px-3 py-2"><Lock size={11} className="text-[#8E8E93]" /><span className="text-[10px] text-[#8E8E93]">Hành trình không thể bị xóa hay chỉnh sửa</span></div>
            </div>

            <div className={`${card} flex flex-col gap-2.5`}>
              <h3 className="text-sm font-bold text-gray-900">Hồ sơ y tế</h3>
              {(pet.medicalRecords ?? []).length === 0 && <p className="text-xs italic text-gray-400">Chưa có hồ sơ y tế công khai.</p>}
              {(pet.medicalRecords ?? []).map((m: any) => {
                const s = MED_STATUS[m.verificationStatus] || MED_STATUS.PENDING;
                const img = m.images?.[0];
                return (
                  <div key={m.id} className="relative flex flex-col gap-1 rounded-2xl border border-gray-200 p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Syringe size={14} className="shrink-0 text-gray-400" />
                      <span className="text-xs font-bold text-gray-900">{show(m.recordName) || m.type}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}>{s.l}</span>
                    </div>
                    <p className="pl-5 text-[11px] text-gray-400">Loại: {MED_TYPE[m.type] || m.type} | Ngày: {fmt(m.recordDate)}</p>
                    {m.hasNextDueDate && m.nextDueDate && <p className="pl-5 text-[11px] font-semibold text-[#E89B5A]">Lịch tiếp theo: {fmt(m.nextDueDate)}</p>}
                    {img && <a href={img} target="_blank" rel="noopener noreferrer" title="Xem" className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-700"><Eye size={14} /></a>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {applying && <AdoptionFormModal pet={{ id: pet.id, name: pet.name, shelterName: pet.shelter?.name }} onClose={() => setApplying(false)} />}
    </div>
  );
}