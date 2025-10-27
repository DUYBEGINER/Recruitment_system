// App.js
import React from 'react';
// import Header from '../components/Header/Header';
// import HeroSection from '../components/HeroSection/HeroSection';// CSS toàn cục
import QuoteSection from '../components/QuoteSection/QuoteSection';
import MainLayout from '../layout/MainLayout';
import Hero from '../components/Hero';

function Home() {
  return (
    <MainLayout showHero={true} heroContent={<Hero />}>
       {/* Các thành phần khác của trang sẽ được đặt ở đây */}
      <QuoteSection />
    </MainLayout>
  );
}

export default Home;
