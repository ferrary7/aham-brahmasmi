
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
        const size = Array.isArray(fields.size) ? fields.size[0] : fields.size;
        const dateOfBirth = Array.isArray(fields.dateOfBirth) ? fields.dateOfBirth[0] : fields.dateOfBirth;
        const zodiacSign = Array.isArray(fields.zodiacSign) ? fields.zodiacSign[0] : fields.zodiacSign;
        const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
        const customIdea = Array.isArray(fields.customIdea) ? fields.customIdea[0] : fields.customIdea;

        // Validate required fields
        if (!name || !email || !address) {
          return res.status(400).json({
            message: 'Name, email, and address are required'
          });
        }

        // Clean and format private key
        let privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          // If it's missing headers, it might be PKCS#1 format, convert to PKCS#8
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
        }

        // Initialize Google Sheets API and Drive API
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: privateKey,
          },
          scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
          ],
        });

        // Save images to public/uploads folder and get accessible URLs
        let inspirationImageUrls = [];
        if (files && Object.keys(files).length > 0) {
          console.log('Files received:', Object.keys(files));
          
          // Ensure uploads directory exists
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          for (const key of Object.keys(files)) {
            if (key.startsWith('inspirationImage')) {
              const file = files[key];
              
              // Handle both single file and array of files from formidable
              const fileObj = Array.isArray(file) ? file[0] : file;
              
              if (!fileObj || !fileObj.filepath) {
                console.log('No valid file found for key:', key);
                continue;
              }
              
              try {
                // Get filename and create unique name
                const originalFilename = fileObj.originalFilename || fileObj.name || `image-${Date.now()}.jpg`;
                const fileExtension = path.extname(originalFilename);
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
                const filePath = path.join(uploadsDir, fileName);
                
                console.log('Processing file:', {
                  key,
                  originalFilename,
                  fileName,
                  mimetype: fileObj.mimetype,
                  size: fileObj.size,
                  tempPath: fileObj.filepath,
                  finalPath: filePath
                });

                // Copy file from temp location to public/uploads
                fs.copyFileSync(fileObj.filepath, filePath);
                
                // Create accessible URL (will work when deployed)
                const imageUrl = `/uploads/${fileName}`;
                
                inspirationImageUrls.push({
                  filename: originalFilename,
                  url: imageUrl,
                  size: fileObj.size
                });
                
                console.log('Image saved successfully:', imageUrl);
              } catch (saveError) {
                console.error('Error saving image:', saveError);
                const filename = fileObj.originalFilename || fileObj.name || 'unknown';
                inspirationImageUrls.push({
                  filename: filename,
                  url: `Save failed: ${saveError.message}`,
                  size: 0
                });
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
        const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        
        const imageLinks = inspirationImageUrls.map(img => `${img.filename}: ${baseUrl}${img.url}`).join(' | ');
        
        const values = [[
          new Date().toISOString(), // Timestamp
          name,
          email,
          size || '',
          dateOfBirth || '',
          zodiacSign || '',
          address,
          customIdea || '',
          imageLinks || 'No images uploaded'
        ]];

        // Append data to Google Sheet
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Sheet1!A:I', // Now includes customIdea and images columns
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values,
          },
        });

        console.log('Data appended successfully:', response.data);

        return res.status(200).json({
          message: 'Design request submitted successfully! We\'ll get back to you via email.',
          success: true
        });

      } catch (innerError) {
        console.error('Error processing form submission:', innerError);
        return res.status(500).json({
          message: 'Failed to submit design request. Please try again.',
          error: innerError.message
        });
      }
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({
      message: 'Failed to submit design request. Please try again.',
      error: error.message
    });
  }
}
