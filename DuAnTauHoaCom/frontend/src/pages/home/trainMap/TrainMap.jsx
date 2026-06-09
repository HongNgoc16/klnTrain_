import React from 'react'
import { FaHeadset, FaRegStar, FaTrainSubway } from 'react-icons/fa6'
import RootLayout from '../../../layout/RootLayout'
import allTrainMap from '../../../assets/all_train.jpg'

const benefits = [
  {
    icon: FaRegStar,
    title: 'Tìm chuyến tàu phù hợp',
    description: 'Lựa chọn lịch trình linh hoạt, nhiều tuyến đường trên cả nước',
  },
  {
    icon: FaTrainSubway,
    title: 'Đặt vé nhanh, dễ dàng',
    description: 'Nhận xác nhận và thông tin vé ngay sau khi hoàn tất đặt chỗ',
  },
  {
    icon: FaHeadset,
    title: 'Hỗ trợ tận tình 24/7',
    description: 'Phản hồi trong 15 phút qua điện thoại và Zalo hàng ngày',
  },
]

const TrainMap = () => {
  return (
    <section className="w-full bg-[#fffef9]">
      <RootLayout className="py-10">

        {/* ── Benefit cards ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {benefits.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.title}
                className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8C1D19]/20 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#8C1D19]/8 group-hover:bg-[#8C1D19]/12 transition-colors">
                  <Icon className="h-6 w-6 text-[#8C1D19]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 md:text-base">{b.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 md:text-sm">{b.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Train map ── */}
        <div className="mt-10">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 md:text-3xl">
                Bản đồ tuyến đường sắt Việt Nam
              </h2>
              <p className="mt-1 text-sm text-neutral-500 md:text-base">
                Thông tin chi tiết về các tuyến tàu, lịch trình và điểm dừng
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl shadow-md ring-1 ring-gray-200">
            <img
              src={allTrainMap}
              alt="Bản đồ tuyến đường sắt Việt Nam"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

      </RootLayout>
    </section>
  )
}

export default TrainMap
