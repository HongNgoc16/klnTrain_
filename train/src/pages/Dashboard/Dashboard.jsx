import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiUsers, FiTrendingUp, FiClock, 
  FiCalendar, FiMapPin, FiBarChart2, FiCheckCircle, 
  FiAlertCircle, FiTarget, FiActivity
} from 'react-icons/fi';
import { FaTrain, FaTicketAlt, FaRoute } from 'react-icons/fa';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { dashboardAPI, reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Dashboard.scss';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // Thống kê số lượng
  const [stats, setStats] = useState({
    total_routes: 0,      // Số tuyến đường
    total_stations: 0,    // Số nhà ga hoạt động
    total_tickets_7d: 0,  // Số vé 7 ngày gần nhất
    total_revenue_7d: 0,  // Doanh thu 7 ngày gần nhất
    new_customers_7d: 0   // Số hành khách mới 7 ngày
  });
  
  // Dữ liệu biểu đồ
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyRevenueData, setWeeklyRevenueData] = useState([]);
  const [weeklyTicketsData, setWeeklyTicketsData] = useState([]);
  
  // Công việc cần xử lý
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Xác nhận hoàn tiền', count: 5, priority: 'high', link: '/refunds' },
    { id: 2, title: 'Đơn hàng chờ thanh toán', count: 5, priority: 'medium', link: '/tickets' },
    { id: 3, title: 'Tàu bảo trì trong tuần', count: 1, priority: 'medium', link: '/trains' },
    { id: 4, title: 'Lịch chạy sắp hết hạn', count: 1, priority: 'low', link: '/schedules' },
    { id: 5, title: 'Phản hồi chưa xử lý', count: 7, priority: 'high', link: '/feedbacks' }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Gọi API
      const [revenueMonthly, revenueWeekly, ticketsWeekly, dashboardStats] = await Promise.all([
        reportAPI.getRevenueReport({ nhom_theo: 'month' }),
        reportAPI.getRevenueReport({ nhom_theo: 'week' }),
        reportAPI.getTicketsReport({ nhom_theo: 'week' }),
        dashboardAPI.getStats()
      ]);

      // Xử lý doanh thu theo tháng
      setMonthlyData(revenueMonthly.data?.data || [
        { month: 'Thg 1', revenue: 1250000000, tickets: 2850 },
        { month: 'Thg 2', revenue: 980000000, tickets: 2230 },
        { month: 'Thg 3', revenue: 1420000000, tickets: 3240 }
      ]);

      // Xử lý doanh thu theo tuần
      setWeeklyRevenueData(revenueWeekly.data?.data || [
        { day: 'T2', revenue: 420000000 }, { day: 'T3', revenue: 380000000 },
        { day: 'T4', revenue: 450000000 }, { day: 'T5', revenue: 430000000 },
        { day: 'T6', revenue: 560000000 }, { day: 'T7', revenue: 720000000 },
        { day: 'CN', revenue: 680000000 }
      ]);

      // Xử lý số vé theo tuần
      setWeeklyTicketsData(ticketsWeekly.data?.data || [
        { day: 'T2', tickets: 960 }, { day: 'T3', tickets: 870 },
        { day: 'T4', tickets: 1030 }, { day: 'T5', tickets: 985 },
        { day: 'T6', tickets: 1280 }, { day: 'T7', tickets: 1650 },
        { day: 'CN', tickets: 1550 }
      ]);

      // Thống kê số lượng (từ database)
      setStats({
        total_routes: await getTotalRoutes(),
        total_stations: await getTotalStations(),
        total_tickets_7d: await getTotalTickets7d(),
        total_revenue_7d: await getTotalRevenue7d(),
        new_customers_7d: await getNewCustomers7d()
      });

    } catch (error) {
      console.error('Lỗi tải dashboard:', error);
      // Mock data khi lỗi
      setStats({
        total_routes: 25,
        total_stations: 163,
        total_tickets_7d: 3840,
        total_revenue_7d: 3890000000,
        new_customers_7d: 156
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy dữ liệu từ database
  const getTotalRoutes = async () => {
    try {
      const res = await dashboardAPI.getTotalRoutes();
      return res.data?.total || 0;
    } catch { return 25; }
  };

  const getTotalStations = async () => {
    try {
      const res = await dashboardAPI.getTotalStations();
      return res.data?.total || 0;
    } catch { return 163; }
  };

  const getTotalTickets7d = async () => {
    try {
      const res = await dashboardAPI.getTotalTickets7d();
      return res.data?.total || 0;
    } catch { return 3840; }
  };

  const getTotalRevenue7d = async () => {
    try {
      const res = await dashboardAPI.getTotalRevenue7d();
      return res.data?.total || 0;
    } catch { return 3890000000; }
  };

  const getNewCustomers7d = async () => {
    try {
      const res = await dashboardAPI.getNewCustomers7d();
      return res.data?.total || 0;
    } catch { return 156; }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
    if (amount >= 1000000) return (amount / 1000000).toFixed(0) + ' tr';
    return formatCurrency(amount);
  };

  // Custom Tooltip
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

  const StatCard = ({ title, value, icon, suffix, color }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>{icon}</div>
        <div className="stat-info">
          <h4>{title}</h4>
          <div className="stat-value">{value}{suffix && <span className="suffix">{suffix}</span>}</div>
        </div>
      </div>
    </div>
  );

  const TaskItem = ({ task }) => (
    <div className={`task-item ${task.priority}`} onClick={() => window.location.href = task.link}>
      <div className="task-icon">
        {task.priority === 'high' && <FiAlertCircle />}
        {task.priority === 'medium' && <FiClock />}
        {task.priority === 'low' && <FiCheckCircle />}
      </div>
      <div className="task-info">
        <span className="task-title">{task.title}</span>
        <span className="task-count">{task.count} công việc</span>
      </div>
      <div className="task-badge">{task.priority === 'high' ? 'Khẩn' : task.priority === 'medium' ? 'Bình thường' : 'Nhẹ'}</div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn đến với hệ thống quản lý bán vé tàu hỏa KLN Train</p>
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
        <StatCard 
          title="Tuyến đường" 
          value={stats.total_routes} 
          icon={<FaRoute />} 
          suffix=" tuyến"
          color="primary" 
        />
        <StatCard 
          title="Nhà ga" 
          value={stats.total_stations} 
          icon={<FiMapPin />} 
          suffix=" ga"
          color="success" 
        />
        <StatCard 
          title="Doanh thu (7 ngày)" 
          value={formatCompactCurrency(stats.total_revenue_7d)} 
          icon={<FiDollarSign />} 
          color="warning" 
        />
        <StatCard 
          title="Vé đã đặt (7 ngày)" 
          value={stats.total_tickets_7d.toLocaleString()} 
          icon={<FaTicketAlt />} 
          suffix=" vé"
          color="info" 
        />
        <StatCard 
          title="Khách hàng mới" 
          value={stats.new_customers_7d.toLocaleString()} 
          icon={<FiUsers />} 
          suffix=" người"
          color="success" 
        />
      </div>

      {/* Nội dung chính */}
      <div className="dashboard-content">
        {/* Cột trái - Biểu đồ */}
        <div className="content-left">
          {/* Biểu đồ doanh thu theo tháng */}
          <div className="chart-card">
            <div className="card-header">
              <h3><FiBarChart2 /> Doanh thu và số lượt đặt vé theo tháng</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C1D19" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8C1D19" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(v) => formatCompactCurrency(v)} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#8C1D19" fill="url(#revenueGradient)" />
                <Line yAxisId="right" type="monotone" dataKey="tickets" name="Số vé" stroke="#e67e22" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ doanh thu 7 ngày */}
          <div className="chart-card">
            <div className="card-header">
              <h3><FiBarChart2 /> Doanh thu 7 ngày gần nhất</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#8C1D19" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ số vé 7 ngày */}
          <div className="chart-card">
            <div className="card-header">
              <h3><FiBarChart2 /> Số vé đã đặt 7 ngày gần nhất</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyTicketsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tickets" name="Số vé" fill="#e67e22" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cột phải - Công việc cần xử lý */}
        <div className="content-right">
          <div className="tasks-card">
            <div className="card-header">
              <h3><FiActivity /> Công việc cần xử lý trong ngày</h3>
              <FiTrendingUp className="header-icon" />
            </div>
            <div className="tasks-list">
              {tasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Thống kê nhanh khác */}
          <div className="quick-stats">
            <div className="stat-block">
              <div className="stat-block-icon"><FaTrain /></div>
              <div className="stat-block-info">
                <span className="label">Tỷ lệ lấp đầy</span>
                <span className="value">78.5%</span>
                <span className="trend positive">↑ 5.2%</span>
              </div>
            </div>
            <div className="stat-block">
              <div className="stat-block-icon"><FiTarget /></div>
              <div className="stat-block-info">
                <span className="label">Tỷ lệ đúng giờ</span>
                <span className="value">94.2%</span>
                <span className="trend positive">↑ 2.1%</span>
              </div>
            </div>
            <div className="stat-block">
              <div className="stat-block-icon"><FiAlertCircle /></div>
              <div className="stat-block-info">
                <span className="label">Tỷ lệ hủy vé</span>
                <span className="value">3.2%</span>
                <span className="trend negative">↓ 0.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;