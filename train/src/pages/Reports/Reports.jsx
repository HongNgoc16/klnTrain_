import React, { useState } from 'react';
import { 
  FiCalendar, 
  FiDownload, 
  FiTrendingUp, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2
} from 'react-icons/fi';

import { FaTicketAlt } from 'react-icons/fa';

import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

import './Reports.scss';

const Reports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState('month');
  
  // Dữ liệu doanh thu theo tháng
  const monthlyData = [
    { month: 'T1', revenue: 1250000000, tickets: 2850, occupancy: 72 },
    { month: 'T2', revenue: 980000000, tickets: 2230, occupancy: 68 },
    { month: 'T3', revenue: 1420000000, tickets: 3240, occupancy: 75 },
    { month: 'T4', revenue: 1350000000, tickets: 3080, occupancy: 74 },
    { month: 'T5', revenue: 1580000000, tickets: 3610, occupancy: 78 },
    { month: 'T6', revenue: 1650000000, tickets: 3780, occupancy: 80 }
  ];
  
  // Dữ liệu tuyến đường
  const routeData = [
    { name: 'HN - SG', revenue: 18675000000, tickets: 12450, occupancy: 92 },
    { name: 'HN - ĐN', revenue: 8010000000, tickets: 8900, occupancy: 88 },
    { name: 'SG - NT', revenue: 4556000000, tickets: 6700, occupancy: 85 },
    { name: 'ĐN - SG', revenue: 5400000000, tickets: 5400, occupancy: 82 },
    { name: 'HN - HP', revenue: 1440000000, tickets: 4800, occupancy: 78 }
  ];
  
  // Dữ liệu loại khách hàng
  const customerData = [
    { name: 'Người lớn', value: 65, color: '#8C1D19' },
    { name: 'Sinh viên', value: 20, color: '#e67e22' },
    { name: 'Trẻ em', value: 10, color: '#27ae60' },
    { name: 'Người cao tuổi', value: 5, color: '#3498db' }
  ];
  
  // Dữ liệu doanh thu theo ga
  const stationData = [
    { name: 'Hà Nội', revenue: 25000000000, trains: 45 },
    { name: 'Sài Gòn', revenue: 22000000000, trains: 42 },
    { name: 'Đà Nẵng', revenue: 15000000000, trains: 35 },
    { name: 'Nha Trang', revenue: 10000000000, trains: 28 },
    { name: 'Hải Phòng', revenue: 8000000000, trains: 25 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' tỷ';
    }
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + ' tr';
    }
    return formatCurrency(amount);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.month || payload[0].payload.name}</p>
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
          {payload[1] && <p className="tooltip-extra">{payload[1].value.toLocaleString()} vé</p>}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    alert('Xuất báo cáo thành công!');
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Báo cáo & Thống kê</h1>
          <p className="page-subtitle">Phân tích dữ liệu doanh thu, vé bán và hiệu suất hoạt động</p>
        </div>
        <button className="btn-primary" onClick={handleExport}>
          <FiDownload /> Xuất báo cáo
        </button>
      </div>

      <div className="report-tabs">
        <button className={`tab-btn ${reportType === 'revenue' ? 'active' : ''}`} onClick={() => setReportType('revenue')}>
          <FiDollarSign /> Doanh thu
        </button>
        <button className={`tab-btn ${reportType === 'tickets' ? 'active' : ''}`} onClick={() => setReportType('tickets')}>
          <FaTicketAlt /> Vé bán ra
        </button>
        <button className={`tab-btn ${reportType === 'routes' ? 'active' : ''}`} onClick={() => setReportType('routes')}>
          <FiBarChart2 /> Tuyến đường
        </button>
        <button className={`tab-btn ${reportType === 'customers' ? 'active' : ''}`} onClick={() => setReportType('customers')}>
          <FiUsers /> Khách hàng
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <FiCalendar />
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      {/* Biểu đồ chính */}
      <div className="chart-card main-chart">
        <div className="card-header">
          <h3>
            {reportType === 'revenue' && 'Biểu đồ doanh thu theo tháng'}
            {reportType === 'tickets' && 'Biểu đồ số vé bán ra theo tháng'}
            {reportType === 'routes' && 'Biểu đồ doanh thu theo tuyến đường'}
            {reportType === 'customers' && 'Phân bố loại khách hàng'}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          {reportType === 'revenue' && (
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8C1D19" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8C1D19" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8C1D19" fill="url(#revenueGradient)" />
            </AreaChart>
          )}
          {reportType === 'tickets' && (
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tickets" name="Số vé" fill="#8C1D19" radius={[8,8,0,0]} />
              <Bar dataKey="occupancy" name="Tỷ lệ lấp đầy (%)" fill="#e67e22" radius={[8,8,0,0]} />
            </BarChart>
          )}
          {reportType === 'routes' && (
            <BarChart data={routeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} />
              <YAxis type="category" dataKey="name" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" name="Doanh thu" fill="#8C1D19" />
            </BarChart>
          )}
          {reportType === 'customers' && (
            <PieChart>
              <Pie
                data={customerData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {customerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Thống kê phụ */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><FiDollarSign /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng doanh thu</span>
            <span className="stat-value">{formatCurrency(12568000000)}</span>
            <span className="stat-growth positive">↑ 15.3%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><FaTicketAlt /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng vé đã bán</span>
            <span className="stat-value">28,450</span>
            <span className="stat-growth positive">↑ 8.2%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><FiTrendingUp /></div>
          <div className="stat-info">
            <span className="stat-label">Tỷ lệ lấp đầy TB</span>
            <span className="stat-value">78.5%</span>
            <span className="stat-growth positive">↑ 5.3%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><FiUsers /></div>
          <div className="stat-info">
            <span className="stat-label">Khách hàng mới</span>
            <span className="stat-value">4,280</span>
            <span className="stat-growth positive">↑ 12.5%</span>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu chi tiết */}
      <div className="data-card">
        <div className="card-header">
          <h3>Chi tiết doanh thu theo tuyến</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tuyến đường</th>
                <th>Số vé</th>
                <th>Doanh thu</th>
                <th>Tỷ lệ lấp đầy</th>
                <th>Đóng góp</th>
              </tr>
            </thead>
            <tbody>
              {routeData.map((route, i) => (
                <tr key={i}>
                  <td><strong>{route.name}</strong></td>
                  <td>{route.tickets.toLocaleString()}</td>
                  <td>{formatCurrency(route.revenue)}</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${route.occupancy}%` }}></div>
                      <span>{route.occupancy}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="contribution">
                      {((route.revenue / routeData.reduce((sum, r) => sum + r.revenue, 0)) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;