import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Utility function to validate cart items and calculate totals
function validateCartAndCalculateTotals(cartItems) {
  // Define valid products (should ideally come from a database)
  const validProducts = {
    1: { id: 1, name: "Sacred Hoodie", price: 1799, sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
    2: { id: 2, name: "Cosmic Tee", price: 899, sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
    3: { id: 3, name: "Mandala Art Print", price: 699, sizes: ["A3", "A2", "A1"] },
    4: { id: 4, name: "Front Poster", price: 599, sizes: ["A3", "A2", "A1"] },
    5: { id: 5, name: "Meditation Cushion", price: 1299, sizes: ["Standard"] },
    6: { id: 6, name: "Cosmic Journal", price: 499, sizes: ["A5"] }
  };

  let subtotal = 0;
  const validatedItems = [];

  for (const item of cartItems) {
    const product = validProducts[item.id];
    
    if (!product) {
      throw new Error(`Invalid product ID: ${item.id}`);
    }
    
    if (!product.sizes.includes(item.size)) {
      throw new Error(`Invalid size ${item.size} for product ${product.name}`);
    }
    
    if (!item.quantity || item.quantity < 1 || item.quantity > 10) {
      throw new Error(`Invalid quantity ${item.quantity} for product ${product.name}`);
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    validatedItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      size: item.size,
      total: itemTotal
    });
  }

  // Calculate tax and shipping
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const shipping = subtotal > 1499 ? 0 : 59; // Free shipping above ₹1499
  const total = subtotal + tax + shipping;

  return {
    items: validatedItems,
    subtotal,
    tax,
    shipping,
    total
  };
}

// Rate limiting map (in production, use Redis or a proper rate limiter)
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // Max 10 requests per window

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const limitData = rateLimitMap.get(ip);
  
  if (now > limitData.resetTime) {
    // Reset the window
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limitData.count >= maxRequests) {
    return false;
  }

  limitData.count++;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }

    const { cartItems, customerInfo } = req.body;

    // Validate input
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Invalid cart items' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({ error: 'Customer information is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate and calculate totals
    let orderData;
    try {
      orderData = validateCartAndCalculateTotals(cartItems);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: orderData.total * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        items_count: orderData.items.length,
        total_items: orderData.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

    // Generate CSRF token for payment verification
    const csrfToken = crypto.randomBytes(32).toString('hex');

    // Store order data temporarily (in production, use a database)
    // For now, we'll include it in the response and rely on client-side state
    const orderSummary = {
      orderId: razorpayOrder.id,
      amount: orderData.total,
      currency: 'INR',
      customerInfo,
      items: orderData.items,
      totals: {
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total
      },
      csrfToken,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      orderSummary,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    
    // Don't expose internal errors to client
    if (error.error && error.error.description) {
      return res.status(400).json({ 
        error: 'Payment gateway error: ' + error.error.description 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
}