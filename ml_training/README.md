# ScamCall Shield — ML training (reproducible)

This folder contains the **actual** training pipeline used to produce the model
shipped in `../web_app/data/model/model.js`. No metrics were fabricated.

## Files
- `dataset.py` — 254 synthetic, anonymized bilingual samples (162 scam / 92 safe;
  152 vi / 102 en) across 7 scam types plus hard negatives (valid OTP notices,
  scam-awareness messages, harmless "urgent" notes). Contains no real PII.
- `train_export.py` — trains a `TfidfVectorizer` (uni+bigram, NFC+lowercase) with
  two `LogisticRegression` heads (scam/safe and 7-type), reports metrics via
  **stratified 5-fold cross-validation**, then refits on all data and exports
  `model.js` + `model.json` + `parity_cases.json`.
- `parity.test.js` — verifies the in-browser JS inference matches scikit-learn
  to < 1e-6 on 14 cases.
- `pipeline.test.js` — end-to-end smoke test of the fusion pipeline.

## Reproduce
```bash
pip install scikit-learn numpy --break-system-packages
python3 train_export.py            # writes ../web_app/data/model/model.js
node parity.test.js                # JS == sklearn parity
node pipeline.test.js              # pipeline sanity
```

## Reported metrics (5-fold CV)
- Scam detection — Precision 0.85 · Recall 0.969 · F1 0.905 · Accuracy 0.87
- Type classification (7 classes) — Macro-F1 0.579 · Accuracy 0.598

Recall is deliberately prioritized (missing a scam is worse than a false alarm).
Metrics are measured on synthetic data and do not represent every real message.
