/* Parity test: JS inference must match scikit-learn probabilities. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "web_app");

require(path.join(ROOT, "data", "model", "model.js"));
require(path.join(ROOT, "js", "ml", "vectorizer.js"));
require(path.join(ROOT, "js", "ml", "model.js"));

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "parity_cases.json"), "utf8"));
const TOL = 1e-6;
let worstBin = 0, worstType = 0, fail = 0;

for (const c of cases) {
  const pb = globalThis.SCS.model.predictBinary(c.text);
  const dBin = Math.abs(pb - c.binary_prob);
  worstBin = Math.max(worstBin, dBin);

  const types = globalThis.SCS.model.predictTypes(c.text);
  for (const t of types) {
    const d = Math.abs(t.p - c.type_probs[t.id]);
    worstType = Math.max(worstType, d);
    if (d > TOL) { fail++; console.error(`TYPE MISMATCH "${c.text.slice(0, 40)}" ${t.id}: js=${t.p} py=${c.type_probs[t.id]}`); }
  }
  if (dBin > TOL) { fail++; console.error(`BIN MISMATCH "${c.text.slice(0, 40)}": js=${pb} py=${c.binary_prob}`); }
}

console.log(`parity: ${cases.length} cases | worst binary diff = ${worstBin.toExponential(2)} | worst type diff = ${worstType.toExponential(2)}`);
if (fail) { console.error(`FAILED: ${fail} mismatches`); process.exit(1); }
console.log("PARITY OK - JS inference matches scikit-learn");
