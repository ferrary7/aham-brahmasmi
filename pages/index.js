import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductSlider from '../components/ProductSlider';
import Footer from '../components/Footer';

export default function Home() {
  // Use 4 distinct products for the cosmic collection; include the newly added front-no-bg image
  const products = [
    {
      id: 1,
      name: "Sacred Hoodie",
      price: "$79.99",
      image: "/assets/marce-no-bg.png",
      alt: "Sacred Hoodie with cosmic design"
    },
    {
      id: 2,
      name: "Cosmic Tee",
      price: "$39.99",
      image: "/assets/mesha-no-bg.png",
      alt: "Cosmic Tee featuring mystical patterns"
    },
    {
      id: 3,
      name: "Mandala Art Print",  
      price: "$24.99",
      image: "/assets/tula-no-bg.png",
      alt: "Beautiful Mandala Art Print"
    },
    {
      id: 4,
      name: "Front Poster",
      price: "$29.99",
      image: "/assets/front-no-bg.png",
      alt: "Front art print with transparent background"
    }
  ];

  return (
    <>
      <Head>
        <title>Aham Brahmasmi - Born Once, Designed Once</title>
        <meta name="description" content="Cosmic Merchandise crafted uniquely for your soul" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/favicon-16x16.png" />
      </Head>

      <Header />
      
      <main>
        <Hero />
        
        {/* The Story Section */}
        <section style={{
          backgroundColor: 'var(--color-bg)',
          padding: '100px 0',
          position: 'relative'
        }}>
          <div className="container">
            <h2 className="gold-foil" style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              textAlign: 'center',
              marginBottom: '40px',
              fontWeight: 'bold'
            }}>
              The Story of Aham BRAHMASMI ■
            </h2>
            
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              lineHeight: '1.8',
              color: 'var(--color-text)',
              fontSize: '1.1rem'
            }}>
              <p style={{ marginBottom: '30px' }}>
                At <span className="gold-foil">Aham BRAHMASMI ■</span>, we believe every individual carries a unique cosmic signature – a blend of astrology, mythology, and energy that makes you who you are.
              </p>
              <p style={{ marginBottom: '30px' }}>
                Our mission is to transform that uniqueness into personalized merchandise – clothing, accessories, and art – designed exclusively for you, based on your birthdate, zodiac, and spiritual essence.
              </p>
              <p style={{ marginBottom: '30px' }}>
                We don't just make products, we create symbols of self-realization. Because "Aham Brahmasmi" means "I am the Universe. The Universe is within me."
              </p>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          padding: '100px 0',
          position: 'relative'
        }}>
          <div className="container">
            <h2 className="gold-foil" style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              textAlign: 'center',
              marginBottom: '60px',
              fontWeight: 'bold'
            }}>
              How It Works
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Step 1 */}
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '12px',
                border: '1px solid var(--color-gold)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'var(--color-gold)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-bg)'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: 'var(--color-gold)',
                  marginBottom: '15px',
                  fontWeight: '600'
                }}>
                  Share Your Cosmic Details
                </h3>
                <p style={{
                  color: 'var(--color-text)',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  Date of Birth, Time of Birth, Zodiac Sign.
                </p>
              </div>
              
              {/* Step 2 */}
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '12px',
                border: '1px solid var(--color-gold)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'var(--color-gold)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-bg)'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: 'var(--color-gold)',
                  marginBottom: '15px',
                  fontWeight: '600'
                }}>
                  We Design Your Pattern
                </h3>
                <p style={{
                  color: 'var(--color-text)',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  Inspired by Indian mythology & astrology, unique mandala & symbolic art, we create one-of-a-kind design in bringing it back to you in 24 hours.
                </p>
              </div>
              
              {/* Step 3 */}
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '12px',
                border: '1px solid var(--color-gold)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'var(--color-gold)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-bg)'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: 'var(--color-gold)',
                  marginBottom: '15px',
                  fontWeight: '600'
                }}>
                  Wear Your Cosmic Identity
                </h3>
                <p style={{
                  color: 'var(--color-text)',
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  Printed on premium merchandise, delivered to your doorstep, a design made only for you.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Cosmic Collection Slider */}
        <section id="cosmic-collection" style={{
          backgroundColor: 'var(--color-bg)',
          padding: '100px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="container">
            <h2 className="gold-foil" style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              textAlign: 'center',
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              Cosmic Collection
            </h2>
            <p style={{
              textAlign: 'center',
              color: 'var(--color-muted)',
              marginBottom: '60px',
              maxWidth: '600px',
              margin: '0 auto 60px'
            }}>
              Discover sacred artifacts crafted for your cosmic journey
            </p>

            <ProductSlider products={products} />

            <div style={{ textAlign: 'center', marginTop: '80px' }}>
              <a href="/shop" className="btn-gold" style={{
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                EXPLORE ALL PRODUCTS
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}