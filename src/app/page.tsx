import React from "react";
import "./style.css";

// ============================================================================
// 1. DỮ LIỆU TĨNH (MOCK_DATA) - Tách toàn bộ data rác ra khỏi UI
// ============================================================================
const MOCK_DATA = {
  navItems: [
    { width: "84px", hasBg: true, title: "Products" },
    { width: "86px", hasBg: false, title: "Solutions" },
    { width: "103px", hasBg: false, title: "Community", minWidth: "87px" },
    { width: "95px", hasBg: false, title: "Resources" },
    { width: "68px", hasBg: false, title: "Pricing", minWidth: "52px" },
    { width: "77px", hasBg: false, title: "Contact" },
    { width: "47px", hasBg: false, title: "Link" },
  ],
  heroFeatures1: [
    { width: "266px", height: "12.5px", marginTop: "18px", iconSrc: "/assets/SvgAsset5.svg", title: "Hồ sơ y tế trọn đời — chỉ bổ sung, không ghi đè", minWidth: "248px" },
    { width: "151px", height: "12px", marginTop: "7px", iconSrc: "/assets/SvgAsset4.svg", title: "Lịch sử nhận nuôi rõ ràng", minWidth: "133px" },
    { width: "273px", height: "12px", marginTop: "7px", iconSrc: "/assets/SvgAsset3.svg", title: "Được xác thực bởi PawLife & phòng khám uy tín", minWidth: "255px" },
    { width: "207px", height: "12.2px", marginTop: "8px", iconSrc: "/assets/SvgAsset2.svg", title: "Truy xuất hồ sơ sức khỏe minh bạch", minWidth: "189px" },
  ],
  heroFeatures2: [
    { width: "216px", height: "12.5px", marginTop: "18px", iconSrc: "/assets/SvgAsset11.svg", title: "Ai cũng có thể quét — không cần app", minWidth: "198px" },
    { width: "175px", height: "12px", marginTop: "7px", iconSrc: "/assets/SvgAsset10.svg", title: "Liên hệ chủ nuôi nhanh chóng", minWidth: "157px" },
    { width: "156px", height: "12px", marginTop: "7px", iconSrc: "/assets/SvgAsset9.svg", title: "Chia sẻ vị trí cho chủ nuôi", minWidth: "138px" },
    { width: "258px", height: "12.1px", marginTop: "8px", iconSrc: "/assets/SvgAsset8.svg", title: "Bảo vệ quyền riêng tư, an toàn cho mọi người", minWidth: "240px" },
  ],
  heroFeatures3: [
    { width: "297px", isHeightLarge: true, marginTop: "18px", iconSrc: "/assets/SvgAsset20.svg", title: "Quét QR để biết tình trạng thú cưng (an toàn/đi lạc)", minWidth: "279px" },
    { width: "270px", isHeightLarge: false, marginTop: "7px", iconSrc: "/assets/SvgAsset19.svg", title: "Bảo vệ thông tin chủ nuôi, chỉ hiện khi cần thiết", minWidth: "252px" },
    { width: "281px", isHeightLarge: true, marginTop: "7px", iconSrc: "/assets/SvgAsset18.svg", title: "Chuyển chủ an toàn, không lo mất thông tin hồ sơ", minWidth: "263px" },
    { width: "262px", isHeightLarge: false, marginTop: "8px", iconSrc: "/assets/SvgAsset17.svg", title: "Một chiếc thẻ cho suốt vòng đời của thú cưng", minWidth: "244px" },
  ],
  socialIcons: [
    { width: "30px", height: "30px", iconSrc: "/assets/SvgAsset40.svg", imgWidth: "22px", imgHeight: "27px" },
    { width: "28px", height: "28px", iconSrc: "/assets/SvgAsset41.svg", imgWidth: "20.7px", imgHeight: "25.3px" },
    { width: "38px", height: "38px", iconSrc: "/assets/SvgAsset39.svg", imgWidth: "24.2px", imgHeight: "16.3px" },
  ],
  largeDots: [
    { iconSrc: "/assets/SvgAsset60.svg" },
    { iconSrc: "/assets/SvgAsset59.svg" },
    { iconSrc: "/assets/SvgAsset58.svg" },
  ],
  adoptionTabs: [
    { title: "Kích hoạt thẻ", width: "80px", isActive: false },
    { title: "PawHistory", width: "70px", isActive: true, marginLeft: "95px" },
    { title: "Cập nhật thông tin", width: "112px", isActive: false, marginLeft: "79px" },
    { title: "An toàn", width: "47px", isActive: false, marginLeft: "91px" },
  ],
  adoptionSteps: [
    { title: "Quét mã QR trên app và đăng ký cho pet cưng", isWide: true },
    { title: "Thêm các mũi tiêm phòng và hồ sơ khám bệnh cho pet", isWide: false, marginLeft: "15px" },
    { title: "Đảm bảo thông tin chủ nuôi luôn chính xác", isWide: true, marginLeft: "15px" },
    { title: "Luôn gắn thẻ QR cho pet cưng của bạn", isWide: true, marginLeft: "26px" },
  ],
  petCards: [
    { image: "/assets/ImageAsset4.png", smallIcon1: "/assets/SvgAsset26.svg", isWide1: true, h1: "29px", w1: "48px", name: "Max", minNameW: "30px", isH14_1: true, isW13_1: false, smallIcon2: "/assets/SvgAsset27.svg", isW9_3: true, isH9_3: true, desc: "4 years • Siberian Husky", descW: "92px", bio: "Bella is a beautiful husky with striking blue eyes. She's intelligent, loyal, and loves long walks. Bella is great with families and needs an active home where she can exercise regularly.\n", bioW: "349px", bioMargin: "14px", btn1Label: "Xem thêm về Max", btn1W: "91px", btn2Label: "Đăng ký nhận nuôi", btn2W: "92px" },
    { image: "/assets/ImageAsset5.png", smallIcon1: "/assets/SvgAsset29.svg", isWide1: false, h1: "28px", w1: "49px", name: "Luna", minNameW: "32px", isH14_1: false, isW13_1: true, smallIcon2: "/assets/SvgAsset28.svg", isW9_3: false, isH9_3: false, desc: "4 years • Orange cat", descW: "79px", bio: "Luna is a gentle and elegant gray cat with a calm temperament. She loves quiet moments and is perfect for someone looking for a peaceful and loving companion.", bioW: "", bioMargin: "6px", btn1Label: "More about Luna", btn1W: "83px", btn2Label: "Apply to Adopt", btn2W: "75px" },
    { image: "/assets/ImageAsset3.png", smallIcon1: "/assets/SvgAsset24.svg", isWide1: true, h1: "36px", w1: "50px", name: "Bella", minNameW: "33px", isH14_1: false, isW13_1: true, smallIcon2: "/assets/SvgAsset25.svg", isW9_3: false, isH9_3: false, desc: "4 years • Siberian Husky\n", descW: "92px", bio: "Bella is a beautiful husky with striking blue eyes. She's intelligent, loyal, and loves long walks. Bella is great with families and needs an active home where she can exercise regularly.", bioW: "", bioMargin: "6px", btn1Label: "More about Bella", btn1W: "84px", btn2Label: "Apply to Adopt", btn2W: "75px" },
  ],
  dividerDots1: ["/assets/SvgAsset33.svg", "/assets/SvgAsset32.svg", "/assets/SvgAsset31.svg", "/assets/SvgAsset30.svg"],
  shelterStats: [{ value: "47", w: "17px" }, { value: "214", w: "22px" }, { value: "94%", w: "27px" }],
  shelterLabels: [{ title: "Active Pets", w: "42px" }, { title: "Lifetime Adoptions", w: "73px", ml: "72px" }, { title: "Success Rate", w: "51px", ml: "42px" }],
  shelterGovernance: [
    { w: "82px", hSwitch: true, icon: "/assets/SvgAsset51.svg", title: "Verified since 2025", tw: "74px" },
    { w: "106px", hSwitch: false, icon: "/assets/SvgAsset50.svg", title: "Monthly report compliant", tw: "98px" },
    { w: "121px", hSwitch: false, icon: "/assets/SvgAsset49.svg", title: "Adoption enforcement active", tw: "113px" },
  ],
  dividerDots2: ["/assets/SvgAsset55.svg", "/assets/SvgAsset54.svg", "/assets/SvgAsset53.svg", "/assets/SvgAsset52.svg"],
  dividerDots3: ["/assets/SvgAsset68.svg", "/assets/SvgAsset67.svg", "/assets/SvgAsset66.svg", "/assets/SvgAsset65.svg"],
  dividerDots4: ["/assets/SvgAsset64.svg", "/assets/SvgAsset63.svg", "/assets/SvgAsset62.svg", "/assets/SvgAsset61.svg"],
};

