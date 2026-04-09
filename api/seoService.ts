import { google } from 'googleapis';
import fs from 'fs';

function logDebug(msg: string) {
  try {
    const timestamp = new Date().toISOString();
    const logPath = process.env.VERCEL ? '/tmp/seo_debug.log' : 'seo_debug.log';
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
  } catch (e) {}
}

export interface SeoInstruction {
  id: string;
  name: string;
  content: any;
}

export async function getSeoFolderId(): Promise<string | undefined> {
  const envId = process.env.GOOGLE_DRIVE_SEO_FOLDER_ID;
  if (envId) {
    logDebug(`Using Folder ID from ENV: ${envId}`);
    return envId;
  }

  try {
    const dbModule = await import("./db.js");
    const { isPostgres, getSqliteDb, useMockDb } = dbModule;
    
    let dbId: string | undefined;
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT value FROM settings WHERE key = 'GOOGLE_DRIVE_SEO_FOLDER_ID'`;
      dbId = rows[0]?.value;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('GOOGLE_DRIVE_SEO_FOLDER_ID');
        dbId = row?.value;
      }
    }
    logDebug(`Using Folder ID from DB: ${dbId}`);
    return dbId;
  } catch (err: any) {
    logDebug(`Failed to fetch SEO Folder ID from DB: ${err.message}`);
  }
  
  return undefined;
}

async function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.KEY;
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

  if (!email || !privateKey) {
    throw new Error("Missing Google Service Account credentials.");
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  return google.drive({ version: 'v3', auth });
}

export async function listPendingInstructions(folderId: string): Promise<SeoInstruction[]> {
  logDebug(`listPendingInstructions called with folderId: ${folderId}`);
  const drive = await getDriveClient();
  
  let rootFolderId = folderId;
  let pendingFolderId = '';

  try {
    // Check if the provided ID is actually the 01_PENDING folder
    const currentFolder = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, parents'
    });
    logDebug(`Current folder name: ${currentFolder.data.name}`);

    if (currentFolder.data.name === '01_PENDING') {
      pendingFolderId = folderId;
      rootFolderId = currentFolder.data.parents?.[0] || folderId;
    } else {
      // Find the 01_PENDING subfolder
      const folderRes = await drive.files.list({
        q: `'${folderId}' in parents and name = '01_PENDING' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)'
      });
      pendingFolderId = folderRes.data.files?.[0]?.id || '';
      logDebug(`Found 01_PENDING subfolder: ${pendingFolderId}`);
    }
  } catch (err: any) {
    logDebug(`Error finding pending folder: ${err.message}`);
    throw err;
  }

  if (!pendingFolderId) {
    logDebug(`No pending folder found for ID: ${folderId}`);
    return [];
  }

  const filesRes = await drive.files.list({
    q: `'${pendingFolderId}' in parents and mimeType = 'application/json' and trashed = false`,
    fields: 'files(id, name)',
    orderBy: 'name'
  });
  logDebug(`Found ${filesRes.data.files?.length || 0} JSON files in pending folder`);

  const instructions: SeoInstruction[] = [];
  try {
    for (const file of filesRes.data.files || []) {
      if (file.id && file.name) {
        const contentRes = await drive.files.get({
          fileId: file.id,
          alt: 'media'
        });
        instructions.push({
          id: file.id,
          name: file.name,
          content: contentRes.data
        });
      }
    }
  } catch (err: any) {
    logDebug(`Error reading file content: ${err.message}`);
    throw new Error(`Failed to read instruction content: ${err.message}`);
  }

  return instructions;
}

export async function moveInstruction(fileId: string, folderId: string, status: 'PROCESSED' | 'FAILED') {
  const drive = await getDriveClient();
  
  let rootFolderId = folderId;

  // Check if the provided ID is actually the 01_PENDING folder
  const currentFolder = await drive.files.get({
    fileId: folderId,
    fields: 'id, name, parents'
  });

  if (currentFolder.data.name === '01_PENDING') {
    rootFolderId = currentFolder.data.parents?.[0] || folderId;
  }

  const targetFolderName = status === 'PROCESSED' ? '02_PROCESSED' : '03_FAILED';
  const folderRes = await drive.files.list({
    q: `'${rootFolderId}' in parents and name = '${targetFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)'
  });

  const targetFolderId = folderRes.data.files?.[0]?.id;
  if (!targetFolderId) throw new Error(`Target folder ${targetFolderName} not found.`);

  // Get current parents
  const file = await drive.files.get({
    fileId,
    fields: 'parents'
  });
  const previousParents = file.data.parents?.join(',') || '';

  // Move the file
  await drive.files.update({
    fileId,
    addParents: targetFolderId,
    removeParents: previousParents,
    fields: 'id, parents'
  });
}
