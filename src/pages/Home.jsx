import React from 'react';
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Home.css";

function Home() {
    return (
      <div className="home-container animate-page">
        <Navbar />
        <section className="home-pg">
          <div className="home-content">
            <h2>Hello, I'm</h2>
            <h1><span>Gavin</span></h1>
            <h3 className="animation"><span></span></h3>
            <div className="icons">
              <a href="https://www.instagram.com/gavinmytype/"><i className='bx bxl-instagram-alt'></i></a>
              <a href="https://www.tiktok.com/@gavinmytype?lang=en"><i className='bx bxl-tiktok'></i></a>
              <a href="https://www.youtube.com/@gavinnmytype"><i className='bx bxl-youtube'></i></a>
            </div>
            <div className="btn-container">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=gavinmytype@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-1"
              >
                Contact me
              </a>
            </div>
          </div>
          <div className="ppf-img">
            <Link to="/about">
              <img src="/images/ppf.jpg" alt="" />
            </Link>
          </div>
        </section>
      </div>
    );
  }
  
  export default Home;
