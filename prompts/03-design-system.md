# Prompt log 03 — Hệ thống thiết kế

## Định hướng (gắn với /design-mastery)
Sản phẩm là công cụ "pháp y/chẩn đoán" lừa đảo: một tin nhắn đáng ngờ là "mẫu vật" đang
được soi. Hệ thống đọc cảm giác lâm sàng, điềm tĩnh, với mỗi chiến thuật thao túng được
gán một màu nhất quán trên toàn ứng dụng (highlight, thẻ dấu hiệu, badge).

- **Palette** theo Dev Guide: Navy #0B2447, Info #2F80ED, Safe #2E7D32, Warning #F9A825,
  Danger #C62828; nền sáng #F5F7FA; nền tối "navy-ink" #0A1628 (không đen tuyền).
- **Typography:** Be Vietnam Pro (hiển thị + thân, hỗ trợ tiếng Việt) + IBM Plex Mono
  (mọi số liệu: điểm, hash, E.164).
- **Signature:** thẻ "specimen" ở hero — tin nhắn lừa đảo mẫu được tô sẵn dấu hiệu, có
  hiệu ứng scan-line quét dọc (tôn trọng prefers-reduced-motion), và đồng hồ rủi ro bán
  nguyệt vẽ bằng SVG.
- Mobile-first 360px, focus-visible rõ ràng, không dùng màu làm tín hiệu duy nhất.
