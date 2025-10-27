// App.js
import React from 'react';
// import Header from '../components/Header/Header';
// import HeroSection from '../components/HeroSection/HeroSection';// CSS toàn cục

import MainLayout from '../layout/MainLayout';
import JobDetail from '../components/JobDetail/JobDetail';

function JobDetailPage() {
  return (
    <MainLayout showHero={true} heroContent={<JobDetail/>}>
       {/* Các thành phần khác của trang sẽ được đặt ở đây */}
      
    </MainLayout>
  );
}

export default JobDetailPage;
 