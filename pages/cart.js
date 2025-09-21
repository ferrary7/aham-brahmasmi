import Head from 'next/head';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { 
    items, 
    itemCount, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    calculateTotals 
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const totals = calculateTotals();

  const handleQuantityChange = (productId, size, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size);
    } else {
      updateQuantity(productId, size, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsLoading(true);
    try {
      // Redirect to checkout page
      window.location.href = '/checkout';
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error proceeding to checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cart - Aham Brahmasmi</title>
        <meta name="description" content="Review your cosmic collection before checkout" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/favicon-16x16.png" />
      </Head>

      <Header cartCount={itemCount} />
      
      <main>
        {/* Hero Section */}
        <section style={{
          background: 'var(--color-bg)',
          padding: '120px 20px 60px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background mandala */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            backgroundImage: 'url("/assets/mandala.svg")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.05,
            animation: 'mandala-rotate 60s linear infinite',
            zIndex: 1
          }} />
          
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <h1 className="gold-foil" style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              marginBottom: '20px',
              fontFamily: 'Cinzel, serif',
              fontWeight: 'bold'
            }}>
              Your Cosmic Cart
            </h1>
            <p style={{
              color: 'var(--color-muted)',
              fontSize: '1.1rem',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {items.length > 0 
                ? `${itemCount} sacred items awaiting your cosmic journey`
                : 'Your cart is empty. Discover the cosmic collection.'
              }
            </p>
          </div>
        </section>

        {/* Cart Content */}
        <section style={{
          background: 'var(--color-bg)',
          padding: '40px 20px 80px',
          minHeight: '400px'
        }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            {items.length === 0 ? (
              /* Empty Cart */
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: 'var(--color-muted)'
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '20px',
                  opacity: 0.3
                }}>
                  🛒
                </div>
                <h3 style={{ 
                  marginBottom: '16px', 
                  fontSize: '1.5rem',
                  color: 'var(--color-text)'
                }}>
                  Your cart is empty
                </h3>
                <p style={{ marginBottom: '30px' }}>
                  Discover our cosmic collection and find items that resonate with your soul.
                </p>
                <a 
                  href="/shop" 
                  style={{
                    display: 'inline-block',
                    padding: '14px 28px',
                    background: 'var(--color-gold)',
                    color: 'var(--color-black)',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  EXPLORE PRODUCTS
                </a>
              </div>
            ) : (
              /* Cart with Items */
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 400px',
                gap: '40px',
                '@media (max-width: 1024px)': {
                  gridTemplateColumns: '1fr',
                  gap: '30px'
                }
              }}>
                {/* Cart Items */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid rgba(212, 160, 23, 0.2)'
                  }}>
                    <h2 style={{
                      color: 'var(--color-gold)',
                      fontSize: '1.5rem',
                      fontFamily: 'Cinzel, serif',
                      margin: 0
                    }}>
                      Cart Items ({itemCount})
                    </h2>
                    <button
                      onClick={clearCart}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(212, 160, 23, 0.3)',
                        color: 'var(--color-muted)',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = 'rgba(212, 160, 23, 0.6)';
                        e.target.style.color = 'var(--color-text)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'rgba(212, 160, 23, 0.3)';
                        e.target.style.color = 'var(--color-muted)';
                      }}
                    >
                      Clear Cart
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {items.map((item) => (
                      <CartItem
                        key={`${item.id}-${item.size}`}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={() => removeFromCart(item.id, item.size)}
                      />
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div style={{
                  background: 'rgba(11, 11, 11, 0.8)',
                  border: '1px solid rgba(212, 160, 23, 0.2)',
                  borderRadius: '16px',
                  padding: '30px',
                  backdropFilter: 'blur(10px)',
                  height: 'fit-content',
                  position: 'sticky',
                  top: '20px'
                }}>
                  <h3 style={{
                    color: 'var(--color-gold)',
                    fontSize: '1.3rem',
                    fontFamily: 'Cinzel, serif',
                    marginBottom: '20px'
                  }}>
                    Order Summary
                  </h3>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      color: 'var(--color-text)'
                    }}>
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      color: 'var(--color-muted)',
                      fontSize: '0.9rem'
                    }}>
                      <span>GST (5%)</span>
                      <span>₹{totals.tax}</span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      color: 'var(--color-muted)',
                      fontSize: '0.9rem'
                    }}>
                      <span>Shipping</span>
                      <span>
                        {totals.shipping === 0 ? (
                          <span style={{ color: 'var(--color-gold)' }}>
                            {totals.hasDigitalProducts ? 'DIGITAL DELIVERY' : 'FREE'}
                          </span>
                        ) : (
                          `₹${totals.shipping}`
                        )}
                      </span>
                    </div>

                    {totals.shipping > 0 ? (
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-muted)',
                        fontStyle: 'italic',
                        marginBottom: '12px'
                      }}>
                        Free shipping on orders above ₹1499
                      </div>
                    ) : totals.hasDigitalProducts ? (
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-gold)',
                        fontStyle: 'italic',
                        marginBottom: '12px'
                      }}>
                        Digital products delivered via email
                      </div>
                    ) : null}
                    
                    <div style={{
                      borderTop: '1px solid rgba(212, 160, 23, 0.2)',
                      paddingTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'var(--color-gold)'
                    }}>
                      <span>Total</span>
                      <span>₹{totals.total}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || items.length === 0}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: items.length > 0 ? 'var(--color-gold)' : '#666',
                      color: items.length > 0 ? 'var(--color-black)' : '#ccc',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Cinzel, serif'
                    }}
                    onMouseEnter={(e) => {
                      if (items.length > 0) {
                        e.target.style.background = '#c8a617';
                        e.target.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (items.length > 0) {
                        e.target.style.background = 'var(--color-gold)';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {isLoading ? 'Processing...' : 'PROCEED TO CHECKOUT'}
                  </button>

                  <div style={{
                    marginTop: '20px',
                    textAlign: 'center'
                  }}>
                    <a 
                      href="/shop"
                      style={{
                        color: 'var(--color-gold)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        borderBottom: '1px solid transparent',
                        transition: 'border-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-gold)'}
                      onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                    >
                      ← Continue Shopping
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes mandala-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        /* Responsive Styles for Cart Page */
        @media (max-width: 1024px) {
          /* Main grid becomes single column on tablets */
          section div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }

        @media (max-width: 768px) {
          /* Mobile adjustments */
          section {
            padding: 60px 20px 80px !important;
          }

          /* Typography adjustments */
          h1 {
            font-size: 1.8rem !important;
            margin-bottom: 20px !important;
          }

          h2 {
            font-size: 1.2rem !important;
          }

          h3 {
            font-size: 1.1rem !important;
          }

          /* Order summary no longer sticky on mobile */
          div[style*="position: sticky"] {
            position: static !important;
            margin-top: 20px;
            top: auto !important;
          }

          /* Cart header with clear button */
          div[style*="justify-content: space-between"][style*="margin-bottom: 30px"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }

          /* Clear cart button */
          button[style*="background: transparent"][style*="border: 1px solid rgba(212, 160, 23"] {
            align-self: flex-end !important;
          }
        }

        @media (max-width: 480px) {
          /* Extra small screens */
          section {
            padding: 40px 15px 60px !important;
          }

          h1 {
            font-size: 1.6rem !important;
            text-align: center;
          }

          /* Cart header centered on very small screens */
          div[style*="justify-content: space-between"][style*="margin-bottom: 30px"] {
            align-items: center !important;
            text-align: center !important;
          }

          /* Clear cart button full width on very small screens */
          button[style*="background: transparent"][style*="border: 1px solid rgba(212, 160, 23"] {
            width: 100% !important;
            max-width: 200px !important;
            align-self: center !important;
          }

          /* Checkout button full width */
          button[style*="background: linear-gradient(135deg, var(--color-gold)"] {
            width: 100% !important;
            padding: 15px !important;
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </>
  );
}

// Cart Item Component
function CartItem({ item, onQuantityChange, onRemove }) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityUpdate = (newQuantity) => {
    setQuantity(newQuantity);
    onQuantityChange(item.id, item.size, newQuantity);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div style={{
      background: 'rgba(11, 11, 11, 0.6)',
      border: '1px solid rgba(212, 160, 23, 0.2)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      transition: 'border-color 0.3s ease'
    }}>
      {/* Product Image */}
      <div style={{
        flexShrink: 0,
        width: '80px',
        height: '80px'
      }}>
        <img
          src={item.image}
          alt={item.alt || item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      </div>

      {/* Product Details */}
      <div style={{ flex: 1 }}>
        <h4 style={{
          color: 'var(--color-gold)',
          fontSize: '1.1rem',
          margin: '0 0 8px 0',
          fontFamily: 'Cinzel, serif'
        }}>
          {item.name}
        </h4>
        
        <div style={{
          color: 'var(--color-muted)',
          fontSize: '0.9rem',
          marginBottom: '8px'
        }}>
          Size: {item.size}
        </div>
        
        <div style={{
          color: 'var(--color-text)',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          ₹{item.price} each
        </div>
      </div>

      {/* Quantity Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0
      }}>
        <button
          onClick={() => handleQuantityUpdate(quantity - 1)}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid rgba(212, 160, 23, 0.3)',
            background: 'transparent',
            color: 'var(--color-text)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease'
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
          −
        </button>
        
        <span style={{
          minWidth: '40px',
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          {quantity}
        </span>
        
        <button
          onClick={() => handleQuantityUpdate(quantity + 1)}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid rgba(212, 160, 23, 0.3)',
            background: 'transparent',
            color: 'var(--color-text)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease'
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
          +
        </button>
      </div>

      {/* Item Total & Remove */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
        flexShrink: 0,
        minWidth: '80px'
      }}>
        <div style={{
          color: 'var(--color-gold)',
          fontSize: '1.1rem',
          fontWeight: '700'
        }}>
          ₹{itemTotal}
        </div>
        
        <button
          onClick={onRemove}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#e74c3c'}
          onMouseLeave={(e) => e.target.style.color = 'var(--color-muted)'}
        >
          Remove
        </button>
      </div>
      
      {/* Cart Item Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          /* Cart item becomes vertical layout on mobile */
          div[style*="display: flex"][style*="gap: 20px"][style*="align-items: center"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
            padding: 15px !important;
          }

          /* Image container centered */
          div[style*="width: 80px"][style*="height: 80px"] {
            width: 60px !important;
            height: 60px !important;
            align-self: center !important;
          }

          /* Product details take full width and center */
          div[style*="flex: 1"] {
            width: 100% !important;
            text-align: center !important;
          }

          /* Product name */
          h4[style*="color: var(--color-gold)"] {
            font-size: 1rem !important;
            text-align: center !important;
          }

          /* Quantity controls centered */
          div[style*="display: flex"][style*="align-items: center"][style*="gap: 12px"] {
            justify-content: center !important;
            width: 100% !important;
          }

          /* Price and remove button in a row */
          div[style*="color: var(--color-gold)"][style*="font-size: 1.1rem"] {
            width: 100% !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }

          /* Remove button */
          button[style*="background: transparent"][style*="border: none"] {
            position: static !important;
            margin-left: auto !important;
          }
        }

        @media (max-width: 480px) {
          /* Quantity control buttons larger for touch */
          button[style*="width: 32px"][style*="height: 32px"] {
            width: 40px !important;
            height: 40px !important;
            font-size: 1.1rem !important;
          }

          /* Product name smaller on very small screens */
          h4[style*="color: var(--color-gold)"] {
            font-size: 0.95rem !important;
          }

          /* Price text adjustment */
          div[style*="color: var(--color-gold)"][style*="font-size: 1.1rem"] {
            font-size: 1rem !important;
          }

          /* Tighter padding on very small screens */
          div[style*="padding: 15px"] {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}