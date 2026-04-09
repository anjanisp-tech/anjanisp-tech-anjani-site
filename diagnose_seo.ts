import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

async function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  let privateKey = rawKey?.replace(/\\n/g, '\n');

  if (privateKey && !privateKey.includes('\n')) {
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";
    if (privateKey.startsWith(header) && privateKey.endsWith(footer)) {
      let content = privateKey.substring(header.length, privateKey.length - footer.length).trim();
      content = content.replace(/\s/g, '');
      const wrapped = content.match(/.{1,64}/g)?.join('\n');
      privateKey = `${header}\n${wrapped}\n${footer}\n`;
    }
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });

  return google.drive({ version: 'v3', auth });
}

async function diagnose() {
  const folderId = '1zGUDIliBvroej0Sbo4Rolagb0OnF-HU_';
  console.log(`Diagnosing Folder ID: ${folderId}`);
  
  try {
    const drive = await getDriveClient();
    
    // 1. Check root folder metadata
    console.log('\n--- Root Folder Metadata ---');
    try {
      const rootMeta = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType, owners, permissions'
      });
      console.log(JSON.stringify(rootMeta.data, null, 2));
    } catch (e: any) {
      console.error(`Error getting root folder: ${e.message}`);
    }

    // 2. List children of root
    console.log('\n--- Children of Root ---');
    const children = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)'
    });
    console.log(JSON.stringify(children.data.files, null, 2));

    // 3. Search for 01_PENDING anywhere (to see if it's nested differently)
    console.log('\n--- Searching for "01_PENDING" globally (accessible to SA) ---');
    const search = await drive.files.list({
      q: `name = '01_PENDING' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, parents)'
    });
    console.log(JSON.stringify(search.data.files, null, 2));

  } catch (err: any) {
    console.error(`Fatal Diagnostic Error: ${err.message}`);
  }
}

diagnose();
