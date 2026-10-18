import type { Metadata } from "next";
import Link from "next/link";
import { COLOR, CONTACT, FONT_BODY, FONT_HEAD, ROUTES } from "@/lib/site";
import PageHero from "@/components/site/PageHero";
import DeleteRequestForm from "@/components/site/DeleteRequestForm";

export const metadata: Metadata = {
  title: "Xóa tài khoản & dữ liệu | PawLife",
  description: "Hướng dẫn xóa tài khoản PawLife - Pet ID và dữ liệu liên quan, kèm biểu mẫu yêu cầu xóa trên web.",
  alternates: { canonical: ROUTES.deleteAccount },
};

// TODO: sửa đường dẫn menu cho đúng với app thực tế & số ngày lưu trữ.
const STEPS = [
  "Mở ứng dụng PawLife - Pet ID và đăng nhập.",
  "Vào Hồ sơ → Cài đặt → Tài khoản.",
  "Chọn “Xóa tài khoản” và xác nhận bằng mật khẩu hoặc mã xác minh.",
  "Tài khoản được vô hiệu hóa ngay và dữ liệu bị xóa vĩnh viễn trong vòng 30 ngày.",
];
const DELETED = ["Thông tin tài khoản: họ tên, email, số điện thoại, ảnh đại diện", "Hồ sơ thú cưng bạn đang là chủ và ảnh liên quan", "Mã thiết bị nhận thông báo, nhật ký hoạt động", "Đơn đăng ký nhận nuôi đang chờ xử lý"];
const KEPT = ["PawHistory (hồ sơ y tế, lịch sử nhận nuôi) được giữ lại ở dạng đã tách khỏi danh tính của bạn, để bảo toàn lịch sử cho thú cưng và chủ mới", "Dữ liệu giao dịch mua thẻ QR giữ theo thời hạn pháp luật về kế toán, thuế yêu cầu", "Bản sao lưu được xóa hoàn toàn trong tối đa 90 ngày"];

function Card({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-[20px] border bg-white p-6" style={{ borderColor: COLOR.line, boxShadow: "0 10px 30px rgba(0,0,0,.03)" }}>
      <h3 style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 700, color, marginBottom: 12 }}>{title}</h3>
      <ul style={{ paddingLeft: 20, listStyle: "disc", margin: 0 }}>
        {items.map((t) => <li key={t} style={{ fontSize: 14, color: COLOR.body, lineHeight: 1.65, marginBottom: 6, fontFamily: FONT_BODY }}>{t}</li>)}
      </ul>
    </div>
  );
}

export default function DeleteAccountPage() {
  return (
    <>
      <PageHero eyebrow="Tài khoản" title="Xóa tài khoản PawLife" desc="Bạn có toàn quyền kiểm soát dữ liệu của mình. Dưới đây là cách xóa tài khoản và những gì sẽ xảy ra với dữ liệu." />
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-10 px-4">
        <section>
          <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, color: COLOR.ink, marginBottom: 16 }}>Cách 1: Xóa ngay trong ứng dụng</h2>
          <ol className="flex flex-col gap-3" style={{ listStyle: "none", padding: 0 }}>
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-start gap-4">
                <span aria-hidden style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: COLOR.brand, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_HEAD }}>{i + 1}</span>
                <span style={{ fontSize: 15, lineHeight: 1.6, color: COLOR.body, paddingTop: 4 }}>{s}</span>
              </li>
            ))}
          </ol>
          <p style={{ marginTop: 16, fontSize: 14, color: COLOR.muted, lineHeight: 1.6 }}>Nếu bạn đang là chủ của thú cưng, hãy chuyển chủ trước khi xóa nếu muốn bé tiếp tục có chủ nuôi trên PawLife.</p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card title="Dữ liệu sẽ bị xóa" items={DELETED} color="#DC2626" />
          <Card title="Dữ liệu có thể được giữ lại" items={KEPT} color={COLOR.purple} />
        </section>

        <section id="yeu-cau" className="rounded-[24px] border bg-white p-6 lg:p-9" style={{ borderColor: COLOR.line, boxShadow: "0 10px 30px rgba(0,0,0,.03)" }}>
          <h2 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, color: COLOR.ink, marginBottom: 6 }}>Cách 2: Gửi yêu cầu trên web</h2>
          <p style={{ fontSize: 14, color: COLOR.muted, lineHeight: 1.6, marginBottom: 20 }}>Dành cho trường hợp bạn không còn truy cập được app. Chúng tôi sẽ gửi email xác minh tới địa chỉ đã đăng ký trước khi xóa.</p>
          <DeleteRequestForm />
        </section>

        <p style={{ fontSize: 14, color: COLOR.muted, textAlign: "center" }}>
          Cần hỗ trợ thêm? Email <a href={`mailto:${CONTACT.privacyEmail}`} style={{ color: COLOR.brand, fontWeight: 700 }}>{CONTACT.privacyEmail}</a> hoặc xem <Link href={ROUTES.privacy} style={{ color: COLOR.brand, fontWeight: 700 }}>Chính sách bảo mật</Link>.
        </p>
      </div>
    </>
  );
}