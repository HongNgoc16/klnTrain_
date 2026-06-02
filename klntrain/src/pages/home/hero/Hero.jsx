import React from 'react'
import RootLayout from '../../../layout/RootLayout';
import Search from '../search/Search';
import background from '../../../assets/background.jpg'
const Hero = () => {
  return (
    <div 
      className='relative mt-[13.4ch] min-h-[calc(100vh-13.4ch)] w-full flex-1 bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${background})` }}
    >
      <RootLayout className="absolute top-0 left-0 w-full h-full py-8 bg-gradient-to-b from-neutral-50/70 via-neutral-50/15 to-neutral-50/5 flex items-start justify-center text-left flex-col gap-9">
        <div className="w-full flex justify-start pl-4 sm:pl-6 md:pl-0">
          <Search />
        </div>
      </RootLayout>
    </div>
  )
}

export default Hero
