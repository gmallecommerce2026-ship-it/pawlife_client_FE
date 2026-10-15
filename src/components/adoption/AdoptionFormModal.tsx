'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axiosClient from '@/lib/api/axiosClient';

type Opt = [string, string]; // [giá trị gửi BE (EN), nhãn hiển thị (VI)]
const HOUSING: Opt[] = [['House','Nhà riêng'],['House with a garden','Nhà có sân vườn'],['Apartment (allows pet ownership)','Căn hộ (cho phép nuôi thú cưng)'],['Apartment (pets not allowed, but willing to keep a pet discreetly)','Căn hộ (không cho phép nhưng vẫn muốn nuôi)'],['Rented house','Nhà thuê'],['Other','Khác']];
const EXP: Opt[] = [['Yes, I used to have one','Có, tôi đã từng nuôi'],['My pet is still living with me now','Thú cưng vẫn đang sống cùng tôi'],["No, I haven't",'Chưa bao giờ']];
const JOB: Opt[] = [['Currently employed','Đang đi làm'],['Currently employed (occasionally travels for work)','Đang đi làm (thỉnh thoảng công tác)'],['Currently employed (frequently travels for work)','Đang đi làm (thường xuyên công tác)'],['Self-employed','Tự kinh doanh'],['Student (without a stable income)','Sinh viên (chưa có thu nhập ổn định)'],['Pupil','Học sinh']];
const REASON: Opt[] = [['Garden guarding','Trông coi nhà/sân vườn'],['Parking lot guarding','Giữ xe/bãi đỗ'],['Breeding','Nhân giống'],['Gift for children','Quà tặng cho trẻ em'],['Because I want to give them a forever home','Vì tôi muốn cho chúng một mái ấm mãi mãi'],['Other','Khác']];
const YN: Opt[] = [['Yes','Có'],['No','Không']];
const YNS: Opt[] = [...YN, ['Sometimes','Đôi khi']];
const WHO: Opt[] = [['Myself','Cho bản thân'],['Someone else','Cho người khác']];
const COMMITS: [string, string][] = [
  ['vaccine', 'Bạn có sẵn sàng tiêm phòng bệnh định kỳ hằng năm cho {n} không?'],
  ['medical', 'Trong thời gian nuôi, {n} sẽ có lúc ốm và cần đi viện. Bạn có sẵn sàng đưa {n} đi viện và chịu mọi chi phí điều trị không?'],
  ['expenses', 'Bạn có sẵn sàng chi trả một số chi phí để đảm bảo sức khỏe, vệ sinh của {n} trước khi về nhà mới không?'],
  ['updateStatus', 'Sau khi nhận nuôi, bạn có sẵn sàng cập nhật thường xuyên tình trạng của {n} trong ít nhất 6 tháng đầu không?'],
  ['homeVisit', 'Bạn có đồng ý để đại diện của PawLife/{s} thỉnh thoảng đến thăm {n} tại nhà không?'],
  ['provideID', 'Theo quy định của {s}, bạn có sẵn lòng cung cấp thông tin CCCD và địa chỉ cụ thể nơi nuôi {n} không?'],
];
const TERMS: [string, string][] = [
  ['Địa điểm nhận nuôi', 'Ưu tiên gia đình sinh sống ở Hà Nội hoặc các khu vực lân cận. Các gia đình ở tỉnh thành khác có thể nhận nuôi nếu đảm bảo được phương án vận chuyển bé. {s} không gửi các bé bằng xe khách đi tỉnh để đảm bảo an toàn, trừ trường hợp gia đình tự đến đón. Ngoài ra, {s} và bạn có thể trao đổi thêm để tìm phương án an toàn nhất cho các bé.'],
  ['Đối tượng nhận nuôi', 'Người nhận nuôi cần có khả năng tài chính ổn định để đảm bảo chăm sóc các bé lâu dài.'],
  ['Không nhận nuôi vì lý do khác', 'Không nhận nuôi dưới hình thức trông nhà, trông vườn, giữ xe, làm đồ chơi cho trẻ nhỏ hoặc mục đích sinh sản. Với những em cún to sẽ ưu tiên những nhà có sân vườn hoặc rộng rãi.'],
  ['Khám sức khỏe tổng quát', 'Người nhận nuôi cần cho chó mèo đến khám sức khỏe tổng quát tại phòng khám được chỉ định trước khi đón chó mèo về nhà.'],
  ['Chăm sóc sức khỏe', 'Người nuôi có trách nhiệm triệt sản và tiêm phòng đầy đủ, định kỳ cho bé tại cơ sở thú y gần nhất. Nếu bé đã được tiêm tại {s}, {s} sẽ cung cấp sổ tiêm để theo dõi lịch nhắc lại.'],
  ['Cập nhật tình trạng', 'Trong vòng 6 tháng đầu, người nhận nuôi phải cập nhật tình trạng của bé qua nhóm Zalo hoặc Whatsapp bằng cách gửi hình ảnh, video. Tình nguyện viên của {s} có thể ghé thăm bất chợt để kiểm tra tình hình cũng như hỗ trợ người nhận nuôi kịp thời trong trường hợp khẩn cấp.'],
  ['Không chuyển nhượng', 'Nếu không thể tiếp tục nuôi bé, bạn không được cho, tặng, bán dưới mọi hình thức, mà phải gửi bé lại {s}.'],
  ['Thông báo khi gửi bé', 'Nếu gia đình quyết định cho bé về quê hoặc cho người thân nuôi, cần thông báo trước và nhận sự đồng ý từ {s}.'],
  ['Hỗ trợ khi bé bị bệnh nặng', 'Trong trường hợp bé bị bệnh quá nặng và gia đình không đủ khả năng chăm sóc, {s} sẽ hỗ trợ tối đa.'],
  ['Xác minh danh tính', 'Vui lòng cung cấp CMND/CCCD (mặt trước) và địa chỉ cư trú chính xác vào ngày nhận nuôi.'],
  ['Khuyến khích đến phỏng vấn trực tiếp', 'Gia đình có thể đến {s} để trực tiếp xem và lựa chọn bé phù hợp.'],
];
const ERR: Record<string, string> = {
  'error.application_limit_reached': 'Bạn đang có 5 đơn chờ xử lý. Vui lòng đợi kết quả trước khi nộp thêm.',
  'error.application_already_submitted': 'Bạn đã nộp đơn cho bé này rồi.',
};
const inputCls = 'w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none focus:border-[#E89B5A]';

