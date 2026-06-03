import React from 'react'
import RootLayout from '../../layout/RootLayout'

const TopbarPage = ({ title }) => {
  return (
    <RootLayout className="min-h-screen pt-[var(--nav-h)] pb-16">
      <div className="mx-auto max-w-4xl rounded-md bg-white p-6 shadow-md">
        <h1 className="text-3xl font-bold text-[#8C1D19]">{title}</h1>
      </div>
    </RootLayout>
  )
}

export default TopbarPage
