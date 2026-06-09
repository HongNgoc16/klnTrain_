import React from 'react'
import Hero from './hero/Hero' 
import TrainMap from './trainMap/TrainMap'
import PopularRoutes from './popularRoutes/PopularRoutes'

const Home = () => {
  return (
    <div className='w-full min-h-screen pb-16'>
        {/*Hero*/}
        <Hero />

        <TrainMap />

        <PopularRoutes />
        
      
    </div>
  )
}

export default Home
