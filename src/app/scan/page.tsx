'use client';

import React, { useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronLeft, EyeOff, Edit2 } from 'lucide-react';
import axiosClient from '@/lib/api/axiosClient';
import { displayBilingual, parseBilingual } from '@/utils/bilingualField';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Các component Modals bạn cần chuyển sang Web (sử dụng Dialog của HeadlessUI/Radix UI hoặc modal custom)
import LostModeShareModal, { FormData } from '@/components/LostModeShareModal';
import ReportIssueModal from '@/components/ReportIssueModal';
import ShelterContactModal from '@/components/ShelterContactModal';

// --- COMPONENT XỬ LÝ ẢNH CÓ LOADING ---
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

// --- COMPONENT XEM ẢNH FULLSCREEN ---
const ImageViewerOverlay = ({
  images,
  isVisible,
  initialIndex = 0,
  onClose,
}: {
  images: string[];
  isVisible: boolean;
  initialIndex?: number;
  onClose: () => void;
}) => {
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
        <button
          onClick={onClose}
          className="p-2 bg-black/40 rounded-full pointer-events-auto"
        >
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
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${currentIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ScannedPetScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagId = searchParams.get('tagId');

  const { t, language } = useLanguage();
  const isVi = language === 'vi';

  const { user } = useContext(AuthContext) as any;
  const [pet, setPet] = useState<any>(null);
  
  const isOwner = useMemo(() => {
    if (!user || !pet) return false;
    return user.id === pet.ownerId || user.id === pet.owner?.id;
  }, [user, pet]);

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
          console.warn(isVi ? "Lỗi parse lostPhotos:" : "Error parsing lostPhotos:", e, rawLostPhotos);
        }
      }

      const dedupedLostImages = lostImages.filter((url) => !combinedImages.includes(url));
      combinedImages = [...combinedImages, ...dedupedLostImages];
    }

    return combinedImages.length > 0
      ? combinedImages
      : ['https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop'];
  }, [pet, isVi]);

  const calculateAgeDisplay = (dob: string | Date | undefined | null): string => {
    if (!dob) return isVi ? 'Không rõ tuổi' : 'Unknown age';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return isVi ? 'Không rõ tuổi' : 'Unknown age';

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (years > 0) return isVi ? `${years} tuổi` : `${years} year${years > 1 ? 's' : ''} old`;
    if (months > 0) return isVi ? `${months} tháng tuổi` : `${months} month${months > 1 ? 's' : ''} old`;
    return isVi ? 'Dưới 1 tháng tuổi' : 'Less than 1 month old';
  };

  const formatBirthday = (dob: string | Date | undefined | null): string => {
    if (!dob) return isVi ? 'Không rõ' : 'Unknown';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return isVi ? 'Không rõ' : 'Unknown';
    return birthDate.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
        window.alert(isVi ? 'Thành công\nĐã gửi thông báo cùng vị trí GPS của bạn đến ứng dụng của chủ thú cưng!' : 'Success\nSuccessfully sent notification with your GPS location to the pet owner!');
      } else {
        window.alert(isVi ? 'Đã báo cáo\nVị trí ẩn danh đã được ghi nhận.' : 'Reported\nAnonymous location has been recorded.');
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      const serverMsg = errorData?.message;
      const displayMsg = Array.isArray(serverMsg) ? serverMsg.join('\n') : serverMsg;
      window.alert(displayMsg || (isVi ? 'Không thể gửi thông báo. Vui lòng thử lại sau.' : 'Cannot send notification. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallOwner = () => {
    if (pet?.owner?.phone) {
      window.location.href = `tel:${pet.owner.phone}`;
    } else {
      window.alert(isVi ? 'Lỗi: Không tìm thấy số điện thoại của chủ nhân.' : 'Error: Owner phone number not found.');
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
        <p className="text-gray-500 font-medium mt-4">{isVi ? 'Đang tải...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen max-w-[500px] mx-auto bg-white flex flex-col items-center justify-center px-6 shadow-md text-center">
        <X size={60} color="#F43F5E" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          {isVi ? 'Không tìm thấy' : 'Not found'}
        </h2>
        <p className="text-gray-500 mt-2 mb-8">
          {isVi ? 'Mã QR này không hợp lệ hoặc vòng cổ chưa được đăng ký trên hệ thống.' : 'This QR code is invalid or the collar has not been registered on the system.'}
        </p>
        <button
          onClick={() => router.replace('/')}
          className="bg-gray-100 px-8 py-3 rounded-full text-gray-700 font-bold"
        >
          {isVi ? 'Quay lại' : 'Go back'}
        </button>
      </div>
    );
  }

  const isLost = pet.isLost || pet.status?.toUpperCase() === 'LOST';
  const rawDob = pet?.dob ?? pet?.birthDate ?? pet?.birthday ?? pet?.dateOfBirth ?? null;

  const displayAge = calculateAgeDisplay(rawDob);
  const displayOwnerName = pet?.lostInfo?.ownerName || pet?.ownerName || pet?.owner?.name || (isVi ? 'Không rõ chủ nhân' : 'Unknown Owner');
  const displayOwnerPhone = pet?.owner?.phone || null;
  const displayOwnerAddress = pet?.owner?.address || (isVi ? 'Chưa cung cấp địa chỉ' : 'No address provided');

  const rawNote = pet?.lostInfo?.note || pet?.note;
  const displayNote = rawNote
    ? (typeof rawNote === 'object' ? displayBilingual(parseBilingual(rawNote), isVi) : rawNote)
    : (isVi ? 'Vui lòng liên hệ tôi sớm nhất' : 'Please contact me ASAP');

  const handleReportSubmit = async (reason: string, details: string, isBlockRequested: boolean) => {
    try {
      await axiosClient.post('/interactions/report-and-block', {
        petId: pet.id,
        reason,
        details,
        isBlockRequested
      });

      setIsReportVisible(false);

      if (isBlockRequested) {
        setIsContentBlocked(true);
      } else {
        window.alert(isVi ? "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất." : "Thank you for reporting. We will review it shortly.");
      }
    } catch (error) {
      window.alert("Error: Could not submit report.");
    }
  };

  if (isContentBlocked) {
    return (
      <div className="min-h-screen max-w-[500px] mx-auto bg-white flex flex-col items-center justify-center px-6 shadow-md relative">
        <div className="absolute top-12 left-6 z-40">
          <button onClick={() => router.back()} className="p-2">
            <ChevronLeft size={24} color="#000000" />
          </button>
        </div>

        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <EyeOff size={32} color="#8E8E93" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-4 text-center">
          {isVi ? 'Nội dung đã bị ẩn' : 'Content Hidden'}
        </h2>
        <p className="text-gray-500 text-center mt-3 mb-8 px-4 leading-6">
          {isVi
            ? 'Bạn đã chặn nội dung từ người dùng này. Chúng tôi đã ghi nhận báo cáo và sẽ xem xét kĩ lưỡng.'
            : 'You have blocked content from this user. We have received your report and will review it.'}
        </p>

        <button
          onClick={() => router.replace('/')}
          className="bg-[#E89B5A] px-8 py-3.5 rounded-full shadow-sm text-white font-bold text-[16px]"
        >
          {isVi ? 'Về trang chủ' : 'Return Home'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-[500px] mx-auto shadow-md relative flex flex-col">
      <div className="absolute top-6 right-6 z-40">
        <button
          onClick={() => router.replace('/')}
          className="w-8 h-8 flex items-center justify-center"
        >
          <img src="/assets/icon/close.png" style={{ width: 12, height: 12 }} alt="Close" />
        </button>
      </div>
      
      <div className="w-full h-20 mx-auto shrink-0" />

      <div className="flex-1 overflow-y-auto pb-10">
        {/* --- 1. HERO IMAGE SECTION --- */}
        {isLost ? (
          <div className="px-5 pt-4">
            <div className="bg-white rounded-[32px] z-10"
              style={{ boxShadow: '0px 4px 10px rgba(232, 155, 90, 0.4)' }}>
              <div
                className="relative rounded-[24px] overflow-hidden bg-gray-200"
                style={{ height: 210, boxShadow: '0px 10px 15px rgba(0,0,0,0.6)' }}
              >
                {/* --- SLIDER ẢNH --- */}
                <div
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full"
                  onScroll={onImageScroll}
                >
                  {displayImages.map((uri, index) => (
                    <div
                      key={`lost-${index}`}
                      className="w-full h-full shrink-0 snap-center cursor-pointer"
                      onClick={() => handleOpenViewer(index)}
                    >
                      <ImageWithLoading uri={uri} />
                    </div>
                  ))}
                </div>

                {/* Overlays LinearGradient */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[105px] w-full rounded-2xl overflow-hidden flex items-center justify-center z-10">
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(232,155,90,0.8)] to-transparent" />
                </div>

                {/* Badge Lost */}
                <div className="absolute top-5 right-5 bg-[#E89B5A] px-4 py-1 rounded-full z-20 pointer-events-none">
                  <span className="text-white font-extrabold text-[16px] tracking-[0.5px] leading-5 uppercase">
                    {isVi ? 'Thất lạc' : 'Lost'}
                  </span>
                </div>

                {/* Tên & Tuổi thú cưng */}
                <div className="absolute bottom-0 left-0 right-0 mb-[26px] flex flex-col items-center z-20 pointer-events-none">
                  <span className="text-white text-[24px] font-bold text-center capitalize mb-2">
                    {pet?.name?.toLowerCase() || (isVi ? 'thú cưng' : 'pet')}
                  </span>
                  <span className="text-white text-[14px] font-normal text-center tracking-[0.5px]">
                    {displayAge !== (isVi ? 'Không rõ tuổi' : 'Unknown age') ? `${displayAge}` : (isVi ? 'Không rõ tuổi' : 'Age unknown')} • {displayBilingual(parseBilingual(pet?.breed), isVi) || (isVi ? 'Không rõ giống' : 'Unknown breed')}
                  </span>
                </div>

                {/* Pagination Dots */}
                {displayImages.length > 1 && (
                  <div className="absolute bottom-[8px] w-full flex flex-row justify-center items-center z-20 pointer-events-none">
                    {displayImages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-[5px] rounded-full mx-[2px] transition-all ${index === currentImageIndex ? 'w-[14px] bg-[#E89B5A]' : 'w-[5px] bg-white/70'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 px-6">
            <div className="bg-white rounded-[32px]" style={{
              boxShadow: '0px 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div
                className="w-full rounded-[24px] overflow-hidden shadow-lg bg-gray-200 relative"
                style={{ height: 210 }}
              >
                <div
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full"
                  onScroll={onImageScroll}
                >
                  {displayImages.map((uri, index) => (
                    <div key={`safe-${index}`} className="w-full h-full shrink-0 snap-center">
                      <ImageWithLoading uri={uri} />
                    </div>
                  ))}
                </div>

                {/* Dấu chấm (Pagination Dots) đè lên ảnh */}
                {displayImages.length > 1 && (
                  <div className="absolute bottom-[8px] w-full flex flex-row justify-center items-center z-20 pointer-events-none">
                    {displayImages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-[5px] rounded-full mx-[2px] transition-all ${index === currentImageIndex ? 'w-[14px] bg-[#E89B5A]' : 'w-[5px] bg-white/70'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className='flex justify-center items-center'>
              <h2 className="text-[24px] font-medium text-gray-800 py-5">
                {isVi ? `Bé ${pet?.name} nè!` : `Meet ${pet?.name}!`}
              </h2>
            </div>
          </div>
        )}

        {/* --- 2. INFORMATION BODY --- */}
        <div className="px-5">
          {isLost ? (
            <div className="bg-white">
              <h3 className="text-[18px] font-semibold text-[#AB5C1A] my-[21px]">
                {isVi ? 'Thông tin chủ nhân' : 'Owner Information'}
              </h3>
              <div className="flex flex-col justify-center items-center mb-4">
                <div className="bg-white border w-full border-[#E89B5A] rounded-[16px] px-4 pt-[21px] pb-[23.15px]">
                  <div className="space-y-5 mx-4">
                    <div className="flex flex-row gap-4 pb-[12.15px]">
                      <div className="flex justify-center mb-5 relative top-1">
                        <img src="/assets/icon/person.png" style={{ width: 16, height: 16 }} className="object-cover" alt="icon" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[#AB5C1A] text-[16px] font-semibold leading-[16px] mb-[7px]">
                          {isVi ? 'Tên chủ nhân' : 'Owner Name'}
                        </span>
                        <span className="text-[#8E8E93] text-[14px] font-normal leading-[16px]">{displayOwnerName}</span>
                      </div>
                    </div>

                    <div className="flex flex-row gap-4 pb-[12.15px]">
                      <div className="flex justify-center mb-5 relative top-1">
                        <img src="/assets/icon/phone.png" style={{ width: 16, height: 16 }} className="object-cover" alt="icon" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[#AB5C1A] text-[16px] font-semibold leading-[16px] mb-[7px]">
                          {isVi ? 'Số điện thoại' : 'Phone Number'}
                        </span>
                        <span className="text-[#8E8E93] text-[14px] font-normal leading-[16px]">{displayOwnerPhone ? displayOwnerPhone : "No phone provided"}</span>
                      </div>
                    </div>

                    <div className="flex flex-row gap-4 pb-[12.15px]">
                      <div className="flex justify-center mb-5 relative top-1">
                        <img src="/assets/icon/address-marker.png" style={{ width: 18, height: 18 }} className="object-cover" alt="icon" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center -mx-1">
                        <span className="text-[#AB5C1A] text-[16px] font-semibold leading-[16px] mb-[7px]">
                          {isVi ? 'Địa chỉ' : 'Address'}
                        </span>
                        <span className="text-[#8E8E93] text-[14px] font-normal leading-[16px]">
                          {displayOwnerAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center w-4/5 bg-[#FFF8F5] px-2.5 rounded-full border border-[#E89B5A] relative -top-5">
                  <span className="text-[#AB5C1A] text-[14px] text-center font-normal leading-[20px] py-[6px]">
                    {displayNote}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center'>
              <div className="w-full bg-white border border-[#D9D9D9] rounded-[16px] px-7 pt-5 pb-9">
                <div className="flex flex-row justify-between gap-2 mb-7">
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">{isVi ? 'Giới tính' : 'Gender'}</p>
                    <p className="text-[#8E8E93] font-normal text-[14px] capitalize">
                      {typeof pet.gender === 'string' ? pet.gender.toLowerCase() : (isVi ? 'không rõ' : 'unknown')}
                    </p>
                  </div>
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">{isVi ? 'Giống' : 'Breed'}</p>
                    <p className="text-[#8E8E93] font-normal text-[14px]">
                      {displayBilingual(parseBilingual(pet.breed), isVi) || (isVi ? 'Không rõ' : 'Unknown')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center gap-2">
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">{isVi ? 'Màu sắc' : 'Color'}</p>
                    <p className="text-[#8E8E93] font-normal text-[14px] capitalize">
                      {displayBilingual(parseBilingual(pet.color), isVi)?.toLowerCase() || (isVi ? 'không rõ' : 'unknown')}
                    </p>
                  </div>
                  <div className="w-1/2">
                    <p className="font-medium text-[16px] mb-[12.5px]">{isVi ? 'Ngày sinh' : 'Birthday'}</p>
                    <p className="text-[#8E8E93] font-normal text-[14px]">
                      {formatBirthday(rawDob)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center w-4/5 bg-[#FAFAFA] px-2.5 py-[6px] rounded-full border border-[#D9D9D9] relative -top-5">
                <span className="text-[#757575] text-[14px] text-center font-normal leading-5">
                  {isVi ? 'Thú cưng này đang an toàn bên chủ nhân' : 'This pet is safe and sound with their owner'}
                </span>
              </div>
            </div>
          )}

          {/* --- 3. BOTTOM ACTIONS --- */}
          <div className="-mt-4 mb-5">
            {isOwner ? (
              <div className="flex flex-col gap-3">
                <div className="bg-blue-50 w-full px-5 py-3 rounded-[16px] border border-blue-100 flex items-center justify-center mb-2 mt-2">
                  <span className="text-center text-blue-600 font-medium text-[14px] leading-5">
                    {isVi
                      ? 'Đây là góc nhìn của người khác khi quét mã thú cưng của bạn.'
                      : 'This is how others view your pet’s profile when scanning.'}
                  </span>
                </div>

                <button
                  onClick={() => router.push(`/edit-pet?id=${pet.id}`)}
                  className="w-full bg-[#E89B5A] py-4 rounded-2xl flex flex-row justify-center items-center shadow-sm"
                >
                  <Edit2 size={16} color="white" />
                  <span className="text-white font-semibold text-[16px] ml-2">
                    {isVi ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}
                  </span>
                </button>
              </div>
            ) : isLost ? (
              <div className="flex flex-col gap-3">
                {!!displayOwnerPhone && (
                  <button
                    onClick={() => setIsContactModalVisible(true)}
                    className="w-full bg-[#E89B5A] py-4 rounded-2xl flex flex-row justify-center items-center"
                  >
                    <img src="/assets/icon/phone-white.png" style={{ width: 16, height: 16 }} className="object-cover" alt="phone" />
                    <span className="text-white font-semibold text-[16px] ml-2">
                      {isVi ? 'Liên hệ chủ nhân' : 'Contact Owner'}
                    </span>
                  </button>
                )}

                {!hasReported && (
                  <button
                    onClick={() => setIsModalVisible(true)}
                    className="w-full border border-[#E5E5E5] py-4 rounded-2xl flex flex-row justify-center items-center"
                  >
                    <img src="/assets/icon/location-gray.png" style={{ width: 10, height: 14 }} className="object-cover relative -top-[2px]" alt="location" />
                    <span className="text-[#8E8E93] font-medium text-[16px] leading-5 ml-2">
                      {isVi ? 'Chia sẻ vị trí của tôi' : 'Share My Location'}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#FAFAFA] w-full px-9 py-[13px] rounded-[16px] border border-[#D9D9D9] flex items-center justify-center mt-5">
                <span className="text-center text-[#757575] font-normal text-[14px] leading-6 tracking-[0.5px]">
                  {isVi
                    ? 'Vì lý do bảo mật, thông tin liên hệ của chủ nhân chỉ hiển thị khi thú cưng bị báo mất.'
                    : 'For privacy, owner’s contact information is only available when a pet is marked as lost.'}
                </span>
              </div>
            )}
          </div>

          {!isOwner && (
            <button
              onClick={() => setIsReportVisible(true)}
              className="w-full flex items-center justify-center pt-2 pb-4"
            >
              <span className="text-center text-[#8E8E93] text-[14px] font-normal underline">
                {isVi ? 'Có gì đó không đúng? Báo cáo tại đây' : "Something isn't right? Report here"}
              </span>
            </button>
          )}
        </div>
      </div>

      <ImageViewerOverlay
        images={displayImages}
        isVisible={isViewerVisible}
        initialIndex={viewerIndex}
        onClose={() => setIsViewerVisible(false)}
      />

      {!!displayOwnerPhone && isContactModalVisible && (
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
      )}

      {isReportVisible && (
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
              if (data.isBlockRequested) setIsContentBlocked(true);
            } catch (error: any) {
              const msg = error.response?.data?.message;
              window.alert(msg || (isVi ? 'Không thể gửi báo cáo. Vui lòng thử lại.' : 'Could not submit report. Please try again.'));
              throw error;
            }
          }}
        />
      )}

      {isModalVisible && (
        <LostModeShareModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onConfirm={handleShareLocation}
        />
      )}
    </div>
  );
}