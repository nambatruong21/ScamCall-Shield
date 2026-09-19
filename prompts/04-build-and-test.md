# Prompt log 04 — Hiện thực & kiểm thử

## Tiếp tục xây dựng
"làm tiếp đi / tiếp đi" — các vòng lặp hiện thực: bộ luật song ngữ theo Phụ lục B, engine
luật (khớp không phân biệt dấu, giữ vị trí để highlight), trích xuất URL/SĐT/số tiền/OTP,
chấm điểm URL có lý do, hợp nhất điểm, bộ phân loại kịch bản, sinh kế hoạch ứng phó theo
trạng thái người dùng ("đã bấm link / đã đưa OTP / đã chuyển tiền").

## Kiểm thử đã chạy
- `ml_training/parity.test.js` — suy luận JS == scikit-learn (< 1e-6). ✅
- `ml_training/pipeline.test.js` — 8 tình huống scam/safe cho điểm hợp lý. ✅
- Smoke test bằng jsdom — boot, phân tích văn bản đầu-cuối, toggle trạng thái (action
  tăng đúng), đổi ngôn ngữ không reload, render về model/learn/history. ✅
- Phone + file smoke — validate E.164, nhà mạng, premium 1900; magic-byte, đuôi kép,
  token PDF, SHA-256. ✅
- Đối chiếu 391 khóa i18n giữa hai bản vi/en — đầy đủ. ✅

> Ghi chú: hãy bổ sung các prompt thật của bạn (yêu cầu chỉnh sửa, ý tưởng, phản hồi)
> vào các tệp trong thư mục này để phản ánh đúng quá trình làm việc.
