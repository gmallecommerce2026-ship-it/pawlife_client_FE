'use client';

import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronLeft, EyeOff, Phone } from 'lucide-react';
import axiosClient from '@/lib/api/axiosClient';
import { showText, formatBreed } from '@/utils/bilingualField';

// =====================================================================
// 1. INLINE MODALS (Tích hợp sẵn để không cần import file ngoài)
// =====================================================================

export interface FormData {
  scannedBy: string;
  phoneNumber: string;
  message: string;
  images?: string[];
}

const LostModeShareModal = ({ isVisible, onClose, onConfirm }: { isVisible: boolean, onClose: () => void, onConfirm: (loc: any, data: FormData, skip: boolean) => void }) => {
  const [formData, setFormData] = useState<FormData>({ scannedBy: '', phoneNumber: '', message: '' });
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[400px] p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Chia sẻ thông tin của bạn</h2>
        <p className="text-sm text-gray-500 mb-4">Chủ thú cưng sẽ nhận được thông báo kèm vị trí hiện tại (nếu bạn cho phép).</p>
        <input type="text" placeholder="Tên của bạn" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mb-3 text-sm outline-none focus:border-[#E89B5A]" onChange={e => setFormData({ ...formData, scannedBy: e.target.value })} />
        <input type="tel" placeholder="Số điện thoại" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mb-3 text-sm outline-none focus:border-[#E89B5A]" onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
        <textarea placeholder="Lời nhắn (Vd: Tôi đang giữ bé ở...)" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mb-4 text-sm outline-none focus:border-[#E89B5A] resize-none h-24" onChange={e => setFormData({ ...formData, message: e.target.value })} />
        <div className="flex flex-col gap-2">
          <button onClick={() => onConfirm(null, formData, false)} className="w-full bg-[#E89B5A] text-white font-bold py-3 rounded-xl">Gửi thông tin</button>
          <button onClick={() => onConfirm(null, formData, true)} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">Chỉ gửi vị trí ẩn danh</button>
        </div>
      </div>
    </div>
  );
};

const ReportIssueModal = ({ isVisible, onClose, onSubmit }: { isVisible: boolean, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [reason, setReason] = useState('Thông tin giả mạo');
  const [details, setDetails] = useState('');
  const [isBlockRequested, setIsBlockRequested] = useState(false);
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[400px] p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Báo cáo vấn đề</h2>
        <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mb-3 text-sm outline-none focus:border-[#E89B5A]" value={reason} onChange={e => setReason(e.target.value)}>
          <option value="Thông tin giả mạo">Thông tin giả mạo</option>
          <option value="Hình ảnh phản cảm">Hình ảnh phản cảm</option>
          <option value="Lừa đảo">Lừa đảo</option>
          <option value="Khác">Khác</option>
        </select>
        <textarea placeholder="Chi tiết vấn đề..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mb-3 text-sm outline-none focus:border-[#E89B5A] resize-none h-24" onChange={e => setDetails(e.target.value)} />
        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-[#E89B5A]" checked={isBlockRequested} onChange={e => setIsBlockRequested(e.target.checked)} />
          <span className="text-sm text-gray-700">Chặn người dùng này</span>
        </label>
        <button onClick={() => onSubmit({ reason, details, isBlockRequested })} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl">Gửi báo cáo</button>
      </div>
    </div>
  );
};

const ShelterContactModal = ({ isVisible, onClose, shelterData }: { isVisible: boolean, onClose: () => void, shelterData: any }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-end sm:items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[400px] p-6 relative animate-in slide-in-from-bottom-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full"><X size={16} /></button>
        <div className="flex flex-col items-center mt-2">
          <img src={shelterData.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full mb-3 object-cover shadow-sm" />
          <h2 className="text-xl font-bold text-gray-900">{shelterData.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{shelterData.phone}</p>
          {shelterData.note && <p className="text-sm text-[#E89B5A] bg-[#FFF8F5] px-4 py-2 rounded-xl mt-3 text-center w-full">{shelterData.note}</p>}
        </div>
        <a href={`tel:${shelterData.phone}`} className="mt-6 w-full bg-[#E89B5A] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2">
          <Phone size={18} /> Gọi ngay
        </a>
      </div>
    </div>
  );
};

// =====================================================================
// 2. COMPONENTS PHỤ (ImageWithLoading, ImageViewerOverlay)
// =====================================================================

const ImageWithLoading = ({ uri }: { uri: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  return (
    <div className="w-full h-full flex justify-center items-center bg-[#F3F4F6] relative shrink-0">
      {isLoading && !isError && (
        <div className="absolute w-6 h-6 border-2 border-[#E89B5A] border-t-transparent rounded-full animate-spin z-10"></div>
      )}
      <img
        src={isError ? 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop' : uri}
        className="w-full h-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setIsError(true);
        }}
        alt="Pet Image"
      />
    </div>
  );
};

const ImageViewerOverlay = ({ images, isVisible, initialIndex = 0, onClose }: { images: string[]; isVisible: boolean; initialIndex?: number; onClose: () => void; }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && scrollRef.current) {
      setCurrentIndex(initialIndex);
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * initialIndex, behavior: 'instant' });
    }
  }, [isVisible, initialIndex]);

  if (!isVisible || !images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      <div className="absolute top-12 left-0 right-0 z-50 flex justify-end px-4 py-2 pointer-events-none">
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full pointer-events-auto">
          <X size={24} color="white" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const width = e.currentTarget.clientWidth;
          setCurrentIndex(Math.round(scrollLeft / width));
        }}
      >
        {images.map((item, index) => (
          <div key={index} className="w-full h-full shrink-0 snap-center flex items-center justify-center">
            <img src={item} className="max-w-full max-h-full object-contain" alt="Viewer" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-1.5 z-10 pointer-events-none">
          {images.map((_, index) => (
            <div key={index} className={`h-2 rounded-full transition-all ${currentIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// 3. MAIN COMPONENT (ScannedPetContent) -> Chứa Logic dùng hook useSearchParams
// =====================================================================

function ScannedPetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagId = searchParams.get('tagId');

  const isVi = true; // Mặc định hiển thị tiếng Việt
  const isOwner = false; // Quét từ web mặc định là người lạ

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isContentBlocked, setIsContentBlocked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleOpenViewer = (index: number) => {
    setViewerIndex(index);
    setIsViewerVisible(true);
  };

  const displayImages = useMemo(() => {
    if (!pet) return ['https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop'];

    const isLost = pet.isLost || pet.status?.toUpperCase() === 'LOST';
    let originalImages: string[] = [];
    const imagesArray = Array.isArray(pet.images) ? pet.images : [];

    originalImages = imagesArray
      .map((img: any) => (typeof img === 'string' ? img : img?.url))
      .filter((url: any) => typeof url === 'string' && url.trim() !== '');

    if (originalImages.length === 0 && typeof pet.image === 'string' && pet.image.trim() !== '') {
      originalImages = [pet.image];
    }

    let combinedImages = [...originalImages];

    if (isLost) {
      const rawLostPhotos = pet.lostPhotos ?? pet.photos ?? pet.lostInfo?.photos ?? null;
      let lostImages: string[] = [];

      if (Array.isArray(rawLostPhotos)) {
        lostImages = rawLostPhotos.filter((url: any) => typeof url === 'string' && url.trim() !== '');
      } else if (typeof rawLostPhotos === 'string' && rawLostPhotos.trim() !== '') {
        try {
          const parsed = JSON.parse(rawLostPhotos);
          if (Array.isArray(parsed)) {
            lostImages = parsed.filter((url: any) => typeof url === 'string' && url.trim() !== '');
          }
        } catch (e) {
          console.warn("Lỗi parse lostPhotos:", e, rawLostPhotos);
        }
      }

      const dedupedLostImages = lostImages.filter((url) => !combinedImages.includes(url));
      combinedImages = [...combinedImages, ...dedupedLostImages];
    }

    return combinedImages.length > 0
      ? combinedImages
      : ['https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop'];
  }, [pet]);

  const calculateAgeDisplay = (dob: string | Date | undefined | null): string => {
    if (!dob) return 'Không rõ tuổi';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'Không rõ tuổi';

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years > 0) return `${years} tuổi`;
    if (months > 0) return `${months} tháng tuổi`;
    return 'Dưới 1 tháng tuổi';
  };

  const formatBirthday = (dob: string | Date | undefined | null): string => {
    if (!dob) return 'Không rõ';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'Không rõ';
    return birthDate.toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    let isActive = true;
    const fetchPetData = async () => {
      try {
        setLoading(true);
        setHasReported(false);
        setCurrentImageIndex(0);

        const response = await axiosClient.get(`/tags/${tagId}/scan?t=${Date.now()}`);
        if (!isActive) return;
        setPet(response.data);
      } catch (error: any) {
        if (isActive) setPet(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    if (tagId) fetchPetData();
    return () => { isActive = false; };
  }, [tagId]);

  const handleShareLocation = async (location: any, formData: FormData, isSkipped: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const finalTagId = Array.isArray(tagId) ? tagId[0] : tagId;
      const lat = location?.latitude || null;
      const lng = location?.longitude || null;
      const radius = location?.radius || null;

      const payload = isSkipped ? {
        tagId: finalTagId,
        latitude: lat,
        longitude: lng,
        radius: radius,
      } : {
        tagId: finalTagId,
        scannedBy: formData.scannedBy.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim(),
        message: formData.message.trim() || undefined,
        latitude: lat,
        longitude: lng,
        radius: radius,
        images: formData.images || undefined,
      };

      await axiosClient.post('/tags/report', payload);
      setIsModalVisible(false);
      setHasReported(true);

      if (!isSkipped) {
        window.alert('Thành công\nĐã gửi thông báo cùng vị trí GPS của bạn đến ứng dụng của chủ thú cưng!');
      } else {
        window.alert('Đã báo cáo\nVị trí ẩn danh đã được ghi nhận.');
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      const serverMsg = errorData?.message;
      const displayMsg = Array.isArray(serverMsg) ? serverMsg.join('\n') : serverMsg;
      window.alert(displayMsg || 'Không thể gửi thông báo. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onImageScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const slideSize = event.currentTarget.clientWidth;
    const scrollLeft = event.currentTarget.scrollLeft;
    const index = Math.round(scrollLeft / slideSize);
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-[500px] mx-auto bg-white flex flex-col items-center justify-center shadow-md">
        <div className="border-4 border-[#ffa053] border-t-transparent rounded-full w-10 h-10 animate-spin"></div>
        <p className="text-gray-500 font-medium mt-4">Đang tải...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen max-w-[500px] mx-auto bg-white flex flex-col items-center justify-center px-6 shadow-md text-center">
        <X size={60} color="#F43F5E" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Không tìm thấy</h2>
        <p className="text-gray-500 mt-2 mb-8">Mã QR này không hợp lệ hoặc vòng cổ chưa được đăng ký trên hệ thống.</p>
        <button onClick={() => router.replace('/')} className="bg-gray-100 px-8 py-3 rounded-full text-gray-700 font-bold">
          Quay lại
        </button>
      </div>
    );
  }

  const isLost = pet.isLost || pet.status?.toUpperCase() === 'LOST';
  const rawDob = pet?.dob ?? pet?.birthDate ?? pet?.birthday ?? pet?.dateOfBirth ?? null;

  const displayAge = calculateAgeDisplay(rawDob);
  const displayOwnerName = pet?.lostInfo?.ownerName || pet?.ownerName || pet?.owner?.name || 'Không rõ chủ nhân';
  const displayOwnerPhone = pet?.owner?.phone || null;
  const displayOwnerAddress = pet?.owner?.address || 'Chưa cung cấp địa chỉ';

  const rawNote = pet?.lostInfo?.note || pet?.note;
  const displayNote = rawNote ? showText(rawNote) : 'Vui lòng liên hệ tôi sớm nhất';

  if (isContentBlocked) {
    return (
      <div className="min-h-screen max-w-[500px] mx-auto bg-white flex flex-col items-center justify-center px-6 shadow-md relative">
        <div className="absolute top-12 left-6 z-40">
          <button onClick={() => router.back()} className="p-2"><ChevronLeft size={24} color="#000000" /></button>
        </div>
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <EyeOff size={32} color="#8E8E93" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mt-4 text-center">Nội dung đã bị ẩn</h2>
        <p className="text-gray-500 text-center mt-3 mb-8 px-4 leading-6">Bạn đã chặn nội dung từ người dùng này. Chúng tôi đã ghi nhận báo cáo và sẽ xem xét kĩ lưỡng.</p>
        <button onClick={() => router.replace('/')} className="bg-[#E89B5A] px-8 py-3.5 rounded-full shadow-sm text-white font-bold text-[16px]">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-[500px] mx-auto shadow-md relative flex flex-col">
      <div className="absolute top-6 right-6 z-40">
        <button onClick={() => router.replace('/')} className="w-8 h-8 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-sm">
          <X size={16} color="white" />
        </button>
      </div>

      <div className="w-full h-10 mx-auto shrink-0" />

      <div className="flex-1 overflow-y-auto pb-10">
        {/* --- 1. HERO IMAGE SECTION --- */}
        {isLost ? (
          <div className="px-5 pt-4">
            <div className="bg-white rounded-[32px] z-10" style={{ boxShadow: '0px 4px 10px rgba(232, 155, 90, 0.4)' }}>
              <div className="relative rounded-[24px] overflow-hidden bg-gray-200" style={{ height: 210, boxShadow: '0px 10px 15px rgba(0,0,0,0.6)' }}>
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full" onScroll={onImageScroll}>
                  {displayImages.map((uri, index) => (
                    <div key={`lost-${index}`} className="w-full h-full shrink-0 snap-center cursor-pointer" onClick={() => handleOpenViewer(index)}>
                      <ImageWithLoading uri={uri} />
                    </div>
                  ))}
                </div>
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[105px] w-full rounded-2xl overflow-hidden flex items-center justify-center z-10">
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(232,155,90,0.8)] to-transparent" />
                </div>
                <div className="absolute top-5 right-5 bg-[#E89B5A] px-4 py-1 rounded-full z-20 pointer-events-none">
                  <span className="text-white font-extrabold text-[16px] tracking-[0.5px] leading-5 uppercase">Thất lạc</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 mb-[26px] flex flex-col items-center z-20 pointer-events-none">
                  <span className="text-white text-[24px] font-bold text-center capitalize mb-2">{pet?.name?.toLowerCase() || 'thú cưng'}</span>
                  <span className="text-white text-[14px] font-normal text-center tracking-[0.5px]">
                    {displayAge} • {formatBreed(pet?.breed) || 'Không rõ giống'}
                  </span>
                </div>
                {displayImages.length > 1 && (
                  <div className="absolute bottom-[8px] w-full flex flex-row justify-center items-center z-20 pointer-events-none">
                    {displayImages.map((_, index) => (
                      <div key={index} className={`h-[5px] rounded-full mx-[2px] transition-all ${index === currentImageIndex ? 'w-[14px] bg-[#E89B5A]' : 'w-[5px] bg-white/70'}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 px-6">
            <div className="bg-white rounded-[32px]" style={{ boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' }}>
              <div className="w-full rounded-[24px] overflow-hidden shadow-lg bg-gray-200 relative" style={{ height: 210 }}>
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full" onScroll={onImageScroll}>
                  {displayImages.map((uri, index) => (
                    <div key={`safe-${index}`} className="w-full h-full shrink-0 snap-center cursor-pointer" onClick={() => handleOpenViewer(index)}>
                      <ImageWithLoading uri={uri} />
                    </div>
                  ))}
                </div>
                {displayImages.length > 1 && (
                  <div className="absolute bottom-[8px] w-full flex flex-row justify-center items-center z-20 pointer-events-none">
                    {displayImages.map((_, index) => (
                      <div key={index} className={`h-[5px] rounded-full mx-[2px] transition-all ${index === currentImageIndex ? 'w-[14px] bg-[#E89B5A]' : 'w-[5px] bg-white/70'}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className='flex justify-center items-center'>
              <h2 className="text-[24px] font-medium text-gray-800 py-5">Bé {pet?.name} nè!</h2>
            </div>
          </div>
        )}

        {/* --- 2. INFORMATION BODY --- */}
        <div className="px-5">
          {isLost ? (
            <div className="bg-white">
              <h3 className="text-[18px] font-semibold text-[#AB5C1A] my-[21px]">Thông tin chủ nhân</h3>
              <div className="flex flex-col justify-center items-center mb-4">
                <div className="bg-white border w-full border-[#E89B5A] rounded-[16px] px-4 pt-[21px] pb-[23.15px]">
                  <div className="space-y-5 mx-4">
                    <div className="flex flex-row gap-4 pb-[12.15px]">
                      <div className="flex justify-center mb-5 relative top-1"><img src="/assets/icon/person.png" style={{ width: 16, height: 16 }} className="object-cover" alt="icon" /></div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[#AB5C1A] text-[16px] font-semibold leading-[16px] mb-[7px]">Tên chủ nhân</span>
                        <span className="text-[#8E8E93] text-[14px] font-normal leading-[16px]">{displayOwnerName}</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-4 pb-[12.15px]">
                      <div className="flex justify-center mb-5 relative top-1"><img src="/assets/icon/phone.png" style={{ width: 16, height: 16 }} className="object-cover" alt="icon" /></div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[#AB5C1A] text-[16px] font-semibold leading-[16px] mb-[7px]">Số điện thoại</span>
                        <span className="text-[#8E8E93] text-[14px] font-normal leading-[16px]">{displayOwnerPhone ? displayOwnerPhone : "Chưa có số điện thoại"}</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-4 pb-[12.15px]">
                      <div className="flex justify-center mb-5 relative top-1"><img src="/assets/icon/address-marker.png" style={{ width: 18, height: 18 }} className="object-cover" alt="icon" /></div>
                      <div className="flex-1 flex flex-col justify-center -mx-1">
                        <span className="text-[#AB5C1A] text-[16px] font-semibold leading-[16px] mb-[7px]">Địa chỉ</span>
                        <span className="text-[#8E8E93] text-[14px] font-normal leading-[16px]">{displayOwnerAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center w-4/5 bg-[#FFF8F5] px-2.5 rounded-full border border-[#E89B5A] relative -top-5">
                  <span className="text-[#AB5C1A] text-[14px] text-center font-normal leading-[20px] py-[6px]">{displayNote}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center'>
              <div className="w-full bg-white border border-[#D9D9D9] rounded-[16px] px-7 pt-5 pb-9">
                <div className="flex flex-row justify-between gap-2 mb-7">
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">Giới tính</p>
                    <p className="text-[#8E8E93] font-normal text-[14px] capitalize">{typeof pet.gender === 'string' ? pet.gender.toLowerCase() : 'Không rõ'}</p>
                  </div>
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">Giống</p>
                    <p className="text-[#8E8E93] font-normal text-[14px]">{formatBreed(pet.breed) || 'Không rõ'}</p>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center gap-2">
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">Màu sắc</p>
                    <p className="text-[#8E8E93] font-normal text-[14px] capitalize">{showText(pet.color)?.toLowerCase() || 'Không rõ'}</p>
                  </div>
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">Ngày sinh</p>
                    <p className="text-[#8E8E93] font-normal text-[14px]">{formatBirthday(rawDob)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center w-4/5 bg-[#FAFAFA] px-2.5 py-[6px] rounded-full border border-[#D9D9D9] relative -top-5">
                <span className="text-[#757575] text-[14px] text-center font-normal leading-5">Thú cưng này đang an toàn bên chủ nhân</span>
              </div>
            </div>
          )}

          {/* --- 3. BOTTOM ACTIONS --- */}
          <div className="-mt-4 mb-5">
            {isLost ? (
              <div className="flex flex-col gap-3">
                {!!displayOwnerPhone && (
                  <button onClick={() => setIsContactModalVisible(true)} className="w-full bg-[#E89B5A] py-4 rounded-2xl flex flex-row justify-center items-center">
                    <img src="/assets/icon/phone-white.png" style={{ width: 16, height: 16 }} className="object-cover" alt="phone" />
                    <span className="text-white font-semibold text-[16px] ml-2">Liên hệ chủ nhân</span>
                  </button>
                )}
                {!hasReported && (
                  <button onClick={() => setIsModalVisible(true)} className="w-full border border-[#E5E5E5] py-4 rounded-2xl flex flex-row justify-center items-center">
                    <img src="/assets/icon/location-gray.png" style={{ width: 10, height: 14 }} className="object-cover relative -top-[2px]" alt="location" />
                    <span className="text-[#8E8E93] font-medium text-[16px] leading-5 ml-2">Chia sẻ vị trí của tôi</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#FAFAFA] w-full px-9 py-[13px] rounded-[16px] border border-[#D9D9D9] flex items-center justify-center mt-5">
                <span className="text-center text-[#757575] font-normal text-[14px] leading-6 tracking-[0.5px]">
                  Vì lý do bảo mật, thông tin liên hệ của chủ nhân chỉ hiển thị khi thú cưng bị báo mất.
                </span>
              </div>
            )}
          </div>

          <button onClick={() => setIsReportVisible(true)} className="w-full flex items-center justify-center pt-2 pb-4">
            <span className="text-center text-[#8E8E93] text-[14px] font-normal underline">Có gì đó không đúng? Báo cáo tại đây</span>
          </button>
        </div>
      </div>

      <ImageViewerOverlay images={displayImages} isVisible={isViewerVisible} initialIndex={viewerIndex} onClose={() => setIsViewerVisible(false)} />

      <ShelterContactModal
        isVisible={isContactModalVisible}
        onClose={() => setIsContactModalVisible(false)}
        shelterData={{
          name: displayOwnerName,
          phone: displayOwnerPhone,
          avatarUrl: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayOwnerName) + '&background=E89B5A&color=fff',
          note: displayNote,
        }}
      />

      <ReportIssueModal
        isVisible={isReportVisible}
        onClose={() => setIsReportVisible(false)}
        onSubmit={async (data: any) => {
          try {
            await axiosClient.post('/interactions/report-and-block', {
              petId: pet.id,
              reason: data.reason,
              details: data.details,
              isBlockRequested: data.isBlockRequested,
            });
            setIsReportVisible(false);
            if (data.isBlockRequested) setIsContentBlocked(true);
            else window.alert("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất.");
          } catch (error: any) {
            window.alert('Không thể gửi báo cáo. Vui lòng thử lại.');
          }
        }}
      />

      <LostModeShareModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleShareLocation}
      />
    </div>
  );
}

// =====================================================================
// 4. SUSPENSE WRAPPER (Để vượt qua lỗi build của Next.js SSR)
// =====================================================================

export default function ScannedPetScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen max-w-[500px] mx-auto bg-white flex flex-col items-center justify-center shadow-md">
        <div className="border-4 border-[#ffa053] border-t-transparent rounded-full w-10 h-10 animate-spin"></div>
        <p className="text-gray-500 font-medium mt-4">Đang tải...</p>
      </div>
    }>
      <ScannedPetContent />
    </Suspense>
  );
}