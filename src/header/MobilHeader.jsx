import { Link, NavLink } from "react-router";
import "./MobilHeader.css";
import logo from "../../images/logo.png";
import Clock from "../componrnts/clock/clock";
import { getUser } from "../leyout/login/auth";
import avaimage from '../../images/avatar.png';
import Logo from '../../images/logo.svg';

import { useState, useRef, useEffect } from "react";
function MobilHeader() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [user, setUser] = useState(null); // ✅ user state

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ user ma'lumotlarini olish
    useEffect(() => {
        getUser().then((data) => setUser(data));
    }, []);
    return (
        <>
            <div className="container container-big">
                <div className="m-nav">
                    <NavLink to={'/'} className="m-logo">
                        <img src={Logo} alt="" />
                    </NavLink>
                    <div className="m-profile" onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef}>
                        {/* <svg
                            className={`m-arrow ${dropdownOpen ? "open" : ""}`}
                            width="15" height="10" viewBox="0 0 10 5"
                            fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M1 1.00006L5 4.00006L9 1.00006" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>   */}
                        {/* <h3>{user.name}</h3> */}
                        <div className="m-profile-img">
                            <img src={avaimage} alt="" />
                        </div>

                        {dropdownOpen && (
                            <div className="m-dropdown">
                                <div className="m-dropdown-header">
                                    <img src={avaimage} alt="" />
                                    <div>
                                        <p className="m-dropdown-name">{user.name}</p>
                                        <p className="m-dropdown-role">Diller</p>
                                    </div>
                                </div>
                                <hr className="m-dropdown-divider" />
                                <ul className="m-dropdown-list">
                                    <li>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Profil
                                    </li>
                                    <li>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        Sozlamalar
                                    </li>
                                    <hr className="m-dropdown-divider" />
                                    <li className="m-dropdown-logout" onClick={() => { logoutUser() }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Chiqish
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
export default MobilHeader;