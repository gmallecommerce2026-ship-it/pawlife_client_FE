import type { Metadata } from "next";
import LegalLayout, { type LegalSection } from "@/components/site/LegalLayout";
import { CONTACT, ROUTES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | PawLife",
  description: "Điều khoản và điều kiện khi sử dụng ứng dụng, thẻ QR và website PawLife.",
  alternates: { canonical: ROUTES.terms },
};

// TODO: nhờ luật sư rà soát (đặc biệt mục thanh toán/hoàn trả và giới hạn trách nhiệm).
const SECTIONS: LegalSection[] = [
  { id: "chap-nhan", title: "Chấp nhận điều khoản", blocks: ["Khi tải, truy cập hoặc sử dụng ứng dụng PawLife - Pet ID, thẻ QR và website pawlife.vn, bạn đồng ý bị ràng buộc bởi các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ."] },
  { id: "tai-khoan", title: "Tài khoản", blocks: [
    { list: ["Bạn phải từ 16 tuổi trở lên (hoặc có sự đồng ý của người giám hộ).", "Thông tin đăng ký cần chính xác và được cập nhật.", "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động trong tài khoản."] },
  ] },
  { id: "the-qr", title: "Thẻ QR & hồ sơ thú cưng", blocks: [
    "Mỗi thẻ QR gắn với một hồ sơ thú cưng. Bạn chịu trách nhiệm về tính chính xác của thông tin hồ sơ. Chế độ lạc cho phép người quét liên hệ với bạn; PawLife không bảo đảm thú cưng thất lạc sẽ được tìm thấy.",
    "PawHistory được thiết kế chỉ bổ sung, không ghi đè hay xóa nhằm bảo đảm tính minh bạch của lịch sử y tế và nhận nuôi.",
  ] },
  { id: "nhan-nuoi", title: "Nhận nuôi", blocks: [
    "PawLife là nền tảng kết nối. Việc xét duyệt, bàn giao và chăm sóc sau nhận nuôi do trạm cứu hộ và người nhận nuôi thực hiện. Bạn cam kết nhận nuôi có trách nhiệm, không bỏ rơi, mua bán hay ngược đãi thú cưng, và đồng ý để trạm kiểm tra sau nhận nuôi.",
  ] },
  { id: "noi-dung", title: "Nội dung người dùng", blocks: [
    "Bạn giữ quyền sở hữu nội dung mình đăng (ảnh, mô tả...) và cấp cho PawLife quyền không độc quyền để lưu trữ, hiển thị nhằm vận hành dịch vụ. Bạn bảo đảm nội dung không vi phạm quyền của người khác.",
  ] },
  { id: "cam", title: "Hành vi bị cấm", blocks: [
    { list: ["Cung cấp thông tin sai lệch hoặc mạo danh.", "Dùng dịch vụ để buôn bán, ngược đãi hoặc đăng nội dung vi phạm pháp luật.", "Can thiệp, dò quét hoặc phá hoại hệ thống; sao chép thẻ QR của người khác.", "Thu thập dữ liệu người dùng trái phép."] },
  ] },
  { id: "thanh-toan", title: "Thanh toán & hoàn trả", blocks: [
    "Ứng dụng miễn phí. Thẻ QR vật lý mua tại trang Mua thẻ QR được bán theo giá niêm yết. Chính sách đổi trả: [TODO: ví dụ đổi trả trong 7 ngày nếu lỗi do nhà sản xuất]. Giao dịch qua App Store/Google Play tuân theo chính sách của các nền tảng này (nếu có).",
  ] },
  { id: "so-huu", title: "Sở hữu trí tuệ", blocks: ["Thương hiệu, logo, giao diện và mã nguồn PawLife thuộc quyền sở hữu của chúng tôi. Bạn không được sao chép hoặc khai thác thương mại nếu chưa có văn bản đồng ý."] },
  { id: "mien-tru", title: "Miễn trừ & giới hạn trách nhiệm", blocks: [
    "Dịch vụ được cung cấp “nguyên trạng”. Trong phạm vi pháp luật cho phép, PawLife không chịu trách nhiệm về thiệt hại gián tiếp, về hành vi của người dùng hoặc trạm cứu hộ, hay về sức khỏe, hành vi của thú cưng sau nhận nuôi. Thông tin trong app không thay thế tư vấn của bác sĩ thú y.",
  ] },
  { id: "cham-dut", title: "Tạm ngừng & chấm dứt", blocks: [
    "Bạn có thể xóa tài khoản bất cứ lúc nào. Chúng tôi có thể tạm khóa hoặc chấm dứt tài khoản vi phạm điều khoản này.",
  ] },
  { id: "luat", title: "Luật áp dụng", blocks: ["Điều khoản chịu sự điều chỉnh của pháp luật Việt Nam. Tranh chấp được ưu tiên giải quyết thông qua thương lượng, nếu không thành sẽ đưa ra Tòa án có thẩm quyền tại TP. Hồ Chí Minh."] },
  { id: "lien-he", title: "Liên hệ", blocks: [`Mọi câu hỏi về điều khoản: ${CONTACT.email} - ${CONTACT.address}.`] },
];

export default function TermsPage() {
  return <LegalLayout eyebrow="Pháp lý" title="Điều khoản sử dụng" intro="Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng PawLife." sections={SECTIONS} />;
}