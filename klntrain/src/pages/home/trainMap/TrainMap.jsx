import React from 'react'
import { FaHeadset, FaRegStar, FaTrainSubway } from 'react-icons/fa6'
import RootLayout from '../../../layout/RootLayout'
import allTrainMap from '../../../assets/all_train.jpg'

const benefits = [
  {
    icon: FaRegStar,
    title: 'Tìm chuyến tàu phù hợp',
    description: 'Lựa chọn lịch trình linh hoạt'
  },
  {
    icon: FaTrainSubway,
    title: 'Đặt vé nhanh, dễ dàng',
    description: 'Nhận vé ngay sau khi đặt'
  },
  {
    icon: FaHeadset,
    title: 'Luôn sẵn sàng hỗ trợ',
    description: 'Phản hồi trong 15 phút qua điện thoại, zalo'
  }
]

const TrainMap = () => {
  return (
    <section className="w-full bg-[#fffef9]">
      <RootLayout className= "py-5">
        <div className="grid gap-6 bg-[#fff9ea] py-4 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon

            return (
              <div key={benefit.title} className="flex items-start gap-4">
                <Icon className="mt-1 h-9 w-9 shrink-0 text-[#8C1D19]" />
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">{benefit.title}</h3>
                  <p className="mt-2 text-base text-neutral-500">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8">
          <h2 className="text-4xl font-bold text-neutral-800">Bản đồ tuyến đường sắt Việt Nam</h2>
          <p className="mt-4 text-xl text-neutral-600">
            Xem thông tin chi tiết về các tuyến tàu hỏa, lịch trình và điểm dừng
          </p>

          <div className="mt-8 overflow-hidden rounded-sm bg-[#FDF2D6] shadow-sm">
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
