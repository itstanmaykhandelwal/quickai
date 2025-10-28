import React from 'react'
import Navbar from '../component/Navbar'
import Hero from '../component/Hero'
import AiTools from '../component/AiTools'
import Testimonial from '../component/Testimonial'
import Plan from '../component/Plan'
import Footer from '../component/Footer'

const Home = () => {
    return (
        <>
            <Navbar/>
            <Hero/>
            <AiTools/>
            <Testimonial/>
            <Plan/>
            <Footer/>
        </>
    )
}

export default Home
