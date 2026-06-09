import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
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
      </Routes>
    </Router>
  )
}

export default App
