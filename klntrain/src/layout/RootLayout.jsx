import React, {Children, useEffect} from 'react'

const RootLayout = ({children, className}) => {
    //tự động cuộn lên đầu trang khi chuyển sang trang khác
    useEffect(()=>{
        window.scrollTo(0,0);
    }, [])
    return (
        <div className={`w-full lg:px-16 md:px-8 sm:px-6 ${className}`}>
            {children}
        </div>
  )
}

export default RootLayout
