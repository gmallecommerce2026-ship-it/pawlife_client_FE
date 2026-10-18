import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/site/LegalLayout";
import { CONTACT, ROUTES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | PawLife",
  description: "Cách PawLife thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn.",
  alternates: { canonical: ROUTES.privacy },
};

// TODO: rà soát từng mục cho khớp thực tế app (SDK analytics, quảng cáo, vị trí...) và nhờ luật sư duyệt trước khi nộp store.
const SECTIONS: LegalSection[] = [
  { id: "gioi-thieu", title: "Giới thiệu", blocks: [
    "PawLife (“chúng tôi”) vận hành ứng dụng PawLife - Pet ID và website pawlife.vn. Chính sách này giải thích cách chúng tôi xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và các quy định liên quan.",
    "Bằng việc sử dụng dịch vụ, bạn xác nhận đã đọc và đồng ý với chính sách này.",
  ] },
  { id: "du-lieu-thu-thap", title: "Dữ liệu chúng tôi thu thập", blocks: [
    "Dữ liệu bạn cung cấp:",
    { list: ["Thông tin tài khoản: họ tên, email, số điện thoại, ảnh đại diện.", "Hồ sơ thú cưng: tên, giống, ngày sinh, ảnh, tiêm phòng, hồ sơ y tế (PawHistory).", "Đơn đăng ký nhận nuôi và thông tin bạn trao đổi với trạm cứu hộ.", "Nội dung bạn gửi qua biểu mẫu liên hệ hoặc yêu cầu hỗ trợ."] },
    "Dữ liệu thu thập tự động:",
    { list: ["Thông tin thiết bị và hệ điều hành, mã thiết bị phục vụ thông báo đẩy.", "Nhật ký sử dụng, lỗi ứng dụng (crash log) để cải thiện chất lượng.", "Dữ liệu quét thẻ QR: thời điểm quét và, nếu bạn cho phép, vị trí gần đúng khi chế độ lạc đang bật."] },
    "Quyền truy cập trên thiết bị (camera để quét QR, thư viện ảnh, thông báo, vị trí) chỉ được dùng khi bạn cấp quyền và bạn có thể thu hồi bất cứ lúc nào trong phần Cài đặt của điện thoại.",
  ] },
  { id: "muc-dich", title: "Mục đích sử dụng", blocks: [
    { list: ["Tạo và quản lý tài khoản, hồ sơ thú cưng, thẻ QR.", "Hiển thị thông tin liên hệ cho người nhặt được thú cưng khi chế độ lạc được bật.", "Kết nối bạn với trạm cứu hộ trong quá trình nhận nuôi.", "Gửi thông báo nhắc lịch tiêm phòng và thông báo dịch vụ.", "Bảo mật, phòng chống gian lận và tuân thủ pháp luật.", "Phân tích ẩn danh để cải thiện sản phẩm."] },
  ] },
  { id: "chia-se", title: "Chia sẻ dữ liệu", blocks: [
    "Chúng tôi không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ trong các trường hợp:",
    { list: ["Với trạm cứu hộ khi bạn gửi đơn nhận nuôi.", "Với người quét thẻ QR, giới hạn ở thông tin bạn cho phép hiển thị.", "Với nhà cung cấp dịch vụ (lưu trữ đám mây, gửi email/thông báo, phân tích) theo hợp đồng bảo mật dữ liệu.", "Khi cơ quan nhà nước có thẩm quyền yêu cầu theo quy định pháp luật."] },
  ] },
  { id: "luu-tru", title: "Lưu trữ & bảo mật", blocks: [
    "Dữ liệu được mã hóa khi truyền tải (HTTPS/TLS) và được kiểm soát truy cập nội bộ. Dữ liệu được lưu trong thời gian tài khoản còn hoạt động; sau khi bạn xóa tài khoản, chúng tôi xử lý theo mục 6 và trang Xóa tài khoản.",
    "Dữ liệu có thể được lưu trữ trên máy chủ đặt ngoài Việt Nam. Chúng tôi áp dụng các biện pháp phù hợp để bảo vệ dữ liệu khi chuyển giao.",
  ] },
  { id: "quyen", title: "Quyền của bạn", blocks: [
    "Bạn có quyền truy cập, chỉnh sửa, hạn chế xử lý, phản đối, rút lại sự đồng ý và yêu cầu xóa dữ liệu cá nhân của mình.",
    { list: ["Xóa tài khoản trực tiếp trong app hoặc tại trang Xóa tài khoản (/xoa-tai-khoan).", `Các yêu cầu khác: gửi email tới ${CONTACT.privacyEmail}. Chúng tôi phản hồi trong vòng 30 ngày.`] },
    "Lưu ý: hồ sơ y tế và lịch sử nhận nuôi (PawHistory) của thú cưng được thiết kế để không bị chỉnh sửa hay xóa; khi bạn xóa tài khoản, các hồ sơ này được tách khỏi danh tính của bạn.",
  ] },
  { id: "tre-em", title: "Trẻ em", blocks: [
    "Dịch vụ không hướng tới người dưới 16 tuổi và chúng tôi không cố ý thu thập dữ liệu của trẻ em. Nếu phát hiện, chúng tôi sẽ xóa dữ liệu đó. Vui lòng liên hệ nếu bạn cho rằng trẻ em đã gửi dữ liệu cho chúng tôi.",
  ] },
  { id: "cookie", title: "Cookie & công nghệ tương tự", blocks: [
    "Website sử dụng cookie cần thiết để vận hành và cookie phân tích để hiểu cách trang được sử dụng. Bạn có thể tắt cookie trong trình duyệt, một số tính năng có thể bị ảnh hưởng.",
  ] },
  { id: "thay-doi", title: "Thay đổi chính sách", blocks: [
    "Chúng tôi có thể cập nhật chính sách này và sẽ thông báo trên app hoặc website khi có thay đổi quan trọng. Ngày cập nhật được ghi ở đầu trang.",
  ] },
  { id: "lien-he", title: "Liên hệ", blocks: [
    `Mọi thắc mắc về quyền riêng tư: ${CONTACT.privacyEmail} hoặc ${CONTACT.email}. Địa chỉ: ${CONTACT.address}.`,
  ] },
];

export default function PrivacyPage() {
  return <LegalLayout eyebrow="Pháp lý" title="Chính sách bảo mật" intro="Chúng tôi coi trọng quyền riêng tư của bạn và của những người bạn bốn chân." sections={SECTIONS} />;
}