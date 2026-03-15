import { useState } from 'react';
import { loginUser } from '../login/auth';
import { BaseUrl } from '../../baseUrl';
import Logo from '../../../images/logo.png';
import './login.css';

const Login = ({ onSuccess }) => {
  const [login, setLogin] = useState("+998");
  const [parol, setParol] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${BaseUrl}/diller_login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password: parol }),
      });

      const data = await res.json();
      console.log("Serverdan kelgan data:", data);

      if (res.ok && data?.length > 0 && data[0]?.id) {
        await loginUser(data[0]);
        onSuccess();
      } else {
        setError("Login yoki parol noto'g'ri");
      }
    } catch {
      setError("Server bilan bog'lanishda xato");
    }
  };

  return (
    <div className="login-box">
      <div className="logo">
        <img src={Logo} alt="" className="logo-img" />
      </div>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="user-box" style={{ width: '100%' }}>
          <input type="text" value={login} onChange={(e) => {
            let value = e.target.value;

            if (!value.startsWith("+998")) {
              value = "+998";
            }

            setLogin(value);
          }}
            maxLength={13} required />
          <label>Telefon</label>
        </div>
        <div className="user-box" style={{ width: '100%' }}>
          <input type="password" value={parol} onChange={(e) => setParol(e.target.value)} required />
          <label>Parol</label>
        </div>
        {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
        <div className="buttons">
          <button className="login" type="submit">Kirish<span /></button>
        </div>
      </form>
    </div>
  );
};

export default Login;