// ============================================================================
// 2. CÁC COMPONENT GIAO DIỆN NHỎ (UI Elements)
// ============================================================================
const NavItem = ({ width, hasBg, title, minWidth }: any) => (
  <div style={{ borderRadius: "8px", height: "32px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: width, ...(hasBg && { backgroundColor: "rgba(245,245,245,1)" }) }}>
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", whiteSpace: "nowrap", color: "rgba(30,30,30,1)", lineHeight: "100%", fontWeight: "400", minWidth: minWidth }}>{title}</div>
  </div>
);

const FeatureListItem = ({ width, height, marginTop, iconSrc, title, minWidth }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "6px", width: width, height: height, marginTop: marginTop }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "12px" }}>
      <img width="9.1px" height="6.6px" src={iconSrc} alt="icon" />
    </div>
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", whiteSpace: "nowrap", color: "rgba(133,133,133,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "400", minWidth: minWidth }}>{title}</div>
  </div>
);

const FeatureListItemAlt = ({ width, isHeightLarge, marginTop, iconSrc, title, minWidth }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "6px", width: width, height: isHeightLarge ? "12.5px" : "12.2px", marginTop: marginTop }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "12px" }}>
      <img width="9px" height="6.6px" src={iconSrc} alt="icon" />
    </div>
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", whiteSpace: "nowrap", color: "rgba(133,133,133,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "400", minWidth: minWidth }}>{title}</div>
  </div>
);

const SocialIcon = ({ width, height, iconSrc, imgWidth, imgHeight }: any) => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: width, height: height }}>
    <img width={imgWidth} height={imgHeight} src={iconSrc} alt="social" />
  </div>
);

const LargeIndicatorDot = ({ iconSrc }: any) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "11px" }}>
    <img width="10.3px" height="8.1px" src={iconSrc} alt="dot" />
  </div>
);

