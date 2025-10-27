import React from 'react';
import MainLayout from '../layout/MainLayout';
import Hero from '../components/Hero';

function Recruitment(props) {
    return (
        <MainLayout showHero={true} heroContent={
            <Hero
                background="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/M%C3%BCnster%2C_LVM%2C_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg/1200px-M%C3%BCnster%2C_LVM%2C_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg"
            />
        }>
            <div>
                {/* Nội dung của trang tuyển dụng sẽ được đặt ở đây */}
            </div>
        </MainLayout>
    );
}

export default Recruitment;
