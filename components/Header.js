import { useState } from 'react';

export default function Header({ cartCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <a href="/" className="brand-link" onClick={closeMenu}>
            <img 
              src="/assets/logo.png" 
              alt="Aham Brahmasmi Logo" 
              className="brand-logo"
            />
            <span className="brand-title gold-foil">AHAM BRAHMASMI</span>
          </a>
          <span className="brand-sub">I AM THE UNIVERSE</span>
        </div>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <a href="/shop" className="nav-link" onClick={closeMenu}>Shop</a>
          <a href="/request-your-own-design" className="nav-link" onClick={closeMenu}>Custom Design</a>
          <a href="/#how-it-works" className="nav-link" onClick={closeMenu}>How It Works</a>
          <a href="/cart" className="nav-link cart-link" onClick={closeMenu}>
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </a>
        </nav>

        {/* Overlay for mobile menu */}
        {isMenuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
      </div>

      <style jsx>{`
        .header-inner {
          position: relative;
        }

        .cart-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }

        .cart-link:hover {
          color: #b37d0b;
        }

        .cart-link:hover .cart-icon {
          filter: grayscale(0%) sepia(100%) saturate(200%) hue-rotate(30deg) brightness(1.2);
        }
        
        .cart-icon {
          font-size: 1.2rem;
        }
        
        .cart-count {
          background: var(--color-gold);
          color: var(--color-black);
          font-size: 0.75rem;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 50%;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        /* Hamburger Menu Styles */
        .hamburger {
          display: none;
          flex-direction: column;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 1001;
        }

        .hamburger span {
          display: block;
          width: 25px;
          height: 3px;
          background: var(--color-gold);
          margin: 3px 0;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Navigation Overlay */
        .nav-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .hamburger {
            display: flex;
          }

          .nav {
            position: fixed;
            top: 0;
            right: -100%;
            width: 280px;
            height: 100vh;
            background: var(--color-bg);
            border-left: 1px solid rgba(212, 160, 23, 0.3);
            flex-direction: column;
            align-items: flex-start;
            padding: 80px 30px 30px;
            transition: right 0.3s ease;
            z-index: 1000;
            backdrop-filter: blur(10px);
          }

          .nav-open {
            right: 0;
          }

          .nav-overlay {
            display: block;
          }

          .nav-link {
            width: 100%;
            padding: 15px 0;
            border-bottom: 1px solid rgba(212, 160, 23, 0.1);
            font-size: 1.1rem;
            text-align: left;
          }

          .nav-link:last-child {
            border-bottom: none;
          }

          .cart-link {
            justify-content: flex-start;
            margin-top: 20px;
            padding: 15px 0;
            border-top: 1px solid rgba(212, 160, 23, 0.3);
          }

          /* Prevent body scroll when menu is open */
          :global(body.menu-open) {
            overflow: hidden;
          }
        }

        /* Tablet Styles */
        @media (max-width: 1024px) and (min-width: 769px) {
          .nav-link {
            font-size: 0.9rem;
            padding: 0 12px;
          }
        }
      `}</style>
    </header>
  );
}