const TabItem = ({ title, width, isActive, marginLeft }: any) => (
  <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "12px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", lineHeight: "24px", fontWeight: "600", minWidth: width, ...(isActive && { textAlign: "center" }), marginLeft: marginLeft }}>{title}</div>
);

const StepItem = ({ title, isWide, marginLeft }: any) => (
  <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", textAlign: "center", color: "rgba(133,133,133,1)", lineHeight: "150%", letterSpacing: "0.05em", fontWeight: "400", width: isWide ? "144px" : "166px", marginLeft: marginLeft }}>{title}</div>
);

const SmallDot = ({ iconSrc }: any) => <img width="5px" height="5px" src={iconSrc} alt="dot" />;

const StatValue = ({ value, minWidth }: any) => (
  <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "14px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "600", minWidth: minWidth }}>{value}</div>
);

const StatLabel = ({ title, minWidth, marginLeft }: any) => (
  <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", whiteSpace: "nowrap", color: "rgba(133,133,133,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "400", minWidth: minWidth, marginLeft: marginLeft }}>{title}</div>
);

const GovernanceItem = ({ width, heightSwitch, iconSrc, title, minWidth }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "5px", width: width, height: heightSwitch ? "8px" : "9px" }}>
    <img width="3px" height="3px" src={iconSrc} alt="icon" />
    <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "400", minWidth: minWidth }}>{title}</div>
  </div>
);

const LogoPlaceholder = () => (
  <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "48px", minWidth: "136px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", textAlign: "center", lineHeight: "100%", letterSpacing: "1px", fontWeight: "900" }}>LOGO</div>
);

