import React, {useState} from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const MainLayout = ({ children, showHero = false, heroContent = null}) => {

  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
       {showHero && heroContent}
      <main className="flex-1 max-w-7xl mx-auto mt-5 w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;