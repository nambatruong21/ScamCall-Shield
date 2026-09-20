# ScamCall Shield 🛡️

> Kiểm tra tin nhắn, cuộc gọi, ảnh, video và tệp đáng ngờ — phân tích đa phương thức,
> chạy **100% trên trình duyệt**, song ngữ Việt/Anh, riêng tư mặc định.
>
> *Check suspicious messages, calls, images, videos and files — multimodal scam
> analysis that runs entirely in your browser. Bilingual VI/EN, private by default.*

Bài dự thi **Vibe Coding Challenge**. Không backend, không tài khoản, không cookie theo dõi.
Nội dung bạn phân tích **không tự rời khỏi thiết bị**.

---

## ✨ Tính năng chính

| Đầu vào | Mô tả |
|---|---|
| 💬 **Văn bản** | Dán SMS/email/Zalo. Tô màu từng cụm thao túng, chấm điểm 0–100, phân loại kịch bản, kế hoạch ứng phó theo thứ tự. |
| 🎙 **Giọng nói** | Thu âm ≤60s + tự chuyển lời nói thành chữ (Web Speech API), luôn có ô nhập tay dự phòng. Đọc to kết quả (Chế độ Gia đình). |
| 🖼 **Hình ảnh** | OCR tiếng Việt + Anh (Tesseract.js), giải mã QR (jsQR), kéo chọn vùng cần đọc, sửa được bản chữ trước khi phân tích. |
| 🎬 **Video** | Lấy keyframe, OCR + quét QR từng khung, dừng sớm khi thấy link/QR đáng ngờ. |
| 📄 **Tệp tin** | Kiểm tra an toàn tĩnh: magic-byte vs đuôi, đuôi kép, macro Office, token động trong PDF (`/OpenAction`, `/JavaScript`, `/Launch`), SHA-256. **Không mở, không chạy, không tải lên.** |
| 📞 **Số điện thoại** | Xác thực cấu trúc E.164 (libphonenumber), gợi ý nhà mạng theo đầu số, cảnh báo đầu số 1900. Không khẳng định "an toàn", chỉ "định dạng hợp lệ". |

Cùng với: **điểm hợp nhất ML + luật**, bảng giải thích điểm, lịch sử cục bộ (tùy chọn,
đã che thông tin nhạy cảm), mini-game *Scam hay An toàn?*, từ điển dấu hiệu, và **Model Card**.

---

## 🚀 Cách chạy

Ứng dụng là tĩnh (HTML/CSS/JS). Có hai cách:

**1) Mở trực tiếp** — bấm đúp `web_app/index.html`.
Phần lớn tính năng (văn bản, số điện thoại, kiểm tra tệp, luật + ML) chạy ngay.

**2) Chạy qua web server (khuyến nghị, để OCR & micro hoạt động):**
```bash
cd web_app
python3 -m http.server 8080      # hoặc:  npx serve .
# mở http://localhost:8080
```

> **Vì sao nên dùng server?** OCR (Tesseract.js) và thu âm (getUserMedia / Web Speech API)
> yêu cầu ngữ cảnh `http(s)://` — không chạy ổn định khi mở bằng `file://`.
> Để triển khai công khai, đẩy thư mục `web_app/` lên **GitHub Pages** là đủ.

**Trình duyệt:** Chrome/Edge mới nhất (khuyến nghị). Firefox/Safari chạy được phần lớn;
chuyển giọng nói thành chữ phụ thuộc hỗ trợ Web Speech API của trình duyệt.

**Lưu ý OCR:** lần đầu cần Internet để tải dữ liệu ngôn ngữ (vài MB) từ CDN.
Thư viện worker đã được đóng gói sẵn trong `web_app/vendor/` (chạy offline sau đó).

---

## 🧠 Mô hình học máy (thật, có thể tái lập)

Mô hình **được train thật** bằng scikit-learn — không bịa số liệu. Pipeline đầy đủ ở
`ml_training/` (xem README riêng trong đó).

- **Thuật toán:** TF-IDF (uni+bigram, NFC + lowercase, song ngữ) + 2 đầu Logistic Regression
  (scam/an toàn và phân loại 7 kịch bản).
- **Train:** scikit-learn → export trọng số sang `web_app/data/model/model.js`.
- **Suy luận:** 100% bằng JavaScript trong trình duyệt (`web_app/js/ml/`), **trùng khớp
  scikit-learn tới < 1e-6** (xác minh bằng `ml_training/parity.test.js`).
- **Điểm nền:** `clamp(0.45·ML + 0.35·luật + 0.15·chỉ_báo + 0.05·bối_cảnh, 0..100)`.
- **Transformer bổ sung:** XLM-R phishing/social-engineering, export ONNX và lượng tử INT8 (~279 MB), chạy trực tiếp trong trình duyệt bằng Transformers.js.
- **Guarded boost:** Transformer không thay thế điểm nền và không bao giờ được kéo điểm xuống. Chỉ khi điểm nền `>= 50` và Transformer `>= 80/100`, hệ thống mới cộng tối đa `+10` điểm vào điểm cuối.

