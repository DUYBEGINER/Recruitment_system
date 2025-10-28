import React from 'react';
// import Header from '../components/Header/Header';
// import Footer from '../components/Footer';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children, showHero = false, heroContent = null}) => {

  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
       {showHero && heroContent}
      <main className="flex-1 max-w-7xl mx-auto w-full" style={{ paddingTop: showHero ? '0' : '80px' }}>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;