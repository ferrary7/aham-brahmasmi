export default function Hero() {
  const scrollToCollection = () => {
    const collectionSection = document.getElementById('cosmic-collection');
    if (collectionSection) {
      collectionSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="hero">
      <div className="mandala-bg"></div>

      <div className="container hero-inner">
        <h1 className="hero-title gold-foil">BORN ONCE</h1>
        <h1 className="hero-title gold-foil">DESIGNED ONCE</h1>

        <p className="hero-sub">Cosmic Merchandise crafted uniquely for your soul.</p>

        <div className="hero-ctas">
          <button onClick={scrollToCollection} className="btn-gold-outline" style={{
            background: 'transparent',
            color: 'var(--color-gold)',
            border: '2px solid var(--color-gold)',
            padding: '14px 28px',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            DISCOVER YOUR DESIGN
          </button>
          <a href="/shop" className="btn-gold">SHOP NOW</a>
        </div>
      </div>
      <div className="hero-overlay" />
    </section>
  );
}