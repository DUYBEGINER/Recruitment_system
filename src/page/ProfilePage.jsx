// App.js
import React from 'react';
// import Header from '../components/Header/Header';
// import HeroSection from '../components/HeroSection/HeroSection';// CSS toàn cục

import MainLayout from '../layout/MainLayout';
import Profile from '../components/Profile/Profile';

function ProfilePage() {
  return (
    <MainLayout showHero={true} heroContent={<Profile/>}>
       {/* Các thành phần khác của trang sẽ được đặt ở đây */}
      
    </MainLayout>
  );
}

export default ProfilePage;
 