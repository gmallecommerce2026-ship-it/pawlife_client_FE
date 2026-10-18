import { ROUTES } from "@/lib/site";

export type FaqItem = { q: string; a: string; link?: { label: string; href: string } };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "tai-khoan", title: "Tài khoản & ứng dụng",
    items: [
      { q: "Làm sao để đăng ký tài khoản PawLife?", a: "Tải app PawLife - Pet ID trên App Store hoặc Google Play, chọn Đăng ký và xác minh email của bạn." },
      { q: "Tôi quên mật khẩu thì làm thế nào?", a: "Tại màn hình đăng nhập, chọn “Quên mật khẩu”, nhập email đã đăng ký và làm theo hướng dẫn trong email khôi phục." },
      { q: "Làm sao để xóa tài khoản và dữ liệu của tôi?", a: "Bạn có thể xóa trực tiếp trong app tại Hồ sơ → Cài đặt → Tài khoản → Xóa tài khoản, hoặc gửi yêu cầu trên web nếu không còn truy cập được app.", link: { label: "Xem hướng dẫn xóa tài khoản", href: ROUTES.deleteAccount } },
      { q: "Tôi có thể đổi email đăng nhập không?", a: "Có. Vào Hồ sơ → Cài đặt → Tài khoản → Đổi email. Bạn cần xác minh email mới trước khi thay đổi có hiệu lực." },
    ],
  },
  {
    id: "the-qr", title: "Thẻ QR",
    items: [
      { q: "Thẻ QR có bị hỏng khi dính nước không?", a: "Thẻ được làm từ chất liệu chống nước và chống xước, đủ bền cho sinh hoạt hằng ngày như tắm rửa, đi mưa hay vui chơi ngoài trời." },
      { q: "Người nhặt được bé có cần cài app để quét không?", a: "Không. Bất kỳ ai cũng có thể quét thẻ bằng camera điện thoại để xem thông tin và liên hệ chủ nuôi." },
      { q: "Tôi làm mất hoặc hỏng thẻ thì sao?", a: "Hãy liên hệ PawLife để vô hiệu hóa thẻ cũ và đặt thẻ thay thế. Hồ sơ thú cưng được giữ nguyên." },
    ],
  },
  {
    id: "che-do-lac", title: "Chế độ lạc",
    items: [
      { q: "Kích hoạt chế độ lạc có mất phí không?", a: "Không. Chế độ lạc hoàn toàn miễn phí, kích hoạt ngay trên app khi thú cưng thất lạc." },
      { q: "Thông tin nào hiển thị khi người khác quét thẻ?", a: "Chỉ những thông tin bạn cho phép, ví dụ tên bé, tình trạng và cách liên hệ. Thông tin cá nhân khác của bạn được bảo vệ." },
    ],
  },
  {
    id: "nhan-nuoi", title: "Nhận nuôi & chuyển chủ",
    items: [
      { q: "Quy trình nhận nuôi như thế nào?", a: "Chọn bé phù hợp, gửi đơn đăng ký nhận nuôi, trạm cứu hộ sẽ liên hệ phỏng vấn, và sau khi nhận nuôi trạm sẽ kiểm tra định kỳ." },
      { q: "Thú cưng ở trạm cứu hộ có an toàn về sức khỏe không?", a: "Các bé đều được gắn microchip, tẩy giun, tiêm phòng và triệt sản theo lịch của bác sĩ thú y trước khi tìm nhà mới." },
      { q: "Chuyển chủ cho thú cưng như thế nào?", a: "Chủ cũ xác nhận chuyển quyền trên app, chủ mới quét thẻ để tiếp nhận. Hồ sơ PawHistory được giữ nguyên." },
    ],
  },
  {
    id: "bao-mat", title: "Quyền riêng tư",
    items: [
      { q: "PawLife có bán dữ liệu của tôi không?", a: "Không. PawLife không bán dữ liệu cá nhân cho bên thứ ba.", link: { label: "Đọc Chính sách bảo mật", href: ROUTES.privacy } },
    ],
  },
];