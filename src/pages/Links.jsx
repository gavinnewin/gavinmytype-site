import React from 'react';
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Links.css";

function Links() {
  return (
    <div className="links-container animate-page">
      <Navbar />
      <div className="gradient wrapper">
        <div className="diagonal-gradient-line"></div>
      </div>

      <div className="pfp-container">
        <div className="pfp-box">
          <img src="/images/ppf.jpg" className="pfp-links" alt="Profile" />
          <h1 className="h1-name">gavinmytype</h1>
          <p className="location"><i className="fa-solid fa-location-dot"></i> bay area</p>
          <div className="email-button-container">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=gavinmytype@gmail.com" className="email-button">
              <i className='bx bx-envelope'><br /></i> Email
            </a>
          </div>
          <div className="social-icons">
            <a href="https://www.youtube.com/@gavinnmytype" className="ig-link"><img src="/images/youtube.svg" alt="YouTube" /></a>
            <a href="https://www.tiktok.com/@gavinmytype?lang=en" className="tt-link"><img src="/images/tiktok-dark.svg" alt="TikTok" /></a>
            <a href="https://instagram.com/gavinmytype" className="yt-link"><img src="/images/instagram.svg" alt="Instagram" /></a>
            <a href="https://open.spotify.com/user/gavinnguyen2002" className="spot-link"><img src="/images/spotify.svg" alt="Spotify" /></a>
            <a href="https://x.com/gavinmytype" className="x-link"><img src="/images/x-dark.svg" alt="X" /></a>
            <a href="https://twitch.tv/gavinmytype" className="twitch-link"><img src="/images/twitch.svg" alt="Twitch" /></a>
          </div>
        </div>
      </div>

      {/* Newest Links Section */}
      <div id="newestLinks">
        <h2 className="links-h2">Newest Links</h2>
        <div className="section">
          <div className="links-container">
            {/* Dynamically generated links will be added here */}
          </div>
        </div>
      </div>

      {/* Storefront/Wishlist Section */}
      <div id="storefront">
        <h2 className="links-h2">Storefront/Wishlist</h2>
        <div className="section">
          <div className="links-container">
            {/* Dynamically generated links will be added here */}
          </div>
        </div>
      </div>

      {/* Keyboard Websites Section */}
      <div id="keyboardWebsites">
        <h2>Keyboard Websites</h2>
        <div className="section">
          <div className="links-container">
            {/* Dynamically generated links will be added here */}
          </div>
        </div>
      </div>

      {/* Rings Section */}
      <div id="rings">
        <h2>Rings</h2>
        <div className="section">
          <div className="links-container">
            {/* Dynamically generated links will be added here */}
          </div>
        </div>
      </div>

      {/* Keyboard Parts Section */}
      <div id="keyboardParts">
        <h2>Keyboard Parts</h2>
        <div className="section">
          <div className="links-container">
            {/* Dynamically generated links will be added here */}
          </div>
        </div>
      </div>

      {/* Product Links Section */}
      <div id="productLinks">
        <h2>Product Links</h2>
        <div className="section">
          <div className="links-container">
            {/* Dynamically generated links will be added here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Links;
  