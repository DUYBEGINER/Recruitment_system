import React, {useState} from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';


const MainLayout = ({ children }) => {

  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <main className="flex-1 max-w-7xl mx-auto mt-5 w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;