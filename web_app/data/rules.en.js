/* ScamCall Shield - English red-flag rules (Dev Guide Appendix B). */
(function (g) {
  g.SCS_RULES = g.SCS_RULES || {};
  g.SCS_RULES.en = [
    { id: "en_urgency", cat: "urgency", w: 12, p: [
      "immediately", "right now", "within 5 minutes", "within 10 minutes", "within 30 minutes",
      "within 24 hours", "within 12 hours", "within 6 hours", "today only", "act now",
      "expires today", "final notice", "final warning", "last chance", "urgent",
      "before midnight", "closes tonight", "slots close", "limited slots", "only 3", "only 50",
      "do it now", "as soon as possible", "right away"
    ]},
    { id: "en_secrecy", cat: "secrecy", w: 18, p: [
      "do not tell anyone", "don't tell anyone", "keep this secret", "keep it secret",
      "keep this confidential", "keep it between us", "tell no one", "do not call",
      "don't call the old number", "do not inform", "quietly", "private group", "secret group"
    ]},
    { id: "en_credential", cat: "credential", w: 25, p: [
      "otp", "one time passcode", "one-time passcode", "verification code", "security code",
      "6 digit code", "six digit code", "your password", "your pin", "card number",
      "cvv", "login details", "two factor code", "2fa code", "read me the code",
      "forward us the code", "enter the code", "send us the code", "confirm your password"
    ]},
    { id: "en_payment", cat: "payment", w: 25, p: [
      "transfer money", "transfer your savings", "wire transfer", "send money", "send $",
      "pay the fee", "processing fee", "verification fee", "clearance fee", "release fee",
      "deposit first", "pay a deposit", "activation fee", "placement deposit", "top up",
      "gift card", "custody account", "safe account", "staff personal account",
      "accountant account", "to this account", "redelivery fee", "storage fee", "income tax to"
    ]},
    { id: "en_authority", cat: "authority", w: 12, p: [
      "this is the police", "police department", "cybercrime unit", "court notice",
      "arrest warrant", "tax office", "immigration department", "customs office",
      "federal agency", "government agency", "bank officer", "fraud team", "officer speaking",
      "social security office", "traffic department", "health inspector", "the electric company"
    ]},
    { id: "en_fear", cat: "fear", w: 15, p: [
      "will be arrested", "be arrested", "arrest you", "account will be locked",
      "will be suspended", "will be frozen", "will be disabled", "will be deactivated",
      "legal action", "lawsuit", "deportation", "money laundering", "criminal case",
      "license will be revoked", "power will be cut", "blocked permanently", "be fined"
    ]},
    { id: "en_remote_app", cat: "remote_app", w: 25, p: [
      "install the app", "install this app", "download the app from", "screen sharing",
      "share your screen", "remote access", "anydesk", "teamviewer", "grant accessibility",
      "show us your banking app", "follow the officer's instructions"
    ]},
    { id: "en_reward", cat: "reward", w: 15, p: [
      "you won", "winner", "congratulations", "claim your prize", "prize of", "gift card",
      "cashback", "refund of", "pending refund", "loyalty gift", "free data",
      "guaranteed returns", "guaranteed 25", "guaranteed 30", "profit", "commission",
      "bonus", "scholarship worth", "easy money", "earn $"
    ]},
    { id: "en_link_lure", cat: "link_lure", w: 10, p: [
      "click the link", "tap the link", "click below", "via the link", "through the secure link",
      "log in at", "sign in via", "scan the qr", "press 1", "press 9", "reply with",
      "enter your card number on", "via the attached"
    ]},
    { id: "en_info_request", cat: "info_request", w: 18, p: [
      "your id number", "national id", "passport number", "verify your identity via",
      "provide your full card details", "confirm your identity", "personal details",
      "your bank login", "verify ownership with"
    ]},
    { id: "en_impersonation", cat: "impersonation", w: 16, p: [
      "my new number", "this is my new number", "phone broke", "lost my wallet",
      "stuck at the airport", "on my friend's phone", "fell in water", "borrowed a phone"
    ]},
    { id: "en_too_good", cat: "too_good", w: 14, p: [
      "no experience needed", "no interview needed", "earn $300 a day", "a day liking",
      "x10 after", "2% daily", "withdraw anytime", "100% visa", "guaranteed buyback",
      "covers any loss", "salary $900 weekly", "work from home, earn"
    ]}
  ];
})(typeof window !== "undefined" ? window : globalThis);
