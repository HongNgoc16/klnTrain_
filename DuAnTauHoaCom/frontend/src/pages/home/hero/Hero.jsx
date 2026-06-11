import React from 'react'
import RootLayout from '../../../layout/RootLayout'
import Search from '../search/Search'
import background from '../../../assets/background.jpg'

const Hero = () => {
  return (
    <div
      className='relative mt-[var(--nav-h)] min-h-[calc(100vh-var(--nav-h))] w-full flex-1 bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Gradient overlay — sáng như Cancel/Exchange */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/60 via-neutral-50/15 to-neutral-50/5 pointer-events-none" />

      {/* Content */}
      <RootLayout className="absolute top-0 left-0 z-10 flex h-full w-full flex-col items-start justify-center gap-5 py-12">

       
        {/* Heading */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-extrabold leading-tight text-[#8C1D19] drop-shadow sm:text-4xl md:text-5xl">
            Hành trình của bạn<br />
            <span className="text-[#d4a017]">bắt đầu từ đây</span>
          </h1>
          <p className="mt-2 text-sm text-[#8C1D19]/70 sm:text-base">
            Vé tàu thông minh - Hành trình thuận lợi
          </p>
        </div>

        {/* Search form */}
        <div className="animate-slide-up w-full">
          <Search />
        </div>

      </RootLayout>
    </div>
  )
}

export default Hero
