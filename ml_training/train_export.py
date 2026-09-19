# -*- coding: utf-8 -*-
"""Train ScamCall Shield models and export browser-ready JS artifact.

Pipeline (per Dev Guide section 7.1):
  TF-IDF (word 1-2 grams) + LogisticRegression
    - Model 1: binary scam / safe
    - Model 2: multinomial scam-type classifier (trained on scam rows only)
Metrics: stratified 5-fold cross-validation (honest estimate on a small
synthetic dataset). The shipped model is then fit on the full dataset.
Exports:
  ../app_submission/web_app/data/model/model.js   (window.SCS_MODEL)
  ./model.json                                    (same payload, for tests)
  ./parity_cases.json                             (sklearn vs JS parity)
"""
import json
import unicodedata
import datetime
import numpy as np
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, f1_score

from dataset import DATA

RND = 42
np.random.seed(RND)


def prep(s: str) -> str:
    return unicodedata.normalize("NFC", s).lower()


def make_vectorizer():
    return TfidfVectorizer(
        preprocessor=prep,
        token_pattern=r"(?u)\b\w\w+\b",
        ngram_range=(1, 2),
        min_df=1,
        smooth_idf=True,
        sublinear_tf=False,
        norm="l2",
    )


texts = [t for t, _, _, _ in DATA]
y_bin = np.array([l for _, l, _, _ in DATA])
types = [t for _, _, t, _ in DATA]
langs = [g for _, _, _, g in DATA]

scam_idx = [i for i, l in enumerate(y_bin) if l == 1]
scam_texts = [texts[i] for i in scam_idx]
scam_types = [types[i] for i in scam_idx]

# ---------------- 5-fold CV metrics: binary ----------------
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RND)
bp, br, bf, bacc = [], [], [], []
for tr, te in skf.split(texts, y_bin):
    vec = make_vectorizer()
    Xtr = vec.fit_transform([texts[i] for i in tr])
    Xte = vec.transform([texts[i] for i in te])
    clf = LogisticRegression(C=3.0, max_iter=4000, class_weight="balanced")
    clf.fit(Xtr, y_bin[tr])
    pred = clf.predict(Xte)
    p, r, f, _ = precision_recall_fscore_support(
        y_bin[te], pred, average="binary", zero_division=0)
    bp.append(p); br.append(r); bf.append(f)
    bacc.append(accuracy_score(y_bin[te], pred))

binary_metrics = {
    "precision": round(float(np.mean(bp)), 3),
    "recall": round(float(np.mean(br)), 3),
    "f1": round(float(np.mean(bf)), 3),
    "accuracy": round(float(np.mean(bacc)), 3),
    "method": "stratified 5-fold CV",
}

# ---------------- 5-fold CV metrics: scam type ----------------
y_type = np.array(scam_types)
tf1, tacc = [], []
for tr, te in skf.split(scam_texts, y_type):
    vec = make_vectorizer()
    Xtr = vec.fit_transform([scam_texts[i] for i in tr])
    Xte = vec.transform([scam_texts[i] for i in te])
    clf = LogisticRegression(C=0.7, max_iter=4000, class_weight="balanced")
    clf.fit(Xtr, y_type[tr])
    pred = clf.predict(Xte)
    tf1.append(f1_score(y_type[te], pred, average="macro", zero_division=0))
    tacc.append(accuracy_score(y_type[te], pred))

type_metrics = {
    "macro_f1": round(float(np.mean(tf1)), 3),
    "accuracy": round(float(np.mean(tacc)), 3),
    "method": "stratified 5-fold CV",
}

# ---------------- Final models on full data ----------------
vec = make_vectorizer()
X = vec.fit_transform(texts)
bin_clf = LogisticRegression(C=3.0, max_iter=4000, class_weight="balanced")
bin_clf.fit(X, y_bin)

Xs = vec.transform(scam_texts)
type_clf = LogisticRegression(C=0.7, max_iter=4000, class_weight="balanced")
type_clf.fit(Xs, y_type)

# sanity: predict_proba must equal softmax(decision_function) (multinomial)
df = type_clf.decision_function(Xs[:5])
sm = np.exp(df - df.max(axis=1, keepdims=True))
sm = sm / sm.sum(axis=1, keepdims=True)
assert np.allclose(sm, type_clf.predict_proba(Xs[:5]), atol=1e-9), \
    "type classifier is not multinomial softmax"

