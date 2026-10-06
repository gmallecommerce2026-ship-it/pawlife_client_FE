'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ChevronLeft, AlertCircle, Tag, X } from 'lucide-react';

export default function CameraScanPage() {
  const router = useRouter();

  const [scanned, setScanned] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Hàm xử lý logic khi quét QR thành công hoặc nhập tay
  const processValidScan = (data: string) => {
    if (scanned) return;
    setScanned(true);

    let safeData = data.replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-').trim();
    let finalTagId = safeData;

    // Lọc lấy ID nếu QR chứa một đường link đầy đủ
    if (safeData.startsWith('http') || safeData.includes('pawlife://')) {
      let urlPath = safeData.split('?')[0];
      let lastSegment = urlPath.split('/').filter(Boolean).pop() || '';
      lastSegment = lastSegment.replace(/\.(png|svg|jpg)$/i, '');
      finalTagId = lastSegment;
    }
    
    // Xoá ký tự đặc biệt, chuyển thành in hoa
    finalTagId = finalTagId.replace(/[^a-zA-Z0-9-_]/g, "").toUpperCase();

    // 🚀 CHUYỂN HƯỚNG TỚI TRANG ĐÍCH (Trang xem hồ sơ thú cưng)
    // Sửa '/scan' thành route chứa code màn hình đích của bạn
    router.push(`/scan?tagId=${finalTagId}`);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col h-[100dvh] w-full max-w-[500px] mx-auto overflow-hidden">
      
      {/* 1. CAMERA VIEW */}
      <div className="absolute inset-0 z-0">
        <Scanner
          onScan={(result) => {
            if (result && result.length > 0 && !scanned && !showInputModal && !showGuideModal) {
              processValidScan(result[0].rawValue);
            }
          }}
          formats={['qr_code']}
          components={{
            audio: false,
            torch: false,
            tracker: false, // Tắt UI mặc định của thư viện để dùng UI custom
          }}
          styles={{ container: { width: '100%', height: '100%' } }}
        />
      </div>

      {/* 2. OVERLAY KHOÉT LỖ & UI TIA LASER */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Lớp phủ mờ đục toàn màn hình có khoét lỗ vuông 288x288 ở giữa */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[288px] h-[288px] rounded-[24px]"
          style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)' }}
        >
          {/* 4 Góc viền màu cam */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-[4px] border-l-[4px] border-[#E89B5A] rounded-tl-[24px]" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-[4px] border-r-[4px] border-[#E89B5A] rounded-tr-[24px]" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[4px] border-l-[4px] border-[#E89B5A] rounded-bl-[24px]" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[4px] border-r-[4px] border-[#E89B5A] rounded-br-[24px]" />

          {/* Tia Laser chạy dọc (Sử dụng animation ở cuối file) */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#E89B5A] shadow-[0_0_8px_2px_rgba(232,155,90,0.8)] opacity-90 animate-laser" />
        </div>
      </div>

      {/* 3. HEADER CONTROLS (Nút Back) */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-6 flex justify-between items-center pointer-events-auto">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md"
        >
          <ChevronLeft size={24} color="white" />
        </button>
      </div>

      {/* 4. BUTTON CÁCH QUÉT */}
      <div className="absolute top-[calc(50%-144px-60px)] left-0 right-0 z-20 flex justify-center pointer-events-auto">
        <button
          onClick={() => setShowGuideModal(true)}
          className="px-5 py-2.5 flex items-center gap-2 bg-black/50 rounded-full border border-white/20 backdrop-blur-md transition-active active:scale-95"
        >
          <AlertCircle size={16} color="white" />
          <span className="text-white font-medium text-[15px]">Cách Quét</span>
        </button>
      </div>

      {/* 5. FOOTER CONTROLS */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-8 pointer-events-auto">
        <button
          onClick={() => setShowInputModal(true)}
          className="px-6 py-3 flex items-center gap-2 bg-black/50 rounded-full border border-white/20 backdrop-blur-md transition-active active:scale-95"
        >
          <Tag size={18} color="white" />
          <span className="text-white font-medium text-[15px]">Nhập mã thủ công</span>
        </button>

        <p className="text-gray-300 text-center text-[15px] px-[60px] pointer-events-none">
          Di chuyển mã QR vào giữa camera để quét tự động
        </p>
      </div>

      {/* ========================================= */}
      {/* MODAL 1: NHẬP MÃ THỦ CÔNG                 */}
      {/* ========================================= */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-6 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white w-full rounded-[24px] p-6 flex flex-col items-center shadow-2xl relative animate-in zoom-in-95">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Tag size={24} className="text-[#E89B5A]" />
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-gray-900">Nhập Mã Thú Cưng</h2>
            <p className="text-gray-500 text-center mb-6 text-[14px]">
              Nhập mã ID được in trên thẻ định danh (VD: PLT-0001)
            </p>

            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="PLT-0001"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-center text-[18px] font-bold tracking-widest mb-6 text-gray-900 outline-none focus:border-[#E89B5A]"
            />

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setShowInputModal(false); setManualCode(''); }}
                className="flex-1 bg-gray-100 py-3.5 rounded-xl text-gray-700 font-semibold text-[16px]"
              >
                Hủy
              </button>
              <button
                disabled={!manualCode.trim()}
                onClick={() => {
                  if (manualCode.trim()) {
                    setShowInputModal(false);
                    processValidScan(manualCode.trim());
                    setManualCode('');
                  }
                }}
                className={`flex-1 py-3.5 rounded-xl font-bold text-[16px] text-white ${manualCode.trim() ? 'bg-[#E89B5A]' : 'bg-orange-300'}`}
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 2: HƯỚNG DẪN QUÉT                   */}
      {/* ========================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-6 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white w-full rounded-[24px] p-6 flex flex-col shadow-2xl relative animate-in zoom-in-95">
            <button 
              onClick={() => setShowGuideModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-full"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-900 pr-8">Hướng dẫn quét QR</h2>
            <ul className="text-[15px] text-gray-600 space-y-3 pl-5 list-disc mb-6">
              <li>Cho phép trang web sử dụng quyền truy cập Camera của bạn.</li>
              <li>Đưa camera điện thoại vào gần thẻ định danh trên vòng cổ của thú cưng.</li>
              <li>Giữ mã QR nằm trọn vẹn bên trong khung vuông màu cam.</li>
              <li>Hệ thống sẽ tự động quét và chuyển bạn đến hồ sơ của bé.</li>
            </ul>
            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-[#E89B5A] py-3.5 rounded-xl font-bold text-[16px] text-white"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* STYLE CHẠY TIA LASER */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-laser {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(280px); }
        }
        .animate-laser {
          animation: scan-laser 2.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}