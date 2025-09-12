import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';
// no client-side cart state needed for the simple showcase
import Header from '../components/Header';
import Footer from '../components/Footer';
// showing a simple showcase grid — no ProductCard component required

// ProductSlider-like component but with cards showing price and details
function ProductCardSlider({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showVideoEndText, setShowVideoEndText] = useState(false);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  // Auto-hide text and replay video after 1.5 seconds
  useEffect(() => {
    if (showVideoEndText) {
      const timer = setTimeout(() => {
        setShowVideoEndText(false);
        // Replay the video using ref
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(console.error);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showVideoEndText]);

  // Style based on slot position (pos = -1, 0, 1) for 3 items
  const getItemStyle = (pos) => {
    const absPos = Math.abs(pos);
    if (absPos === 0) {
      // Center slot
      return {
        transform: 'scale(1.1) translateY(-10px)',
        zIndex: 10,
        opacity: 0.9,
      };
    } else {
      // Side slots
      return {
        transform: 'scale(0.85) translateY(10px)',
        zIndex: 5,
        opacity: 0.7,
      };
    }
  };

  // Compute position for a visual slot offset - responsive
  const getPosition = (pos) => {
    // Use responsive spacing based on screen size
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;
      
      if (isSmallMobile) {
        return pos * 100; // Much smaller spacing for very small screens
      } else if (isMobile) {
        return pos * 140; // Smaller spacing for tablets
      }
    }
    return pos * 280; // Desktop spacing
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);
  const getCardOffset = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;
      
      if (isSmallMobile) {
        return 60; // Half of 120px card width
      } else if (isMobile) {
        return 75; // Half of 150px card width
      }
    }
    return 140; // Half of 280px card width (desktop)
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="product-slider-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      {/* Render three visual slots: positions -1, 0, 1 */}
      {[-1, 0, 1].map((pos) => {
        const n = products.length;
        // Map slot position to source product index
        const srcIndex = ((currentIndex + pos) % n + n) % n;
        const product = products[srcIndex];

        return (
          <div
            key={`slot-${pos}`}
            className="slider-item"
            style={{
              position: 'absolute',
              left: '50%',
              marginLeft: `${getPosition(pos) - getCardOffset()}px`,
              transition: 'margin-left 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
              ...getItemStyle(pos),
            }}
          >
            {/* Product Card */}
            <div className="product-card modern slider-card" style={{
              background: 'rgba(11, 11, 11, 0.8)',
              border: '1px solid rgba(212, 160, 23, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <img
                src={product.image}
                alt={product.alt}
                style={{
                  width: '100%',
                  height: '320px',
                  objectFit: 'contain',
                  marginBottom: '16px'
                }}
              />
              <h3 style={{
                color: 'var(--color-gold)',
                fontSize: '1.2rem',
                margin: '0 0 8px 0',
                fontFamily: 'Cinzel, serif'
              }}>
                {product.name}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                margin: '0 0 8px 0'
              }}>
                <p style={{
                  color: 'var(--color-gold)',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  margin: 0,
                }}>
                  {product.price}
                </p>
                <p style={{
                  color: 'var(--color-muted)',
                  fontSize: '1rem',
                  textDecoration: 'line-through',
                  margin: 0,
                  opacity: 0.7
                }}>
                  {product.originalPrice}
                </p>
              </div>
              <p style={{
                color: 'var(--color-muted)',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                margin: 0
              }}>
                {product.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Shop() {
  const [showVideoEndText, setShowVideoEndText] = useState(false);
  const videoRef = useRef(null);

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // Form submission state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    size: '',
    dateOfBirth: '',
    zodiacSign: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide text and replay video after 1.5 seconds (only for desktop)
  useEffect(() => {
    if (showVideoEndText && !isMobile) {
      const timer = setTimeout(() => {
        setShowVideoEndText(false);
        // Replay the video using ref
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(console.error);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showVideoEndText, isMobile]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/submit-design-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage('🌟 Thank you for connecting with us! We will design your unique cosmic creation and send it to your email within 24 hours. Get ready to wear your cosmic identity! ✨');
        // Reset form
        setFormData({
          name: '',
          email: '',
          size: '',
          dateOfBirth: '',
          zodiacSign: '',
          address: ''
        });
      } else {
        setSubmitMessage(data.message || 'Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Three showcase items only — no cart or purchasing UI
  const products = [
    {
      id: 1,
      name: "Sacred Hoodie",
      originalPrice: "Rs. 1299",
      price: "Rs. 799",
      image: "/assets/marce-no-bg.png",
      alt: "Personalised Hoodie with cosmic design",
      description: "Premium cotton hoodie featuring intricate mandala patterns."
    },
    {
      id: 2,
      name: "Cosmic Hoodie",
      originalPrice: "Rs. 1299",
      price: "Rs. 799",
      image: "/assets/mesha-no-bg.png",
      alt: "Cosmic Tee featuring mystical patterns",
      description: "Comfortable organic cotton t-shirt with celestial designs."
    },
    {
      id: 3,
      name: "Mandala Art Print",
      originalPrice: "Rs. 1299",
      price: "Rs. 799",
      image: "/assets/tula-no-bg.png",
      alt: "Beautiful Mandala Art Print",
      description: "High-quality art print of sacred geometry mandala."
    }
  ];

  return (
    <>
      <Head>
        <title>Shop - Aham Brahmasmi</title>
        <meta name="description" content="Discover our collection of cosmic merchandise and spiritual products" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/favicon-16x16.png" />
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes bounceArrow {
            0%, 100% { 
              transform: translateY(0px); 
              opacity: 0.8; 
            }
            50% { 
              transform: translateY(8px); 
              opacity: 1; 
            }
          }
          .bouncing-arrow {
            animation: bounceArrow 2s ease-in-out infinite;
          }
        `}</style>
      </Head>

  <Header />

      <main>
        {/* Shop showcase: 50/50 split - left video, right ProductSlider with mandala background */}
        <section className="shop-showcase">
          {/* Left half: clean elegant video */}
          <div className="video-section">
            {/* Soft ambient background */}
            <div style={{
              position: 'absolute',
              inset: '20%',
              background: 'radial-gradient(circle, rgba(212, 160, 23, 0.06) 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0
            }} />
            
            {/* Minimal video frame */}
            <div style={{ 
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '480px',
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
              borderRadius: '20px',
              border: '1px solid rgba(212, 160, 23, 0.15)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
            }}>
              <video
                ref={videoRef}
                src="/assets/video.mp4"
                playsInline
                autoPlay
                muted
                loop={isMobile}
                onEnded={isMobile ? undefined : () => setShowVideoEndText(true)}
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  borderRadius: '14px',
                  display: showVideoEndText ? 'none' : 'block'
                }}
              />
              {/* Text overlay when video ends */}
              {showVideoEndText && (
                <div className="video-end-overlay" style={{
                  position: 'absolute',
                  inset: '16px',
                  background: 'rgba(0, 0, 0, 0.95)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '40px 20px',
                  animation: 'fadeIn 1s ease-in-out'
                }}>
                  <h2 className="gold-foil" style={{
                    fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                    marginBottom: '16px',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: '600'
                  }}>
                    Discover Your
                  </h2>
                  <h3 className="gold-foil" style={{
                    fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
                    marginBottom: '12px',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: '700'
                  }}>
                    Cosmic Creations
                  </h3>
                  <p style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.9rem',
                    maxWidth: '280px',
                    lineHeight: '1.4',
                    marginBottom: '20px'
                  }}>
                    Sacred designs channeled from the universe
                  </p>
                  
                  {/* Animated arrow pointing down */}
                  <div className="bouncing-arrow" style={{
                    fontSize: '1.5rem',
                    color: 'var(--color-gold)'
                  }}>
                    ↓
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right half: ProductSlider with centered mandala background */}
          <div className="carousel-section">
            {/* Mandala background - centered on right container only */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', backgroundImage: 'url("/assets/mandala.svg")', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.08, animation: 'mandala-rotate 40s linear infinite', zIndex: 1 }} />
            
            {/* ProductCardSlider component */}
            <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
              <ProductCardSlider products={products} />
            </div>
          </div>
        </section>

        {/* Custom Design Request Form */}
        <section className="custom-design-section" style={{
          padding: '80px 20px',
          backgroundColor: 'var(--color-bg)',
          position: 'relative'
        }}>

          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 className="gold-foil" style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                marginBottom: '16px',
                fontFamily: 'Cinzel, serif',
                fontWeight: '700'
              }}>
                Get Your Own Design
              </h2>
              <p style={{
                color: 'var(--color-muted)',
                fontSize: '1.1rem',
                lineHeight: '1.6',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                Fill out the form below and we'll create a personalized cosmic design just for you.
                We'll get back to you via email with your custom creation.
              </p>
            </div>

            <form className="custom-design-form" onSubmit={handleSubmit} style={{
              background: 'rgba(11, 11, 11, 0.8)',
              border: '1px solid rgba(212, 160, 23, 0.2)',
              borderRadius: '16px',
              padding: '40px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Name Field */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--color-gold)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontFamily: 'Cinzel, serif'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 160, 23, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--color-text)',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease',
                      outline: 'none'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--color-gold)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontFamily: 'Cinzel, serif'
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 160, 23, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--color-text)',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease',
                      outline: 'none'
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Size Field */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--color-gold)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontFamily: 'Cinzel, serif'
                  }}>
                    Size
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#181818',
                      border: '1px solid rgba(212, 160, 23, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="">Select your size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                {/* Date of Birth Field */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--color-gold)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontFamily: 'Cinzel, serif'
                  }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 160, 23, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--color-text)',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease',
                      outline: 'none'
                    }}
                  />
                </div>


                {/* Zodiac Sign/Rashi Field */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--color-gold)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontFamily: 'Cinzel, serif'
                  }}>
                    Zodiac Sign / Rashi
                  </label>
                  <select
                    name="zodiacSign"
                    value={formData.zodiacSign}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#181818',
                      border: '1px solid rgba(212, 160, 23, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                    }}
                  >
                    <option value="">Select your zodiac sign</option>
                    <option value="aries">Aries (Mesha)</option>
                    <option value="taurus">Taurus (Vrishabha)</option>
                    <option value="gemini">Gemini (Mithuna)</option>
                    <option value="cancer">Cancer (Karka)</option>
                    <option value="leo">Leo (Simha)</option>
                    <option value="virgo">Virgo (Kanya)</option>
                    <option value="libra">Libra (Tula)</option>
                    <option value="scorpio">Scorpio (Vrishchika)</option>
                    <option value="sagittarius">Sagittarius (Dhanu)</option>
                    <option value="capricorn">Capricorn (Makara)</option>
                    <option value="aquarius">Aquarius (Kumbha)</option>
                    <option value="pisces">Pisces (Meena)</option>
                  </select>
                </div>

                {/* Address Field */}
                <div>
                  <label style={{
                    display: 'block',
                    color: 'var(--color-gold)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    fontFamily: 'Cinzel, serif'
                  }}>
                    Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 160, 23, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--color-text)',
                      fontSize: '1rem',
                      minHeight: '60px',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    placeholder="Enter your full address for delivery"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: isSubmitting ? 'rgba(212, 160, 23, 0.6)' : 'var(--color-gold)',
                    color: 'var(--color-black)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'Cinzel, serif',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    marginTop: '16px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.background = 'var(--color-gold-hover)';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.background = 'var(--color-gold)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Request My Design'}
                </button>

                {/* Success/Error Message */}
                {submitMessage && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: submitMessage.includes('Thank you') 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${submitMessage.includes('Thank you') 
                      ? 'rgba(34, 197, 94, 0.3)' 
                      : 'rgba(239, 68, 68, 0.3)'}`,
                    color: submitMessage.includes('Thank you') 
                      ? '#22c55e' 
                      : '#ef4444',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}>
                    {submitMessage}
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

  {/* No cart summary — this page is a presentation-only showcase */}
      </main>

      <Footer />
    </>
  );
}
