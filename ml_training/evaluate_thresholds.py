import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer
from dataset import DATA

MODEL_DIR = "ml_training/xlm_r_phishing_quantized"
MODEL_PATH = f"{MODEL_DIR}/model_quantized.onnx"

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)


def softmax(x):
    x = x - np.max(x, axis=1, keepdims=True)
    exp_x = np.exp(x)
    return exp_x / exp_x.sum(axis=1, keepdims=True)


def get_predictions(rows):
    results = []
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
            results.append(
                (item[1], float(prob[1]))
            )

    return results


def metrics(results, threshold):
    tp = fp = tn = fn = 0

    for label, score in results:
        pred = 1 if score >= threshold else 0

        if label == 1 and pred == 1:
            tp += 1
        elif label == 0 and pred == 1:
            fp += 1
        elif label == 0 and pred == 0:
            tn += 1
        else:
            fn += 1

    accuracy = (tp + tn) / (tp + fp + tn + fn)
    precision = tp / (tp + fp) if (tp + fp) else 0
    recall = tp / (tp + fn) if (tp + fn) else 0

    f1 = (
        2 * precision * recall / (precision + recall)
        if precision + recall
        else 0
    )

    return accuracy, precision, recall, f1, fp, fn


def evaluate_language(rows, name):
    print(f"\n===== {name} =====")

    predictions = get_predictions(rows)

    print(
        "Threshold | Accuracy | Precision | Recall | F1     | FP | FN"
    )

    for threshold in [
        0.05,
        0.10,
        0.15,
        0.20,
        0.25,
        0.30,
        0.35,
        0.40,
        0.45,
        0.50,
        0.60,
        0.70,
        0.80,
        0.90
    ]:
        acc, precision, recall, f1, fp, fn = metrics(
            predictions,
            threshold
        )

        print(
            f"{threshold:9.2f} | "
            f"{acc:8.4f} | "
            f"{precision:9.4f} | "
            f"{recall:6.4f} | "
            f"{f1:6.4f} | "
            f"{fp:2d} | {fn:2d}"
        )


vi = [x for x in DATA if x[3] == "vi"]
en = [x for x in DATA if x[3] == "en"]

evaluate_language(vi, "VIETNAMESE")
evaluate_language(en, "ENGLISH")