# -*- coding: utf-8 -*-
"""ScamCall Shield - synthetic bilingual training dataset.

Every sample is synthetic / anonymized. No real personal data, OTPs,
account numbers or live URLs. Format: (text, label, scam_type, lang)
  label: 1 = scam, 0 = safe
  scam_type: one of bank_phishing | fake_authority | job_scholarship |
             delivery | investment | account_takeover | other  (or "" for safe)
"""

DATA = [
    # ===================== SCAM - bank_phishing (vi) =====================
    ("Tài khoản của quý khách sẽ bị khóa trong 5 phút. Vui lòng truy cập http://vietcombank-vn.xyz để xác minh và nhập mã OTP ngay.", 1, "bank_phishing", "vi"),
    ("Thông báo: phát hiện đăng nhập bất thường. Bấm vào link sau và nhập mật khẩu cùng OTP để mở khóa tài khoản ngay hôm nay.", 1, "bank_phishing", "vi"),
    ("Quý khách có khoản tiền treo 25.000.000đ chưa nhận. Xác thực thông tin thẻ và mã CVV tại đường link bên dưới trong hôm nay.", 1, "bank_phishing", "vi"),
    ("Ngân hàng thông báo nâng cấp hệ thống, quý khách cần xác nhận OTP trong 10 phút nếu không tài khoản sẽ bị tạm ngưng.", 1, "bank_phishing", "vi"),
    ("Tin khẩn: thẻ của bạn vừa bị trừ 4.990.000đ. Nếu không phải bạn, bấm link khieunai-nganhang.top và đăng nhập để hoàn tiền gấp.", 1, "bank_phishing", "vi"),
    ("Yêu cầu cập nhật sinh trắc học trước 17h hôm nay. Truy cập app giả lập tại link lạ và cung cấp mã OTP để hoàn tất.", 1, "bank_phishing", "vi"),
    ("Tài khoản internet banking của bạn bị hạn chế giao dịch. Soạn tin kèm số thẻ và mật khẩu gửi 8x79 để khôi phục ngay.", 1, "bank_phishing", "vi"),
    ("Khách hàng thân thiết được hoàn phí thường niên 550.000đ, vui lòng đăng nhập qua link bit.ly/hoanphi-the và nhập OTP xác nhận.", 1, "bank_phishing", "vi"),
    ("Cảnh báo cuối: hồ sơ vay của bạn sắp bị hủy, đóng phí giải ngân 2.000.000đ vào tài khoản cá nhân sau để nhận tiền ngay.", 1, "bank_phishing", "vi"),
    ("Hệ thống phát hiện thẻ tín dụng của bạn bị lộ. Cung cấp ngay số thẻ, ngày hết hạn và CVV cho nhân viên để khóa khẩn cấp.", 1, "bank_phishing", "vi"),
    ("Anh ơi em bên ngân hàng đây, tài khoản anh đang bị treo, anh đọc giúp em mã OTP vừa gửi để em mở lại liền nhé.", 1, "bank_phishing", "vi"),
    ("Quý khách nhận được ưu đãi nâng hạn mức thẻ. Hoàn tất trong 30 phút bằng cách xác nhận mật khẩu đăng nhập tại trang sau.", 1, "bank_phishing", "vi"),
    ("Giao dịch chuyển 9.800.000đ đang chờ. Nếu không thực hiện, nhập OTP tại nganhang-xacthuc.icu để hủy lệnh ngay lập tức.", 1, "bank_phishing", "vi"),
    ("Tài khoản của bạn liên quan giao dịch đáng ngờ, cần chuyển toàn bộ số dư sang tài khoản an toàn do ngân hàng chỉ định ngay.", 1, "bank_phishing", "vi"),
    ("Vui lòng quét mã QR đính kèm để xác minh chủ thẻ, nhập đầy đủ OTP và mật khẩu, quá hạn hôm nay thẻ sẽ bị thu hồi.", 1, "bank_phishing", "vi"),
    ("Em chào anh, bên thẻ em hỗ trợ rút tiền mặt từ thẻ tín dụng phí 0đ, anh chỉ cần đưa số thẻ với mã CVV là xong ạ.", 1, "bank_phishing", "vi"),
    ("Thong bao: tai khoan cua ban se bi khoa, dang nhap ngay tai link de xac minh OTP trong 5 phut.", 1, "bank_phishing", "vi"),
    ("Số dư của bạn tạm bị phong tỏa do nghi ngờ rửa tiền. Đăng nhập link khẩn cấp bên dưới và xác nhận toàn bộ thông tin bảo mật.", 1, "bank_phishing", "vi"),

    # ===================== SCAM - bank_phishing (en) =====================
    ("Your account will be locked within 5 minutes. Verify immediately at http://secure-bank-check.xyz and enter your OTP code.", 1, "bank_phishing", "en"),
    ("Unusual login detected. Click the link below and confirm your password and one time passcode today or access will be suspended.", 1, "bank_phishing", "en"),
    ("Final notice: your card was charged $499. If this was not you, sign in via bit.ly/refund-claim and enter the verification code to get a refund.", 1, "bank_phishing", "en"),
    ("Dear customer, your online banking is restricted. Reply with your card number and CVV to restore access immediately.", 1, "bank_phishing", "en"),
    ("Security alert: confirm your identity within 30 minutes at our verification portal or your funds will be frozen. Have your OTP ready.", 1, "bank_phishing", "en"),
    ("You have a pending refund of $250. Log in through the secure link and provide your full card details to claim it now.", 1, "bank_phishing", "en"),
    ("This is the fraud team. To stop a suspicious transfer, read me the 6 digit code we just texted you right now.", 1, "bank_phishing", "en"),
    ("Action required today: update your e-banking certificate via the attached QR code and re-enter your password and PIN.", 1, "bank_phishing", "en"),

    # ===================== SCAM - fake_authority (vi) =====================
    ("Đây là Công an thành phố, anh liên quan đến đường dây rửa tiền. Tuyệt đối không nói với ai và chuyển 200 triệu vào tài khoản tạm giữ để phục vụ điều tra.", 1, "fake_authority", "vi"),
    ("Viện kiểm sát thông báo có lệnh bắt tạm giam đối với anh. Muốn chứng minh trong sạch phải chuyển toàn bộ tiền tiết kiệm để giám định nguồn gốc ngay hôm nay.", 1, "fake_authority", "vi"),
    ("Tòa án triệu tập bà vì nợ cước viễn thông liên quan vụ án ma túy. Giữ bí mật tuyệt đối, cài app theo hướng dẫn để khai báo trực tuyến.", 1, "fake_authority", "vi"),
    ("Số căn cước của anh bị lợi dụng mở 3 tài khoản lừa đảo. Hợp tác điều tra bằng cách cung cấp mật khẩu ngân hàng cho cán bộ, không được kể với gia đình.", 1, "fake_authority", "vi"),
    ("Đây là tổng đài Bộ Công an, hồ sơ của chị dính vụ án nghiêm trọng, kết bạn Zalo với điều tra viên và làm theo, tuyệt đối giữ kín nếu không sẽ bị bắt.", 1, "fake_authority", "vi"),
    ("Cảnh sát giao thông thông báo anh có biên bản phạt nguội chưa nộp, bấm vào link sau và thanh toán ngay trong hôm nay nếu không sẽ bị khởi tố.", 1, "fake_authority", "vi"),
    ("Cơ quan thuế yêu cầu chị cài ứng dụng tổng cục thuế theo đường link gửi kèm để hoàn thuế, cấp quyền trợ năng cho app rồi nhập mật khẩu ngân hàng.", 1, "fake_authority", "vi"),
    ("Anh có bưu phẩm chứa giấy triệu tập của tòa. Để xác minh không phạm tội, chuyển 50 triệu vào tài khoản giám sát, sau 24h sẽ hoàn lại, không nói với ai.", 1, "fake_authority", "vi"),
    ("Đây là điện lực, nhà chị nợ tiền điện 3 tháng sẽ bị cắt trong 2 giờ, chuyển khoản ngay cho nhân viên thu hộ số tài khoản cá nhân bên dưới.", 1, "fake_authority", "vi"),
    ("Trung tâm an ninh mạng phát hiện sim của anh phát tán tin nhắn rác, đọc mã xác nhận vừa gửi để cán bộ khóa bảo vệ, làm ngay kẻo bị khóa hai chiều.", 1, "fake_authority", "vi"),
    ("Con chị gây tai nạn đang bị giữ tại trụ sở, muốn bảo lãnh phải chuyển ngay 30 triệu tiền viện phí vào số tài khoản này, không được gọi cho ai khác.", 1, "fake_authority", "vi"),
    ("Bảo hiểm xã hội thông báo thẻ của ông bị khóa do trục lợi, bấm link cập nhật thông tin và nộp phí xác minh 1.500.000đ trước 16h.", 1, "fake_authority", "vi"),
    ("Day la cong an, anh lien quan vu an, giu bi mat va chuyen tien vao tai khoan tam giu de dieu tra ngay.", 1, "fake_authority", "vi"),

    # ===================== SCAM - fake_authority (en) =====================
    ("This is the police cybercrime unit. Your identity was used in a money laundering case. Keep this secret and transfer your savings to a custody account for investigation.", 1, "fake_authority", "en"),
    ("Court notice: an arrest warrant has been issued under your name. To prove innocence, pay the verification deposit today and do not tell anyone.", 1, "fake_authority", "en"),
    ("This is the tax office. You owe back taxes and will be arrested within 24 hours unless you pay immediately via the link below.", 1, "fake_authority", "en"),
    ("Officer speaking: your parcel contains illegal items. Cooperate quietly, install the screen sharing app and show us your banking app now.", 1, "fake_authority", "en"),
    ("Immigration department: your visa is flagged. A fine of $900 must be transferred today or deportation proceedings will begin. Keep this confidential.", 1, "fake_authority", "en"),
    ("Final warning from the electric company: your power will be cut in 45 minutes. Pay the overdue bill now to the staff personal account below.", 1, "fake_authority", "en"),

    # ===================== SCAM - job_scholarship (vi) =====================
    ("Tuyển CTV chốt đơn online tại nhà, việc nhẹ lương cao 500k đến 2 triệu mỗi ngày, chỉ cần đặt cọc 300k kích hoạt tài khoản, hoàn lại sau đơn đầu tiên.", 1, "job_scholarship", "vi"),
    ("Chúc mừng em nhận học bổng toàn phần 120 triệu. Để giữ suất, đóng phí hồ sơ 2.500.000đ trong hôm nay qua số tài khoản cá nhân của thầy.", 1, "job_scholarship", "vi"),
    ("Tuyển nhân viên đánh máy tại nhà lương 15 triệu, không cần kinh nghiệm, nộp phí đồng phục và bảo mật 450k trước khi nhận việc ngay hôm nay.", 1, "job_scholarship", "vi"),
    ("Nhiệm vụ like video nhận hoa hồng 30%, nạp 500k làm nhiệm vụ đầu, nạp càng nhiều hoa hồng càng cao, rút tiền trong ngày.", 1, "job_scholarship", "vi"),
    ("Anh được chọn làm cộng tác viên sàn thương mại, thanh toán hộ đơn ảo để hưởng chiết khấu 20%, chuyển khoản đơn đầu 1.200.000đ để bắt đầu.", 1, "job_scholarship", "vi"),
    ("Học bổng du học Hàn Quốc xét duyệt nhanh, đảm bảo đậu visa 100%, phí giữ chỗ 5 triệu đóng trước hôm nay, mai hết suất.", 1, "job_scholarship", "vi"),
    ("Bên chị tuyển mẫu ảnh nhí, bé được chọn rồi nhé, phụ huynh đóng phí trang phục 800k để xác nhận lịch chụp, chuyển ngay kẻo mất suất.", 1, "job_scholarship", "vi"),
    ("Việc làm thêm dịp hè cho sinh viên, lương 800k một ngày, chỉ cần CCCD và đóng 200k phí hồ sơ, nhận việc luôn không phỏng vấn.", 1, "job_scholarship", "vi"),
    ("Em ơi bên trung tâm thông báo em trúng tuyển thực tập sinh Nhật, đặt cọc 10 triệu trước 12h trưa nay để chốt danh sách bay.", 1, "job_scholarship", "vi"),
    ("Cong ty tuyen CTV xu ly don hang, hoa hong 25%, dat coc 500k nhan viec ngay, hoan tien sau 2 don.", 1, "job_scholarship", "vi"),
    ("Tuyển người xem video TikTok nhận lương theo giờ, vào nhóm kín Telegram theo link, nạp tiền nhiệm vụ để nhận nhiệm vụ cao cấp hơn.", 1, "job_scholarship", "vi"),

    # ===================== SCAM - job_scholarship (en) =====================
    ("Congratulations, you won a full scholarship worth $5000. To secure your slot, pay the $99 processing fee today via the link below.", 1, "job_scholarship", "en"),
    ("Work from home, earn $300 a day liking videos. Deposit $20 to activate your task account, withdraw anytime, limited slots today.", 1, "job_scholarship", "en"),
    ("You are hired as a remote data entry assistant, salary $900 weekly. Send a $45 equipment fee first and start immediately, no interview needed.", 1, "job_scholarship", "en"),
    ("Part time job offer: complete simple orders for 25% commission. Top up your first task of $50 now, profits are withdrawn daily.", 1, "job_scholarship", "en"),
    ("Your internship visa is approved. Transfer the placement deposit today to confirm your flight list, slots close at noon.", 1, "job_scholarship", "en"),

    # ===================== SCAM - delivery (vi) =====================
    ("Bưu kiện của bạn đang bị giữ tại kho do thiếu phí hải quan 39.000đ, thanh toán tại link giaonhanh-vn.top trong hôm nay để nhận hàng.", 1, "delivery", "vi"),
    ("Shipper đây ạ, đơn của chị giao không thành công, chị bấm vào link sau điền lại địa chỉ và thanh toán phí phát lại 25k giúp em.", 1, "delivery", "vi"),
    ("Đơn hàng quốc tế của bạn chứa vật phẩm giá trị, nộp thuế 1.200.000đ vào tài khoản nhân viên kho để thông quan ngay, quá hạn sẽ hoàn trả.", 1, "delivery", "vi"),
    ("Anh có đơn COD 350k em giao tới nơi không ai nhận, anh chuyển khoản trước giúp em rồi tối em giao lại, em cam kết bằng CCCD.", 1, "delivery", "vi"),
    ("Thông báo từ bưu điện: kiện hàng của quý khách bị thất lạc, bấm link bên dưới nhập số thẻ ngân hàng để nhận bồi thường 2.000.000đ.", 1, "delivery", "vi"),
    ("Em là điều phối kho, đơn chị bị sai mã, chị quét QR này thanh toán lại 1k để hệ thống xác nhận rồi bên em hoàn 100k phí xin lỗi ạ.", 1, "delivery", "vi"),
    ("Buu kien cua ban thieu phi van chuyen, thanh toan ngay tai link de nhan hang trong hom nay.", 1, "delivery", "vi"),
    ("Tổng đài giao hàng thông báo: quý khách có 2 đơn trùng địa chỉ, vui lòng cung cấp mã OTP vừa gửi để hủy bớt một đơn.", 1, "delivery", "vi"),

    # ===================== SCAM - delivery (en) =====================
    ("Your parcel is held at customs. Pay the $3.99 clearance fee today at quick-post-track.top or it will be returned to sender.", 1, "delivery", "en"),
    ("Delivery failed: update your address and pay a $1 redelivery fee via the link below within 12 hours.", 1, "delivery", "en"),
    ("Your international package contains taxable goods. Transfer the duty to the warehouse staff account now to release it.", 1, "delivery", "en"),
    ("Courier notice: enter your card number on the page below to receive compensation for your lost shipment.", 1, "delivery", "en"),

    # ===================== SCAM - investment (vi) =====================
    ("Sàn quốc tế cam kết lợi nhuận 30% mỗi tháng, chuyên gia đọc lệnh kèm 1-1, nạp tối thiểu 10 triệu hôm nay nhận thêm 20% vốn thưởng.", 1, "investment", "vi"),
    ("Quỹ đầu tư AI bao lỗ 100%, rút gốc bất kỳ lúc nào, anh vào nhóm Zalo theo link để nhận 3 mã x2 tài khoản trong tuần.", 1, "investment", "vi"),
    ("Em là trợ lý chuyên gia chứng khoán, danh mục VIP lãi 15% một tuần, anh chuyển vốn vào tài khoản công ty em tạo giúp để hệ thống tự giao dịch.", 1, "investment", "vi"),
    ("Dự án tiền số sắp lên sàn, mua trước giá ưu đãi 0.1$, cam kết x10 sau một tháng, chỉ nhận chuyển khoản trong hôm nay, mai khóa ví.", 1, "investment", "vi"),
    ("Anh tham gia gói tích lũy 68 triệu, mỗi ngày nhận 1.2 triệu tiền lãi về ví, giới thiệu thêm người nhận thưởng 10%, nạp lần đầu giảm 50%.", 1, "investment", "vi"),
    ("Tài khoản của anh trên sàn đang lãi 180 triệu nhưng muốn rút phải nộp 15% thuế thu nhập vào tài khoản kế toán trước 21h hôm nay.", 1, "investment", "vi"),
    ("San dau tu cam ket loi nhuan 25% moi thang, nap toi thieu 5 trieu, rut von bat ky luc nao, vao nhom kin ngay.", 1, "investment", "vi"),

    # ===================== SCAM - investment (en) =====================
    ("Join our crypto fund with guaranteed 25% monthly returns, withdraw anytime. Deposit $500 today and get a 20% bonus, slots close tonight.", 1, "investment", "en"),
    ("Your trading account profit is $12,400. To withdraw, pay the 10% income tax to our accountant wallet within 6 hours.", 1, "investment", "en"),
    ("VIP signal group: 15% weekly profit, our expert places orders for you. Transfer your capital to the company account to start auto trading.", 1, "investment", "en"),
    ("Pre-sale token guaranteed to x10 after listing. Send payment today, wallets close at midnight, only 50 slots left.", 1, "investment", "en"),

    # ===================== SCAM - account_takeover (vi) =====================
    ("Mẹ ơi con đổi số mới, điện thoại con hỏng rồi, mẹ chuyển gấp 15 triệu vào số tài khoản này cho bạn con mượn, tối con về giải thích.", 1, "account_takeover", "vi"),
    ("Chị ơi em bị treo app ngân hàng, chị nhận hộ em mã xác nhận gửi về máy chị rồi đọc cho em với, em đang cần gấp lắm.", 1, "account_takeover", "vi"),
    ("Tao đây, đang kẹt ở sân bay mất ví rồi, mày chuyển nhanh 5 triệu vào tài khoản này giùm, về tao gửi lại liền, đừng nói ba mẹ.", 1, "account_takeover", "vi"),
    ("Anh yêu, em đang gặp chuyện không tiện gọi, anh mua giúp em 3 thẻ cào 500k gửi mã qua đây liền nhé, lát em giải thích.", 1, "account_takeover", "vi"),
    ("Facebook của bạn vi phạm bản quyền và sẽ bị khóa trong 24h, xác minh danh tính tại link kèm theo, đăng nhập và nhập mã bảo mật hai lớp.", 1, "account_takeover", "vi"),
    ("Bạn nhận được yêu cầu khôi phục mật khẩu. Nếu là bạn, gửi lại mã 6 số vừa nhận cho trung tâm hỗ trợ qua tin nhắn này để xác minh.", 1, "account_takeover", "vi"),
    ("Me oi con doi so, chuyen gap 10 trieu vao tai khoan nay cho con, toi ve con noi sau, dung goi lai so cu.", 1, "account_takeover", "vi"),

    # ===================== SCAM - account_takeover (en) =====================
    ("Mom this is my new number, my phone broke. Please transfer $800 to this account for my friend, I will explain tonight, do not call the old number.", 1, "account_takeover", "en"),
    ("Hey it's me, I'm stuck at the airport and lost my wallet. Send $300 to this account quickly, I'll pay you back tomorrow, keep it between us.", 1, "account_takeover", "en"),
    ("Your page violated copyright and will be disabled in 24 hours. Verify your identity via the link and enter your two factor code.", 1, "account_takeover", "en"),
    ("Support team here: to recover your account, forward us the 6 digit code you just received by SMS right now.", 1, "account_takeover", "en"),

    # ===================== SCAM - other (vi) =====================
    ("Chúc mừng thuê bao của bạn trúng thưởng xe SH trị giá 150 triệu từ chương trình tri ân, nộp phí nhận thưởng 3 triệu để làm hồ sơ trong hôm nay.", 1, "other", "vi"),
    ("Sim của quý khách sẽ bị khóa hai chiều sau 2 giờ do chưa chuẩn hóa, bấm phím 1 gặp nhân viên và cung cấp số căn cước cùng mã OTP.", 1, "other", "vi"),
    ("Bạn được chọn nhận quà tri ân 0 đồng từ nhãn hàng, chỉ trả 199k phí vận chuyển, chuyển khoản trước vào tài khoản cá nhân để giữ suất hôm nay.", 1, "other", "vi"),
    ("Ví điện tử của bạn nhận 500.000đ tiền hoàn, đăng nhập tại vi-hoantien.xyz và nhập mật khẩu cùng mã xác minh để nhận trước 18h.", 1, "other", "vi"),
    ("Tổng đài viễn thông: cước tháng này của bạn là 8.900.000đ do phát sinh quốc tế, bấm phím 9 và làm theo hướng dẫn, giữ máy không tắt.", 1, "other", "vi"),
    ("Anh ơi em gửi nhầm 2 triệu vào tài khoản anh, anh chuyển lại giúp em vào số khác này nhé, em đang cần gấp, em cảm ơn nhiều ạ.", 1, "other", "vi"),
    ("Chuc mung ban trung thuong dien thoai, nop phi 500k nhan qua ngay hom nay, lien he zalo theo link.", 1, "other", "vi"),

    # ===================== SCAM - other (en) =====================
    ("Congratulations! You won a $1000 gift card from our anniversary draw. Pay the $25 release fee today to claim your prize.", 1, "other", "en"),
    ("Your SIM will be deactivated in 2 hours due to new regulations. Press 1 and provide your ID number and the OTP we send.", 1, "other", "en"),
    ("I accidentally transferred $120 to your wallet, please send it back to this other account quickly, I really need it today.", 1, "other", "en"),
    ("Your e-wallet received a cashback of $50. Log in at wallet-refund.icu and enter your password and verification code before 6pm.", 1, "other", "en"),

    # ===================== SAFE (vi) =====================
    ("Tối nay 7h cả nhà ăn lẩu ở quán cũ nhé, ba đặt bàn rồi, con nhớ về sớm phụ mẹ dọn nhà.", 0, "", "vi"),
    ("Anh ơi mai họp nhóm lúc 9h sáng ở phòng 302, anh nhớ mang theo laptop và bản kế hoạch quý nhé.", 0, "", "vi"),
    ("Hôm nay trời mưa to, con đi học nhớ mang áo mưa, tan học đứng trong sảnh chờ mẹ đón.", 0, "", "vi"),
    ("Chị gửi em file báo cáo doanh thu tháng 5 qua email công ty rồi nhé, em xem góp ý giúp chị trước thứ sáu.", 0, "", "vi"),
    ("Lớp mình đổi lịch học bù sang chiều thứ bảy, các bạn xem thông báo trên cổng thông tin của trường nhé.", 0, "", "vi"),
    ("Cuối tuần này nhóm mình đi đá bóng lúc 6h sáng, ai đi được thì thả tim để mình đặt sân.", 0, "", "vi"),
    ("Mẹ ơi con tan làm trễ, mẹ ăn cơm trước đi, con mua trái cây về cho mẹ rồi nè.", 0, "", "vi"),
    ("Đơn hàng #VN20250612 của bạn đã được giao thành công lúc 14:32. Cảm ơn bạn đã mua sắm, hẹn gặp lại.", 0, "", "vi"),
    ("Shipper sẽ giao đơn sách của bạn vào sáng mai, vui lòng để ý điện thoại, tiền thu hộ là 215.000đ thanh toán khi nhận hàng.", 0, "", "vi"),
    ("Nhà hàng xác nhận bàn 4 người lúc 19h thứ bảy tên anh Minh, nếu thay đổi vui lòng gọi lại số tổng đài của quán.", 0, "", "vi"),
    ("Thư viện thông báo sách bạn mượn sẽ đến hạn trả vào ngày 20/6, bạn có thể gia hạn trực tiếp trên trang thư viện của trường.", 0, "", "vi"),
    ("Ngân hàng không bao giờ yêu cầu khách hàng cung cấp mật khẩu hay mã OTP qua điện thoại, hãy cảnh giác với cuộc gọi tự xưng nhân viên.", 0, "", "vi"),
    ("Biến động số dư: tài khoản của quý khách vừa nhận 1.500.000đ lúc 09:15 từ NGUYEN VAN A, nội dung thanh toan tien hang.", 0, "", "vi"),
    ("Quý khách vừa thanh toán 320.000đ tại siêu thị lúc 18:45. Nếu cần hỗ trợ, gọi hotline in trên mặt sau thẻ của quý khách.", 0, "", "vi"),
    ("Em nộp bài tiểu luận môn marketing lên hệ thống lúc 22h rồi nha cô, cô kiểm tra giúp em xem file mở được không ạ.", 0, "", "vi"),
    ("Phòng nhân sự thông báo lịch nghỉ lễ từ 30/4 đến 4/5, các bạn sắp xếp bàn giao công việc trước kỳ nghỉ.", 0, "", "vi"),
    ("Bác sĩ hẹn tái khám cho bé vào thứ năm tuần sau lúc 8h30, mẹ nhớ mang sổ khám và thẻ bảo hiểm y tế nhé.", 0, "", "vi"),
    ("Hội thao công ty sẽ diễn ra ngày 15/7 tại sân vận động quận, đăng ký môn thi với thư ký phòng trước cuối tuần này.", 0, "", "vi"),
    ("Con gửi mẹ ảnh điểm thi học kỳ của cháu nè, cháu được học sinh giỏi đó mẹ, cuối tuần nhà con về thăm mẹ.", 0, "", "vi"),
    ("Tiền điện nhà mình tháng này 850 nghìn, để tối anh ra cửa hàng điện lực đóng trực tiếp luôn nhé.", 0, "", "vi"),
    ("Cô chủ nhiệm nhắn: ngày mai lớp kiểm tra toán 15 phút đầu giờ, phụ huynh nhắc các con ôn bài chương 3 giúp cô.", 0, "", "vi"),
    ("Anh đặt giúp em một ly cà phê sữa đá khi ghé quán nhé, em đang ở tầng 5 họp, 15 phút nữa em xuống.", 0, "", "vi"),
    ("Gấp nha mọi người: 14h chiều nay họp đột xuất với khách hàng tại phòng lớn, ai vắng báo lại trưởng nhóm trước 13h.", 0, "", "vi"),
    ("Khách sạn xác nhận đặt phòng 2 đêm từ 12/8, quý khách thanh toán trực tiếp tại quầy lễ tân khi nhận phòng.", 0, "", "vi"),
    ("Mình bán lại vé concert giá gốc 1.2 triệu vì bận đột xuất, bạn nào lấy thì gặp mình trực tiếp tại trường trao đổi nhé.", 0, "", "vi"),
    ("Ba ơi cuối tháng con đóng học phí kỳ mới 4 triệu rưỡi, ba chuyển vào tài khoản con như mọi lần giúp con nha, không gấp đâu ạ.", 0, "", "vi"),
    ("Chào bạn, đơn ứng tuyển của bạn đã qua vòng hồ sơ, mời bạn đến phỏng vấn tại văn phòng công ty lúc 10h thứ ba, gặp chị Lan lễ tân.", 0, "", "vi"),
    ("Trường thông báo học bổng khuyến khích học tập kỳ này, sinh viên đạt điều kiện nộp hồ sơ miễn phí tại phòng công tác sinh viên trước 25/6.", 0, "", "vi"),
    ("Mai 6h sáng mình chạy bộ công viên không? Chạy xong ăn sáng bánh mì chỗ cũ, ông rủ thêm thằng Nam nữa nhé.", 0, "", "vi"),
    ("App ngân hàng sẽ bảo trì từ 0h đến 2h sáng chủ nhật, trong thời gian này quý khách tạm thời không thực hiện được giao dịch, mong quý khách thông cảm.", 0, "", "vi"),
    ("Em ơi chị chuyển khoản tiền hàng cho em rồi đó, em kiểm tra giúp chị rồi gửi hàng theo địa chỉ cũ nhé, cảm ơn em.", 0, "", "vi"),
    ("Nhóm mình chốt quà sinh nhật cho Hà là máy xay sinh tố nhé, mỗi người góp 150k, đưa tiền mặt cho Trang vào thứ hai.", 0, "", "vi"),
    ("Hệ thống đã ghi nhận yêu cầu đổi mật khẩu của bạn thành công lúc 10:21, nếu không phải bạn thực hiện hãy liên hệ bộ phận hỗ trợ qua kênh chính thức.", 0, "", "vi"),
    ("Lịch cắt điện bảo trì khu vực phường 5 từ 8h đến 11h thứ tư, người dân xem chi tiết trên trang web chính thức của điện lực thành phố.", 0, "", "vi"),
    ("Cảm ơn quý khách đã đặt vé xem phim suất 20h, vui lòng đến trước 15 phút và xuất trình mã đặt chỗ tại quầy để nhận vé.", 0, "", "vi"),
    ("Toi nay an com nha noi nhe ca nha, 6h co mat day du, ba dang nau mon bo kho ngon lam.", 0, "", "vi"),
    ("Bài giảng tuần này cô đã đăng lên lớp học trực tuyến, các em xem trước video chương 4 và làm bài tập nhỏ cuối bài.", 0, "", "vi"),
    ("Anh kiểm tra giúp em hợp đồng trang 12 mục thanh toán, em thấy ghi 30 ngày mà mình thỏa thuận 45 ngày, sửa lại trước khi ký nhé.", 0, "", "vi"),
    ("Chung cư thông báo diễn tập phòng cháy chữa cháy sáng chủ nhật, cư dân nghe chuông báo vui lòng di chuyển theo cầu thang bộ xuống sân.", 0, "", "vi"),
    ("Mẹ nhớ uống thuốc huyết áp đúng giờ nha mẹ, con để hộp thuốc trên bàn ăn, chia sẵn theo từng buổi rồi đó ạ.", 0, "", "vi"),

    # ===================== SAFE (en) =====================
    ("Hey, are we still on for dinner at 7 tonight? I booked the usual place, see you there.", 0, "", "en"),
    ("Reminder: team standup moved to 9:30am tomorrow in room 2B, please bring your sprint updates.", 0, "", "en"),
    ("Your order #88231 was delivered at 2:15pm. Thanks for shopping with us, rate your experience in the app.", 0, "", "en"),
    ("The courier will deliver your books tomorrow morning, cash on delivery is $12, please keep your phone nearby.", 0, "", "en"),
    ("Your library books are due on June 20. You can renew them on the university library portal.", 0, "", "en"),
    ("We never ask for your password or OTP by phone or email. Stay alert against callers claiming to be bank staff.", 0, "", "en"),
    ("Transaction alert: your account received $150.00 at 09:15 from JOHN D. Reference: invoice 1023.", 0, "", "en"),
    ("You paid $32.50 at the grocery store at 6:45pm. For support, call the hotline printed on the back of your card.", 0, "", "en"),
    ("Hi mom, my exam went well today. I'll come home this weekend and cook dinner for you.", 0, "", "en"),
    ("HR notice: the office is closed for the holiday from April 30 to May 4. Please hand over pending tasks before the break.", 0, "", "en"),
    ("Doctor's appointment confirmed for Thursday 8:30am. Bring your health record book and insurance card.", 0, "", "en"),
    ("Your hotel booking for two nights from Aug 12 is confirmed. Payment is at the front desk on arrival.", 0, "", "en"),
    ("Urgent for today only: the client meeting moved to 2pm in the main room, message the team lead if you cannot attend.", 0, "", "en"),
    ("Congrats on passing the first interview round. Please visit our office at 10am Tuesday and ask for Ms. Lan at reception.", 0, "", "en"),
    ("The scholarship office is accepting applications until June 25. Submission is free at the student affairs desk.", 0, "", "en"),
    ("Morning run at the park at 6am tomorrow? Breakfast after at the usual bakery, bring Nam along.", 0, "", "en"),
    ("Our banking app will be under maintenance from midnight to 2am Sunday. Transactions will be temporarily unavailable.", 0, "", "en"),
    ("I just transferred the payment for the goods, please check and ship to the same address as last time, thank you.", 0, "", "en"),
    ("We received your password change request at 10:21. If this wasn't you, contact support through the official app.", 0, "", "en"),
    ("Movie tickets booked for the 8pm show. Arrive 15 minutes early and show your booking code at the counter.", 0, "", "en"),
    ("Lecture slides for week 6 are posted on the LMS. Watch the chapter 4 video and finish the short quiz.", 0, "", "en"),
    ("Please review clause 12 of the contract, it says 30 days but we agreed on 45. Let's fix it before signing.", 0, "", "en"),
    ("Fire drill this Sunday morning. When the alarm rings, please use the stairs and gather at the courtyard.", 0, "", "en"),
    ("Dad, tuition for the new term is $1,800 due end of month. Transfer to my account like last time, no rush.", 0, "", "en"),
    ("Don't forget your blood pressure medicine, I left the pillbox on the dining table sorted by day.", 0, "", "en"),
    ("The package tracking shows your parcel is at the local hub and will arrive within two days. No action needed.", 0, "", "en"),
    ("Team lunch on Friday to celebrate the launch! Vote for Korean or Thai in the group poll by tomorrow.", 0, "", "en"),
    ("Your electricity bill for May is $42. You can pay at any branch or through the official utility website.", 0, "", "en"),
    ("Reminder from the dentist: your cleaning appointment is next Monday at 3pm. Reply YES to confirm or call us to reschedule.", 0, "", "en"),
    ("The committee approved your thesis topic. Schedule a meeting with your supervisor next week to plan chapter one.", 0, "", "en"),

    # ===================== SAFE - hard negatives (vi/en) =====================
    ("Cảnh báo từ báo chí: gần đây xuất hiện chiêu giả danh công an gọi điện dọa bắt, yêu cầu chuyển tiền vào tài khoản tạm giữ. Tuyệt đối không chuyển tiền cho người lạ.", 0, "", "vi"),
    ("Bài học hôm nay: kẻ gian thường tạo cảm giác khẩn cấp như chuyển tiền ngay, giữ bí mật. Gặp tình huống này hãy bình tĩnh gọi xác minh qua số chính thức.", 0, "", "vi"),
    ("Mã OTP dùng một lần của bạn là 583920, có hiệu lực trong 2 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai, kể cả nhân viên ngân hàng.", 0, "", "vi"),
    ("Mình vừa đọc bài về lừa đảo việc nhẹ lương cao, tụi nó bắt đặt cọc trước rồi chặn luôn, mọi người cẩn thận giùm nha.", 0, "", "vi"),
    ("Anh nhớ thanh toán hóa đơn nước trước ngày 15 trên app chính thức nhé, tháng trước mình quên bị tính phí trễ hạn đó.", 0, "", "vi"),
    ("Police warned this week about callers posing as officers demanding urgent transfers to a custody account. Never send money to strangers.", 0, "", "en"),
    ("Your one time passcode is 442918, valid for 2 minutes. Do not share this code with anyone, including bank staff.", 0, "", "en"),
    ("Class topic today: scammers create urgency like transfer now or keep it secret. Stay calm and verify through official channels.", 0, "", "en"),
    ("I read an article about task scams asking for deposits first, then blocking victims. Please be careful everyone.", 0, "", "en"),
    ("Remember to pay the water bill before the 15th on the official app, we got a late fee last month.", 0, "", "en"),
]


