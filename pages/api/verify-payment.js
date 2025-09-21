import crypto from 'crypto';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      items
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        message: 'Missing payment verification data' 
      });
    }

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('Invalid payment signature:', {
        received: razorpay_signature,
        expected: expectedSignature
      });
      
      return res.status(400).json({ 
        success: false,
        message: 'Payment signature verification failed' 
      });
    }

    // Fetch payment details from Razorpay
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (error) {
      console.error('Error fetching payment from Razorpay:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error verifying payment with gateway' 
      });
    }

    // Check if payment is captured/successful
    if (payment.status !== 'captured') {
      return res.status(400).json({ 
        success: false,
        message: 'Payment not captured successfully' 
      });
    }

    // Log successful payment (in production, save to database)
    const orderRecord = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: payment.amount / 100, // Convert paise to rupees
      currency: payment.currency,
      status: 'completed',
      customerDetails: customerDetails,
      items: items,
      paymentMethod: payment.method,
      paymentBank: payment.bank,
      paymentWallet: payment.wallet,
      createdAt: new Date(payment.created_at * 1000).toISOString(),
      verifiedAt: new Date().toISOString()
    };

    // Here you would typically:
    // 1. Save order to database
    // 2. Send confirmation email to customer
    // 3. Update inventory
    // 4. Create shipping label
    // 5. Send notification to admin

    // For now, we'll simulate these operations
    try {
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate a unique order ID for customer reference
      const customerOrderId = `AB-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Save order details to Google Sheets after successful payment
      try {
        const combinedAddress = `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`;
        
        // Check if this is a custom design order
        const hasCustomDesign = items.some(item => item.id === 'custom-design');
        
        // Prepare data for Google Sheets
        const sheetData = {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: combinedAddress,
          dateOfBirth: customerDetails.dateOfBirth || '',
          zodiacSign: customerDetails.zodiacSign || '',
          customIdea: customerDetails.customIdea || '',
          orderItems: items.map(item => `${item.name} (${item.size}) x${item.quantity}`).join(', '),
          submissionDate: new Date().toISOString(),
          submissionType: 'E-commerce Order - PAID',
          orderTotal: payment.amount / 100,
          orderId: customerOrderId,
          paymentId: razorpay_payment_id
        };

        // Only save basic order data here (images will be uploaded separately if needed)
        const apiUrl = process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/save-order-data`
          : 'http://localhost:3000/api/save-order-data';
          
        console.log('🔗 Calling save-order-data API at:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sheetData)
        });

        console.log('🔍 Save order data response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to save order data:', errorText);
          // Don't fail the payment verification if sheets save fails
        } else {
          const successData = await response.json();
          console.log('✅ Order data saved successfully:', successData);
        }
      } catch (sheetError) {
        // Don't fail the payment verification if sheets save fails
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified and order created successfully',
        orderId: customerOrderId,
        paymentId: razorpay_payment_id,
        amount: payment.amount / 100,
        orderDetails: {
          customerOrderId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: 'confirmed',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
        }
      });

    } catch (error) {
      console.error('Error processing order after payment verification:', error);
      
      // Payment is verified but order processing failed
      // In production, you'd want to handle this carefully
      return res.status(500).json({
        success: false,
        message: 'Payment verified but order processing failed. Please contact support.',
        paymentId: razorpay_payment_id
      });
    }

  } catch (error) {
    console.error('Error in payment verification:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment verification'
    });
  }
}