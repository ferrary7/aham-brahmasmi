
import { google } from 'googleapis';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(400).json({ message: 'Error parsing form data', error: err.message });
      }

      try {
        // Extract string values from formidable fields (they come as arrays)
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
        const size = Array.isArray(fields.size) ? fields.size[0] : fields.size;
        const dateOfBirth = Array.isArray(fields.dateOfBirth) ? fields.dateOfBirth[0] : fields.dateOfBirth;
        const zodiacSign = Array.isArray(fields.zodiacSign) ? fields.zodiacSign[0] : fields.zodiacSign;
        const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
        const customIdea = Array.isArray(fields.customIdea) ? fields.customIdea[0] : fields.customIdea;
        
        // Handle e-commerce order data (from checkout)
        const orderItems = Array.isArray(fields.orderItems) ? fields.orderItems[0] : fields.orderItems;
        const orderTotal = Array.isArray(fields.orderTotal) ? fields.orderTotal[0] : fields.orderTotal;
        const submissionType = Array.isArray(fields.submissionType) ? fields.submissionType[0] : fields.submissionType;

        // Validate required fields
        if (!name || !email || !address) {
          return res.status(400).json({
            message: 'Name, email, and address are required'
          });
        }

        // Check for required environment variables
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN || !process.env.GOOGLE_SHEET_ID) {
          console.error('Missing required environment variables:', {
            hasClientId: !!process.env.GOOGLE_CLIENT_ID,
            hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
            hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
            hasSheetId: !!process.env.GOOGLE_SHEET_ID
          });
          return res.status(500).json({
            message: 'Server configuration error. Please contact support.'
          });
        }

        // Initialize Google OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'urn:ietf:wg:oauth:2.0:oob' // For server-side apps
        );

        // Set refresh token to get access tokens
        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        // Use the OAuth2 client for authentication
        const auth = oauth2Client;

        // Upload images to Google Drive and get shareable links
        let inspirationImageLinks = [];
        if (files && Object.keys(files).length > 0) {
          const drive = google.drive({ version: 'v3', auth });
          
          for (const key of Object.keys(files)) {
            if (key.startsWith('inspirationImage')) {
              const file = files[key];
              
              // Handle both single file and array of files from formidable
              const fileObj = Array.isArray(file) ? file[0] : file;
              
              if (!fileObj || !fileObj.filepath) {
                continue;
              }
              
              try {
                // Get filename 
                const originalFilename = fileObj.originalFilename || fileObj.name || `image-${Date.now()}.jpg`;
                
                // Create unique filename
                const uniqueFilename = `aham-brahmasmi-${Date.now()}-${originalFilename}`;

                // Upload file to Google Drive (to root, no parent folder to avoid quota issues)
                const driveResponse = await drive.files.create({
                  requestBody: {
                    name: uniqueFilename,
                    // Don't specify parents - upload to root to avoid folder permission issues
                  },
                  media: {
                    mimeType: fileObj.mimetype || 'image/jpeg',
                    body: fs.createReadStream(fileObj.filepath),
                  },
                });

                // Make file publicly viewable
                await drive.permissions.create({
                  fileId: driveResponse.data.id,
                  requestBody: {
                    role: 'reader',
                    type: 'anyone',
                  },
                });

                // Get direct viewable link
                const shareableLink = `https://drive.google.com/file/d/${driveResponse.data.id}/view`;
                const directLink = `https://drive.google.com/uc?export=view&id=${driveResponse.data.id}`;
                
                inspirationImageLinks.push(`${originalFilename}: ${shareableLink}`);
                
                console.log('Image uploaded to Drive successfully:', {
                  filename: originalFilename,
                  shareableLink,
                  directLink
                });
              } catch (uploadError) {
                console.error('Error uploading image to Drive:', uploadError);
                console.error('Drive error details:', uploadError.response?.data || uploadError.message);
                
                const filename = fileObj.originalFilename || fileObj.name || 'unknown';
                
                // If it's a quota error, try without authentication (as fallback)
                if (uploadError.message?.includes('storage quota') || uploadError.code === 403) {
                  inspirationImageLinks.push(`${filename}: Upload failed - Storage quota exceeded`);
                } else {
                  inspirationImageLinks.push(`${filename}: Upload failed - ${uploadError.message}`);
                }
              }
            }
          }
        }

        const sheets = google.sheets({ version: 'v4', auth });
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
          orderItems || size || '', // Use orderItems for e-commerce, fallback to size for design requests
          dateOfBirth || '',
          zodiacSign || '',
          address,
          customIdea || '',
          inspirationImageLinks.join(' | ') || 'No images uploaded',
          phone || '' // Phone number moved to the end
        ]];

        // Append data to Google Sheet
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Sheet1!A:J', // Updated range for 10 columns (removed orderTotal and submissionType)
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values,
          },
        });

        return res.status(200).json({
          message: 'Design request submitted successfully! We\'ll get back to you via email.',
          success: true
        });

      } catch (innerError) {
        console.error('Error processing form submission:', innerError);
        console.error('Error stack:', innerError.stack);
        console.error('Error details:', {
          message: innerError.message,
          name: innerError.name,
          code: innerError.code
        });
        return res.status(500).json({
          message: 'Failed to submit design request. Please try again.',
          error: innerError.message,
          details: process.env.NODE_ENV === 'development' ? innerError.stack : undefined
        });
      }
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      message: 'Failed to submit design request. Please try again.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
