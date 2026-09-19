# Prompt log 01 — Đặc tả & khởi động

> Đây là nhật ký prompt thật của quá trình xây dựng ScamCall Shield cùng Claude.
> Bạn (thí sinh) nên BỔ SUNG các prompt/ghi chú thật của mình vào các tệp này trước khi nộp,
> để phản ánh đúng quá trình làm việc của bạn.

## Prompt khởi động (người dùng → AI)
"Hãy build cho tôi 1 cái web với yêu cầu như trên file docs. Web có thể chuyển đổi được
2 nền tối/sáng. Hãy code cẩn thận, từ từ bình tĩnh. Code một phát ăn ngay."

Kèm theo: lệnh `/design-mastery` (yêu cầu chất lượng giao diện thi đấu) và 2 tệp:
- `Vibe_Coding_Challenge.pdf` — thể lệ cuộc thi (web tĩnh, tiêu chí chấm, cấu trúc nộp).
- `ScamCall_Shield_Dev_Guide.docx` — PRD chi tiết sản phẩm.

## Định hướng AI rút ra
- Web app chỉ HTML/CSS/JS, chạy hoàn toàn front-end (cho phép thư viện chạy trên trình duyệt).
- Sáu đầu vào: văn bản, giọng nói, ảnh, video, tệp, số điện thoại. Song ngữ Việt/Anh.
- Riêng tư mặc định: không backend, không gửi dữ liệu ra ngoài.
- Mô hình ML phải train THẬT, báo cáo số liệu thật (không bịa).
