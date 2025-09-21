import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const router = useRouter();
  const { items, itemCount, calculateTotals, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Customer Details, 2: Payment
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  
  const totals = calculateTotals();

  // Customer details form (including additional fields from request-your-own-design)
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    // Additional fields for personalization
    dateOfBirth: '',
    zodiacSign: '',
    customIdea: ''
  });

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Image upload state for custom designs
  const [inspirationImages, setInspirationImages] = useState([]);
  
  // Check if cart has custom design items
  const hasCustomDesign = items.some(item => item.id === 'custom-design');

  // Wait for cart to load, then check if empty
  useEffect(() => {
    // Give some time for cart context to initialize from localStorage
    const timer = setTimeout(() => {
      setIsCartLoaded(true);
      if (items.length === 0) {
        router.push('/shop');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [items, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image uploads for custom designs
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + inspirationImages.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setInspirationImages(prev => [...prev, {
          file: file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setInspirationImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!customerData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!customerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(customerData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!customerData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!customerData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!customerData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!customerData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(customerData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Additional validations for new fields
    if (!customerData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!customerData.zodiacSign.trim()) {
      newErrors.zodiacSign = 'Zodiac sign is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitCustomerDetails = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Form validation passed, proceed to payment step
        // Customer data and images will be saved after successful payment
        setStep(2); // Move to payment step
      } catch (error) {
        console.error('Error proceeding to payment:', error);
        setStep(2);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    
    try {
      // Create order with customer details and cart items
      const orderData = {
        customerDetails: customerData,
        items: items,
        totals: totals
      };

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        // Initialize Razorpay payment
        initializeRazorpay(data.orderId, data.amount);
      } else {
        alert('Error creating order: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeRazorpay = (orderId, amount) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount,
      currency: 'INR',
      name: 'Aham Brahmasmi',
      description: 'Cosmic Collection Purchase',
      order_id: orderId,
      handler: function (response) {
        // Payment successful
        handlePaymentSuccess(response);
      },
      prefill: {
        name: customerData.name,
        email: customerData.email,
        contact: customerData.phone
      },
      theme: {
        color: '#d4a017'
      },
      modal: {
        ondismiss: function() {
          alert('Payment cancelled. Your cart is still saved.');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      // Verify payment with backend
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          customerDetails: customerData,
          items: items,
          hasCustomDesign: hasCustomDesign,
          inspirationImagesCount: inspirationImages.length
        })
      });

      const data = await verifyResponse.json();

      if (data.success) {
        // If there are custom design images, upload them separately after payment
        if (hasCustomDesign && inspirationImages.length > 0) {
          try {
            const combinedAddress = `${customerData.address}, ${customerData.city}, ${customerData.state} - ${customerData.pincode}`;
            
            const formData = new FormData();
            formData.append('name', customerData.name);
            formData.append('email', customerData.email);
            formData.append('phone', customerData.phone);
            formData.append('address', combinedAddress);
            formData.append('dateOfBirth', customerData.dateOfBirth);
            formData.append('zodiacSign', customerData.zodiacSign);
            formData.append('customIdea', customerData.customIdea);
            formData.append('orderItems', items.map(item => `${item.name} (${item.size}) x${item.quantity}`).join(', '));
            formData.append('submissionDate', new Date().toISOString());
            formData.append('submissionType', 'E-commerce Order - PAID (Images)');
            formData.append('orderId', data.orderId);
            formData.append('paymentId', data.paymentId);
            
            // Add images
            inspirationImages.forEach((img, index) => {
              formData.append(`inspirationImage${index}`, img.file);
            });

            // Upload images separately
            await fetch('/api/submit-design-request', {
              method: 'POST',
              body: formData
            });
            
          } catch (imageError) {
            console.error('Error uploading custom design images:', imageError);
            // Don't fail the order if image upload fails
          }
        }
        
        // Clear cart and redirect to success page
        clearCart();
        
        // Store order ID in localStorage as backup
        localStorage.setItem('lastOrderId', data.orderId);
        localStorage.setItem('lastPaymentId', data.paymentId);
        localStorage.setItem('lastOrderAmount', data.amount);
        
        // Use replace instead of push to prevent back button issues
        router.replace(`/order-success?orderId=${data.orderId}&paymentId=${data.paymentId}&amount=${data.amount}`);
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Error verifying payment. Please contact support.');
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Show loading or nothing while cart is initializing or if cart is empty
  if (!isCartLoaded || items.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout - Aham Brahmasmi</title>
          <meta name="description" content="Complete your cosmic journey - Checkout" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/assets/favicon-16x16.png" />
        </Head>
        <Header cartCount={itemCount} />
        <main style={{
          background: 'var(--color-bg)',
          padding: '80px 20px',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            color: 'var(--color-text)',
            fontSize: '1.2rem',
            textAlign: 'center'
          }}>
            {!isCartLoaded ? 'Loading cart...' : 'Redirecting to shop...'}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - Aham Brahmasmi</title>
        <meta name="description" content="Complete your cosmic journey - Checkout" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/favicon-16x16.png" />
      </Head>

      <Header cartCount={itemCount} />
      
      <main>
        {/* Progress Indicator */}
        <section style={{
          background: 'var(--color-bg)',
          padding: '40px 20px 20px',
          borderBottom: '1px solid rgba(212, 160, 23, 0.2)'
        }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: step >= 1 ? 'var(--color-gold)' : 'var(--color-muted)',
                fontWeight: step === 1 ? '600' : '400'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: step >= 1 ? 'var(--color-gold)' : 'transparent',
                  border: `2px solid ${step >= 1 ? 'var(--color-gold)' : 'var(--color-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step >= 1 ? 'var(--color-black)' : 'var(--color-muted)',
                  marginRight: '10px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  1
                </div>
                Customer Details
              </div>
              
              <div style={{
                width: '40px',
                height: '2px',
                background: step >= 2 ? 'var(--color-gold)' : 'var(--color-muted)',
                opacity: 0.5
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: step >= 2 ? 'var(--color-gold)' : 'var(--color-muted)',
                fontWeight: step === 2 ? '600' : '400'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: step >= 2 ? 'var(--color-gold)' : 'transparent',
                  border: `2px solid ${step >= 2 ? 'var(--color-gold)' : 'var(--color-muted)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step >= 2 ? 'var(--color-black)' : 'var(--color-muted)',
                  marginRight: '10px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  2
                </div>
                Payment
              </div>
            </div>
          </div>
        </section>

        {/* Checkout Content */}
        <section style={{
          background: 'var(--color-bg)',
          padding: '40px 20px 80px',
          minHeight: '500px'
        }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 400px',
              gap: '40px'
            }}>
              
              {/* Main Content */}
              <div>
                {step === 1 ? (
                  /* Customer Details Form */
                  <div>
                    <h2 style={{
                      color: 'var(--color-gold)',
                      fontSize: '1.8rem',
                      fontFamily: 'Cinzel, serif',
                      marginBottom: '30px'
                    }}>
                      Customer Details & Personalization
                    </h2>

                    <form onSubmit={handleSubmitCustomerDetails} style={{
                      background: 'rgba(11, 11, 11, 0.8)',
                      border: '1px solid rgba(212, 160, 23, 0.2)',
                      borderRadius: '16px',
                      padding: '30px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      
                      {/* Basic Details Section */}
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{
                          color: 'var(--color-gold)',
                          fontSize: '1.3rem',
                          fontFamily: 'Cinzel, serif',
                          marginBottom: '20px',
                          borderBottom: '1px solid rgba(212, 160, 23, 0.2)',
                          paddingBottom: '10px'
                        }}>
                          Contact Information
                        </h3>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '20px',
                          marginBottom: '20px'
                        }}>
                          {/* Name */}
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
                              value={customerData.name}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.name ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                              placeholder="Enter your full name"
                            />
                            {errors.name && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.name}
                              </span>
                            )}
                          </div>

                          {/* Email */}
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
                              value={customerData.email}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.email ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                              placeholder="your.email@example.com"
                            />
                            {errors.email && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.email}
                              </span>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label style={{
                              display: 'block',
                              color: 'var(--color-gold)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              marginBottom: '8px',
                              fontFamily: 'Cinzel, serif'
                            }}>
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={customerData.phone}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.phone ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                              placeholder="9876543210"
                            />
                            {errors.phone && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address Section */}
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{
                          color: 'var(--color-gold)',
                          fontSize: '1.3rem',
                          fontFamily: 'Cinzel, serif',
                          marginBottom: '20px',
                          borderBottom: '1px solid rgba(212, 160, 23, 0.2)',
                          paddingBottom: '10px'
                        }}>
                          Delivery Address
                        </h3>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '20px',
                          marginBottom: '20px'
                        }}>
                          {/* City */}
                          <div>
                            <label style={{
                              display: 'block',
                              color: 'var(--color-gold)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              marginBottom: '8px',
                              fontFamily: 'Cinzel, serif'
                            }}>
                              City *
                            </label>
                            <input
                              type="text"
                              name="city"
                              required
                              value={customerData.city}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.city ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                              placeholder="Enter your city"
                            />
                            {errors.city && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.city}
                              </span>
                            )}
                          </div>

                          {/* State */}
                          <div>
                            <label style={{
                              display: 'block',
                              color: 'var(--color-gold)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              marginBottom: '8px',
                              fontFamily: 'Cinzel, serif'
                            }}>
                              State *
                            </label>
                            <input
                              type="text"
                              name="state"
                              required
                              value={customerData.state}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.state ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                              placeholder="Enter your state"
                            />
                            {errors.state && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.state}
                              </span>
                            )}
                          </div>

                          {/* Pincode */}
                          <div>
                            <label style={{
                              display: 'block',
                              color: 'var(--color-gold)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              marginBottom: '8px',
                              fontFamily: 'Cinzel, serif'
                            }}>
                              Pincode *
                            </label>
                            <input
                              type="text"
                              name="pincode"
                              required
                              value={customerData.pincode}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.pincode ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                              placeholder="123456"
                            />
                            {errors.pincode && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.pincode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            color: 'var(--color-gold)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: '8px',
                            fontFamily: 'Cinzel, serif'
                          }}>
                            Complete Address *
                          </label>
                          <textarea
                            name="address"
                            required
                            value={customerData.address}
                            onChange={handleInputChange}
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${errors.address ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                              borderRadius: '8px',
                              color: 'var(--color-text)',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'border-color 0.3s ease',
                              resize: 'vertical'
                            }}
                            placeholder="Enter your complete address for delivery"
                          />
                          {errors.address && (
                            <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                              {errors.address}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Personalization Section */}
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{
                          color: 'var(--color-gold)',
                          fontSize: '1.3rem',
                          fontFamily: 'Cinzel, serif',
                          marginBottom: '20px',
                          borderBottom: '1px solid rgba(212, 160, 23, 0.2)',
                          paddingBottom: '10px'
                        }}>
                          Cosmic Personalization
                        </h3>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '20px',
                          marginBottom: '20px'
                        }}>
                          {/* Date of Birth */}
                          <div>
                            <label style={{
                              display: 'block',
                              color: 'var(--color-gold)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              marginBottom: '8px',
                              fontFamily: 'Cinzel, serif'
                            }}>
                              Date of Birth *
                            </label>
                            <input
                              type="date"
                              name="dateOfBirth"
                              required
                              value={customerData.dateOfBirth}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.dateOfBirth ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s ease'
                              }}
                            />
                            {errors.dateOfBirth && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.dateOfBirth}
                              </span>
                            )}
                          </div>

                          {/* Zodiac Sign */}
                          <div>
                            <label style={{
                              display: 'block',
                              color: 'var(--color-gold)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              marginBottom: '8px',
                              fontFamily: 'Cinzel, serif'
                            }}>
                              Zodiac Sign *
                            </label>
                            <select
                              name="zodiacSign"
                              required
                              value={customerData.zodiacSign}
                              onChange={handleInputChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(11, 11, 11, 0.9)',
                                border: `1px solid ${errors.zodiacSign ? '#e74c3c' : 'rgba(212, 160, 23, 0.3)'}`,
                                borderRadius: '8px',
                                color: 'var(--color-text)',
                                fontSize: '1rem',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'border-color 0.3s ease'
                              }}
                            >
                              <option value="">Select your zodiac sign</option>
                              <option value="Aries">Aries (Mar 21 - Apr 19)</option>
                              <option value="Taurus">Taurus (Apr 20 - May 20)</option>
                              <option value="Gemini">Gemini (May 21 - Jun 20)</option>
                              <option value="Cancer">Cancer (Jun 21 - Jul 22)</option>
                              <option value="Leo">Leo (Jul 23 - Aug 22)</option>
                              <option value="Virgo">Virgo (Aug 23 - Sep 22)</option>
                              <option value="Libra">Libra (Sep 23 - Oct 22)</option>
                              <option value="Scorpio">Scorpio (Oct 23 - Nov 21)</option>
                              <option value="Sagittarius">Sagittarius (Nov 22 - Dec 21)</option>
                              <option value="Capricorn">Capricorn (Dec 22 - Jan 19)</option>
                              <option value="Aquarius">Aquarius (Jan 20 - Feb 18)</option>
                              <option value="Pisces">Pisces (Feb 19 - Mar 20)</option>
                            </select>
                            {errors.zodiacSign && (
                              <span style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                                {errors.zodiacSign}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Custom Design Ideas */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{
                            display: 'block',
                            color: 'var(--color-gold)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: '8px',
                            fontFamily: 'Cinzel, serif'
                          }}>
                            Custom Design Ideas {hasCustomDesign ? '*' : '(Optional)'}
                          </label>
                          <textarea
                            name="customIdea"
                            value={customerData.customIdea}
                            onChange={handleInputChange}
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(212, 160, 23, 0.3)',
                              borderRadius: '8px',
                              color: 'var(--color-text)',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'border-color 0.3s ease',
                              resize: 'vertical'
                            }}
                            placeholder={hasCustomDesign 
                              ? "Describe your cosmic design vision. What elements, symbols, or themes would you like to include?"
                              : "Share any custom design ideas, cosmic elements you'd like to see, or personal touches for your order..."
                            }
                          />
                          
                          {hasCustomDesign && (
                            <div style={{ marginTop: '20px' }}>
                              <label style={{
                                display: 'block',
                                color: 'var(--color-gold)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '8px',
                                fontFamily: 'Cinzel, serif'
                              }}>
                                Inspiration Images (Optional)
                              </label>
                              
                              <div style={{
                                border: '2px dashed rgba(212, 160, 23, 0.3)',
                                borderRadius: '8px',
                                padding: '20px',
                                textAlign: 'center',
                                background: 'rgba(255, 255, 255, 0.02)',
                                marginBottom: '15px'
                              }}>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  style={{ display: 'none' }}
                                  id="image-upload"
                                />
                                <label
                                  htmlFor="image-upload"
                                  style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    background: 'var(--color-gold)',
                                    color: 'var(--color-black)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    transition: 'background-color 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = '#c8a617'}
                                  onMouseLeave={(e) => e.target.style.background = 'var(--color-gold)'}
                                >
                                  📸 Upload Inspiration Images
                                </label>
                                <div style={{
                                  marginTop: '10px',
                                  color: 'var(--color-muted)',
                                  fontSize: '0.8rem'
                                }}>
                                  Maximum 5 images, 5MB each. JPG, PNG, GIF supported.
                                </div>
                              </div>
                              
                              {inspirationImages.length > 0 && (
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                  gap: '10px',
                                  marginTop: '15px'
                                }}>
                                  {inspirationImages.map((img, index) => (
                                    <div key={index} style={{
                                      position: 'relative',
                                      borderRadius: '6px',
                                      overflow: 'hidden',
                                      border: '1px solid rgba(212, 160, 23, 0.3)'
                                    }}>
                                      <img
                                        src={img.preview}
                                        alt={img.name}
                                        style={{
                                          width: '100%',
                                          height: '80px',
                                          objectFit: 'cover'
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        style={{
                                          position: 'absolute',
                                          top: '4px',
                                          right: '4px',
                                          background: 'rgba(255, 0, 0, 0.8)',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '50%',
                                          width: '20px',
                                          height: '20px',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        ×
                                      </button>
                                      <div style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--color-muted)',
                                        padding: '4px',
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {img.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: isLoading ? '#666' : 'var(--color-gold)',
                          color: isLoading ? '#ccc' : 'var(--color-black)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'Cinzel, serif'
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoading) {
                            e.target.style.background = '#c8a617';
                            e.target.style.transform = 'scale(1.02)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading) {
                            e.target.style.background = 'var(--color-gold)';
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {isLoading ? 'SAVING DETAILS...' : 'CONTINUE TO PAYMENT'}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Payment Step */
                  <div>
                    <h2 style={{
                      color: 'var(--color-gold)',
                      fontSize: '1.8rem',
                      fontFamily: 'Cinzel, serif',
                      marginBottom: '30px'
                    }}>
                      Payment
                    </h2>

                    <div style={{
                      background: 'rgba(11, 11, 11, 0.8)',
                      border: '1px solid rgba(212, 160, 23, 0.2)',
                      borderRadius: '16px',
                      padding: '30px',
                      backdropFilter: 'blur(10px)',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{
                        color: 'var(--color-gold)',
                        fontSize: '1.2rem',
                        marginBottom: '20px',
                        fontFamily: 'Cinzel, serif'
                      }}>
                        Customer Details
                      </h3>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '20px'
                      }}>
                        <div>
                          <strong style={{ color: 'var(--color-gold)' }}>Name:</strong><br />
                          <span style={{ color: 'var(--color-text)' }}>{customerData.name}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--color-gold)' }}>Email:</strong><br />
                          <span style={{ color: 'var(--color-text)' }}>{customerData.email}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--color-gold)' }}>Phone:</strong><br />
                          <span style={{ color: 'var(--color-text)' }}>{customerData.phone}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--color-gold)' }}>Zodiac:</strong><br />
                          <span style={{ color: 'var(--color-text)' }}>{customerData.zodiacSign}</span>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <strong style={{ color: 'var(--color-gold)' }}>Address:</strong><br />
                        <span style={{ color: 'var(--color-text)' }}>
                          {customerData.address}, {customerData.city}, {customerData.state} - {customerData.pincode}
                        </span>
                      </div>

                      <button
                        onClick={() => setStep(1)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(212, 160, 23, 0.3)',
                          color: 'var(--color-gold)',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
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
                        Edit Details
                      </button>
                    </div>

                    <div style={{
                      background: 'rgba(11, 11, 11, 0.8)',
                      border: '1px solid rgba(212, 160, 23, 0.2)',
                      borderRadius: '16px',
                      padding: '30px',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        color: 'var(--color-gold)',
                        fontSize: '1.3rem',
                        marginBottom: '20px',
                        fontFamily: 'Cinzel, serif'
                      }}>
                        Secure Payment
                      </h3>
                      
                      <p style={{
                        color: 'var(--color-muted)',
                        marginBottom: '30px',
                        lineHeight: '1.6'
                      }}>
                        Your payment is secured by Razorpay. We accept all major credit cards, debit cards, net banking, and UPI.
                      </p>

                      <button
                        onClick={handleProceedToPayment}
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          maxWidth: '400px',
                          padding: '16px 24px',
                          background: isLoading ? '#666' : 'var(--color-gold)',
                          color: isLoading ? '#ccc' : 'var(--color-black)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          fontFamily: 'Cinzel, serif'
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoading) {
                            e.target.style.background = '#c8a617';
                            e.target.style.transform = 'scale(1.02)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoading) {
                            e.target.style.background = 'var(--color-gold)';
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {isLoading ? 'Processing...' : `PAY ₹${totals.total}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Sidebar */}
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

                {/* Order Items */}
                <div style={{ marginBottom: '20px' }}>
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '15px',
                      paddingBottom: '15px',
                      borderBottom: '1px solid rgba(212, 160, 23, 0.1)'
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'contain',
                          borderRadius: '6px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: 'var(--color-text)',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          color: 'var(--color-muted)',
                          fontSize: '0.8rem'
                        }}>
                          Size: {item.size} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{
                        color: 'var(--color-gold)',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    color: 'var(--color-text)'
                  }}>
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
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
                        <span style={{ color: 'var(--color-gold)' }}>FREE</span>
                      ) : (
                        `₹${totals.shipping}`
                      )}
                    </span>
                  </div>
                  
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

                {/* Secure Payment Info */}
                <div style={{
                  background: 'rgba(212, 160, 23, 0.1)',
                  border: '1px solid rgba(212, 160, 23, 0.2)',
                  borderRadius: '8px',
                  padding: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: 'var(--color-gold)',
                    fontSize: '1.2rem',
                    marginBottom: '8px'
                  }}>
                    🔒
                  </div>
                  <div style={{
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    Secure Payment
                  </div>
                  <div style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.8rem'
                  }}>
                    Powered by Razorpay
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 1024px) {
          section div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}