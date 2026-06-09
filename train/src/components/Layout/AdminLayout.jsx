// src/components/Layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from '../Common/Breadcrumb';
import './AdminLayout.scss';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`sidebar-wrapper ${mobileOpen ? 'open' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} isMobile={isMobile} />
      </div>
      
      {/* Main content */}
      <div className={`main-wrapper ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="main-content"> 
           <Breadcrumb />
          <Outlet />
        </main>
      </div>
      
      {/* Overlay cho mobile */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}></div>
      )}
    </div>
  );
};

export default AdminLayout;