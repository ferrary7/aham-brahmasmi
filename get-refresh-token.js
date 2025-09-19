const { google } = require('googleapis');
const readline = require('readline');

// Your OAuth credentials from Google Cloud Console
const CLIENT_ID = '1037743269429-o7viqo4gmlfak63k6lcufee3mihlh7km.apps.googleusercontent.com';
const CLIENT_SECRET = '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';

// Use the OAuth Playground redirect URI since it should be authorized
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Scopes for Drive and Sheets access
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force consent to get refresh token
});

console.log('\n🚀 GOOGLE OAUTH SETUP FOR https://www.brahmasmi.store/');
console.log('=========================================================');
console.log('\n⚠️  IMPORTANT: Fix the OAuth Client Type');
console.log('');
console.log('1. Go to https://console.cloud.google.com/');
console.log('2. Select project: ahbr-471911');
console.log('3. APIs & Services > Credentials');
console.log('4. Either:');
console.log('   A) CREATE NEW: OAuth 2.0 Client ID > Desktop Application');
console.log('   B) EDIT EXISTING: Add redirect URI: http://localhost:3000');
console.log('');
console.log('5. Update CLIENT_ID and CLIENT_SECRET in this file if needed');
console.log('6. Run this script again');
console.log('\n🔗 AUTHORIZATION URL:');
console.log('\n' + authUrl);
console.log('\n7. Open this URL, sign in with YOUR Google account');
console.log('8. You might get redirected to localhost:3000 with a code in URL');
console.log('9. Copy the authorization code and paste it below');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nEnter the authorization code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ SUCCESS! Update your .env.local file:');
    console.log('==========================================');
    console.log('# Replace the old service account variables with these:');
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_SHEET_ID=16lHf3-Iwe-uhcjlk7D4ns25FLNgZqAqHCzaVfF0MQ_w`);
    console.log('==========================================');
    console.log('\n🗑️  Remove these old variables:');
    console.log('GOOGLE_CLIENT_EMAIL');
    console.log('GOOGLE_PRIVATE_KEY');
    console.log('\n🚀 Then deploy to production!');
    
  } catch (error) {
    console.error('Error getting tokens:', error);
  } finally {
    rl.close();
  }
});