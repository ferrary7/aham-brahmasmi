import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  const { itemCount } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch order details from your backend
    // For now, we'll simulate this with localStorage or query params
    if (orderId) {
      // Simulate order details
      setOrderDetails({
        customerOrderId: orderId,
        status: 'confirmed',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        trackingNumber: `AB${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      });
    }
  }, [orderId]);

  return (
    <>
      <Head>
        <title>Order Successful - Aham Brahmasmi</title>
        <meta name="description" content="Your cosmic journey order has been confirmed" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/favicon-16x16.png" />
      </Head>

      <Header cartCount={itemCount} />
      
      <main>
        <section style={{
          background: 'var(--color-bg)',
          padding: '80px 20px',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="container" style={{ 
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            {/* Success Animation/Icon */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 40px',
              background: 'linear-gradient(135deg, var(--color-gold), #f4d03f)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              animation: 'successPulse 2s ease-in-out infinite alternate'
            }}>
              ✓
            </div>

            <h1 style={{
              color: 'var(--color-gold)',
              fontSize: '2.5rem',
              fontFamily: 'Cinzel, serif',
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              Order Confirmed!
            </h1>

            <p style={{
              color: 'var(--color-text)',
              fontSize: '1.2rem',
              lineHeight: '1.6',
              marginBottom: '40px'
            }}>
              Thank you for your purchase! Your cosmic journey items are being prepared with love and care.
            </p>

            {orderDetails && (
              <div style={{
                background: 'rgba(11, 11, 11, 0.8)',
                border: '1px solid rgba(212, 160, 23, 0.2)',
                borderRadius: '16px',
                padding: '30px',
                backdropFilter: 'blur(10px)',
                marginBottom: '40px',
                textAlign: 'left'
              }}>
                <h3 style={{
                  color: 'var(--color-gold)',
                  fontSize: '1.3rem',
                  fontFamily: 'Cinzel, serif',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  Order Details
                </h3>

                <div style={{
                  display: 'grid',
                  gap: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(212, 160, 23, 0.1)'
                  }}>
                    <span style={{ color: 'var(--color-muted)' }}>Order ID:</span>
                    <span style={{ 
                      color: 'var(--color-gold)', 
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {orderDetails.customerOrderId}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(212, 160, 23, 0.1)'
                  }}>
                    <span style={{ color: 'var(--color-muted)' }}>Status:</span>
                    <span style={{ 
                      color: '#2ecc71', 
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {orderDetails.status}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(212, 160, 23, 0.1)'
                  }}>
                    <span style={{ color: 'var(--color-muted)' }}>Estimated Delivery:</span>
                    <span style={{ 
                      color: 'var(--color-text)', 
                      fontWeight: '500'
                    }}>
                      {new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: 'var(--color-muted)' }}>Tracking Number:</span>
                    <span style={{ 
                      color: 'var(--color-gold)', 
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {orderDetails.trackingNumber}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              background: 'rgba(212, 160, 23, 0.1)',
              border: '1px solid rgba(212, 160, 23, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '40px'
            }}>
              <h4 style={{
                color: 'var(--color-gold)',
                fontSize: '1.1rem',
                marginBottom: '10px',
                fontFamily: 'Cinzel, serif'
              }}>
                What happens next?
              </h4>
              <ul style={{
                color: 'var(--color-text)',
                textAlign: 'left',
                lineHeight: '1.8',
                paddingLeft: '20px'
              }}>
                <li>We'll send you an email confirmation shortly</li>
                <li>Your items will be carefully packaged and shipped</li>
                <li>You'll receive tracking information via email</li>
                <li>Expected delivery within 8-10 business days</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => router.push('/shop')}
                style={{
                  padding: '14px 28px',
                  background: 'var(--color-gold)',
                  color: 'var(--color-black)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Cinzel, serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#c8a617';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--color-gold)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Continue Shopping
              </button>

              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  color: 'var(--color-gold)',
                  border: '2px solid rgba(212, 160, 23, 0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Cinzel, serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--color-gold)';
                  e.target.style.background = 'rgba(212, 160, 23, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(212, 160, 23, 0.3)';
                  e.target.style.background = 'transparent';
                }}
              >
                Go Home
              </button>
            </div>

            <div style={{
              marginTop: '40px',
              padding: '20px',
              background: 'rgba(11, 11, 11, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(212, 160, 23, 0.1)'
            }}>
              <p style={{
                color: 'var(--color-muted)',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                Need help with your order? Contact us at{' '}
                <a 
                  href="mailto:brahmasmi.store@gmail.com"
                  style={{ color: 'var(--color-gold)', textDecoration: 'none' }}
                >
                  brahmasmi.store@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes successPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(212, 160, 23, 0.7);
          }
          100% {
            transform: scale(1.05);
            box-shadow: 0 0 0 20px rgba(212, 160, 23, 0);
          }
        }
      `}</style>
    </>
  );
}