// Khối thẻ PetCard lớn
const PetCard = ({ data }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "27px", width: "685px", height: "294px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "-343px", gap: "35px", width: "308px", height: "294px" }}>
      <img style={{ borderRadius: "32px", width: "308px", height: "294px", boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)", overflow: "hidden" }} src={data.image} alt="pet" width="308px" height="294px" />
      <img width="308px" height="294px" src={data.smallIcon1} alt="shadow" />
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start", width: "350px", height: "274px" }}>
      <div style={{ marginLeft: "1px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", gap: "6px", width: data.isWide1 ? "92px" : "79px", height: data.h1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", height: "14px", width: data.w1 }}>
          <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "14px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "600", minWidth: data.minNameW }}>{data.name}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: data.isH14_1 ? "14px" : "13px", ...(data.isW13_1 && { width: "13px" }) }}>
            <img style={{ width: data.isW9_3 ? "9.3px" : "6px", height: data.isH9_3 ? "9.3px" : "9.2px" }} width={data.isW9_3 ? "9.3px" : "6px"} height={data.isH9_3 ? "9.3px" : "9.2px"} src={data.smallIcon2} alt="icon" />
          </div>
        </div>
        <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", whiteSpace: "nowrap", color: "rgba(133,133,133,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "400", minWidth: data.descW }}>{data.desc}</div>
      </div>
      <div style={{ marginLeft: "1px", fontFamily: "'Urbanist', sans-serif", fontSize: "10px", color: "rgba(133,133,133,1)", lineHeight: "150%", letterSpacing: "0.05em", fontWeight: "400", ...(data.bioW && { width: data.bioW }), marginTop: data.bioMargin }}>{data.bio}</div>
      <div style={{ marginLeft: "1px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "5px", width: "182px", height: "15px", marginTop: "9px" }}>
        <div style={{ backgroundColor: "rgba(219,252,231,1)", borderRadius: "1056.8px", borderColor: "rgb(119,200,82)", borderStyle: "solid", borderWidth: "0.5px", height: "15px", overflow: "hidden", minWidth: "51px", display: "flex", justifyContent: "center", alignItems: "center", gap: "3.2px", padding: "4.2px 10.6px" }}>
          <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", minWidth: "33px", whiteSpace: "nowrap", color: "rgba(80,177,84,1)", lineHeight: "21.1px", fontWeight: "600" }}>Neutered</div>
        </div>
        <div style={{ backgroundColor: "rgba(232,241,255,1)", borderRadius: "1056.8px", borderColor: "rgb(90,144,218)", borderStyle: "solid", borderWidth: "0.5px", height: "15px", overflow: "hidden", minWidth: "48px", display: "flex", justifyContent: "center", alignItems: "center", gap: "3.2px", padding: "4.2px 10.6px" }}>
          <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", minWidth: "24px", whiteSpace: "nowrap", color: "rgba(90,144,218,1)", lineHeight: "21.1px", fontWeight: "600" }}>Playful</div>
        </div>
        <div style={{ backgroundColor: "rgba(255,186,0,0.1)", borderRadius: "1056.8px", borderColor: "rgb(255,186,0)", borderStyle: "solid", borderWidth: "0.5px", height: "15px", overflow: "hidden", minWidth: "73px", display: "flex", justifyContent: "center", alignItems: "center", gap: "3.2px", padding: "4.2px 10.6px" }}>
          <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", minWidth: "54px", whiteSpace: "nowrap", color: "rgba(255,186,0,1)", lineHeight: "21.1px", fontWeight: "600" }}>Good with kids</div>
        </div>
      </div>
      <div style={{ marginTop: "132px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "9px", width: "329px", height: "31px" }}>
        <div style={{ backgroundColor: "rgba(232,155,90,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "160px", height: "31px", borderRadius: "8px" }}>
          <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", whiteSpace: "nowrap", color: "rgba(255,255,255,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "600", minWidth: data.btn1W }}>{data.btn1Label}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "160px", height: "31px", borderRadius: "8px", borderColor: "rgb(232,155,90)", borderStyle: "solid", borderWidth: "1px" }}>
          <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", whiteSpace: "nowrap", color: "rgba(232,155,90,1)", lineHeight: "100%", letterSpacing: "0.05em", fontWeight: "600", minWidth: data.btn2W }}>{data.btn2Label}</div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// 3. CÁC SECTION CHÍNH
// ============================================================================
const HeaderSection = () => (
  <div style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "10px", padding: "10px", width: "60px", height: "55px" }}>
      <div style={{ gap: "24px", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", width: "40px", height: "35px" }}>
        <img width="26.8px" height="38.5px" src="/assets/SvgAsset1.svg" alt="Logo" />
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "end", alignItems: "start", gap: "8px", marginLeft: "14px", width: "1110px" }}>
      <div style={{ gap: "8px", display: "flex", flexDirection: "row", justifyContent: "start", alignItems: "center", width: "608px" }}>
        {MOCK_DATA.navItems.map((item, idx) => (
          <NavItem key={idx} width={item.width} hasBg={item.hasBg} title={item.title} minWidth={item.minWidth} />
        ))}
      </div>
    </div>
    <div style={{ gap: "12px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginLeft: "24px", width: "178px", height: "32px" }}>
      <div style={{ backgroundColor: "rgba(227,227,227,1)", borderRadius: "8px", border: "1px solid rgb(118,118,118)", height: "32px", minWidth: "89px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "8px" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", minWidth: "51px", whiteSpace: "nowrap", color: "rgba(30,30,30,1)", lineHeight: "100%", fontWeight: "400" }}>Sign in</div>
      </div>
      <div style={{ backgroundColor: "rgba(44,44,44,1)", borderRadius: "8px", border: "1px solid rgb(44,44,44)", height: "32px", minWidth: "89px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "8px" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", minWidth: "63px", whiteSpace: "nowrap", color: "rgba(245,245,245,1)", lineHeight: "100%", fontWeight: "400" }}>Register</div>
      </div>
    </div>
  </div>
);

const HeroBannerSection = () => (
  <div style={{ marginTop: "810px", position: "relative", width: "1439px", height: "1125px" }}>
    <div style={{ position: "absolute", zIndex: "50", width: "1439px", height: "1125px" }}>
      {/* Feature 1 */}
      <div style={{ position: "absolute", top: "975px", left: "1150px", zIndex: "50", display: "flex", flexDirection: "column", alignItems: "start", width: "273px", height: "120px" }}>
        <div style={{ marginLeft: "5px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "13px", width: "245px", height: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "16px" }}><img width="15px" height="13.7px" src="/assets/SvgAsset6.svg" alt="icon" /></div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", width: "216px", height: "32px" }}>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "12px", minWidth: "75px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", textAlign: "center", lineHeight: "24px", fontWeight: "700" }}>PawHistory</div>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "8px", minWidth: "216px", whiteSpace: "nowrap", color: "rgba(0,0,0,0.25)", lineHeight: "100%", fontWeight: "400" }}>Không chỉnh sửa - Không xóa bỏ</div>
          </div>
        </div>
        {MOCK_DATA.heroFeatures1.map((item, idx) => (
          <FeatureListItem key={idx} width={item.width} height={item.height} marginTop={item.marginTop} iconSrc={item.iconSrc} title={item.title} minWidth={item.minWidth} />
        ))}
      </div>
      
      {/* Feature 2 */}
      <div style={{ position: "absolute", top: "827px", left: "1150px", zIndex: "40", display: "flex", flexDirection: "column", alignItems: "start", width: "283px", height: "120px" }}>
        <div style={{ marginLeft: "5px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "17px", width: "203px", height: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "16px" }}><img width="13px" height="14.3px" src="/assets/SvgAsset7.svg" alt="icon" /></div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", width: "170px", height: "32px" }}>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "12px", minWidth: "69px", whiteSpace: "nowrap", color: "rgba(0,0,0,1)", lineHeight: "24px", fontWeight: "600" }}>Chế độ lạc</div>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "8px", minWidth: "170px", whiteSpace: "nowrap", color: "rgba(0,0,0,0.25)", lineHeight: "100%", fontWeight: "400" }}>Kích hoạt miễn phí khi pet cưng thất lạc</div>
          </div>
        </div>
        {MOCK_DATA.heroFeatures2.map((item, idx) => (
          <FeatureListItem key={idx} width={item.width} height={item.height} marginTop={item.marginTop} iconSrc={item.iconSrc} title={item.title} minWidth={item.minWidth} />
        ))}
      </div>

      {/* Floating ID Card */}
      <div style={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: "16px", width: "145px", height: "188px", boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)", position: "absolute", top: "937px", left: "569px", zIndex: "30", display: "flex", flexDirection: "column", paddingTop: "18px", paddingLeft: "23px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "61px", height: "15px" }}>
          <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "14px", minWidth: "45px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Piglet</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "14px" }}><img width="9.3px" height="9.3px" src="/assets/SvgAsset12.svg" alt="icon" /></div>
        </div>
        <div style={{ marginTop: "6px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "8px", minWidth: "97px", color: "rgba(133,133,133,1)", fontWeight: "400" }}>2 tuổi • Siberian Husky</div>
        <div style={{ marginTop: "11px" }}></div>
        <div style={{ marginTop: "8px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "8px", minWidth: "53px", color: "rgba(133,133,133,1)", fontWeight: "600" }}>QR NUMBER</div>
        <div style={{ marginTop: "3px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", minWidth: "57px", color: "rgba(0,0,0,1)", fontWeight: "400" }}>PL-00000</div>
        <div style={{ marginTop: "8px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "8px", minWidth: "55px", color: "rgba(133,133,133,1)", fontWeight: "600" }}>TÌNH TRẠNG</div>
        <div style={{ marginTop: "3px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", minWidth: "42px", color: "rgba(0,0,0,1)", fontWeight: "400" }}>An toàn</div>
        <div style={{ marginTop: "9px" }}></div>
        <div style={{ marginTop: "9px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "8px", minWidth: "37px", color: "rgba(133,133,133,1)", fontWeight: "600" }}>GHI CHÚ</div>
        <div style={{ marginTop: "3px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", width: "100px", color: "rgba(0,0,0,1)", fontWeight: "400" }}>Dễ thương, nhưng hơi nhát người</div>
      </div>

      {/* Main Hero Image */}
      <img style={{ borderRadius: "32px", width: "308px", height: "291px", boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)", position: "absolute", top: "773px", left: "369px", zIndex: "20" }} src="/assets/ImageAsset1.png" alt="Hero" />
      
      {/* Background with Title */}
      <div style={{ backgroundImage: "url('/assets/ImageAsset2.png')", position: "absolute", zIndex: "10", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", paddingTop: "678px", paddingBottom: "59px", gap: "14px", width: "1439px", height: "789px" }}>
        <div style={{ fontFamily: "'1FTV VIP Baby Doll', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", textTransform: "uppercase" }}>thẻ QR cho thú cưng</div>
        <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Quản lý thông tin pet cưng</div>
      </div>

      {/* Hero Buttons below image */}
      <div style={{ position: "absolute", top: "995px", left: "733px", zIndex: "40", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "9px", width: "329px", height: "31px" }}>
        <div style={{ backgroundColor: "rgba(232,155,90,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "160px", height: "31px", borderRadius: "8px" }}>
          <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", minWidth: "88px", color: "rgba(255,255,255,1)", fontWeight: "600" }}>Tải app PawLife</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "160px", height: "31px", borderRadius: "8px", border: "1px solid rgb(232,155,90)" }}>
          <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", minWidth: "93px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Purchase QR Tag</div>
        </div>
      </div>

      {/* Floating control buttons */}
      <div style={{ position: "absolute", top: "945px", left: "1088px", zIndex: "30", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "5px", width: "25px", height: "55px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(90deg)", width: "12px", height: "12px" }}>
            <img width="4.2px" height="7.2px" src="/assets/SvgAsset14.svg" alt="up" />
          </div>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)", zIndex: "10" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(-90deg)", width: "12px", height: "12px" }}>
            <img width="4.2px" height="7.2px" src="/assets/SvgAsset13.svg" alt="down" />
          </div>
        </div>
      </div>
      
      {/* Decorative Dots */}
      <div style={{ position: "absolute", top: "981px", left: "879px", zIndex: "20", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", width: "37px", height: "5px" }}>
        <div></div>
        <img width="5px" height="5px" src="/assets/SvgAsset16.svg" alt="dot" />
        <img width="5px" height="5px" src="/assets/SvgAsset15.svg" alt="dot" />
      </div>

      {/* Middle White Card */}
      <div style={{ backgroundColor: "rgba(255,255,255,1)", borderRadius: "19px", border: "1px solid rgb(217,217,217)", width: "329px", height: "158px", position: "absolute", top: "811px", left: "733px", zIndex: "10", display: "flex", flexDirection: "column", paddingTop: "14px", paddingLeft: "21px" }}>
        <div style={{ marginLeft: "5px", display: "flex", justifyContent: "space-between", alignItems: "end", gap: "13px", width: "186px", height: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "17px" }}>
            <img width="13.8px" height="13.8px" src="/assets/SvgAsset21.svg" alt="icon" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", width: "156px", height: "32px" }}>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "12px", minWidth: "90px", color: "rgba(0,0,0,1)", lineHeight: "24px", fontWeight: "600" }}>Định danh pet</div>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "8px", minWidth: "156px", color: "rgba(0,0,0,0.25)", lineHeight: "100%", fontWeight: "400" }}>Một thẻ QR - Một danh tính vĩnh viễn</div>
          </div>
        </div>
        {MOCK_DATA.heroFeatures3.map((item, idx) => (
          <FeatureListItemAlt key={idx} width={item.width} isHeightLarge={item.isHeightLarge} marginTop={item.marginTop} iconSrc={item.iconSrc} title={item.title} minWidth={item.minWidth} />
        ))}
      </div>

      {/* Decorative Dots Top */}
      <div style={{ position: "absolute", top: "311px", left: "370px", zIndex: "10", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", width: "37px", height: "5px" }}>
        <div></div>
        <img width="5px" height="5px" src="/assets/SvgAsset35.svg" alt="dot" />
        <img width="5px" height="5px" src="/assets/SvgAsset34.svg" alt="dot" />
      </div>
    </div>
  </div>
);

const AdoptionSection = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
    <div style={{ marginTop: "167px", fontFamily: "'1FTV VIP Baby Doll', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", textTransform: "uppercase" }}>Nhận nuôi cùng PawLife</div>
    <div style={{ marginTop: "14px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Tô điểm sắc màu cho một sinh mạng</div>
    
    <div style={{ marginTop: "41px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "29px", width: "1056px", height: "316px" }}>
      <img style={{ width: "289px", height: "125px" }} src="/assets/ImageAsset6.png" alt="Adoption Banner" />
      <div style={{ position: "relative", width: "738px", height: "316px" }}>
        <div style={{ position: "absolute", zIndex: "20", display: "flex", justifyContent: "space-between", alignItems: "end", gap: "28px", width: "738px", height: "316px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "5px", width: "25px", height: "55px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(90deg)", width: "12px", height: "12px" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset23.svg" alt="up" /></div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(-90deg)", width: "12px", height: "12px" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset22.svg" alt="down" /></div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "17px", width: "685px", height: "316px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "-1470px", gap: "50px", width: "685px", height: "294px" }}>
              {MOCK_DATA.petCards.map((item, idx) => (
                <PetCard key={idx} data={item} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", width: "55px", height: "5px" }}>
               <div />
               {MOCK_DATA.dividerDots1.map((dot, idx) => <SmallDot key={idx} iconSrc={dot} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ShelterSection = () => (
  <div style={{ marginTop: "120px", display: "flex", justifyContent: "space-between", alignItems: "end", gap: "26px", width: "745px", height: "417px" }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", height: "417px" }}>
      <div style={{ fontFamily: "'1FTV VIP Baby Doll', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", textTransform: "uppercase" }}>trạm cứu hộ</div>
      <div style={{ marginTop: "14px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Trạm cứu hộ uy tín ở Việt Nam</div>
      <div style={{ marginTop: "51px", display: "flex", justifyContent: "space-between", alignItems: "end", gap: "27px", width: "694px", height: "292px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start", width: "330px", height: "287px" }}>
          <div style={{ display: "flex", justifyContent: "start", alignItems: "start", height: "29px" }}>
            <img style={{ width: "28px", height: "28px" }} src="/assets/ImageAsset10.png" alt="Shelter Logo" />
            <div style={{ marginTop: "1px", marginLeft: "9px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", gap: "6px", width: "160px", height: "28px" }}>
              <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Happy Paws Sanctuary</div>
              <div style={{ marginLeft: "1px", display: "flex", justifyContent: "space-between", alignItems: "end", gap: "4px", width: "68px", height: "8px" }}>
                <img width="6px" height="7px" src="/assets/SvgAsset48.svg" alt="location" />
                <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", color: "rgba(133,133,133,1)" }}>Hanoi, Vietnam</div>
              </div>
            </div>
            <img style={{ marginTop: "6px", marginLeft: "4px" }} width="8.9px" height="8.9px" src="/assets/SvgAsset47.svg" alt="check" />
          </div>
          <div style={{ marginTop: "14px", marginLeft: "1px", fontFamily: "'Urbanist', sans-serif", fontSize: "10px", width: "329px", color: "rgba(133,133,133,1)", lineHeight: "150%" }}>
            A dedicated animal welfare organization committed to rescuing, rehabilitating, and rehoming pets in need. We provide comprehensive care, medical treatment, and behavioral support to ensure every animal finds their perfect forever home.
          </div>
          <div style={{ marginLeft: "1px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", gap: "7px", width: "280px", height: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "95px", width: "256px", height: "14px" }}>
              {MOCK_DATA.shelterStats.map((item, idx) => <StatValue key={idx} value={item.value} minWidth={item.w} />)}
            </div>
            <div style={{ display: "flex", justifyContent: "start", alignItems: "center", height: "8.1px" }}>
              {MOCK_DATA.shelterLabels.map((item, idx) => <StatLabel key={idx} title={item.title} minWidth={item.w} marginLeft={item.ml} />)}
            </div>
          </div>
          <div style={{ marginTop: "15px", marginLeft: "1px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", gap: "10px", width: "121px", height: "64px" }}>
            <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", minWidth: "92px", color: "rgba(133,133,133,1)", fontWeight: "700" }}>GOVERNANCE STATUS</div>
            {MOCK_DATA.shelterGovernance.map((item, idx) => (
              <GovernanceItem key={idx} width={item.w} heightSwitch={item.hSwitch} iconSrc={item.icon} title={item.title} minWidth={item.tw} />
            ))}
          </div>
          <div style={{ marginTop: "17px", marginLeft: "1px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "9px", width: "329px", height: "31px" }}>
            <div style={{ backgroundColor: "rgba(232,155,90,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "160px", height: "31px", borderRadius: "8px" }}>
              <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", minWidth: "96px", color: "rgba(255,255,255,1)", fontWeight: "600" }}>Xem thông tin trạm</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "160px", height: "31px", borderRadius: "8px", border: "1px solid rgb(232,155,90)" }}>
              <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", minWidth: "63px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Tất cả trạm</div>
            </div>
          </div>
        </div>
        <img style={{ borderRadius: "32px", width: "337px", height: "292px", boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }} src="/assets/ImageAsset11.png" alt="Shelter Img" />
      </div>
      <div style={{ marginTop: "17px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", width: "55px", height: "5px" }}>
        <div></div>
        {MOCK_DATA.dividerDots2.map((dot, idx) => <SmallDot key={idx} iconSrc={dot} />)}
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "5px", width: "25px", height: "55px" }}>
      <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(90deg)", width: "12px", height: "12px" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset57.svg" alt="up" /></div>
      </div>
      <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(-90deg)", width: "12px", height: "12px" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset56.svg" alt="down" /></div>
      </div>
    </div>
  </div>
);

const MythsSection = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
    <div style={{ marginTop: "146px", fontFamily: "'Fredoka', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Myths</div>
    <div style={{ marginTop: "14px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Những hiểu lầm cần được làm rõ</div>
    <div style={{ marginTop: "63px", display: "flex", justifyContent: "space-between", alignItems: "start", gap: "33px", width: "743px", height: "279px" }}>
      <div style={{ marginTop: "37px", position: "relative", width: "628px", height: "242px" }}>
        <img style={{ width: "405px", height: "242px", boxShadow: "0px 7px 14.6px 0px rgba(101,46,0,0.25)", position: "absolute", left: "9px", zIndex: "40" }} src="/assets/ImageAsset9.png" alt="Myths" />
        <div style={{ position: "absolute", top: "72px", left: "405px", zIndex: "30", fontFamily: "'Urbanist', sans-serif", fontSize: "10px", width: "207px", color: "rgba(133,133,133,1)", lineHeight: "150%" }}>
          Animals from shelters are microchipped, treated for parasites, vaccinated, sterilized. All operations are carried out strictly according to the schedule.
        </div>
        <div style={{ position: "absolute", top: "113px", zIndex: "20", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "5px", width: "25px", height: "55px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ transform: "rotate(90deg)", width: "12px", height: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset46.svg" alt="up" /></div>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ transform: "rotate(-90deg)", width: "12px", height: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset45.svg" alt="down" /></div>
          </div>
        </div>
        <div style={{ position: "absolute", top: "12px", left: "360px", zIndex: "10", fontFamily: "'Urbanist', sans-serif", fontSize: "24px", width: "268px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Only sick animals live in the shelters</div>
      </div>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "212.3px", minWidth: "82px", color: "rgba(232,155,90,1)", fontWeight: "600", lineHeight: "100%" }}>1</div>
    </div>
    <div style={{ marginTop: "11px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", width: "55px", height: "5px" }}>
      <div></div>
      {MOCK_DATA.dividerDots3.map((dot, idx) => <SmallDot key={idx} iconSrc={dot} />)}
    </div>
  </div>
);

const FaqSection = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
    <div style={{ marginTop: "145px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Thắc mắc & giải đáp</div>
    
    <div style={{ marginTop: "29px", position: "relative", width: "694px", height: "39px" }}>
      <div style={{ borderRadius: "8px", border: "1px solid rgb(217,217,217)", width: "694px", height: "39px", position: "absolute", zIndex: "20", display: "flex", justifyContent: "end", alignItems: "center", paddingRight: "17px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "12px" }}><img width="7.2px" height="4.2px" src="/assets/SvgAsset44.svg" alt="icon" /></div>
      </div>
      <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: "10", fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Happy Paws Sanctuary</div>
    </div>

    <div style={{ marginTop: "10px", position: "relative", width: "694px", height: "39px" }}>
      <div style={{ borderRadius: "8px", border: "1px solid rgb(217,217,217)", width: "694px", height: "39px", position: "absolute", zIndex: "20", display: "flex", justifyContent: "end", alignItems: "center", paddingRight: "17px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "12px" }}><img width="7.2px" height="4.2px" src="/assets/SvgAsset43.svg" alt="icon" /></div>
      </div>
      <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: "10", fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Happy Paws Sanctuary</div>
    </div>

    <div style={{ marginTop: "10px", position: "relative", width: "694px", height: "77px" }}>
      <div style={{ borderRadius: "8px", border: "1px solid rgb(217,217,217)", width: "694px", height: "77px", position: "absolute", zIndex: "30", display: "flex", justifyContent: "end", alignItems: "start", paddingTop: "13px", paddingRight: "17px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(179deg)", height: "12px" }}><img width="7.2px" height="4.2px" src="/assets/SvgAsset42.svg" alt="icon" /></div>
      </div>
      <div style={{ position: "absolute", top: "37px", left: "12px", zIndex: "20", fontFamily: "'Urbanist', sans-serif", fontSize: "10px", width: "643px", color: "rgba(133,133,133,1)", lineHeight: "150%" }}>
        Animals from shelters are microchipped, treated for parasites, vaccinated, sterilized. All operations are carried out strictly according to the schedule.
      </div>
      <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: "10", fontFamily: "'Urbanist', sans-serif", fontSize: "14px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Happy Paws Sanctuary</div>
    </div>
  </div>
);

const JourneySection = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
    <div style={{ marginTop: "148px", fontFamily: "'1FTV VIP Baby Doll', sans-serif", fontSize: "14px", color: "rgba(232,155,90,1)", textTransform: "uppercase" }}>Hành trình hạnh phúc</div>
    <div style={{ marginTop: "14px", fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "32px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Lan tỏa yêu thương</div>
    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "26px", width: "735px", height: "294px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "5px", width: "25px", height: "55px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ transform: "rotate(90deg)", width: "12px", height: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset37.svg" alt="up" /></div>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,1)", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ transform: "rotate(-90deg)", width: "12px", height: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}><img width="4.2px" height="7.2px" src="/assets/SvgAsset36.svg" alt="down" /></div>
        </div>
      </div>
      
      <img style={{ borderRadius: "32px", width: "308px", height: "294px", boxShadow: "2px 3px 15px 0px rgba(0,0,0,0.25)" }} src="/assets/ImageAsset8.png" alt="Journey" />
      
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start", height: "257px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", width: "191px", height: "28px" }}>
          <img style={{ width: "28px", height: "28px" }} src="/assets/ImageAsset7.png" alt="Avatar" />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", gap: "4px", width: "157px", height: "22px" }}>
            <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "10px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>Judy Smith</div>
            <div style={{ fontFamily: "'Urbanist', sans-serif", fontSize: "8px", color: "rgba(133,133,133,1)" }}>adopted through Happy Paws Sanctuary</div>
          </div>
        </div>
        <div style={{ marginTop: "12px", fontFamily: "'Urbanist', sans-serif", fontSize: "10px", width: "349px", color: "rgba(133,133,133,1)", lineHeight: "150%" }}>
          With the appearance of Alice in my life, there was a psychological upswing. I understand that I am not alone and that the four-legged friend is waiting for me at home. The dog became a support for me. I know she needs me. The brightest moments are when Alice meets me from work, runs against my legs.
        </div>
        <div style={{ marginTop: "99px", marginLeft: "2px", display: "flex", justifyContent: "center", alignItems: "center", width: "80px", height: "28px", borderRadius: "8px", border: "1px solid rgb(232,155,90)" }}>
          <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: "10px", color: "rgba(232,155,90,1)", fontWeight: "600" }}>Đọc thêm</div>
        </div>
      </div>
    </div>
    <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", width: "55px", height: "5px" }}>
      <div></div>
      {MOCK_DATA.dividerDots4.map((dot, idx) => <SmallDot key={idx} iconSrc={dot} />)}
    </div>
  </div>
);

const LogosSection = () => (
  <div style={{ marginTop: "124px", display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "-1488px", gap: "50px", width: "1438px", height: "58px" }}>
    {[...Array(16)].map((_, i) => <LogoPlaceholder key={i} />)}
  </div>
);

// ============================================================================
// 4. MAIN COMPONENT CHÍNH CỦA TRANG (HomePageCleaned)
// ============================================================================
export default function HomePageCleaned() {
  return (
    <div style={{ backgroundColor: "rgba(255,255,255,1)", width: "1440px", height: "5971px", display: "flex", justifyContent: "space-between", alignItems: "start", paddingTop: "22px", paddingRight: "-47px", gap: "22px" }}>
      
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", width: "1440px", height: "4944px" }}>
        
        <HeaderSection />
        
        <HeroBannerSection />
        
        <div style={{ marginTop: "59px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "140px", width: "540.8px", height: "38px" }}>
          <img width="24.8px" height="24.8px" src="/assets/SvgAsset38.svg" alt="Social" />
          {MOCK_DATA.socialIcons.map((item, idx) => <SocialIcon key={idx} width={item.width} height={item.height} iconSrc={item.iconSrc} imgWidth={item.imgWidth} imgHeight={item.imgHeight} />)}
        </div>
        
        <div style={{ marginTop: "5px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "156px", width: "345px", height: "11px" }}>
          {MOCK_DATA.largeDots.map((item, idx) => <LargeIndicatorDot key={idx} iconSrc={item.iconSrc} />)}
        </div>

        <div style={{ marginTop: "2px", display: "flex", justifyContent: "start", alignItems: "center", height: "24px" }}>
          {MOCK_DATA.adoptionTabs.map((item, idx) => <TabItem key={idx} title={item.title} width={item.width} isActive={item.isActive} marginLeft={item.marginLeft} />)}
        </div>

        <div style={{ marginTop: "4px", display: "flex", justifyContent: "start", alignItems: "center", height: "30px" }}>
          {MOCK_DATA.adoptionSteps.map((item, idx) => <StepItem key={idx} title={item.title} isWide={item.isWide} marginLeft={item.marginLeft} />)}
        </div>

        <AdoptionSection />

        <ShelterSection />

        <MythsSection />

        <FaqSection />

        <JourneySection />

        <LogosSection />

      </div>

      {/* Decorative vertical dots mapping the right scroll column from your original code */}
      <div style={{ marginTop: "2625px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "5px", width: "25px", height: "55px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(90deg)", width: "12px", height: "12px" }}>
            <img width="3px" height="6px" src="/assets/SvgAsset70.svg" alt="up" />
          </div>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", justifyContent: "center", alignItems: "center", width: "25px", height: "25px", borderRadius: "5px", border: "0.5px solid rgb(217,217,217)", boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "rotate(-90deg)", width: "12px", height: "12px" }}>
            <img width="3px" height="6px" src="/assets/SvgAsset69.svg" alt="down" />
          </div>
        </div>
      </div>
      
    </div>
  );
}