vocab = {t: int(i) for t, i in vec.vocabulary_.items()}
idf = [round(float(v), 6) for v in vec.idf_]
bin_coef = [round(float(v), 6) for v in bin_clf.coef_[0]]
bin_b = round(float(bin_clf.intercept_[0]), 6)
type_labels = [str(c) for c in type_clf.classes_]
type_coef = [[round(float(v), 6) for v in row] for row in type_clf.coef_]
type_b = [round(float(v), 6) for v in type_clf.intercept_]

cnt_lang = Counter(langs)
cnt_type = Counter(t or "safe" for t in types)
payload = {
    "version": "1.0.0",
    "trained_at": datetime.date.today().isoformat(),
    "algorithm": "TF-IDF (1-2 grams) + Logistic Regression (scikit-learn %s)",
    "tokenizer": {"pattern": "[\\p{L}\\p{N}_]{2,}", "ngram": [1, 2],
                  "normalize": "NFC", "lowercase": True},
    "vocab": vocab,
    "idf": idf,
    "binary": {"coef": bin_coef, "intercept": bin_b},
    "types": {"labels": type_labels, "coef": type_coef, "intercept": type_b},
    "meta": {
        "dataset": {
            "total": len(texts),
            "scam": int(y_bin.sum()),
            "safe": int(len(texts) - y_bin.sum()),
            "vi": cnt_lang.get("vi", 0),
            "en": cnt_lang.get("en", 0),
            "per_type": dict(sorted(cnt_type.items())),
            "note": "synthetic_anonymized",
        },
        "metrics": {"binary": binary_metrics, "type": type_metrics},
        "features": int(X.shape[1]),
    },
}
import sklearn
payload["algorithm"] = payload["algorithm"] % sklearn.__version__

js = ("/* ScamCall Shield ML artifact - generated by ml_training/train_export.py.\n"
      " * TF-IDF + Logistic Regression trained on a synthetic bilingual dataset.\n"
      " * Inference runs fully in the browser (see js/ml/vectorizer.js, model.js). */\n"
      "(function (g) {\n  g.SCS_MODEL = ")
js += json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
js += (";\n})(typeof window !== 'undefined' ? window : globalThis);\n")

with open("../app_submission/web_app/data/model/model.js", "w", encoding="utf-8") as f:
    f.write(js)
with open("model.json", "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False)

# ---------------- Parity cases for the JS implementation ----------------
cases = [
    "Tài khoản của bạn sẽ bị KHÓA trong 5 phút, nhập OTP ngay tại link!",
    "Mai họp nhóm 9h sáng phòng 302 nhé, nhớ mang laptop.",
    "This is the police, keep it secret and transfer money to the custody account now.",
    "Your parcel is held at customs, pay $3.99 at quick-post-track.top today.",
    "Mã OTP của bạn là 583920, không chia sẻ với bất kỳ ai.",
    "Tuyển CTV chốt đơn, đặt cọc 300k nhận việc ngay hôm nay!!!",
    "Team lunch Friday to celebrate the launch, vote Korean or Thai.",
    "Mẹ ơi con đổi số mới, chuyển gấp 15 triệu vào tài khoản này nhé.",
    "Sàn cam kết lợi nhuận 30% mỗi tháng, nạp 10 triệu hôm nay.",
    "zz qq unknownwordhere",
    "Chuc mung ban trung thuong, nop phi 500k nhan qua ngay.",
    "We never ask for your OTP. Stay alert against fake bank staff calls.",
    "ĐÂY LÀ CÔNG AN! Giữ bí mật, chuyển 200 triệu để điều tra!",
    "ok",
]
Xc = vec.transform(cases)
pb = bin_clf.predict_proba(Xc)[:, list(bin_clf.classes_).index(1)]
pt = type_clf.predict_proba(Xc)
parity = []
for i, c in enumerate(cases):
    parity.append({
        "text": c,
        "binary_prob": float(pb[i]),
        "type_probs": {type_labels[j]: float(pt[i][j]) for j in range(len(type_labels))},
    })
with open("parity_cases.json", "w", encoding="utf-8") as f:
    json.dump(parity, f, ensure_ascii=False, indent=1)

print("== dataset ==", payload["meta"]["dataset"])
print("== binary  ==", binary_metrics)
print("== type    ==", type_metrics)
print("features:", payload["meta"]["features"], "| labels:", type_labels)
print("model.js bytes:", len(js.encode("utf-8")))
