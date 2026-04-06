import { google } from 'googleapis';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedKnowledge: string | null = null;
let lastSync: number = 0;
const SYNC_INTERVAL = 1000 * 60 * 60; // 1 hour

export async function getKnowledgeBase(): Promise<string> {
  const now = Date.now();
  if (cachedKnowledge && (now - lastSync < SYNC_INTERVAL)) {
    return cachedKnowledge;
  }

  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const fileId = process.env.GOOGLE_DRIVE_KNOWLEDGE_FILE_ID;

    if (!email || !privateKey || !fileId) {
      console.warn("Google Service Account credentials or File ID missing. Knowledge base will be empty.");
      return "";
    }

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log(`[KNOWLEDGE] Syncing knowledge base from Google Drive (File ID: ${fileId})...`);

    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    
    cachedKnowledge = result.value;
    lastSync = now;
    
    console.log(`[KNOWLEDGE] Sync complete. Length: ${cachedKnowledge.length} characters.`);
    return cachedKnowledge;
  } catch (error: any) {
    console.error("[KNOWLEDGE] Error syncing knowledge base:", error.message);
    return cachedKnowledge || ""; // Return old cache if sync fails
  }
}
