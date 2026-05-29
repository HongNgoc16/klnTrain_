import React, { useState } from 'react';
import { FiMenu, FiBell, FiUser, FiChevronDown, FiSearch } from 'react-icons/fi';
import './Header.scss';

const Header = ({ toggleSidebar, collapsed }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <div className="search-box">
          <FiSearch />
          <input type="text" placeholder="Tìm kiếm..." />
        </div>
      </div>

      <div className="header-right">
        <button className="notification-btn">
          <FiBell />
          <span className="badge">3</span>
        </button>

        <div className="user-dropdown" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="user-avatar">
            <FiUser />
          </div>
          <div className="user-info">
            <span className="user-name">{user.name || 'Admin'}</span>
            <FiChevronDown />
          </div>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <a href="/profile">Hồ sơ</a>
              <a href="/settings">Cài đặt</a>
              <hr />
              <a href="#" onClick={() => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.href = '/login';
              }}>Đăng xuất</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;