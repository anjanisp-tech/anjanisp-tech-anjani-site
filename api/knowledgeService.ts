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

    // First, check the file metadata to see if it's a Google Doc or a binary file
    const metadata = await drive.files.get({ fileId, fields: 'mimeType' });
    const mimeType = metadata.data.mimeType;
    
    let buffer: Buffer;
    
    if (mimeType === 'application/vnd.google-apps.document') {
      // It's a native Google Doc, we must export it to docx first
      console.log(`[KNOWLEDGE] Detected Google Doc. Exporting to docx...`);
      const exportResponse = await drive.files.export(
        { fileId, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { responseType: 'arraybuffer' }
      );
      buffer = Buffer.from(exportResponse.data as ArrayBuffer);
    } else {
      // It's a binary file (like a .docx uploaded to Drive)
      console.log(`[KNOWLEDGE] Detected binary file (${mimeType}). Downloading...`);
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      buffer = Buffer.from(response.data as ArrayBuffer);
    }

    console.log(`[KNOWLEDGE] Extracting text from buffer...`);
    let result;
    try {
      result = await mammoth.extractRawText({ buffer });
    } catch (mammothErr: any) {
      console.error("[KNOWLEDGE] Mammoth extraction failed:", mammothErr.message);
      throw new Error(`Failed to extract text from document: ${mammothErr.message}`);
    }
    
    if (!result || !result.value) {
      console.warn("[KNOWLEDGE] Mammoth returned empty text.");
      return cachedKnowledge || "";
    }

    cachedKnowledge = result.value;
    lastSync = now;
    
    console.log(`[KNOWLEDGE] Sync complete. Length: ${cachedKnowledge.length} characters.`);
    return cachedKnowledge;
  } catch (error: any) {
    console.error("[KNOWLEDGE] Error syncing knowledge base:", error.message);
    return cachedKnowledge || ""; // Return old cache if sync fails
  }
}
