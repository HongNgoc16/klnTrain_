import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiUsers, FiTrendingUp, FiClock, 
  FiCheckCircle, FiXCircle, FiCalendar, FiMapPin, 
  FiBarChart2, FiPieChart, FiActivity
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
  const [rates, setRates] = useState({ ontime_rate: 0, cancel_rate: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        monthlyRes,
        weeklyRes,
        routesRes,
        ordersRes,
        trainsRes,
        stationsRes,
        distributionRes,
        ratesRes
      ] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRevenueByMonth(),
        dashboardAPI.getRevenueByWeek(),
        dashboardAPI.getPopularRoutes(),
        dashboardAPI.getRecentOrders(),
        dashboardAPI.getUpcomingTrains(),
        dashboardAPI.getTopStations(),
        dashboardAPI.getCustomerDistribution(),
        dashboardAPI.getRates()
      ]);

      setStats(statsRes.data.data);
      setMonthlyData(monthlyRes.data.data || []);
      setWeeklyData(weeklyRes.data.data || []);
      setPopularRoutes(routesRes.data.data || []);
      setRecentOrders(ordersRes.data.data || []);
      setUpcomingTrains(trainsRes.data.data || []);
      setTopStations(stationsRes.data.data || []);
      setCustomerDistribution(distributionRes.data.data || []);
      setRates(ratesRes.data.data || { ontime_rate: 0, cancel_rate: 0 });
      
    } catch (error) {
      console.error('Lỗi tải dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
    if (amount >= 1000000) return (amount / 1000000).toFixed(0) + ' tr';
    return formatCurrency(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      da_thanh_toan: { class: 'status-completed', icon: <FiCheckCircle />, text: 'Hoàn thành' },
      cho_thanh_toan: { class: 'status-pending', icon: <FiClock />, text: 'Chờ thanh toán' },
      da_huy: { class: 'status-cancelled', icon: <FiXCircle />, text: 'Đã hủy' },
      dung_gio: { class: 'status-ontime', icon: <FiCheckCircle />, text: 'Đúng giờ' },
      tre_gio: { class: 'status-delayed', icon: <FiClock />, text: 'Chậm giờ' }
    };
    return badges[status] || badges.da_thanh_toan;
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>{icon}</div>
        <div className="stat-info">
          <h4>{title}</h4>
          <div className="stat-value">{value}</div>
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

      {/* 5 thẻ thống kê chính */}
      <div className="stats-grid">
        <StatCard title="Doanh thu" value={formatCurrency(stats.total_revenue)} icon={<FiDollarSign />} color="primary" />
        <StatCard title="Vé đã bán" value={stats.total_tickets?.toLocaleString()} icon={<FaTicketAlt />} color="success" />
        <StatCard title="Khách hàng" value={stats.total_customers?.toLocaleString()} icon={<FiUsers />} color="info" />
        <StatCard title="Tàu đang hoạt động" value={stats.total_trains} icon={<FaTrain />} color="warning" />
        <StatCard title="Tỷ lệ lấp đầy" value={`${stats.avg_occupancy}%`} icon={<FiActivity />} color="primary" />
      </div>

      {/* 2 thẻ tỷ lệ */}
      <div className="sub-stats">
        <div className="sub-stat-card">
          <div className="sub-stat-icon"><FiCheckCircle /></div>
          <div className="sub-stat-info">
            <span className="sub-stat-label">Tỷ lệ đúng giờ</span>
            <span className="sub-stat-value">{rates.ontime_rate}%</span>
          </div>
        </div>
        <div className="sub-stat-card">
          <div className="sub-stat-icon"><FiXCircle /></div>
          <div className="sub-stat-info">
            <span className="sub-stat-label">Tỷ lệ hủy vé</span>
            <span className="sub-stat-value">{rates.cancel_rate}%</span>
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
              <h3><FiBarChart2 /> Biểu đồ doanh thu theo tháng</h3>
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
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8C1D19" fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ doanh thu tuần */}
          <div className="chart-card">
            <div className="card-header">
              <h3><FiBarChart2 /> Doanh thu 7 ngày qua</h3>
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
                        <td>{order.id}</td>
                        <td className="customer-name">{order.customer}</td>
                        <td>{order.train || '---'}</td>
                        <td className="route-cell">{order.from_station} → {order.to_station}</td>
                        <td>{order.date}</td>
                        <td className="amount">{formatCurrency(order.amount)}</td>
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
                      <span className="from">{route.from_station}</span>
                      <span className="arrow">→</span>
                      <span className="to">{route.to_station}</span>
                    </div>
                    <div className="route-stats">{route.total_tickets?.toLocaleString()} lượt</div>
                  </div>
                  <div className="route-revenue">{formatCompactCurrency(route.total_revenue)}</div>
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
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
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
                    <div className="train-time">{train.departure}</div>
                    <div className="train-info">
                      <div className="train-id">{train.id}</div>
                      <div className="train-route">{train.from_station} → {train.to_station}</div>
                    </div>
                    <span className={`status-badge small ${status.class}`}>{status.icon} {status.text}</span>
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
                  <div className="station-name">{station.name}</div>
                  <div className="station-bar">
                    <div className="bar-fill" style={{ width: `${station.percentage}%` }}></div>
                  </div>
                  <div className="station-traffic">{station.traffic?.toLocaleString()} lượt</div>
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