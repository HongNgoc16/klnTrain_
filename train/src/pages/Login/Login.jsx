import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.scss';
import logo from '../../assets/images/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
    const response = await authAPI.login({
      email,
      password
    });
      console.log('Response:', response.data); // Debug
      
      if (response.data.success) {
        // Lưu thông tin vào localStorage
        localStorage.setItem('admin_token', response.data.token || 'mock_token');
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        
        console.log('Đã lưu user:', response.data.user); // Debug
        console.log('Chuyển sang dashboard...'); // Debug
        
        // Chuyển trang
         window.location.href = '/dashboard';
      } else {
        setError(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Train Logo" />
          <h2>KLN Train</h2>
          <p>Đăng nhập hệ thống</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-footer">
          <p>TK: admin@klntrain.vn / MK:admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;