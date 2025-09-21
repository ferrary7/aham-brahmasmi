import Razorpay from 'razorpay';

// Initialize Razorpay instance with your API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { customerDetails, items, totals } = req.body;

    // Validate required data
    if (!customerDetails || !items || !totals) {
      return res.status(400).json({ 
        message: 'Missing required data: customerDetails, items, or totals' 
      });
    }

    // Validate customer details
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!customerDetails[field] || customerDetails[field].trim() === '') {
        return res.status(400).json({ 
          message: `Missing required field: ${field}` 
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerDetails.phone.replace(/\s+/g, ''))) {
      return res.status(400).json({ 
        message: 'Invalid phone number format' 
      });
    }

    // Validate pincode
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(customerDetails.pincode)) {
      return res.status(400).json({ 
        message: 'Invalid pincode format' 
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Cart is empty or invalid items data' 
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.name || !item.price || !item.quantity || !item.size) {
        return res.status(400).json({ 
          message: 'Invalid item data' 
        });
      }
      
      if (item.quantity <= 0 || item.price <= 0) {
        return res.status(400).json({ 
          message: 'Invalid item quantity or price' 
        });
      }
    }

    // Recalculate totals server-side for security
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedTax = Math.round(calculatedSubtotal * 0.05);
    const calculatedShipping = calculatedSubtotal > 1499 ? 0 : 59;
    const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping;

    // Verify totals match (allow small rounding differences)
    if (Math.abs(calculatedTotal - totals.total) > 1) {
      return res.status(400).json({ 
        message: 'Total amount mismatch. Please refresh and try again.' 
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: calculatedTotal * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        itemCount: items.length,
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        shipping: calculatedShipping,
        total: calculatedTotal
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Store order details in a more robust way (you might want to use a database)
    // For now, we'll include it in the response for the frontend to handle
    const orderData = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      customerDetails,
      items,
      calculatedTotals: {
        subtotal: calculatedSubtotal,
        tax: calculatedTax,
        shipping: calculatedShipping,
        total: calculatedTotal
      },
      createdAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      orderData: orderData
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle specific Razorpay errors
    if (error.error && error.error.code) {
      const razorpayError = error.error;
      return res.status(400).json({ 
        message: `Payment gateway error: ${razorpayError.description || razorpayError.code}` 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error. Please try again later.' 
    });
  }
}