export default function Header({ cartCount = 0 }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <a href="/" className="brand-link">
            <img 
              src="/assets/logo.png" 
              alt="Aham Brahmasmi Logo" 
              className="brand-logo"
            />
            <span className="brand-title gold-foil">AHAM BRAHMASMI</span>
          </a>
          <span className="brand-sub">I AM THE UNIVERSE</span>
        </div>

        <nav className="nav">
          <a href="/shop" className="nav-link">Shop</a>
          <a href="/#how-it-works" className="nav-link">How It Works</a>
        </nav>
      </div>
    </header>
  );
}