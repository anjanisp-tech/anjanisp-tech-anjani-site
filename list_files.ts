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

async function listAll() {
  try {
    const drive = await getDriveClient();
    console.log('Listing all files accessible to Service Account:');
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, parents)',
    });
    console.log(JSON.stringify(res.data.files, null, 2));
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
  }
}

listAll();
