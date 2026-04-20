import { useState } from "react";
import "./ProfilePage.css";
import { getUser } from "./auth";
import Header from "../../header/header";
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);
export default function ProfilePage() {
  const user = getUser()
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
        <div className="menu-list">
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
