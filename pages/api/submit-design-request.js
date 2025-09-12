import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
  const { name, email, size, dateOfBirth, zodiacSign, address } = req.body;

    // Validate required fields
    if (!name || !email || !address) {
      return res.status(400).json({
        message: 'Name, email, and address are required'
      });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Your Google Sheet ID - you'll need to provide this
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return res.status(500).json({
        message: 'Google Sheet ID not configured'
      });
    }

    // Prepare the data to append
    const values = [[
      new Date().toISOString(), // Timestamp
      name,
      email,
      size || '',
      dateOfBirth || '',
      zodiacSign || '',
      address
    ]];

    // Append data to Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G', // Now includes address column
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values,
      },
    });

    console.log('Data appended successfully:', response.data);

    res.status(200).json({
      message: 'Design request submitted successfully! We\'ll get back to you via email.',
      success: true
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      message: 'Failed to submit design request. Please try again.',
      error: error.message
    });
  }
}
