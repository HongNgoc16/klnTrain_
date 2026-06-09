// pages/home/popularRoutes/PopularRoutes.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowRightLong } from 'react-icons/fa6'
import RootLayout from '../../../layout/RootLayout'
import { popularRoutes } from '../../../data/popularRoutes'
import { searchTrains } from '../../../data/trains'

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

const PopularRoutes = () => {
  const navigate = useNavigate()

  const handleViewRoute = (route) => {
    // Tìm chuyến tàu phù hợp
    const matchedTrains = searchTrains(route.from, route.to)
    
    if (matchedTrains.length > 0) {
      navigate('/tim-ve', {
        state: {
          fromStation: route.from,
          toStation: route.to,
          departureDate: new Date().toISOString().split('T')[0],
          tripType: 'one-way',
          adultTickets: 1,
          childTickets: 0,
          ticketTotal: 1,
          matchedTrains: matchedTrains
        }
      })
    } else {
      alert('Không tìm thấy chuyến tàu phù hợp')
    }
  }

  return (
    <section className="w-full bg-[#fffef9] py-8">
      <RootLayout>
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 md:text-4xl">
            Các hành trình tàu hỏa phổ biến
          </h2>
          <p className="mt-3 text-lg text-neutral-600 md:text-xl">
            Khám phá những tuyến đường được yêu thích nhất và đặt vé ngay với giá ưu đãi!
          </p>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {popularRoutes.map((route) => (
            <article
              key={route.id}
              className="rounded-md border border-neutral-200 bg-white p-6 shadow-md"
            >
              <span className="inline-flex rounded-full bg-[#FDF2D6] px-4 py-2 text-lg font-medium text-[#8C1D19]">
                {route.trainName}
              </span>

              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <span className="text-2xl font-medium text-neutral-800">{route.from}</span>
                <div className="flex min-w-[110px] flex-col items-center text-neutral-500">
                  <span className="text-lg font-medium leading-none">{route.duration}</span>
                  <FaArrowRightLong className="mt-2 h-8 w-full" />
                </div>
                <span className="text-right text-2xl font-medium text-neutral-800">{route.to}</span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <p className="text-3xl font-bold text-[#8C1D19]">
                  {formatPrice(route.price)} đ
                </p>
                <button
                  type="button"
                  onClick={() => handleViewRoute(route)}
                  className="h-14 min-w-[108px] rounded-md bg-[#8C1D19] px-7 text-lg font-bold text-white transition-colors hover:bg-[#f47c00]"
                >
                  Xem
                </button>
              </div>
            </article>
          ))}
        </div>
      </RootLayout>
    </section>
  )
}

export default PopularRoutes