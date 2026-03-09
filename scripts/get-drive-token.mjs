/**
 * One-time setup script to get Google Drive OAuth2 refresh token.
 *
 * Run: node scripts/get-drive-token.mjs
 *
 * Steps before running:
 * 1. Go to https://console.cloud.google.com
 * 2. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
 * 3. Type: "Desktop app", name it anything
 * 4. Download JSON → copy client_id and client_secret into this script
 * 5. Run: node scripts/get-drive-token.mjs
 * 6. Open the URL shown, authorize, paste the code
 * 7. Copy the refresh_token into .env.local
 */

import { createServer } from 'http';
import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Read from .env.local
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^"|"$/g, '') : null;
}

const CLIENT_ID = getEnvVar('GOOGLE_OAUTH_CLIENT_ID');
const CLIENT_SECRET = getEnvVar('GOOGLE_OAUTH_CLIENT_SECRET');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in .env.local');
  console.error('\nAdd these lines to .env.local first:');
  console.error('GOOGLE_OAUTH_CLIENT_ID=your_client_id_here');
  console.error('GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_here');
  process.exit(1);
}

const REDIRECT_URI = 'http://localhost:3333/callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive'],
  prompt: 'consent',
});

console.log('\n📋 Steps:');
console.log('1. Open this URL in your browser:');
console.log('\n' + authUrl + '\n');
console.log('2. Sign in with your personal Google account');
console.log('3. Allow access to Google Drive');
console.log('4. You will be redirected and the refresh token will be saved automatically\n');

// Start a local server to catch the callback
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3333');

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');

    if (!code) {
      res.writeHead(400);
      res.end('No code received');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      const refreshToken = tokens.refresh_token;

      if (!refreshToken) {
        res.writeHead(500);
        res.end('No refresh token received. Try again.');
        console.error('\n❌ No refresh token. Make sure you set prompt: consent and revoke access first.');
        server.close();
        return;
      }

      // Write refresh token to .env.local
      let newEnv = envContent;
      if (envContent.includes('GOOGLE_OAUTH_REFRESH_TOKEN=')) {
        newEnv = envContent.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*/m, `GOOGLE_OAUTH_REFRESH_TOKEN=${refreshToken}`);
      } else {
        newEnv = envContent + `\nGOOGLE_OAUTH_REFRESH_TOKEN=${refreshToken}\n`;
      }
      writeFileSync(envPath, newEnv);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>✅ Success!</h1><p>Refresh token saved to .env.local. You can close this tab.</p>');

      console.log('\n✅ Refresh token saved to .env.local');
      console.log('   GOOGLE_OAUTH_REFRESH_TOKEN=' + refreshToken.substring(0, 30) + '...');
      console.log('\n🚀 Now restart: npm run dev\n');

      server.close();
      process.exit(0);
    } catch (err) {
      res.writeHead(500);
      res.end('Error: ' + err.message);
      console.error('\n❌ Error getting token:', err.message);
      server.close();
    }
  }
});

server.listen(3333, () => {
  console.log('⏳ Waiting for authorization...\n');
});
