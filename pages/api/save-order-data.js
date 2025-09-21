import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      zodiacSign,
      customIdea,
      orderItems,
      submissionDate,
      submissionType,
      orderTotal,
      orderId,
      paymentId
    } = req.body;

    // Debug: Log received data
    console.log('Received order data for saving:', {
      name,
      email,
      phone,
      hasAddress: !!address,
      hasOrderItems: !!orderItems,
      orderTotal,
      orderId
    });

    // Validate required fields
    if (!name || !email || !address || !orderItems) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        message: 'Name, email, address, and order items are required'
      });
    }

    // Set up Google Sheets API with OAuth
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN || !process.env.GOOGLE_SHEET_ID) {
      return res.status(500).json({
        message: 'Missing Google API configuration',
        debug: {
          hasClientId: !!process.env.GOOGLE_CLIENT_ID,
          hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
          hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
          hasSheetId: !!process.env.GOOGLE_SHEET_ID
        }
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000' // redirect URI (not used for refresh token flow)
    );

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Prepare the row data
    const rowData = [
      name || '',
      email || '',
      phone || '',
      address || '',
      dateOfBirth || '',
      zodiacSign || '',
      customIdea || '',
      orderItems || '',
      submissionDate || new Date().toISOString(),
      submissionType || 'E-commerce Order',
      orderTotal || '',
      orderId || '',
      paymentId || '',
      '' // Empty column for inspiration images (since this is order data, not design request)
    ];

    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:N', // Adjust range as needed
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData]
      }
    });

    return res.status(200).json({
      message: 'Order data saved successfully',
      success: true,
      rowsAdded: response.data.updates.updatedRows
    });

  } catch (error) {
    console.error('Error saving order data:', error);
    return res.status(500).json({
      message: 'Failed to save order data',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}