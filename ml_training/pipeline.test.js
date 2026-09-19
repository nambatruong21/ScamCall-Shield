const path = require("path");
const R = p => require(path.join(__dirname, "..", "web_app", p));
R("data/model/model.js"); R("data/rules.vi.js"); R("data/rules.en.js");
R("js/ml/vectorizer.js"); R("js/ml/model.js"); R("js/ml/ruleEngine.js"); R("js/ml/scoreFusion.js");
R("js/utils/extract.js"); R("js/analyzers/textAnalyzer.js");
const S = globalThis.SCS;
const cases = [
  ["SCAM bank vi", "Tài khoản của quý khách sẽ bị KHÓA trong 5 phút. Truy cập http://vietcombank-vn.xyz và nhập mã OTP ngay, tuyệt đối không nói với ai."],
  ["SCAM authority no-diacritic", "Day la cong an thanh pho, anh lien quan duong day rua tien, giu bi mat va chuyen 200 trieu vao tai khoan tam giu ngay."],
  ["SCAM job en", "Congratulations! You won a scholarship worth $5000. Pay the $99 processing fee today via bit.ly/claim-now to secure your slot."],
  ["SCAM takeover vi", "Mẹ ơi con đổi số mới, mẹ chuyển gấp 15 triệu vào số tài khoản này cho bạn con mượn, đừng nói ba nhé."],
  ["SAFE meeting (has 'gấp')", "Gấp nha mọi người: 14h chiều nay họp đột xuất với khách hàng tại phòng lớn, ai vắng báo lại trưởng nhóm trước 13h."],
  ["SAFE otp notice", "Mã OTP của bạn là 583920, có hiệu lực 2 phút. Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên ngân hàng."],
  ["SAFE dinner en", "Hey, are we still on for dinner at 7 tonight? I booked the usual place."],
  ["SAFE awareness", "Cảnh giác nhé cả nhà, dạo này có số lạ giả danh điện lực đòi chuyển khoản gấp, điện lực chỉ thu qua kênh chính thức."],
];
for (const [name, text] of cases) {
  const r = S.engine.analyze({ sourceType: "text", rawText: text });
  const flags = Object.keys(r.flagCategories).join(",") || "-";
  const types = r.scamTypes.map(t => `${t.id}:${(t.confidence*100|0)}%`).join(" ") || "-";
  console.log(`${String(r.overallScore).padStart(3)} ${r.riskLevel.padEnd(8)} | ml=${String(r.components.ml).padStart(3)} ru=${String(r.components.rules).padStart(3)} in=${String(r.components.indicators).padStart(3)} cx=${String(r.components.context).padStart(3)} | ${name}\n    types: ${types}\n    flags: ${flags}`);
}
// URL scoring sanity
const u = S.extract.scoreUrl("http://vietcombank-vn.xyz/verify");
console.log("\nurl test:", u.score, u.level, u.reasons.join(","));
const u2 = S.extract.scoreUrl("https://tiki.vn/sach");
console.log("url test:", u2.score, u2.level, u2.reasons.join(","));
