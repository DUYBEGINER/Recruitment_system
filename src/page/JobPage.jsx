// App.js
import React from 'react';
// import Header from '../components/Header/Header';
// import HeroSection from '../components/HeroSection/HeroSection';// CSS toàn cục

import MainLayout from '../layout/MainLayout';
import JobListing from '../components/JobListing/JobListing';

function JobPage() {
  return (
    <MainLayout showHero={false}>
       <JobListing/>
    </MainLayout>
  );
}

export default JobPage;
 