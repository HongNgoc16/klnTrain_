import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import './Breadcrumb.scss';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const routeNames = {
    'dashboard': 'Tổng quan',
    'tickets': 'Quản lý vé',
    'trains': 'Quản lý tàu',
    'stations': 'Quản lý ga',
    'schedules': 'Lịch chạy tàu',
    'customers': 'Quản lý khách hàng',
    'coupons': 'Mã giảm giá',
    'refunds': 'Hủy & hoàn tiền',
    'reports': 'Báo cáo & thống kê',
    'policies': 'Chính sách giá',
    'carriage-types': 'Quản lý loại toa',
    'seat-types': 'Quản lý loại ghế',
    'seat-config': 'Cấu hình ghế',
    'users': 'Quản lý người dùng',
    'notifications': 'Quản lý thông báo',
    'settings': 'Cài đặt'
  };

  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return null;
  }

  return (
    <div className="breadcrumb">
      <Link to="/dashboard" className="breadcrumb-item">
        <FiHome /> Trang chủ
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || name;

        return (
          <React.Fragment key={name}>
            <FiChevronRight className="separator" />
            {isLast ? (
              <span className="breadcrumb-item active">{displayName}</span>
            ) : (
              <Link to={routeTo} className="breadcrumb-item">{displayName}</Link>
            )}
          </React.Fragment>
        );
      })} 
    </div>
  );
};

export default Breadcrumb;