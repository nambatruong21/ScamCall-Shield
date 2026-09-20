import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer
from dataset import DATA

MODEL_DIR = "ml_training/xlm_r_phishing_quantized"
MODEL_PATH = f"{MODEL_DIR}/model_quantized.onnx"
THRESHOLD = 0.50

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

print("Loading quantized ONNX model...")
session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)


def softmax(x):
    x = x - np.max(x, axis=1, keepdims=True)
    exp_x = np.exp(x)
    return exp_x / exp_x.sum(axis=1, keepdims=True)


def evaluate(rows, name):
    tp = fp = tn = fn = 0
    mistakes = []

    batch_size = 16

    for start in range(0, len(rows), batch_size):
        batch = rows[start:start + batch_size]
        texts = [x[0] for x in batch]

        encoded = tokenizer(
            texts,
            return_tensors="np",
            padding=True,
            truncation=True,
            max_length=512
        )

        ort_inputs = {}

        for inp in session.get_inputs():
            if inp.name in encoded:
                ort_inputs[inp.name] = encoded[inp.name]

        logits = session.run(None, ort_inputs)[0]
        probs = softmax(logits)

        for item, prob in zip(batch, probs):
            text, label, scam_type, lang = item

            scam_prob = float(prob[1])
            pred = 1 if scam_prob >= THRESHOLD else 0

            if label == 1 and pred == 1:
                tp += 1
            elif label == 0 and pred == 1:
                fp += 1
            elif label == 0 and pred == 0:
                tn += 1
            else:
                fn += 1

            if pred != label:
                mistakes.append({
                    "expected": label,
                    "predicted": pred,
                    "score": scam_prob,
                    "lang": lang,
                    "type": scam_type or "safe",
                    "text": text
                })

    total = tp + fp + tn + fn

    accuracy = (tp + tn) / total if total else 0
    precision = tp / (tp + fp) if (tp + fp) else 0
    recall = tp / (tp + fn) if (tp + fn) else 0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall)
        else 0
    )

    print(f"\n===== {name} =====")
    print(f"Samples   : {total}")
    print(f"TP / FP   : {tp} / {fp}")
    print(f"TN / FN   : {tn} / {fn}")
    print(f"Accuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1        : {f1:.4f}")
    print(f"Mistakes  : {len(mistakes)}")

    if mistakes:
        print("\n--- MISCLASSIFIED ---")

        for m in mistakes[:20]:
            print()
            print(
                f"expected={m['expected']} "
                f"pred={m['predicted']} "
                f"score={m['score']:.4f} "
                f"lang={m['lang']} "
                f"type={m['type']}"
            )
            print(m["text"])

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "tp": tp,
        "fp": fp,
        "tn": tn,
        "fn": fn
    }


print(f"\nThreshold = {THRESHOLD}")

evaluate(DATA, "ALL")

vi = [x for x in DATA if x[3] == "vi"]
en = [x for x in DATA if x[3] == "en"]

evaluate(vi, "VIETNAMESE")
evaluate(en, "ENGLISH")