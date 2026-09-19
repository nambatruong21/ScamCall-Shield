# Prompt log 02 — Kiến trúc & mô hình ML

## Quyết định kiến trúc (AI đề xuất, người dùng chấp thuận)
- Đa tệp đúng theo cấu trúc trong Dev Guide, KHÔNG gộp một tệp.
- Mọi dữ liệu (locales/rules/model/demoSamples) là tệp `.js` gán `window.*` để chạy được
  cả `file://` lẫn `http://` (tránh fetch JSON bị chặn CORS khi mở tệp).
- Thư viện vendor (jsQR, libphonenumber, JSZip, Tesseract worker) đóng gói offline.

## Mô hình ML
"Train model thật bằng scikit-learn trong môi trường, không fake số liệu. Dataset tổng hợp
song ngữ, báo cáo metrics bằng stratified 5-fold cross-validation, ship model train trên
toàn bộ dữ liệu. Model card ghi rõ dữ liệu là synthetic_anonymized."

Kết quả: TF-IDF (uni+bigram) + Logistic Regression. Suy luận JS trùng khớp scikit-learn
tới < 1e-6 (kiểm chứng bằng parity test). Điểm cuối hợp nhất 45% ML + 35% luật +
15% chỉ báo + 5% bối cảnh.
