"use client";

import { useState } from "react";
import { InvitationBox } from "@/components/invitation/box/InvitationBox";

/* Trang xem trước hộp 3D. Kéo thanh để mở/đóng nắp. Có thể xoá trang này khi không cần. */
export default function BoxPreviewPage() {
  const [progress, setProgress] = useState(0);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#EEEAE4] p-8">
      <InvitationBox progress={progress} size={320} />
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
        className="w-72"
        aria-label="Độ mở nắp hộp"
      />
    </main>
  );
}
