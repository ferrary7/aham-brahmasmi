export default function Hero() {
  return (
    <section className="hero">
      <div className="mandala-bg"></div>

      <div className="container hero-inner">
        <h1 className="hero-title gold-foil">BORN ONCE</h1>
        <h1 className="hero-title gold-foil">DESIGNED ONCE</h1>

        <p className="hero-sub">Cosmic Merchandise crafted uniquely for your soul.</p>

        <div className="hero-ctas">
          <a href="/shop" className="btn-gold-outline" style={{
            background: 'transparent',
            color: 'var(--color-gold)',
            border: '2px solid var(--color-gold)',
            padding: '14px 28px',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            SHOP NOW
          </a>
          <a href="/shop?highlight=custom-design" className="btn-gold">CUSTOM DESIGN</a>
        </div>
      </div>
      <div className="hero-overlay" />
    </section>
  );
}