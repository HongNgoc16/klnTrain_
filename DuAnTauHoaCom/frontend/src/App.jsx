import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Navbar from "./component/Navbar/Navbar"
import Footer from "./component/Footer/Footer"
import { isLoggedIn } from "./utils/authUtils"
import { getMyNotifications, markNotificationRead } from "./api/notifications"
import Home from "./pages/home/Home"
import TicketSearch from "./pages/ticketSearch/TicketSearch"
import CancelTicket from "./pages/cancelTicket/CancelTicket"
import ExchangeTicket from "./pages/exchangeTicket/ExchangeTicket"
import BookingLookup from "./pages/bookingLookup/BookingLookup"
import Checkout from "./pages/checkout/Checkout"
import PaymentMethod from './pages/payment/PaymentMethod'
import QRPayment from './pages/payment/QRPayment'
import PaymentSuccess from './pages/payment/PaymentSuccess'
import TrainSchedule from "./pages/trainSchedule/TrainSchedule"
import PrintTicket from "./pages/printTicket/PrintTicket"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import DispatcherLogin from "@dispatcher/pages/Login"
import DispatcherLayout from "@dispatcher/components/Layout"
import Dashboard from "@dispatcher/pages/Dashboard"
import QuanLyChuyen from "@dispatcher/pages/QuanLyChuyen"
import ChiTietChuyen from "@dispatcher/pages/ChiTietChuyen"
import QuanLyLich from "@dispatcher/pages/QuanLyLich"
import ThongTinCaNhan from "@dispatcher/pages/ThongTinCaNhan"
import { isLoggedIn as dpIsLoggedIn } from "@dispatcher/utils/auth"

import { AuthProvider as AdminAuthProvider } from "@admin/context/AuthContext"
import AdminPrivateRoute from "@admin/routes/PrivateRoute"
import AdminLayout from "@admin/components/Layout/AdminLayout"
import AdminLogin from "@admin/pages/Login/Login"
import AdminDashboard from "@admin/pages/Dashboard/Dashboard"
import AdminTicketsManagement from "@admin/pages/TicketsManagement/TicketsManagement"
import AdminTrainsManagement from "@admin/pages/TrainsManagement/TrainsManagement"
import AdminStationsManagement from "@admin/pages/StationsManagement/StationsManagement"
import AdminSchedulesManagement from "@admin/pages/SchedulesManagement/SchedulesManagement"
import AdminCustomersManagement from "@admin/pages/CustomersManagement/CustomersManagement"
import AdminUsersManagement from "@admin/pages/UsersManagement/UsersManagement"
import AdminCarriageTypesManagement from "@admin/pages/CarriageTypesManagement/CarriageTypesManagement"
import AdminSeatTypesManagement from "@admin/pages/SeatTypesManagement/SeatTypesManagement"
import AdminNotificationsManagement from "@admin/pages/NotificationsManagement/NotificationsManagement"
import AdminReports from "@admin/pages/Reports/Reports"
import AdminPolicies from "@admin/pages/Policies/Policies"
import AdminRefunds from "@admin/pages/Refunds/Refunds"
import AdminCoupons from "@admin/pages/Coupons/Coupons"
import AdminSettings from "@admin/pages/Settings/Settings"
import AdminProfile from "@admin/pages/Profile/Profile"
import "@admin/styles/global.scss"

const DispatcherGuard = ({ children }) =>
  dpIsLoggedIn() ? children : <Navigate to="/dispatcher/dang-nhap" replace />

const AdminApp = () => (
  <AdminAuthProvider>
    <div className="admin-app">
      <Outlet />
    </div>
  </AdminAuthProvider>
)

