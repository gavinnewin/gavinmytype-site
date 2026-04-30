import { useRef, useState } from 'react';
import "../styles/Home.css";
import BrandsCarousel from "../components/BrandsCarousel";

function Home() {
  const clickTimesRef = useRef([]);
  const [showLogin, setShowLogin] = useState(false);

  const REQUIRED_CLICKS = 5;
  const THRESHOLD_MS = 2000;

  const handleSecretClick = () => {
    const now = Date.now();
    clickTimesRef.current = clickTimesRef.current.filter((t) => now - t < THRESHOLD_MS);
    clickTimesRef.current.push(now);
    if (clickTimesRef.current.length >= REQUIRED_CLICKS) {
      clickTimesRef.current = [];
      setShowLogin(true);
    }
  };

  return (
    <div className="home-container animate-page">
      <section className="home-pg">
        <div className="home-content">
          <p className="home-hello">Hello, I'm</p>
          <h1><span>Gavin</span></h1>
          <h3 className="animation"><span></span></h3>

          <div className="icons">
            <a href="https://www.instagram.com/gavinmytype/" aria-label="Instagram">
              <i className="bx bxl-instagram-alt" />
            </a>
            <a href="https://www.tiktok.com/@gavinmytype?lang=en" aria-label="TikTok">
              <i className="bx bxl-tiktok" />
            </a>
            <a href="https://www.youtube.com/@gavinnmytype" aria-label="YouTube">
              <i className="bx bxl-youtube" />
            </a>
          </div>

          <div className="btn-container">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=gavinmytype@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact me
            </a>
          </div>
        </div>

        <div className="ppf-img" onClick={handleSecretClick}>
          <img src="/images/ppf.jpg" alt="Gavin" />
        </div>
      </section>

      <div className="brands-wrap">
        <BrandsCarousel />
      </div>

      {showLogin && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h3>Admin Login</h3>
            <input type="password" placeholder="Admin password" />
            <button>Login</button>
            <button className="close-btn" onClick={() => setShowLogin(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
