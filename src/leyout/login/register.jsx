// import '../login/login.css';
import { useState } from 'react';
import { useNavigate, Navigate, NavLink } from 'react-router-dom';
import { loginUser, } from './auth';
import { BaseUrl } from '../../baseUrl';
import Logo from '../../../images/logo.png';
import './login.css'
import "react-datepicker/dist/react-datepicker.css";

import DatePicker from 'react-datepicker';
const Register = () => {
  const [SingData, setSingData] = useState(
    {
      id: '',
      ism: '',
      familya: '',
      jinsi: '',
      tugilgan_sana: '',
      telefon_1: '',
      telefon_2: '',
      viloyat_id: '',
      shahar_id: '',
      manzil: '',
      parol: '',
    }
  );

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BaseUrl}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: login,
          password: parol,
        }),
      });

      const data = await res.json();
      console.log("Serverdan kelgan data:", data);

      if (res.ok && data && data.token) {
        loginUser(data); // tokenni saqlaymiz
        navigate('/');
      } else {
        setError('Login yoki parol noto‘g‘ri');
      }
    } catch (err) {
      console.error("Xatolik:", err);
      setError('Server bilan bog‘lanishda xato');
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSingData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  return (
    <>
      <div className="login-box">
        <div className="logo">
          <img src={Logo} alt="" className="logo-img" />
        </div>
        <form onSubmit={handleSubmit} className='user-form'>
          <div className="user-box" style={{ width: '100%' }}>
            <input
              type="text"
              name="ism"
              value={SingData.ism}
              onChange={handleChange}
              required
            />
            <label>Ism</label>
          </div>

          <div className="user-box" style={{ width: '100%' }}>
            <input
              type="text"
              name="familya"
              value={SingData.familya}
              onChange={handleChange}
              required
            />
            <label>Familya</label>
          </div>

          <div className="user-box" style={{ width: '49%' }}>
            <label style={{ top: '-20px', left: '0', fontSize: '14px' }}>Jinsi</label>
            <select
              name="gender"
              value={SingData.gender}
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="1">Erkak</option>
              <option value="0">Ayol</option>
            </select>
          </div>

          <div className="user-box" style={{ width: '49%' }}>
            <label style={{ top: '-20px', left: '0', fontSize: '14px' }}>Tug'ilgan sana</label>
            <input
              type="date"
              name="tugilgan_sana"
              value={SingData.tugilgan_sana}
              onChange={handleChange}
            />
          </div>

          <div className="user-box" style={{ width: '100%' }}>
            <input
              type="text"
              name="telefon_1"
              value={SingData.telefon_1}
              onChange={handleChange}
              required
            />
            <label>Telefon 1</label>
          </div>
          <div className="user-box" style={{ width: '100%' }}>
            <input
              type="text"
              name="telefon_2"
              value={SingData.telefon_2}
              onChange={handleChange}
              required
            />
            <label>Telefon 2</label>
          </div>
          <div className="user-box" style={{ width: '49%' }}>
            <label style={{ top: '-20px', left: '0', fontSize: '14px' }}>Viloyat</label>
            <select
              name="viloyat"
              value={SingData.viloyat}
              onChange={handleChange}
            >
              <option value=""></option>
              <option value="toshkent">Toshkent</option>
              <option value="samarkand">Samarqand</option>
              <option value="fargona">Farg'ona</option>
              <option value="andijon">Andijon</option>
              <option value="namangan">Namangan</option>
              <option value="buxoro">Buxoro</option>
              <option value="xorazm">Xorazm</option>
              <option value="surxondaryo">Surxondaryo</option>
              <option value="qashqadaryo">Qashqadaryo</option>
              <option value="jizzax">Jizzax</option>
              <option value="sirdaryo">Sirdaryo</option>
              <option value="navoiy">Navoiy</option>
              <option value="qoraqalpogiston">Qoraqalpog'iston</option>
            </select>
          </div>
          <div className="user-box" style={{ width: '49%' }}>
            <label style={{ top: '-20px', left: '0', fontSize: '14px' }}>Shahar/tuman</label>
            <select
              name="shahar"
              value={SingData.shahar}
              onChange={handleChange}
            >
              <option value=""></option>
            </select>
          </div>
          <div className="user-box" style={{ width: '100%' }}>
            <input
              type="text"
              name="manzil"
              value={SingData.manzil}
              onChange={handleChange}
            />
            <label>Manzil</label>
          </div>

          <div className="user-box" style={{ width: '49%' }}>
            <input
              type="password"
              name="parol"
              value={SingData.parol}
              onChange={handleChange}
              required
            />
            <label>Parol</label>
          </div>

          <div className="user-box" style={{ width: '49%' }}>
            <input
              type="password"
              name="parolTasdiqlang"
              value={SingData.parolTasdiqlang}
              onChange={handleChange}
              required
            />
            <label>Parolni tasdiqlang</label>
          </div>

          <div className="buttons register-buttons">
            <button className='login register-button' type="submit">
              Royhatdan otish
            </button>
            <NavLink className={'register'} to="/login">Kirish</NavLink>
          </div>

        </form>
      </div>
    </>

  );
};

export default Register;
