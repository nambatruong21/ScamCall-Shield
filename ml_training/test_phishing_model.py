from transformers import pipeline

MODEL_ID = "nxtcute/xlm-r-phishing-and-social-engineering-detector-vi"

print("Loading model...")

classifier = pipeline(
    "text-classification",
    model=MODEL_ID,
    device=-1
)

samples = [
    "Công an thông báo tài khoản của bạn liên quan đến rửa tiền. "
    "Hãy chuyển toàn bộ tiền vào tài khoản an toàn trong 30 phút "
    "và cung cấp mã OTP.",

    "Tài khoản ngân hàng của bạn sẽ bị khóa. "
    "Vui lòng đăng nhập tại http://xac-thuc-ngan-hang.com để xác minh ngay.",

    "Mẹ ơi chiều nay con về trễ một chút, cả nhà cứ ăn cơm trước nhé."
]

for i, text in enumerate(samples, 1):
    result = classifier(
        text,
        top_k=None,
        truncation=True
    )

    print(f"\n--- SAMPLE {i} ---")
    print(text)
    print(result)