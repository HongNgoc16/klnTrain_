import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars, FaChevronDown, FaX } from 'react-icons/fa6'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { label: 'Hỗ trợ', link: '/', hasDropdown: true },
    { label: 'Khuyến mãi', link: '/' },
    { label: 'Đăng nhập', link: '/' },
    { label: 'Đăng ký', link: '/' }
  ]

  const topbarItems = [
    { label: 'Trang chủ', link: '/' },
    { label: 'Tìm vé', link: '/tim-ve' },
    { label: 'Thông tin đặt chỗ', link: '/thong-tin-dat-cho' },
    { label: 'Chuyến tàu - giá vé', link: '/chuyen-tau-gia-ve' },
    { label: 'Trả vé', link: '/tra-ve' },
    { label: 'Đổi vé', link: '/doi-ve' }
  ]

  const handleOpen = () => {
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const isActiveTopbar = (link) => {
    if (link === '/') {
      return location.pathname === '/'
    }

    return location.pathname === link
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <nav className="h-[8ch] w-full bg-[#8C1D19] px-4 sm:px-7 md:px-16 lg:px-24">
        <div className="flex h-full w-full items-center justify-between">
          <Link
            to="/"
            className="font-saira whitespace-nowrap text-4xl font-bold text-[#FDF2D6] sm:text-5xl"
            onClick={handleClose}
          >
            KLN TRAIN
          </Link>

          <button
            type="button"
            className="flex w-fit cursor-pointer flex-col items-center justify-center gap-1 text-[#FDF2D6] md:hidden"
            onClick={handleOpen}
            aria-label="Mở menu"
          >
            {open ? <FaX className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>

          <div
            className={`${
              open ? 'flex absolute top-[8ch] left-0 w-full' : 'hidden'
            } flex-1 flex-col items-start gap-8 border border-[#fff8de]/20 bg-[#8C1D19] p-4 shadow-md md:relative md:top-auto md:left-auto md:flex md:w-auto md:flex-row md:items-center md:justify-end md:gap-14 md:border-transparent md:bg-transparent md:p-0 md:shadow-none`}
          >
            <ul className="font-roboto flex list-none flex-col flex-wrap items-start gap-4 text-lg font-bold uppercase text-[#FDF2D6] md:flex-row md:items-center md:gap-8">
              {navItems.map((item, ind) => (
                <li key={ind}>
                  <Link
                    to={item.link}
                    className="flex items-center gap-2 transition-colors duration-300 ease-in-out hover:text-[#FFD15A]"
                    onClick={handleClose}
                  >
                    {item.label}
                    {item.hasDropdown && <FaChevronDown className="h-4 w-4" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div className="h-[5.4ch] w-full overflow-x-auto bg-[#FDF2D6] shadow-sm md:overflow-x-visible">
        <div className="flex h-full min-w-max items-stretch px-4 sm:px-7 md:grid md:min-w-0 md:grid-cols-6 md:px-6 lg:px-10 xl:px-16">
          {topbarItems.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className={`font-roboto flex h-full min-w-[150px] items-center justify-center whitespace-nowrap px-9 text-center text-base font-bold uppercase leading-tight text-[#8C1D19] transition-colors duration-300 md:min-w-0 md:px-2 md:text-xs lg:px-3 lg:text-sm xl:px-4 xl:text-base ${
                isActiveTopbar(item.link) ? 'bg-[#FFD15A]' : 'hover:bg-[#ffe9a7]'
              }`}
              onClick={handleClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Navbar
