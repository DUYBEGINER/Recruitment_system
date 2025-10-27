// src/pages/Home.jsx
import React from "react";
import MainLayout from "../layout/MainLayout";
import Hero from "../components/Hero";

function Home() {
  const handleSearch = ({ job, region }) => {
    console.log("Tìm kiếm:", { job, region });
    // TODO: điều hướng trang kết quả, ví dụ:
    // navigate(`/jobs?job=${encodeURIComponent(job)}&region=${encodeURIComponent(region)}`)
  };

  return (
    <MainLayout
      showHero={true}
      heroContent={
        <Hero
          onSearch={handleSearch}
          background="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/M%C3%BCnster%2C_LVM%2C_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg/1200px-M%C3%BCnster%2C_LVM%2C_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg"
        />
      }
    >
      <section className="max-w-6xl mx-auto mt-10">
        {/* Các block gợi ý việc làm, categories... */}
      </section>
    </MainLayout>
  );
}

export default Home;