**Chất lượng (5-fold cross-validation):**
- Phát hiện scam — Precision **0.85** · Recall **0.969** · F1 **0.905** · Accuracy **0.87**
- Phân loại kịch bản (7 lớp) — Macro-F1 **0.579** · Accuracy **0.598**
Các metric trên là của mô hình TF-IDF + Logistic Regression nền.

**Đánh giá Transformer trên dataset hiện tại:**
- Vietnamese: Accuracy **71.71%** · Precision **92.65%** · Recall **62.38%** · F1 **74.56%**
- English: Accuracy **82.35%** · Precision **82.09%** · Recall **90.16%** · F1 **85.94%**

Transformer có cả false positive và false negative, vì vậy được dùng như tín hiệu xác nhận bổ sung thay vì bộ phân loại quyết định độc lập.

Ưu tiên **recall** (bỏ sót scam nguy hiểm hơn báo nhầm). Dữ liệu là **tổng hợp/ẩn danh**,
không chứa OTP/số tài khoản thật.

---

## 🏗️ Kiến trúc

```
web_app/
├── index.html              # SPA, semantic, skip-link, script defer theo thứ tự
├── css/                    # tokens · base · components · views · responsive
├── js/
│   ├── app.js              # điều phối: router, tabs, các luồng, export
│   ├── i18n.js · state.js · ui.js
│   ├── ml/                 # vectorizer · model · ruleEngine · scoreFusion
│   ├── ai/                 # XLM-R Transformer inference qua Transformers.js
│   ├── analyzers/          # text · phone · file · image · voice · video
│   ├── integrations/       # phone/file adapter (Contest Strict, không API key)
│   └── utils/              # sanitizer · extract · validators · hashing · redaction
├── data/                   # locales(vi/en) · rules(vi/en) · demoSamples · model/
├── vendor/                 # jsQR · libphonenumber · jszip · tesseract (offline)
└── assets/                 # logo · favicon
```

**Tầng dữ liệu** (`locales`, `rules`, `model`, `demoSamples`) là các tệp `.js` gán vào
`window.*` — nhờ vậy ứng dụng chạy được cả khi mở `file://` lẫn qua server.

---

## 🔒 Bảo mật & quyền riêng tư

- Không dùng `innerHTML` cho nội dung người dùng — mọi văn bản render qua `textContent`
  (chống XSS). Không `eval`.
- Tệp được đọc dưới dạng **bytes**, không mở/không thực thi, không tải lên.
- Báo cáo xuất ra (TXT/JSON) **che OTP, số tài khoản và số điện thoại**.
- Lịch sử chỉ lưu khi bạn bật, nằm trong `localStorage`, xóa được toàn bộ bất cứ lúc nào.
- Không dùng API inference hoặc API key để phân loại nội dung.
- Lần đầu sử dụng Transformer cần Internet để tải Transformers.js và trọng số XLM-R từ Hugging Face; sau khi tải, suy luận diễn ra ngay trong trình duyệt.
- Nội dung người dùng không được gửi tới Hugging Face để thực hiện phân loại.
  (Twilio Lookup / VirusTotal) để sẵn "đường nối" trong `js/integrations/` cho minh bạch.

---

## ⚠️ Giới hạn

- Scam dùng từ lóng mới hoặc không chứa từ khóa có thể bị bỏ sót.
- OCR / nhận dạng giọng nói có thể sai → hãy kiểm tra bản chữ trước khi phân tích.
- **"Rủi ro thấp" ≠ an toàn tuyệt đối.**
- Kiểm tra tệp ở mức chỉ báo tĩnh, không phải phần mềm diệt virus.

---

## 🗺️ Hướng phát triển

- Giảm kích thước Transformer hoặc chuyển sang model nhỏ hơn để giảm thời gian tải lần đầu.
- Mở rộng benchmark bằng dữ liệu thực tế độc lập với tập train trước khi tăng vai trò của Transformer trong điểm cuối.
- Bộ luật mở rộng theo chiến dịch lừa đảo mới, cập nhật từ cộng đồng.
- Tra cứu hash/uy tín số điện thoại qua API (chế độ Demo+, key theo phiên).
- Bộ phân loại kịch bản mạnh hơn khi có thêm dữ liệu gán nhãn thực tế.
- PWA cài đặt offline; chia sẻ trực tiếp từ ứng dụng nhắn tin (Web Share Target).

---

## 🤖 Quy trình dùng AI

Toàn bộ sản phẩm được xây dựng cùng Claude (Anthropic): từ đặc tả, thiết kế hệ thống,
viết bộ luật song ngữ, train + export mô hình ML, đến giao diện và kiểm thử. Nhật ký
prompt nằm trong `prompts/`.

---

*ScamCall Shield hỗ trợ nhận diện dấu hiệu rủi ro, không khẳng định tuyệt đối nội dung
an toàn hay lừa đảo. Khi nghi ngờ: dừng lại, không cung cấp OTP/mật khẩu, không chuyển
tiền, và xác minh qua kênh chính thức.*
