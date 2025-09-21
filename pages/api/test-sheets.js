import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const requiredEnvVars = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
      GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return res.status(500).json({
        success: false,
        message: 'Missing environment variables',
        missingVars
      });
    }

    // Set up OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Create Sheets API client
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Test 1: Get spreadsheet info
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId
    });

    // Test 2: Read some data to test permissions
    const readTest = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:N10', // Read first 10 rows
    });

    // Test 3: Write test data
    const testData = [
      'TEST',
      'test@example.com',
      '1234567890',
      'Test Address',
      '1990-01-01',
      'Aries',
      'Test custom idea',
      'Test Product x1',
      new Date().toISOString(),
      'API Test',
      '99.00',
      'TEST-ORDER-' + Date.now(),
      'TEST-PAYMENT-' + Date.now(),
      ''
    ];

    const writeTest = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:N',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [testData]
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Google Sheets API test completed successfully',
      results: {
        spreadsheetTitle: spreadsheetInfo.data.properties.title,
        spreadsheetId: spreadsheetId,
        existingRows: readTest.data.values ? readTest.data.values.length : 0,
        testRowAdded: writeTest.data.updates.updatedRows,
        updatedRange: writeTest.data.updates.updatedRange
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Google Sheets API test failed',
      error: {
        message: error.message,
        code: error.code,
        status: error.status
      }
    });
  }
}