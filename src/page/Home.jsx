// App.js
import React from 'react';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';// CSS toàn cục
import QuoteSection from '../components/QuoteSection/QuoteSection';

function Home() {
  return (
    <div className="Home">
      <Header />
      <HeroSection />
      <QuoteSection/>
      {/* Các thành phần khác của trang sẽ được đặt ở đây */}
    </div>
  );
}

export default Home;