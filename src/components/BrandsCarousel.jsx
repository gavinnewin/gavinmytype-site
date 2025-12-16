import React from 'react';
import '../styles/BrandsCarousel.css';

// Replace these with your real logo paths and alt text
const brands = [
  { src: '/images/brands/logo1.png', alt: 'Brand 1' },
  { src: '/images/brands/logo2.png', alt: 'Brand 2' },
  { src: '/images/brands/logo3.png', alt: 'Brand 3', scale: 1.8},
  { src: '/images/brands/logo4.png', alt: 'Brand 4' , scale: 1.4},
  { src: '/images/brands/logo5.png', alt: 'Brand 5' , scale: 1.5 },
  { src: '/images/brands/logo6.png', alt: 'Brand 6', scale: 1.8},
  { src: '/images/brands/logo7.png', alt: 'Brand 7' },
];

const BrandsCarousel = () => {
  // Duplicate the brands for seamless infinite animation
  const items = [...brands, ...brands];
  return (
    <div className="brands-section">
      <p className="logo-text">Trusted by creatives, entrepreneurs, and businesses</p>
      <div className="logo-container">
        <div className="logo-wrapper">
          {items.map((brand, idx) => (
            <div className="logo-item" key={idx}>
               <img className="brand-logo" src={brand.src} alt={brand.alt} style={{ transform: `scale(${brand.scale || 1})` }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandsCarousel;
  