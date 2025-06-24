import React from 'react';
import '../styles/BrandsCarousel.css';

// Replace these with your real logo paths and alt text
const brands = [
  { src: '/images/brands/logo1.jpg', alt: 'Brand 1' },
  { src: '/images/ppf.jpg', alt: 'Brand 2' },
  { src: '/images/ppf.jpg', alt: 'Brand 3' },
  { src: '/images/ppf.jpg', alt: 'Brand 4' },
  { src: '/images/ppf.jpg', alt: 'Brand 5' },
  { src: '/images/ppf.jpg', alt: 'Brand 6' },
  { src: '/images/ppf.jpg', alt: 'Brand 7' },
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
              <div className="logo-text-item">{brand.src}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandsCarousel;
  