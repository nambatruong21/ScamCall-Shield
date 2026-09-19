/* ScamCall Shield - demo content (samples, quiz, demo phone reports).
 * All numbers/links here are FICTIONAL and for demonstration only.
 */
(function (g) {
  "use strict";

  g.SCS_DEMO = {
    /* One-tap samples per analyzer tab, both languages. */
    text: {
      vi: [
        { label: "Giả danh ngân hàng", value: "NGAN HANG thong bao: tai khoan cua quy khach phat hien giao dich bat thuong va se bi KHOA trong 30 phut. De mo khoa, vui long truy cap https://vietcom-bank.xyz-verify.top va dang nhap xac thuc OTP ngay. Tuyet doi khong cung cap ma cho nguoi khac." },
        { label: "Giả danh công an", value: "Day la Cong an thanh pho. Qua dieu tra, can cuoc cua anh lien quan duong day rua tien xuyen quoc gia. Yeu cau anh giu bi mat tuyet doi, khong noi voi nguoi than va chuyen toan bo so tien trong tai khoan vao tai khoan an toan cua Bo de phuc vu dieu tra. Neu khong hop tac se bi bat tam giam." },
        { label: "Việc nhẹ lương cao", value: "Cong ty tuyen cong tac vien lam viec tai nha, moi don hang hoan thanh nhan 50.000d, ngay nhan 500.000-2.000.000d. De kich hoat tai khoan nhiem vu, ban can nap truoc 300.000d tien coc, sau 2 nhiem vu se hoan lai ca goc lan lai. Lam ngay keo het suat hom nay!" },
        { label: "Mạo danh người thân", value: "Me oi con doi so moi nha. Dien thoai con bi roi vo nuoc nen muon may ban nhan tam. Con dang ket tien dong hoc gap, me chuyen giup con 12 trieu vao so tai khoan nay 0987xxxxxx ngan hang ABC, chu tai khoan Nguyen Van A la ban con. Dung goi so cu nha me, may con hong roi." }
      ],
      en: [
        { label: "Bank impersonation", value: "BANK ALERT: suspicious activity detected on your account. It will be LOCKED within 30 minutes. To unlock, log in and verify your OTP at https://secure-bank.xyz-verify.top right now. Do not share this code with anyone." },
        { label: "Fake authority", value: "This is the Police Department. Our investigation links your ID to an international money-laundering ring. Keep this strictly confidential, tell no one, and transfer your entire balance to the safe account we provide for the investigation. Failure to cooperate will result in arrest." },
        { label: "Job scam", value: "We're hiring work-from-home assistants. Earn $5 per completed task, $30-150 a day. To activate your task account, deposit $20 first; after two tasks both your deposit and earnings are returned. Act now, slots close today!" },
        { label: "Impostor relative", value: "Mom, this is my new number. My phone fell in water so I'm texting from a friend's phone. I'm stuck and urgently need tuition money, please send $500 to this account 0987xxxxxx, account holder is my friend. Don't call my old number, it's broken." }
      ]
    },
    voice: {
      vi: "Alo, day co phai so cua anh khong? Em ben tong dai VNPT thong bao thue bao cua anh dang no cuoc 8 trieu 9, neu trong 2 gio khong thanh toan se bi khoa hai chieu va chuyen ho so sang cong an. Anh bam phim 9 de gap nhan vien xu ly, va chuan bi so the ngan hang de em huong dan dong cuoc nhe.",
      en: "Hello, is this your number? I'm calling from the telecom office. Your line has an unpaid balance of $89. If you don't pay within two hours, your number will be suspended and your file sent to the police. Press 9 to speak with an agent and have your bank card ready so I can guide you through the payment."
    },
    video: {
      vi: "Chuyen gia tai chinh chia se: chi can nap 5 trieu vao san XTrade, he thong AI tu dong giao dich, cam ket lai 30% moi thang, bao lo thang dau. Quet ma QR ben duoi de tham gia nhom Zalo VIP nhan tin hieu mien phi.",
      en: "Our financial expert reveals: just deposit $200 into the XTrade platform, the AI trades automatically, guaranteed 30% monthly returns, losses covered in month one. Scan the QR code below to join the VIP group for free signals."
    },

    /* Mini-game: balanced scam vs safe items. flags = i18n category keys. */
    quiz: [
      { text: "Quy khach trung thuong xe SH! De nhan giai, vui long nop 2.000.000d phi ho so va cung cap so the ngan hang qua link sau.", isScam: true, flags: ["reward", "payment", "link_lure"], en: "You won a motorbike! To claim, pay a $80 processing fee and provide your bank card via this link." },
      { text: "Ma OTP cua ban la 738201, co hieu luc trong 3 phut. Ngan hang khong bao gio yeu cau ban cung cap ma nay cho bat ky ai.", isScam: false, flags: [], en: "Your OTP is 738201, valid for 3 minutes. The bank will never ask you to share this code with anyone." },
      { text: "Day la Vien kiem sat. Ho so cua ong dang bi dieu tra, yeu cau giu bi mat va chuyen tien vao tai khoan tam giu de chung minh trong sach.", isScam: true, flags: ["authority", "fear", "secrecy", "payment"], en: "This is the Procuracy. Your file is under investigation; keep it secret and transfer funds to a custody account to prove your innocence." },
      { text: "Don hang #SP12345 cua ban da duoc giao thanh cong luc 14h20. Cam on ban da mua sam tai shop!", isScam: false, flags: [], en: "Your order #SP12345 was delivered at 2:20pm. Thanks for shopping with us!" },
      { text: "Tuyen mau anh online luong 800k/ngay, khong can kinh nghiem, nhan viec ngay. Dong 250k phi dong phuc de bat dau.", isScam: true, flags: ["too_good", "payment", "reward"], en: "Hiring online models, $35/day, no experience needed, start immediately. Pay a $10 uniform fee to begin." },
      { text: "Nhac lich: cuoc hop nhom luc 9h sang mai tai phong A2. Moi nguoi chuan bi bao cao tuan nhe.", isScam: false, flags: [], en: "Reminder: team meeting at 9am tomorrow in room A2. Please prepare your weekly report." },
      { text: "Chao ban, minh la bo phan ho tro Facebook. Tai khoan ban bi bao cao vi pham, gui ma xac nhan 6 so vua nhan de chung toi mo khoa giup.", isScam: true, flags: ["impersonation", "credential", "urgency"], en: "Hi, this is Facebook support. Your account was reported; send the 6-digit code you just received so we can unlock it." },
      { text: "TK 0123 da nhan +500.000d luc 10:05 ngay 12/06. So du kha dung 2.450.000d. Chi tiet xem tren app.", isScam: false, flags: [], en: "Account 0123 received +$20 at 10:05 on 12 Jun. Available balance $98. See details in the app." }
    ],

    /* Demo reputation dataset for phone tab (fictional). */
    phoneReports: [
      { e164: "+842899998888", label: "Giả danh ngân hàng / bank impersonation", count: 412 },
      { e164: "+842877776666", label: "Giả danh công an / fake authority", count: 358 },
      { e164: "+84900011122", label: "Lừa tuyển dụng / job scam", count: 173 },
      { e164: "+84911223344", label: "Đòi nợ cước / SIM-lock scam", count: 96 },
      { e164: "+18005551234", label: "Robocall prize scam", count: 240 }
    ],

    glossary: [
      { term: "OTP", k: "cat.credential" },
      { term: "Phishing", k: "cat.link_lure" },
      { term: "Vishing", k: "cat.authority" },
      { term: "Smishing", k: "cat.link_lure" },
      { term: "Remote access", k: "cat.remote_app" },
      { term: "Money mule", k: "cat.payment" }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
