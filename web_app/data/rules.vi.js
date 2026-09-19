/* ScamCall Shield - Vietnamese red-flag rules (Dev Guide Appendix B).
 * Each rule: id, cat (tactic category), w (weight 0-30), p (substring patterns).
 * Matching is case-insensitive and diacritic-insensitive (see ruleEngine.js),
 * so "chuyển tiền" also matches "chuyen tien". Keep patterns >= 2 words where
 * possible to avoid firing on harmless single keywords.
 */
(function (g) {
  g.SCS_RULES = g.SCS_RULES || {};
  g.SCS_RULES.vi = [
    { id: "vi_urgency", cat: "urgency", w: 12, p: [
      "ngay lập tức", "ngay bây giờ", "trong 5 phút", "trong 10 phút", "trong 30 phút",
      "trong 2 giờ", "trong 24h", "trong hôm nay", "ngay hôm nay", "trước 12h", "trước 15h",
      "trước 16h", "trước 17h", "trước 18h", "trước 21h", "trước 23h59", "gấp lắm",
      "chuyển gấp", "làm ngay", "kẻo mất", "kẻo bị", "hết hạn hôm nay", "cuối cùng",
      "quá hạn sẽ", "chỉ còn", "mai hết suất", "đóng trước", "khẩn cấp", "tin khẩn",
      "cảnh báo cuối", "chốt danh sách", "giữ suất hôm nay", "suất cuối"
    ]},
    { id: "vi_secrecy", cat: "secrecy", w: 18, p: [
      "không nói với ai", "không được nói", "giữ bí mật", "giữ kín", "tuyệt đối giữ",
      "đừng nói ba mẹ", "đừng nói với", "không thông báo cho người thân", "không được kể",
      "giữa chúng ta", "không gọi cho ai", "không được gọi lại", "đừng gọi lại số cũ",
      "nhóm kín", "bí mật tuyệt đối", "đừng nói ba", "đừng nói mẹ", "đừng cho ai biết"
    ]},
    { id: "vi_credential", cat: "credential", w: 25, p: [
      "mã otp", "nhập otp", "đọc otp", "gửi otp", "cung cấp otp", "otp vừa gửi",
      "mã xác nhận", "mã xác thực", "mã xác minh", "mã bảo mật", "mã pin", "mã cvv",
      "mật khẩu", "tên đăng nhập", "số thẻ", "ngày hết hạn thẻ", "thông tin bảo mật",
      "mã 6 số", "đọc giúp em mã", "gửi lại mã", "nhận hộ em mã", "đọc mã xác nhận"
    ]},
    { id: "vi_payment", cat: "payment", w: 25, p: [
      "chuyển tiền", "chuyển khoản", "chuyển toàn bộ", "nộp phí", "đóng phí", "đặt cọc",
      "phí xác minh", "phí hồ sơ", "phí giải ngân", "phí nhận thưởng", "phí vận chuyển",
      "tiền bảo lãnh", "nộp thuế", "nộp phạt", "nạp tiền", "nạp thẻ", "thẻ cào",
      "mua thẻ cào", "thanh toán hộ", "chuyển trước", "góp vốn", "ký quỹ", "nạp ví",
      "phí kích hoạt", "phí giữ chỗ", "phí lưu kho", "tiền viện phí", "tài khoản tạm giữ",
      "tài khoản an toàn", "tài khoản cá nhân của", "số tài khoản này", "tài khoản chỉ định"
    ]},
    { id: "vi_authority", cat: "authority", w: 12, p: [
      "công an", "cảnh sát", "viện kiểm sát", "tòa án", "toà án", "bộ công an",
      "cơ quan điều tra", "điều tra viên", "lệnh bắt", "triệu tập", "khởi tố",
      "cơ quan thuế", "tổng cục thuế", "thanh tra", "xuất nhập cảnh", "đăng kiểm",
      "bảo hiểm xã hội", "an ninh mạng", "nhân viên ngân hàng", "tổng đài viên",
      "cán bộ", "điện lực thông báo", "đây là điện lực", "đây là công an", "nhà mạng"
    ]},
    { id: "vi_fear", cat: "fear", w: 15, p: [
      "bị bắt", "bắt tạm giam", "bị khóa", "bị khoá", "sẽ bị khóa", "bị phạt",
      "bị cắt", "bị thu hồi", "bị đình chỉ", "bị phong tỏa", "phong toả", "bị tạm ngưng",
      "bị hủy", "bị huỷ", "rửa tiền", "đường dây ma túy", "vụ án", "bị truy tố",
      "bị khóa hai chiều", "khoá hai chiều", "bị giữ bằng lái", "bị lập biên bản",
      "bị trục xuất", "liên quan đến vụ"
    ]},
    { id: "vi_remote_app", cat: "remote_app", w: 25, p: [
      "cài app", "cài ứng dụng", "cài đặt ứng dụng", "tải app theo", "tải ứng dụng theo",
      "chia sẻ màn hình", "truy cập màn hình", "cấp quyền trợ năng", "cấp quyền truy cập",
      "app hỗ trợ", "ứng dụng giả lập", "làm theo hướng dẫn của cán bộ", "kết bạn zalo với điều tra"
    ]},
    { id: "vi_reward", cat: "reward", w: 15, p: [
      "trúng thưởng", "trúng giải", "nhận thưởng", "quà tri ân", "tri ân khách hàng",
      "trúng tuyển", "học bổng toàn phần", "hoàn tiền", "hoàn phí", "tiền treo",
      "miễn phí 0 đồng", "quà 0 đồng", "lợi nhuận", "cam kết lợi nhuận", "bao lỗ",
      "lãi suất khủng", "hoa hồng", "chiết khấu", "x2 tài khoản", "việc nhẹ lương cao"
    ]},
    { id: "vi_link_lure", cat: "link_lure", w: 10, p: [
      "bấm vào link", "bấm link", "nhấn vào link", "truy cập link", "theo link",
      "đường link bên dưới", "link sau", "link kèm theo", "đăng nhập tại", "đăng nhập qua link",
      "quét mã qr", "quét qr", "bấm phím", "soạn tin", "điền vào form", "nhấp vào đường dẫn"
    ]},
    { id: "vi_info_request", cat: "info_request", w: 18, p: [
      "cung cấp số căn cước", "số cccd", "cmnd", "căn cước công dân", "cung cấp thông tin cá nhân",
      "chụp 2 mặt", "ảnh chụp căn cước", "số tài khoản và mật khẩu", "xác minh danh tính tại",
      "xác thực thông tin thẻ", "cung cấp số thẻ"
    ]},
    { id: "vi_impersonation", cat: "impersonation", w: 16, p: [
      "con đổi số", "đổi số mới", "số mới của con", "điện thoại con hỏng", "máy con hỏng",
      "điện thoại hỏng", "mượn máy bạn", "rớt điện thoại", "đang kẹt ở", "mất ví rồi",
      "mượn máy nhắn", "con là cháu", "nhắn từ máy bạn"
    ]},
    { id: "vi_too_good", cat: "too_good", w: 14, p: [
      "lương 15 triệu", "lương 20 triệu", "mỗi ngày nhận", "một ngày kiếm", "không cần kinh nghiệm",
      "không phỏng vấn", "đảm bảo đậu", "bao đậu", "cam kết x", "x10 sau", "lãi 2% mỗi ngày",
      "rút tiền trong ngày", "rút gốc bất kỳ", "đậu visa 100", "bao lỗ 100"
    ]}
  ];
})(typeof window !== "undefined" ? window : globalThis);
