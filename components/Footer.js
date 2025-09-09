export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-bg)',
      padding: '40px 0',
      marginTop: '60px'
    }}>
      <div className="container">
        {/* Gold divider line */}
        <div className="divider"></div>
        
        {/* Footer text */}
        <div style={{
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontSize: '1rem',
          letterSpacing: '1px'
        }}>
          Aham Brahmasmi | I am the Universe. The Universe is within me.
        </div>
      </div>
    </footer>
  );
}