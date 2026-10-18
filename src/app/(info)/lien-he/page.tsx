import type { Metadata } from "next";
import { COLOR, ROUTES } from "@/lib/site";
import PageHero from "@/components/site/PageHero";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Liên hệ | PawLife",
  description: "Liên hệ đội ngũ PawLife để được hỗ trợ về ứng dụng, thẻ QR, nhận nuôi và hợp tác trạm cứu hộ.",
  alternates: { canonical: ROUTES.contact },
};

export default function ContactPage() {
  return (
    <>
      <PageHero 
        eyebrow="Liên hệ" 
        title="Chúng tôi luôn sẵn sàng lắng nghe" 
        desc="Có câu hỏi về app, thẻ QR hay muốn đồng hành cùng PawLife? Hãy để lại lời nhắn, chúng tôi sẽ phản hồi trong 1–2 ngày làm việc." 
      />
      {/* Thay vì dùng Grid, giới hạn chiều rộng ở 640px và căn giữa bằng mx-auto */}
      <div className="mx-auto w-full max-w-[640px] px-4 pb-20">
        <div 
          className="rounded-[24px] border bg-white p-6 lg:p-9" 
          style={{ borderColor: COLOR.line, boxShadow: "0 10px 30px rgba(0,0,0,.03)" }}
        >
          <ContactForm />
        </div>
      </div>
    </>
  );
}