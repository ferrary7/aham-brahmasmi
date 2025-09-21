import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const { items: cart, itemCount, addToCart, calculateTotals } = useCart();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightCustom, setHighlightCustom] = useState(false);
  const router = useRouter();

  // Check for highlight parameter on mount
  useEffect(() => {
    if (router.query.highlight === 'custom-design') {
      setHighlightCustom(true);
      // Auto-scroll to custom design after a short delay
      setTimeout(() => {
        const customElement = document.getElementById('custom-design-product');
        if (customElement) {
          customElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      
      // Remove highlight after 5 seconds
      setTimeout(() => {
        setHighlightCustom(false);
      }, 5000);
    }
  }, [router.query]);

  // Extended product catalog with more details for e-commerce
  const products = [
    {
      id: 'custom-design',
      name: "Custom Design Ideas",
      basePrice: 50,
      image: "/assets/custom-tee.png",
      alt: "Custom Design Ideas - Create your own cosmic design",
      category: "custom",
      description: "Share your cosmic design ideas and we'll create a unique piece just for you. Upload inspiration images and describe your vision during checkout.",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      inStock: true,
      featured: true,
      isCustom: true,
      customOptions: [
        {
          type: 'tee',
          name: 'Custom Tee',
          price: 799,
          originalPrice: 1199,
          description: 'Custom design on premium organic cotton t-shirt',
          image: '/assets/custom-tee.png'
        },
        {
          type: 'hoodie', 
          name: 'Custom Hoodie',
          price: 1499,
          originalPrice: 2099,
          description: 'Custom design on premium cotton hoodie',
          image: '/assets/custom-hoodie.png'
        }
      ]
    },
    {
      id: 1,
      name: "Sacred Hoodie",
      price: 1299,
      originalPrice: 1999,
      image: "/assets/marce-no-bg.png",
      alt: "Sacred Hoodie with cosmic design",
      category: "apparel",
      description: "Premium cotton hoodie featuring intricate mandala patterns and cosmic designs. Perfect for meditation and daily wear.",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      inStock: true,
      featured: true
    },
    {
      id: 2,
      name: "Cosmic Tee",
      price: 749,
      originalPrice: 999,
      image: "/assets/cosmic-lion.png",
      alt: "Cosmic Tee featuring mystical patterns",
      category: "apparel",
      description: "Comfortable organic cotton t-shirt with celestial designs inspired by ancient wisdom.",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      inStock: true,
      featured: true
    },
    {
      id: 3,
      name: "Mandala Art Print",
      price: 1299,
      originalPrice: 1999,
      image: "/assets/tula-no-bg.png",
      alt: "Beautiful Mandala Art Print",
      category: "art",
      description: "High-quality illustration of sacred geometry over our hoodie. Perfect for postive winter.",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      inStock: true,
      featured: false
    },
    {
      id: 4,
      name: "Cosmic Tank-Top",
      price: 749,
      originalPrice: 999,
      image: "/assets/tank-top.png",
      alt: "Beautiful Tank Top",
      category: "art",
      description: "High-quality tank top featuring sacred geometry mandala. Perfect for warm weather.",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      inStock: true,
      featured: false
    },
    {
      id: 5,
      name: "Cosmic Wall Paper",
      price: 99,
      originalPrice: 199,
      image: "/assets/cosmic-wallpaper.png",
      alt: "Beautiful Wall Paper",
      category: "art",
      description: "Get high-quality wall paper designs of sacred geometry mandala. Perfect for meditation spaces.",
      sizes: ["3:2", "1:1"],
      inStock: true,
      featured: false
    },
    {
      id: 6,
      name: "Cosmic Wall Paper",
      price: 0,
      originalPrice: 199,
      image: "/assets/cosmic-wallpaper.png",
      alt: "Beautiful Wall Paper",
      category: "art",
      description: "Get high-quality wall paper designs of sacred geometry mandala. Perfect for meditation spaces.",
      sizes: ["3:2", "1:1"],
      inStock: true,
      featured: false
    }
  ];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesFilter = filter === 'all' || product.category === filter;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      // Always put custom design first
      if (a.id === 'custom-design') return -1;
      if (b.id === 'custom-design') return 1;
      
      // Then apply the selected sorting
      switch (sortBy) {
        case 'price-low':
          const priceA = a.isCustom && a.customOptions ? a.customOptions[0].price : a.price;
          const priceB = b.isCustom && b.customOptions ? b.customOptions[0].price : b.price;
          return priceA - priceB;
        case 'price-high':
          const priceHighA = a.isCustom && a.customOptions ? a.customOptions[0].price : a.price;
          const priceHighB = b.isCustom && b.customOptions ? b.customOptions[0].price : b.price;
          return priceHighB - priceHighA;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Get cart total count
  const getCartCount = () => {
    return itemCount;
  };

  return (
    <>
      <Head>
        <title>Shop - Aham Brahmasmi</title>
        <meta name="description" content="Discover our collection of cosmic merchandise and spiritual products" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/favicon-16x16.png" />
      </Head>

      <Header cartCount={getCartCount()} />
      
      <main>
        {/* Hero Section */}
        <section style={{
          background: 'var(--color-bg)',
          padding: '120px 20px 80px',
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
            width: '600px',
            height: '600px',
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
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              marginBottom: '20px',
              fontFamily: 'Cinzel, serif',
              fontWeight: 'bold'
            }}>
              Cosmic Collection
            </h1>
            <p style={{
              color: 'var(--color-muted)',
              fontSize: '1.2rem',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: '1.6'
            }}>
              Discover sacred artifacts crafted for your cosmic journey. Each piece carries the energy of the universe.
            </p>
          </div>
        </section>

        {/* Filters and Search */}
        <section style={{
          background: 'rgba(11, 11, 11, 0.8)',
          padding: '40px 20px',
          borderBottom: '1px solid rgba(212, 160, 23, 0.2)'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(212, 160, 23, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(11, 11, 11, 0.9)',
                    border: '1px solid rgba(212, 160, 23, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="custom">Custom Design</option>
                  <option value="apparel">Apparel</option>
                  <option value="art">Art Prints</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(11, 11, 11, 0.9)',
                    border: '1px solid rgba(212, 160, 23, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section style={{
          background: 'var(--color-bg)',
          padding: '80px 20px'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  isHighlighted={highlightCustom && product.id === 'custom-design'}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: 'var(--color-muted)'
              }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>No products found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </section>

        {/* Cart Summary (if items in cart) */}
        {cart.length > 0 && (
          <section style={{
            background: 'rgba(212, 160, 23, 0.1)',
            padding: '20px',
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(212, 160, 23, 0.3)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            minWidth: '280px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ color: 'var(--color-gold)', fontWeight: '600' }}>
                Cart ({getCartCount()} items)
              </span>
              <span style={{ color: 'var(--color-text)', fontWeight: '700' }}>
                ₹{calculateTotals().subtotal}
              </span>
            </div>
            <button
              onClick={() => window.location.href = '/cart'}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--color-gold)',
                color: 'var(--color-black)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              View Cart & Checkout
            </button>
          </section>
        )}
      </main>

      <Footer />

      <style jsx>{`
        @keyframes mandala-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(212, 160, 23, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(212, 160, 23, 0.6);
          }
        }
      `}</style>
    </>
  );
}

// Product Card Component
function ProductCard({ product, onAddToCart, isHighlighted = false }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedCustomOption, setSelectedCustomOption] = useState(
    product.isCustom && product.customOptions ? product.customOptions[0] : null
  );

  const handleAddToCart = () => {
    if (product.isCustom && selectedCustomOption) {
      // For custom designs, create a modified product with selected option
      const customProduct = {
        ...product,
        name: selectedCustomOption.name,
        price: selectedCustomOption.price,
        originalPrice: selectedCustomOption.originalPrice,
        customType: selectedCustomOption.type,
        description: selectedCustomOption.description
      };
      onAddToCart(customProduct, selectedSize);
    } else {
      onAddToCart(product, selectedSize);
    }
    
    // Show confirmation
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-gold);
      color: var(--color-black);
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    const productName = product.isCustom && selectedCustomOption ? selectedCustomOption.name : product.name;
    toast.textContent = `Added ${productName} (${selectedSize}) to cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Calculate discount based on selected option for custom products
  const currentPrice = product.isCustom && selectedCustomOption ? selectedCustomOption.price : product.price;
  const currentOriginalPrice = product.isCustom && selectedCustomOption ? selectedCustomOption.originalPrice : product.originalPrice;
  const discountPercentage = currentOriginalPrice ? Math.round((1 - currentPrice / currentOriginalPrice) * 100) : 0;

  return (
    <div 
      id={product.id === 'custom-design' ? 'custom-design-product' : undefined}
      style={{
        background: isHighlighted ? 'rgba(212, 160, 23, 0.15)' : 'rgba(11, 11, 11, 0.8)',
        border: isHighlighted ? '2px solid var(--color-gold)' : '1px solid rgba(212, 160, 23, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.3s ease, border-color 0.3s ease, background 0.3s ease',
        cursor: 'pointer',
        boxShadow: isHighlighted ? '0 0 30px rgba(212, 160, 23, 0.3)' : 'none',
        animation: isHighlighted ? 'pulse 2s infinite' : 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = 'rgba(212, 160, 23, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isHighlighted ? 'var(--color-gold)' : 'rgba(212, 160, 23, 0.2)';
      }}>
      
      {/* Product Image */}
      <div style={{
        position: 'relative',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {product.featured && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'var(--color-gold)',
            color: 'var(--color-black)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: '600',
            zIndex: 2
          }}>
            FEATURED
          </div>
        )}
        
        {discountPercentage > 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#e74c3c',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: '600',
            zIndex: 2
          }}>
            -{discountPercentage}%
          </div>
        )}
        
        <img
          src={product.isCustom && selectedCustomOption ? selectedCustomOption.image : product.image}
          alt={product.isCustom && selectedCustomOption ? `${selectedCustomOption.name} - ${product.alt}` : product.alt}
          style={{
            width: '100%',
            maxWidth: '250px',
            height: '300px',
            objectFit: 'contain',
            borderRadius: '8px',
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>

      {/* Product Info */}
      <div>
        <h3 style={{
          color: 'var(--color-gold)',
          fontSize: '1.3rem',
          margin: '0 0 8px 0',
          fontFamily: 'Cinzel, serif',
          fontWeight: '600'
        }}>
          {product.name}
        </h3>
        
        <p style={{
          color: 'var(--color-muted)',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          margin: '0 0 16px 0'
        }}>
          {product.isCustom && selectedCustomOption ? selectedCustomOption.description : product.description}
        </p>

        {/* Custom Design Options */}
        {product.isCustom && product.customOptions && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Choose Type:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {product.customOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => setSelectedCustomOption(option)}
                  style={{
                    padding: '12px 8px',
                    background: selectedCustomOption?.type === option.type ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCustomOption?.type === option.type ? 'var(--color-black)' : 'var(--color-text)',
                    border: '1px solid rgba(212, 160, 23, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCustomOption?.type !== option.type) {
                      e.target.style.background = 'rgba(212, 160, 23, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCustomOption?.type !== option.type) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  <div style={{ marginBottom: '4px' }}>
                    {option.name.replace('Custom ', '')}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    ₹{option.price}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <span style={{
            color: 'var(--color-gold)',
            fontSize: '1.4rem',
            fontWeight: '700'
          }}>
            ₹{currentPrice}
          </span>
          {currentOriginalPrice && currentOriginalPrice > currentPrice && (
            <span style={{
              color: 'var(--color-muted)',
              fontSize: '1rem',
              textDecoration: 'line-through'
            }}>
              ₹{currentOriginalPrice}
            </span>
          )}
        </div>

        {/* Size Selector */}
        {product.sizes.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: 'var(--color-text)',
              fontSize: '0.9rem',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Size:
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 160, 23, 0.3)',
                borderRadius: '6px',
                color: 'var(--color-text)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {product.sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          style={{
            width: '100%',
            padding: '14px',
            background: product.inStock ? 'var(--color-gold)' : '#666',
            color: product.inStock ? 'var(--color-black)' : '#ccc',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: product.inStock ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            fontFamily: 'Cinzel, serif'
          }}
          onMouseEnter={(e) => {
            if (product.inStock) {
              e.target.style.background = '#c8a617';
              e.target.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (product.inStock) {
              e.target.style.background = 'var(--color-gold)';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          {product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
        </button>
      </div>
    </div>
  );
}