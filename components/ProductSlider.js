import { useState, useEffect } from 'react';

export default function ProductSlider({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0); // Start with first product for better symmetry
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-rotate with different timing for mobile
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, isMobile ? 1000 : 2500); // 1 second for mobile, 2.5 seconds for desktop

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length, isMobile]);

  // Style based on slot position - responsive for mobile
  const getItemStyle = (pos) => {
    const absPos = Math.abs(pos);

    if (isMobile) {
      // Mobile: only show center item
      if (absPos === 0) {
        return {
          transform: 'scale(1)',
          zIndex: 10,
          opacity: 1,
          filter: 'brightness(1)',
          display: 'block',
        };
      } else {
        return {
          transform: 'scale(0.8)',
          zIndex: 1,
          opacity: 0,
          filter: 'brightness(0.7)',
        };
      }
    }

    // Desktop: original multi-item display
    if (absPos === 0) {
      // Center slot
      return {
        transform: 'scale(1.1) translateY(-10px)',
        zIndex: 10,
        opacity: 1,
        filter: 'brightness(1.1)',
      };
    } else if (absPos === 1) {
      // Adjacent slots
      return {
        transform: 'scale(0.9) translateY(0px)',
        zIndex: 5,
        opacity: 0.8,
        filter: 'brightness(0.9)',
      };
    } else {
      // Far slots
      return {
        transform: 'scale(0.7) translateY(20px)',
        zIndex: 1,
        opacity: 0.5,
        filter: 'brightness(0.7)',
      };
    }
  };

  // Compute position for a visual slot offset - responsive
  const getPosition = (pos) => {
    if (isMobile) {
      return 0; // All items centered on mobile
    }
    const spacing = 220; // px between centers for desktop
    return pos * spacing;
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 1000); // Resume auto-play after 1s
  };

  return (
    <div
      className="product-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '400px' : '500px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Mobile: Simple single image display */}
      {isMobile ? (
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={products[currentIndex].image}
            alt={products[currentIndex].alt}
            style={{
              width: '280px',
              height: '350px',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => window.location.href = '/request-your-own-design'}
          />
        </div>
      ) : (
        /* Desktop: Original carousel */
        <div
          className="slider-container"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[-2, -1, 0, 1, 2].map((pos) => {
            const n = products.length;
            const srcIndex = ((currentIndex + pos) % n + n) % n;
            const product = products[srcIndex];

            return (
              <div
                key={`slot-${pos}`}
                className="slider-item"
                style={{
                  position: 'absolute',
                  left: '50%',
                  marginLeft: `${getPosition(pos) - 140}px`,
                  transition: 'margin-left 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
                  ...getItemStyle(pos),
                }}
              >
                <img
                  src={product.image}
                  alt={product.alt}
                  style={{
                    width: '280px',
                    height: '450px',
                    objectFit: 'cover',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => window.location.href = '/request-your-own-design'}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile dots indicator */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 15
        }}>
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                background: currentIndex === index ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
