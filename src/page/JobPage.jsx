// App.js
import React from 'react';
// import Header from '../components/Header/Header';
// import HeroSection from '../components/HeroSection/HeroSection';// CSS toàn cục

import MainLayout from '../layout/MainLayout';
import JobListing from '../components/JobListing/JobListing';

function JobPage() {
  return (
    <MainLayout showHero={true} heroContent={<JobListing/>}>
       {/* Các thành phần khác của trang sẽ được đặt ở đây */}
      
    </MainLayout>
  );
}

export default JobPage;
 