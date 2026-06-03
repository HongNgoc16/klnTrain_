// component/Footer/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { FaTrain, FaPhone, FaEnvelope, FaClock, FaLocationDot, FaFacebook } from 'react-icons/fa6'
import { SiZalo } from 'react-icons/si'

const PHONE = '0337297690'
const ZALO_URL = `https://zalo.me/${PHONE}`

const Footer = () => {
  return (
    <footer className="bg-[#1a0a09] text-gray-300 mt-auto">

      {/* Main content */}
      <div className="container mx-auto px-6 lg:px-16 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Cột 1: Thương hiệu */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <FaTrain className="text-[#FFD15A] text-2xl" />
              <span className="text-2xl font-bold text-[#FDF2D6]">KLN TRAIN</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Đặt vé tàu hỏa trực tuyến nhanh chóng, tiện lợi. Đồng hành cùng mọi hành trình của bạn trên khắp đất nước Việt Nam.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0068ff] hover:bg-[#0058d0] transition-colors"
                title="Liên hệ Zalo">
                <SiZalo className="text-white text-lg" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1877f2] hover:bg-[#1465cc] transition-colors"
                title="Facebook">
                <FaFacebook className="text-white text-base" />
              </a>
              <a href={`tel:${PHONE}`}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#8C1D19] hover:bg-[#6a1613] transition-colors"
                title="Gọi điện">
                <FaPhone className="text-white text-sm" />
              </a>
            </div>
          </div>

          {/* Cột 2: Dịch vụ */}
          <div>
            <h3 className="text-[#FFD15A] font-bold text-sm uppercase tracking-wide mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Đặt vé tàu', to: '/tim-ve' },
                { label: 'Tra cứu đặt chỗ', to: '/thong-tin-dat-cho' },
                { label: 'Lịch chạy tàu & giá vé', to: '/chuyen-tau-gia-ve' },
                { label: 'Trả vé', to: '/tra-ve' },
                { label: 'Đổi vé', to: '/doi-ve' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-gray-400 hover:text-[#FFD15A] transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#8C1D19] inline-block" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-[#FFD15A] font-bold text-sm uppercase tracking-wide mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Hướng dẫn đặt vé', to: '/' },
                { label: 'Chính sách hoàn vé', to: '/' },
                { label: 'Chính sách đổi vé', to: '/' },
                { label: 'Câu hỏi thường gặp', to: '/' },
                { label: 'Khuyến mãi', to: '/' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-gray-400 hover:text-[#FFD15A] transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#8C1D19] inline-block" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-[#FFD15A] font-bold text-sm uppercase tracking-wide mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <FaPhone className="text-[#FFD15A] mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Hotline</p>
                  <a href={`tel:${PHONE}`}
                    className="text-white font-semibold hover:text-[#FFD15A] transition-colors">
                    {PHONE}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <SiZalo className="text-[#0068ff] mt-0.5 shrink-0 text-base" />
                <div>
                  <p className="text-gray-400 text-xs">Zalo</p>
                  <a href={ZALO_URL} target="_blank" rel="noopener noreferrer"
                    className="text-white font-semibold hover:text-[#FFD15A] transition-colors">
                    {PHONE}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <FaEnvelope className="text-[#FFD15A] mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <a href="mailto:support@klntrain.vn"
                    className="text-white hover:text-[#FFD15A] transition-colors">
                    support@klntrain.vn
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <FaClock className="text-[#FFD15A] mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Giờ hỗ trợ</p>
                  <p className="text-white">7:30 – 22:00 hàng ngày</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <FaLocationDot className="text-[#FFD15A] mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Địa chỉ</p>
                  <p className="text-white">Tp. Hồ Chí Minh, Việt Nam</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Bottom bar */}
      <div className="container mx-auto px-6 lg:px-16 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© 2026 KLN Train. Bảo lưu mọi quyền.</p>
          <p className="text-center">
            Dịch vụ đặt vé tàu hỏa trực tuyến — An toàn · Nhanh chóng · Tiện lợi
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
