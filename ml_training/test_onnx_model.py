import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer

MODEL_DIR = "ml_training/xlm_r_phishing_onnx"
MODEL_PATH = f"{MODEL_DIR}/model.onnx"

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

print("Loading ONNX model...")
session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

samples = [
    "Công an thông báo tài khoản của bạn liên quan đến rửa tiền. "
    "Hãy chuyển toàn bộ tiền vào tài khoản an toàn trong 30 phút "
    "và cung cấp mã OTP.",

    "Tài khoản ngân hàng của bạn sẽ bị khóa. "
    "Vui lòng đăng nhập tại http://xac-thuc-ngan-hang.com để xác minh ngay.",

    "Mẹ ơi chiều nay con về trễ một chút, cả nhà cứ ăn cơm trước nhé."
]


def softmax(x):
    x = x - np.max(x)
    exp_x = np.exp(x)
    return exp_x / exp_x.sum()


for i, text in enumerate(samples, 1):
    encoded = tokenizer(
        text,
        return_tensors="np",
        truncation=True,
        max_length=512
    )

    ort_inputs = {}

    for inp in session.get_inputs():
        if inp.name in encoded:
            ort_inputs[inp.name] = encoded[inp.name]

    outputs = session.run(None, ort_inputs)

    logits = outputs[0][0]
    probs = softmax(logits)

    print(f"\n--- SAMPLE {i} ---")
    print(text)
    print(f"SAFE     (LABEL_0): {probs[0]:.6f}")
    print(f"PHISHING (LABEL_1): {probs[1]:.6f}")