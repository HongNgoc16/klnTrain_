import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import Navbar from "./component/Navbar/Navbar"
import Footer from "./component/Footer/Footer"
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

const MainLayout = () => (
  <main className="w-full flex flex-col bg-neutral-50 min-h-screen">
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