// ─── Hiển thị thông báo (chậm giờ, hủy chuyến, bảo trì…) dạng toast khi vào trang ─
const NotificationListener = () => {
  useEffect(() => {
    if (!isLoggedIn()) return
    let huy = false

    const taiThongBao = async () => {
      try {
        const res = await getMyNotifications()
        const items = res?.data?.items || []
        const chuaDoc = items.filter((tb) => !tb.da_doc)
        if (huy) return
        chuaDoc.forEach((tb) => {
          const hienThi =
            tb.loai === 'cancel' ? toast.error :
            (tb.loai === 'delay' || tb.loai === 'maintenance') ? toast.warning :
            toast.info
          hienThi(`${tb.tieu_de}: ${tb.noi_dung}`, { autoClose: 8000 })
          markNotificationRead(tb.id_thong_bao).catch(() => {})
        })
      } catch { /* bỏ qua lỗi tải thông báo, không chặn trải nghiệm người dùng */ }
    }

    taiThongBao()
    return () => { huy = true }
  }, [])

  return <ToastContainer position="top-right" newestOnTop />
}

const MainLayout = () => (
  <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
    <NotificationListener />
    <Navbar />
    <Outlet />
    <Footer />
  </main>
)

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang in vé — không có Navbar/Footer */}
        <Route path="/in-ve" element={<PrintTicket />} />

        {/* Auth — không có Navbar (có nền riêng) */}
        <Route path="/dang-nhap" element={<><Navbar /><Login /></>} />
        <Route path="/dang-ky"   element={<><Navbar /><Register /></>} />

        {/* Các trang chính — có Navbar + Footer */}
        <Route element={<MainLayout />}>
          <Route path="/"                      element={<Home />} />
          <Route path="/tim-ve"                element={<TicketSearch />} />
          <Route path="/checkout"              element={<Checkout />} />
          <Route path="/thanh-toan"            element={<PaymentMethod />} />
          <Route path="/thanh-toan/qr"         element={<QRPayment />} />
          <Route path="/thanh-toan/thanh-cong" element={<PaymentSuccess />} />
          <Route path="/thong-tin-dat-cho"     element={<BookingLookup />} />
          <Route path="/chuyen-tau-gia-ve"     element={<TrainSchedule />} />
          <Route path="/tra-ve"                element={<CancelTicket />} />
          <Route path="/doi-ve"                element={<ExchangeTicket />} />
        </Route>

        {/* Điều phối viên — prefix /dispatcher */}
        <Route path="/dispatcher/dang-nhap" element={<DispatcherLogin />} />
        <Route path="/dispatcher" element={<DispatcherGuard><DispatcherLayout /></DispatcherGuard>}>
          <Route index                         element={<Dashboard />} />
          <Route path="chuyen-tau"             element={<QuanLyChuyen />} />
          <Route path="chuyen-tau/:id"         element={<ChiTietChuyen />} />
          <Route path="lich-chay"              element={<QuanLyLich />} />
          <Route path="thong-tin-ca-nhan"      element={<ThongTinCaNhan />} />
        </Route>

        {/* Admin — prefix /admin */}
        <Route path="/admin" element={<AdminApp />}>
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
            <Route index                 element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard"      element={<AdminDashboard />} />
            <Route path="tickets"        element={<AdminTicketsManagement />} />
            <Route path="trains"         element={<AdminTrainsManagement />} />
            <Route path="stations"       element={<AdminStationsManagement />} />
            <Route path="carriage-types" element={<AdminCarriageTypesManagement />} />
            <Route path="seat-types"     element={<AdminSeatTypesManagement />} />
            <Route path="schedules"      element={<AdminSchedulesManagement />} />
            <Route path="customers"      element={<AdminCustomersManagement />} />
            <Route path="users"          element={<AdminUsersManagement />} />
            <Route path="notifications"  element={<AdminNotificationsManagement />} />
            <Route path="reports"        element={<AdminReports />} />
            <Route path="policies"       element={<AdminPolicies />} />
            <Route path="refunds"        element={<AdminRefunds />} />
            <Route path="coupons"        element={<AdminCoupons />} />
            <Route path="settings"       element={<AdminSettings />} />
            <Route path="profile"        element={<AdminProfile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
