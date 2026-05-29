import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiUsers, FiTrendingUp, FiClock, 
  FiCheckCircle, FiXCircle, FiCalendar, FiMapPin, 
  FiBarChart2, FiPieChart
} from 'react-icons/fi';
import { FaTrain, FaTicketAlt } from 'react-icons/fa';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Dashboard.scss';

const Dashboard = () => {
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_tickets: 0,
    total_customers: 0,
    total_trains: 0,
    avg_occupancy: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingTrains, setUpcomingTrains] = useState([]);
  const [topStations, setTopStations] = useState([]);
  const [customerDistribution, setCustomerDistribution] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Gọi API song song với cấu trúc mới
      const [
        statsRes,
        monthlyRes,
        weeklyRes,
        routesRes,
        ordersRes,
        trainsRes,
        stationsRes,
        distributionRes
      ] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRevenueByMonth(),
        dashboardAPI.getRevenueByWeek(),
        dashboardAPI.getPopularRoutes(),
        dashboardAPI.getRecentOrders(),
        dashboardAPI.getUpcomingTrains(),
        dashboardAPI.getTopStations(),
        dashboardAPI.getCustomerDistribution()
      ]);

      // Xử lý dữ liệu từ API
      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      } else if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }

      setMonthlyData(monthlyRes.data?.data || monthlyRes.data || []);
      setWeeklyData(weeklyRes.data?.data || weeklyRes.data || []);
      setPopularRoutes(routesRes.data?.data || routesRes.data || []);
      setRecentOrders(ordersRes.data?.data || ordersRes.data || []);
      setUpcomingTrains(trainsRes.data?.data || trainsRes.data || []);
      setTopStations(stationsRes.data?.data || stationsRes.data || []);
      setCustomerDistribution(distributionRes.data?.data || distributionRes.data || []);
      
    } catch (error) {
      console.error('Lỗi tải dashboard:', error);
      // Mock data khi API lỗi
      setStats({
        total_revenue: 12568000000,
        total_tickets: 28450,
        total_customers: 45680,
        total_trains: 26,
        avg_occupancy: 78
      });
      setMonthlyData([
        { month: 'Thg 1', revenue: 1250000000, tickets: 2850 },
        { month: 'Thg 2', revenue: 980000000, tickets: 2230 },
        { month: 'Thg 3', revenue: 1420000000, tickets: 3240 },
        { month: 'Thg 4', revenue: 1350000000, tickets: 3080 },
        { month: 'Thg 5', revenue: 1580000000, tickets: 3610 },
        { month: 'Thg 6', revenue: 1650000000, tickets: 3780 }
      ]);
      setWeeklyData([
        { day: 'T2', revenue: 420000000, tickets: 960 },
        { day: 'T3', revenue: 380000000, tickets: 870 },
        { day: 'T4', revenue: 450000000, tickets: 1030 },
        { day: 'T5', revenue: 430000000, tickets: 985 },
        { day: 'T6', revenue: 560000000, tickets: 1280 },
        { day: 'T7', revenue: 720000000, tickets: 1650 },
        { day: 'CN', revenue: 680000000, tickets: 1550 }
      ]);
      setPopularRoutes([
        { from_station: 'Hà Nội', to_station: 'Sài Gòn', total_tickets: 12450, total_revenue: 18675000000 },
        { from_station: 'Hà Nội', to_station: 'Đà Nẵng', total_tickets: 8900, total_revenue: 8010000000 },
        { from_station: 'Sài Gòn', to_station: 'Nha Trang', total_tickets: 6700, total_revenue: 4556000000 }
      ]);
      setRecentOrders([
        { id: 'ORD001', customer: 'Nguyễn Văn A', train: 'SE1', from_station: 'Hà Nội', to_station: 'Sài Gòn', date: '2026-01-15', amount: 1250000, status: 'completed' },
        { id: 'ORD002', customer: 'Trần Thị B', train: 'SE2', from_station: 'Đà Nẵng', to_station: 'Hà Nội', date: '2026-01-15', amount: 890000, status: 'completed' }
      ]);
      setUpcomingTrains([
        { id: 'SE1', from_station: 'Hà Nội', to_station: 'Sài Gòn', departure: '08:00', status: 'on-time' },
        { id: 'SE2', from_station: 'Sài Gòn', to_station: 'Hà Nội', departure: '09:30', status: 'on-time' }
      ]);
      setTopStations([
        { name: 'Ga Hà Nội', traffic: 12500, percentage: 28 },
        { name: 'Ga Sài Gòn', traffic: 11800, percentage: 26 }
      ]);
      setCustomerDistribution([
        { name: 'Người lớn', value: 65, color: '#8C1D19' },
        { name: 'Sinh viên', value: 20, color: '#e67e22' },
        { name: 'Trẻ em', value: 10, color: '#27ae60' },
        { name: 'Người cao tuổi', value: 5, color: '#3498db' }
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status) => {
    const badges = {
      completed: { class: 'status-completed', icon: <FiCheckCircle />, text: 'Hoàn thành' },
      da_thanh_toan: { class: 'status-completed', icon: <FiCheckCircle />, text: 'Hoàn thành' },
      pending: { class: 'status-pending', icon: <FiClock />, text: 'Chờ xử lý' },
      cho_thanh_toan: { class: 'status-pending', icon: <FiClock />, text: 'Chờ xử lý' },
      cancelled: { class: 'status-cancelled', icon: <FiXCircle />, text: 'Đã hủy' },
      da_huy: { class: 'status-cancelled', icon: <FiXCircle />, text: 'Đã hủy' },
      'on-time': { class: 'status-ontime', icon: <FiCheckCircle />, text: 'Đúng giờ' },
      dung_gio: { class: 'status-ontime', icon: <FiCheckCircle />, text: 'Đúng giờ' },
      delayed: { class: 'status-delayed', icon: <FiClock />, text: 'Chậm giờ' },
      tre_gio: { class: 'status-delayed', icon: <FiClock />, text: 'Chậm giờ' }
    };
    return badges[status] || badges.completed;
  };

  const StatCard = ({ title, value, icon, growth, color }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>{icon}</div>
        <div className="stat-info">
          <h4>{title}</h4>
          <div className="stat-value">{value}</div>
          {growth !== undefined && (
            <div className="stat-growth">
              <FiTrendingUp className="growth-icon" />
              <span className={growth >= 0 ? 'positive' : 'negative'}>
                {growth >= 0 ? `+${growth}%` : `${growth}%`}
              </span>
              <span className="growth-text">so với kỳ trước</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
          {payload[1] && (
            <p className="tooltip-extra">{payload[1].value.toLocaleString()} vé</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Tổng quan</h1>
        </div>
        <div className="date-selector">
          <FiCalendar />
          <select defaultValue="month">
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      {/* 3 thẻ thống kê chính */}
      <div className="stats-grid">
        <StatCard 
          title="Doanh thu" 
          value={formatCurrency(stats.total_revenue)} 
          icon={<FiDollarSign />} 
          growth={15.3}
          color="primary" 
        />
        <StatCard 
          title="Vé đã bán" 
          value={stats.total_tickets?.toLocaleString() || '0'} 
          icon={<FaTicketAlt />} 
          growth={8.2}
          color="success" 
        />
        <StatCard 
          title="Khách hàng" 
          value={stats.total_customers?.toLocaleString() || '0'} 
          icon={<FiUsers />} 
          growth={12.5}
          color="info" 
        />
      </div>

      {/* 2 thẻ thống kê phụ */}
      <div className="sub-stats">
        <div className="sub-stat-card">
          <div className="sub-stat-icon"><FaTrain /></div>
          <div className="sub-stat-info">
            <span className="sub-stat-label">Tàu đang hoạt động</span>
            <span className="sub-stat-value">{stats.total_trains || 26}</span>
          </div>
        </div>
        <div className="sub-stat-card">
          <div className="sub-stat-icon"><FiXCircle /></div>
          <div className="sub-stat-info">
            <span className="sub-stat-label">Tỷ lệ lấp đầy</span>
            <span className="sub-stat-value">{stats.avg_occupancy || 78}%</span>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="dashboard-content">
        {/* Cột trái */}
        <div className="content-left">
          {/* Biểu đồ doanh thu tháng */}
          <div className="chart-card">
            <div className="card-header">
              <h3><FiBarChart2 /> Biểu đồ doanh thu 2025</h3>
              <div className="chart-tabs">
                <button className="active">Theo tháng</button>
                <button>Theo quý</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
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
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh thu" 
                  stroke="#8C1D19" 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ doanh thu tuần */}
          <div className="chart-card">
            <div className="card-header">
              <h3><FiBarChart2 /> Doanh thu theo ngày trong tuần</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#8C1D19" radius={[8,8,0,0]} />
                <Bar dataKey="tickets" name="Số vé" fill="#e67e22" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Đơn hàng gần đây */}
          <div className="recent-orders">
            <div className="card-header">
              <h3><FiClock /> Đơn hàng gần đây</h3>
              <a href="/tickets" className="view-all">Xem tất cả →</a>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tàu</th>
                    <th>Hành trình</th>
                    <th>Ngày</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => {
                    const status = getStatusBadge(order.status);
                    return (
                      <tr key={idx}>
                        <td>{order.id || order.ma_don}</td>
                        <td className="customer-name">{order.customer || order.ho_ten}</td>
                        <td>{order.train || order.ma_tau}</td>
                        <td>
                          <span className="route">
                            <span className="from">{order.from_station || order.ga_di}</span>
                            <span className="arrow">→</span>
                            <span className="to">{order.to_station || order.ga_den}</span>
                          </span>
                        </td>
                        <td>{order.date || new Date(order.thoi_gian_dat).toLocaleDateString('vi-VN')}</td>
                        <td className="amount">{formatCurrency(order.amount || order.tong_tien)}</td>
                        <td><span className={`status-badge ${status.class}`}>{status.icon} {status.text}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="content-right">
          {/* Tuyến phổ biến */}
          <div className="popular-routes">
            <div className="card-header">
              <h3><FiTrendingUp /> Tuyến phổ biến nhất</h3>
            </div>
            <div className="routes-list">
              {popularRoutes.slice(0, 5).map((route, idx) => (
                <div key={idx} className="route-item">
                  <div className="route-rank">#{idx + 1}</div>
                  <div className="route-info">
                    <div className="route-path">
                      <FiMapPin className="route-icon" />
                      <span className="from">{route.from_station || route.ga_di}</span>
                      <span className="arrow">→</span>
                      <span className="to">{route.to_station || route.ga_den}</span>
                    </div>
                    <div className="route-stats">
                      {(route.total_tickets || route.so_luong)?.toLocaleString()} lượt đặt
                    </div>
                  </div>
                  <div className="route-revenue">{formatCompactCurrency(route.total_revenue || route.doanh_thu)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phân bố loại khách hàng */}
          <div className="distribution-card">
            <div className="card-header">
              <h3><FiPieChart /> Phân bố loại khách hàng</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={customerDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {customerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lịch chạy sắp tới */}
          <div className="upcoming-trains">
            <div className="card-header">
              <h3><FaTrain /> Lịch chạy sắp tới</h3>
              <a href="/schedules" className="view-all">Xem lịch đầy đủ →</a>
            </div>
            <div className="trains-list">
              {upcomingTrains.slice(0, 4).map((train, idx) => {
                const status = getStatusBadge(train.status);
                return (
                  <div key={idx} className="train-item">
                    <div className="train-time">{train.departure || train.gio_di}</div>
                    <div className="train-info">
                      <div className="train-id">{train.id || train.ma_tau}</div>
                      <div className="train-route">
                        <span>{train.from_station || train.ga_di}</span>
                        <span className="arrow">→</span>
                        <span>{train.to_station || train.ga_den}</span>
                      </div>
                    </div>
                    <span className={`status-badge small ${status.class}`}>
                      {status.icon} {status.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top ga lớn nhất */}
          <div className="top-stations">
            <div className="card-header">
              <h3><FiMapPin /> Top ga có lượng khách lớn nhất</h3>
            </div>
            <div className="stations-list">
              {topStations.map((station, idx) => (
                <div key={idx} className="station-item">
                  <div className="station-rank">{idx + 1}</div>
                  <div className="station-name">{station.name || station.ten_ga}</div>
                  <div className="station-bar">
                    <div className="bar-fill" style={{ width: `${station.percentage || station.ty_le}%` }}></div>
                  </div>
                  <div className="station-traffic">{(station.traffic || station.luot_khach)?.toLocaleString()} lượt</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;