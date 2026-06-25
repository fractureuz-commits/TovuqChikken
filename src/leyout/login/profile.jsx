import { useState } from "react";
import "./ProfilePage.css";
import { getUser } from "./auth";
import Header from "../../header/header";
import { LANGUAGE_OPTIONS, useLanguage } from "../../utils/i18n";
import PwaInstallButton from "../../componrnts/PwaInstall/PwaInstallButton";

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const LanguageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 0 20" />
    <path d="M12 2a15.3 15.3 0 0 0 0 20" />
  </svg>
);

const InstallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v11" />
    <path d="M7 9l5 5 5-5" />
    <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
  </svg>
);

export default function ProfilePage() {
  const user = getUser()
  const { language, setLanguage } = useLanguage();
  const [activeItem, setActiveItem] = useState(null);

  const menuItems = [
    // { id: "password", icon: <LockIcon />, label: "Парол ўзгартириш" },
    // { id: "about",    icon: <InfoIcon />, label: "Дастур ҳақида" },
    { id: "logout", icon: <LogoutIcon />, label: "Dasturdan chiqish" },
  ];
  const handleMenuClick = (id) => {
    setActiveItem(id);

    if (id === "logout") {
      localStorage.removeItem("current_user");
      window.location.href = "/";
    }
  };
  return (
    <div className="phone-frame">
      <Header />

      <div className="profile-page">
        <div className="profile-header">
          <p className="profile-name">{user?.name}</p>
          {/* <p className="profile-phone">+998904097171</p> */}
          {/* <div className="avatar-wrapper">
            <AvatarIcon />
          </div> */}
        </div>
        <div className="language-section">
          <div className="language-section-header">
            <span className="menu-icon"><LanguageIcon /></span>
            <div>
              <p className="language-title">Til sozlamalari</p>
              <p className="language-subtitle">Ilova tili</p>
            </div>
          </div>
          <div className="language-options" role="radiogroup" aria-label="Ilova tili">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                className={`language-option ${language === option.code ? "active" : ""}`}
                onClick={() => setLanguage(option.code)}
              >
                <span>{option.label}</span>
                {language === option.code && <small>Tanlangan</small>}
              </button>
            ))}
          </div>
        </div>
        <div className="menu-list">
          <PwaInstallButton
            variant="menu"
            className="menu-item"
            icon={<InstallIcon />}
            label="Ilovani o'rnatish"
            showDivider={menuItems.length > 0}
          />
          {menuItems.map((item, idx) => (
            <div key={item.id}>
              <button
                className={`menu-item ${activeItem === item.id ? "active" : ""}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
              {idx < menuItems.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