def stats():
    from collections import Counter
    c = Counter((l, t or "safe", g) for _, l, t, g in DATA)
    total = len(DATA)
    scam = sum(1 for _, l, _, _ in DATA if l == 1)
    return total, scam, total - scam, c


if __name__ == "__main__":
    total, scam, safe, c = stats()
    print(f"total={total} scam={scam} safe={safe}")
    for k in sorted(c):
        print(k, c[k])

# ===================== EXTRA SAMPLES (round 2) =====================
EXTRA = [
    # bank_phishing vi
    ("Hồ sơ vay 50 triệu của anh đã được duyệt, đóng phí bảo hiểm khoản vay 1.800.000đ vào tài khoản kế toán để giải ngân trong 30 phút.", 1, "bank_phishing", "vi"),
    ("Thẻ ATM của quý khách bị nuốt do lỗi hệ thống, cung cấp số thẻ và mã PIN cho tổng đài viên để khóa thẻ khẩn cấp ngay bây giờ.", 1, "bank_phishing", "vi"),
    ("Ứng dụng ngân hàng phiên bản cũ sẽ ngừng hoạt động tối nay, tải bản mới tại link ngoài kèm theo và đăng nhập lại bằng mật khẩu cũ.", 1, "bank_phishing", "vi"),
    ("Quý khách được hoàn 2% phí giao dịch quý 2, xác nhận nhận tiền bằng cách nhập OTP tại trang hoantien-quy2.top trước 23h59 hôm nay.", 1, "bank_phishing", "vi"),
    # bank_phishing en
    ("Your loan of $2,000 is approved. Pay the $80 insurance fee to the accountant account below to receive funds within 30 minutes.", 1, "bank_phishing", "en"),
    ("Your mobile banking app expires tonight. Download the new version from the attached link and log in with your old password.", 1, "bank_phishing", "en"),
    ("Cashback of 2% is ready for you. Confirm by entering the OTP at refund-q2.top before midnight today.", 1, "bank_phishing", "en"),
    # fake_authority vi
    ("Đây là cục quản lý xuất nhập cảnh, hộ chiếu của chị bị tạm giữ vì nghi vấn, đóng phí xác minh 5 triệu và không thông báo cho người thân.", 1, "fake_authority", "vi"),
    ("Cán bộ phường thông báo anh chưa cập nhật định danh mức 2, bấm link tải app hỗ trợ rồi cấp quyền truy cập màn hình để cán bộ làm giúp.", 1, "fake_authority", "vi"),
    ("Đây là thanh tra sở y tế, phòng khám của chị bị tố cáo, muốn không bị đình chỉ thì chuyển 40 triệu chi phí xử lý hồ sơ trong chiều nay.", 1, "fake_authority", "vi"),
    ("Trung tâm đăng kiểm thông báo xe anh bị phạt nguội 3 lần, nộp phạt qua tài khoản cá nhân của cán bộ xử lý để không bị giữ bằng lái.", 1, "fake_authority", "vi"),
    # fake_authority en
    ("This is the social security office, your number is suspended due to suspicious activity. Verify your bank login with the officer and tell no one.", 1, "fake_authority", "en"),
    ("Traffic department: you have 3 unpaid camera fines. Pay today to the officer handling account or your license will be revoked.", 1, "fake_authority", "en"),
    ("Health inspector speaking: your clinic was reported. Transfer the case handling fee this afternoon to avoid suspension.", 1, "fake_authority", "en"),
    # job_scholarship vi
    ("Bên em tuyển dịch giả online lương 20 triệu, nhận việc cần nộp phí tài khoản dịch thuật 600k, làm 2 ngày hoàn phí, chuyển khoản ngay nhé chị.", 1, "job_scholarship", "vi"),
    ("Chương trình trao đổi sinh viên còn 2 suất cuối, em chuyển 8 triệu giữ chỗ trước 15h, hồ sơ visa bên anh lo trọn gói đậu 100%.", 1, "job_scholarship", "vi"),
    ("Tuyển gấp 5 bạn nhập liệu buổi tối tại nhà, lương theo sản phẩm 7k một đơn, kích hoạt tài khoản làm việc bằng cách nạp thẻ cào 300k.", 1, "job_scholarship", "vi"),
    ("Em được chọn vào vòng nhận việc của tập đoàn, hoàn tất đặt cọc giữ vị trí 1.500.000đ hôm nay, mai ký hợp đồng chính thức tại văn phòng.", 1, "job_scholarship", "vi"),
    # job_scholarship en
    ("We hire online translators, salary $800 weekly. Pay the $25 translation account fee to start, refunded after two days of work.", 1, "job_scholarship", "en"),
    ("Final 2 slots for the exchange program. Transfer the $350 reservation today, our agency guarantees 100% visa approval.", 1, "job_scholarship", "en"),
    ("Evening data entry job, paid per task. Activate your work account by topping up a $15 card and start tonight.", 1, "job_scholarship", "en"),
    ("You passed our final hiring round. Complete the $60 position deposit today and sign the contract tomorrow at our office.", 1, "job_scholarship", "en"),
    # delivery vi
    ("Kho trung chuyển báo đơn của anh bị bóc trộm, anh xác nhận số thẻ ngân hàng vào form sau để bên bảo hiểm kho bồi thường 500k ngay hôm nay.", 1, "delivery", "vi"),
    ("Em giao hàng cho chị mà chị không nghe máy, giờ em gửi lại kho, chị muốn nhận trong hôm nay thì chuyển 30k phí lưu kho qua số tài khoản em.", 1, "delivery", "vi"),
    ("Hệ thống bưu cục thông báo địa chỉ nhận của bạn sai mã vùng, bấm vào link buucuc-update.xyz cập nhật lại và đóng 15k phí điều chỉnh.", 1, "delivery", "vi"),
    ("Đơn nước hoa quốc tế của chị bị hải quan giữ vì nghi hàng cấm, nộp 2 triệu tiền bảo lãnh vào tài khoản cán bộ kho để không bị lập biên bản.", 1, "delivery", "vi"),
    # delivery en
    ("The transit hub reports your parcel was damaged. Enter your card number in the form below to receive the $20 insurance payout today.", 1, "delivery", "en"),
    ("Courier here, you missed my call so the parcel goes back to the depot. Transfer the $2 storage fee to my account to get it today.", 1, "delivery", "en"),
    ("Postal system: your address has a wrong zone code. Update at post-update.xyz and pay a $0.99 adjustment fee.", 1, "delivery", "en"),
    ("Customs held your perfume order as restricted goods. Pay the $90 bond to the warehouse officer account to avoid a report.", 1, "delivery", "en"),
    # investment vi
    ("Anh vào nhóm đọc lệnh vàng quốc tế, thầy phân tích 10 năm kinh nghiệm, nạp ký quỹ 20 triệu hôm nay được tặng kèm gói tín hiệu VIP trọn đời.", 1, "investment", "vi"),
    ("Bên em mở bán suất đầu tư bất động sản chia nhỏ chỉ từ 5 triệu, cam kết mua lại gốc cộng lãi 18% sau 3 tháng, ký hợp đồng điện tử ngay hôm nay.", 1, "investment", "vi"),
    ("Hệ thống copy trade tự động lãi 2% mỗi ngày, anh chỉ cần nạp ví và bật chế độ tự động, đội ngũ kỹ thuật bao lỗ tháng đầu cho anh.", 1, "investment", "vi"),
    ("Chị tham gia mô hình tích điểm hoàn tiền, mua gói 30 triệu mỗi tháng rút 4 triệu, giới thiệu bạn bè nhận thêm hoa hồng 3 tầng không giới hạn.", 1, "investment", "vi"),
    ("Tài khoản chứng khoán nội bộ sắp chia cổ tức khủng, chuyển tiền trước 16h hôm nay để kịp chốt danh sách, suất ngoại giao chỉ còn 3 slot.", 1, "investment", "vi"),
    # investment en
    ("Join our gold signal room, the master has 10 years of experience. Deposit $1,000 margin today and get a lifetime VIP signal package.", 1, "investment", "en"),
    ("Fractional real estate from $200 with guaranteed buyback plus 18% in 3 months. Sign the e-contract today, limited allocation.", 1, "investment", "en"),
    ("Auto copy trading earns 2% daily. Just fund your wallet and enable auto mode, our team covers any loss in month one.", 1, "investment", "en"),
    ("Insider stock dividend closes at 4pm today. Transfer now to be on the list, only 3 diplomatic slots left.", 1, "investment", "en"),
    # account_takeover vi
    ("Cậu ơi tớ đang họp không gọi được, chuyển giúp tớ 3 triệu vào số tài khoản lạ này trả tiền hàng gấp, xong họp tớ chuyển lại liền nha.", 1, "account_takeover", "vi"),
    ("Chào bạn, tôi là bộ phận hỗ trợ Zalo, tài khoản bạn bị báo cáo spam, gửi mã xác thực 6 số vừa nhận để chúng tôi mở khóa trong hôm nay.", 1, "account_takeover", "vi"),
    ("Dì ơi con là Tí đây, con rớt điện thoại xuống nước nên mượn máy bạn nhắn, dì chuyển gấp 7 triệu đóng tiền học cho con qua số này nha dì.", 1, "account_takeover", "vi"),
    ("Tài khoản email của bạn đăng nhập từ thiết bị lạ, xác minh ngay bằng cách trả lời tin nhắn này kèm mật khẩu hiện tại để giữ quyền truy cập.", 1, "account_takeover", "vi"),
    ("Bạn cũ đây, lâu rồi không gặp, mình mới về nước cần đổi 10 triệu tiền mặt lấy chuyển khoản, bạn chuyển trước mình đưa tiền mặt sau nhé.", 1, "account_takeover", "vi"),
    # account_takeover en
    ("Auntie, this is Tim on my friend's phone, mine fell in water. Please send $250 for my tuition to this account today.", 1, "account_takeover", "en"),
    ("Hello, this is app support. Your account was reported for spam, send us the 6 digit code you just received to unlock it today.", 1, "account_takeover", "en"),
    ("Your email was accessed from a new device. Reply with your current password to verify and keep access.", 1, "account_takeover", "en"),
    ("Old friend here, just got back home. I need to swap $400 cash for a transfer, you send first and I hand you cash later.", 1, "account_takeover", "en"),
    # other vi
    ("Nhà mạng tri ân khách hàng 10 năm, bấm vào link nhận 50GB data miễn phí, đăng nhập bằng số điện thoại và mã OTP để kích hoạt ngay.", 1, "other", "vi"),
    ("Bạn có 1 lệnh chuyển nhầm 5 triệu vào ví, hệ thống yêu cầu xác minh chủ ví bằng mật khẩu và mã PIN để hoàn trả cho người gửi trong hôm nay.", 1, "other", "vi"),
    ("Chương trình quay số cuối năm thông báo số của bạn trúng giải nhì 80 triệu, đóng thuế thu nhập cá nhân 8 triệu trước khi nhận giải hôm nay.", 1, "other", "vi"),
    ("Tổng đài truyền hình thông báo hợp đồng của bạn hết hạn, gia hạn ưu đãi 50% bằng cách chuyển khoản cho kỹ thuật viên phụ trách khu vực ngay.", 1, "other", "vi"),
    # other en
    ("Your number won second prize of $3,000 in our year end draw. Pay the $300 income tax today before claiming the prize.", 1, "other", "en"),
    ("Telecom loyalty gift: tap the link for 50GB free data, log in with your phone number and the OTP to activate now.", 1, "other", "en"),
    ("A wrong transfer of $200 entered your wallet. Verify ownership with your password and PIN so we can refund the sender today.", 1, "other", "en"),
    ("Your TV contract expired. Renew with 50% off by transferring directly to the regional technician account now.", 1, "other", "en"),
    # safe vi
    ("Anh chuyển khoản tiền học phí cho cô giáo qua số tài khoản trường công bố trên website nhé, đừng chuyển cho tài khoản cá nhân nào khác.", 0, "", "vi"),
    ("Bưu tá vừa gọi báo chiều nay giao sách lúc 3h, con ở nhà nhận giúp mẹ nhé, tiền mẹ đưa sẵn trên bàn rồi.", 0, "", "vi"),
    ("Công ty thông báo đợt đánh giá hiệu suất quý sẽ bắt đầu tuần sau, mọi người hoàn thành tự đánh giá trên hệ thống nội bộ trước thứ sáu.", 0, "", "vi"),
    ("Mình gửi biên lai đóng tiền lớp học bơi của bé rồi nha chị, chị kiểm tra giúp em xem đúng số buổi chưa.", 0, "", "vi"),
    ("Cảnh giác nhé cả nhà, dạo này có số lạ gọi tự xưng nhân viên điện lực đòi chuyển khoản gấp, điện lực chỉ thu qua kênh chính thức thôi.", 0, "", "vi"),
    ("Chị ơi bên em xác nhận lịch lắp điều hòa sáng thứ tư, kỹ thuật viên sẽ mặc đồng phục và xuất trình thẻ nhân viên khi đến ạ.", 0, "", "vi"),
    # safe en
    ("Please pay the tuition to the school account published on the official website, not to any personal account.", 0, "", "en"),
    ("The postman called, your books arrive at 3pm today. Please stay home to receive them, I left the cash on the table.", 0, "", "en"),
    ("Quarterly performance reviews start next week. Complete your self assessment on the internal system by Friday.", 0, "", "en"),
    ("Heads up everyone, strangers are calling pretending to be the utility company demanding urgent transfers. They only collect via official channels.", 0, "", "en"),
    ("Our technician will install the air conditioner Wednesday morning, in uniform and with a staff ID card.", 0, "", "en"),
    ("I sent the receipt for the kids swimming class, please check the number of sessions is correct.", 0, "", "en"),
]
DATA += EXTRA