export default function AdoptionFormModal({ pet, onClose }: { pet: { id: string; name: string; shelterName?: string | null }; onClose: () => void }) {
  const shelter = pet.shelterName || 'trạm cứu hộ';
  const [step, setStep] = useState<'terms' | 'form' | 'done'>('terms');
  const [read, setRead] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [f, setF] = useState<Record<string, string>>({
    fullName: '', zalo: '', email: '', adoptFor: 'Myself', detail: '', housing: '', otherHousing: '',
    children: 'No', cage: 'No', exp: '', prevPet: '', job: '', reason: '', otherReason: '',
    vaccine: 'Yes', medical: 'Yes', expenses: 'Yes', updateStatus: 'Yes', homeVisit: 'Yes', provideID: 'Yes',
    hasQ: 'No', question: '',
  });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setRead(true);
  };
  useEffect(() => { if (step === 'terms') checkScroll(); }, [step]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/').then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setProvinces(d.map((p: any) => ({ ...p, clean: p.name.replace(/^(Tỉnh|Thành phố)\s+/i, '').trim() })).sort((a: any, b: any) => a.clean.localeCompare(b.clean, 'vi')));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setWard(''); setWards([]);
    const p = provinces.find((x) => x.clean === city);
    if (!p?.code) return;
    fetch(`https://provinces.open-api.vn/api/v2/w/?province=${p.code}`).then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setWards(d.map((w: any) => w.name).sort((a: string, b: string) => a.localeCompare(b, 'vi')));
    }).catch(() => {});
  }, [city, provinces]);

  const fld = (label: string, el: React.ReactNode, req = false) => (
    <div className="mt-4"><p className="mb-1.5 text-[13px] text-gray-600">{label} {req && <span className="text-red-500">*</span>}</p>{el}</div>
  );
  const txt = (k: string, ph = '', type = 'text') => <input className={inputCls} type={type} value={f[k]} placeholder={ph} onChange={(e) => set(k, e.target.value)} />;
  const area = (k: string, ph = '') => <textarea className="h-24 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#E89B5A]" value={f[k]} placeholder={ph} onChange={(e) => set(k, e.target.value)} />;
  const sel = (k: string, opts: Opt[], ph: string) => (
    <select className={inputCls} value={f[k]} onChange={(e) => set(k, e.target.value)}>
      <option value="">{ph}</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  const seg = (k: string, opts: Opt[]) => (
    <div className="flex gap-2">{opts.map(([v, l]) => (
      <button type="button" key={v} onClick={() => set(k, v)}
        className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${f[k] === v ? 'border-transparent bg-[#E89B5A] text-white' : 'border-gray-200 bg-white text-gray-500'}`}>{l}</button>
    ))}</div>
  );
  const title = (t: string) => <h3 className="mt-8 text-base font-semibold text-gray-900">{t}</h3>;

  const submit = async () => {
    const hadPet = f.exp === EXP[0][0];
    const bad = ([
      [!f.fullName.trim(), 'Vui lòng nhập họ và tên.'],
      [!f.zalo.trim(), 'Vui lòng nhập số Zalo / điện thoại.'],
      [!/\S+@\S+\.\S+/.test(f.email.trim()), 'Vui lòng nhập email hợp lệ để trạm liên hệ với bạn.'],
      [!city || !ward, 'Vui lòng chọn Tỉnh/Thành phố và Phường/Xã.'],
      [!f.housing, 'Vui lòng chọn loại nhà ở.'],
      [f.housing === 'Other' && !f.otherHousing.trim(), 'Vui lòng mô tả loại nhà ở.'],
      [!f.exp, 'Vui lòng chọn kinh nghiệm nuôi thú cưng.'],
      [hadPet && !f.prevPet.trim(), 'Vui lòng chia sẻ về thú cưng trước đây của bạn.'],
      [!f.job, 'Vui lòng chọn tình trạng việc làm.'],
      [!f.reason, 'Vui lòng chọn lý do nhận nuôi.'],
      [f.reason === 'Other' && !f.otherReason.trim(), 'Vui lòng nêu rõ lý do nhận nuôi.'],
    ] as [boolean, string][]).find((c) => c[0]);
    if (bad) { setErr(bad[1]); return; }

    const payload = {
      petId: pet.id, fullName: f.fullName.trim(), phone: f.zalo.trim(), zalo: f.zalo.trim(), email: f.email.trim(),
      adoptFor: f.adoptFor,
      location: `${f.detail.trim() ? f.detail.trim() + ', ' : ''}${ward}, ${city}`,
      housing: f.housing === 'Other' ? f.otherHousing.trim() : f.housing,
      children: f.children, cage: f.cage,
      petExperience: f.exp, prevPetHistory: hadPet ? f.prevPet.trim() : '',
      employmentStatus: f.job,
      adoptionReason: f.reason === 'Other' ? f.otherReason.trim() : f.reason,
      commitments: Object.fromEntries(COMMITS.map(([k]) => [k, f[k]])),
      otherQuestion: f.hasQ === 'Yes' ? f.question.trim() : '',
    };
    try {
      setBusy(true); setErr('');
      await axiosClient.post('/public/applications', payload);
      setStep('done');
    } catch (e: any) {
      const d = e?.response?.data;
      setErr(ERR[d?.i18n?.key] || (Array.isArray(d?.message) ? d.message.join('\n') : d?.message) || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally { setBusy(false); }
  };

  const modal = (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 p-3" onClick={onClose}>
      <div className="relative flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-3 z-10 text-2xl leading-none text-gray-400">×</button>

        {step === 'done' && (
          <div className="px-6 py-14 text-center">
            <p className="text-xl font-bold text-gray-900">Gửi đơn thành công! 🎉</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-gray-500">Cảm ơn bạn đã đăng ký nhận nuôi {pet.name}. {shelter} sẽ xem xét và liên hệ qua số điện thoại hoặc email bạn đã cung cấp. Hãy giữ điện thoại luôn sẵn sàng nhé!</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-[#E89B5A] px-8 py-3 text-sm font-bold text-white">Đóng</button>
          </div>
        )}

        {step === 'terms' && (
          <>
            <div className="px-6 pb-2 pt-5 text-center">
              <h2 className="text-xl font-bold text-gray-900">Điều kiện nhận nuôi</h2>
              <p className="text-sm text-gray-400">{shelter}</p>
            </div>
            <div ref={scrollRef} onScroll={checkScroll} className="flex-1 overflow-y-auto px-6 py-3">
              <p className="mb-4 text-[13px] leading-5 text-gray-900">Trước khi đăng ký, các bạn vui lòng đọc kỹ các điều kiện nhận nuôi dưới đây. Những thông tin các bạn cung cấp sẽ giúp {shelter} hiểu rõ hơn về nhu cầu và khả năng chăm sóc thú cưng của bạn.</p>
              {TERMS.map(([t, b], i) => (
                <div key={t} className="mb-5">
                  <p className="mb-1 text-base text-gray-900">{i + 1}. {t}</p>
                  <p className="pl-4 text-sm font-light leading-5 text-[#8E8E93]">{b.replace(/\{s\}/g, shelter)}</p>
                </div>
              ))}
              <p className="mb-2 text-justify text-[12px] italic leading-5 text-black">{shelter} rất mong các bạn hiểu rằng quy trình nhận nuôi này được đặt ra nhằm đảm bảo tìm được cho các bé một mái nhà an toàn và một gia đình có thể chăm sóc, yêu thương các bé đến cuối đời. Vì thế, {shelter} sẽ đề ra những yêu cầu nghiêm ngặt để trao gửi các bé tới người nhận nuôi đáng tin cậy. {shelter} rất trân trọng sự đồng hành của các bạn.</p>
            </div>
            <div className="p-5">
              <button type="button" disabled={!read} onClick={() => setStep('form')}
                className={`w-full rounded-full py-3.5 text-base font-semibold ${read ? 'bg-[#E89B5A] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {read ? 'Tôi đồng ý điều kiện nhận nuôi' : 'Cuộn xuống cuối để tiếp tục'}
              </button>
            </div>
          </>
        )}

        {step === 'form' && (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="pr-8 text-xl font-bold text-gray-900">Đơn đăng ký nhận nuôi {pet.name}</h2>
            <p className="text-xs font-semibold text-[#F97316]">{shelter}</p>

            {title('Mục A – Thông tin người nhận nuôi')}
            {fld('Họ và tên', txt('fullName'), true)}
            {fld('Số Zalo / Điện thoại', txt('zalo', '', 'tel'), true)}
            {fld('Email', txt('email', 'Trạm sẽ gửi lịch phỏng vấn qua email này', 'email'), true)}
            {fld(`Bạn điền đơn này để nhận nuôi ${pet.name} cho bản thân hay thay mặt người khác?`, seg('adoptFor', WHO), true)}

            {title('Mục B – Điều kiện sinh sống')}
            {fld('Tỉnh / Thành phố', <select className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}><option value="">Chọn Tỉnh/Thành phố</option>{provinces.map((p) => <option key={p.code} value={p.clean}>{p.clean}</option>)}</select>, true)}
            {fld('Phường / Xã', <select className={inputCls} value={ward} onChange={(e) => setWard(e.target.value)} disabled={!wards.length}><option value="">Chọn Phường/Xã</option>{wards.map((w) => <option key={w} value={w}>{w}</option>)}</select>, true)}
            {fld('Địa chỉ chi tiết', txt('detail', 'Số nhà, ngõ, đường... (không bắt buộc)'))}
            {fld('Loại nhà ở', sel('housing', HOUSING, 'Chọn loại nhà ở'), true)}
            {f.housing === 'Other' && <div className="mt-2">{txt('otherHousing', 'Vui lòng mô tả loại nhà ở')}</div>}
            {fld('Nhà có trẻ nhỏ không?', seg('children', YN), true)}
            {fld('Bạn có ý định lưu chuồng thú cưng không?', seg('cage', YNS), true)}

            {title('Mục C – Kinh nghiệm nuôi thú cưng')}
            {fld('Bạn đã từng nuôi thú cưng bao giờ chưa?', sel('exp', EXP, 'Chọn một lựa chọn'), true)}
            {f.exp === EXP[0][0] && fld('Nếu trước đây bạn đã từng nuôi chó/mèo rồi hiện giờ không còn nữa là vì...', area('prevPet', 'Chia sẻ với chúng mình nhé...'), true)}

            {title('Mục D – Việc làm')}
            {fld('Tình trạng việc làm của bạn', sel('job', JOB, 'Chọn tình trạng việc làm'), true)}

            {title('Mục E – Cam kết nhận nuôi')}
            {fld('Lý do nhận nuôi', sel('reason', REASON, 'Chọn lý do'), true)}
            {f.reason === 'Other' && <div className="mt-2">{area('otherReason', 'Vui lòng nêu rõ lý do')}</div>}
            {COMMITS.map(([k, q]) => <div key={k}>{fld(q.replace(/\{n\}/g, pet.name).replace(/\{s\}/g, shelter), seg(k, YN), true)}</div>)}
            {fld(`Bạn có câu hỏi nào khác muốn gửi đến ${shelter} không?`, seg('hasQ', YN))}
            {f.hasQ === 'Yes' && <div className="mt-2">{area('question', 'Nhập câu hỏi của bạn...')}</div>}

            {err && <p className="mt-4 whitespace-pre-line text-sm text-red-500">{err}</p>}
            <button type="button" disabled={busy} onClick={submit} className="mt-5 w-full rounded-full bg-[#E89B5A] py-3.5 text-base font-bold text-white disabled:opacity-60">
              {busy ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}