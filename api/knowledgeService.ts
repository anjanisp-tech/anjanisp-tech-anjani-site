import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedKnowledge: string | null = null;
let lastSync: number = 0;
const SYNC_INTERVAL = 1000 * 60 * 60; // 1 hour

export async function getKnowledgeBase(force: boolean = false, fileIdOverride?: string): Promise<string> {
  const now = Date.now();
  if (!force && cachedKnowledge && (now - lastSync < SYNC_INTERVAL)) {
    return cachedKnowledge;
  }

    try {
      const { google } = await import('googleapis');
      const mammoth = (await import('mammoth')).default;
      
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.EMAIL;
      const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.KEY;
      const privateKey = rawKey?.replace(/\\n/g, '\n');
      const fileId = fileIdOverride || process.env.GOOGLE_DRIVE_KNOWLEDGE_FILE_ID || process.env.DOC_ID;

      if (!email || !privateKey || !fileId) {
        const missing = [];
        if (!email) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL (or EMAIL)");
        if (!privateKey) missing.push("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (or KEY)");
        if (!fileId) missing.push("GOOGLE_DRIVE_KNOWLEDGE_FILE_ID (or DOC_ID)");
        console.warn(`[KNOWLEDGE] Missing credentials: ${missing.join(", ")}`);
        return "";
      }

      const auth = new google.auth.JWT({
        email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
      });

      const drive = google.drive({ version: 'v3', auth });

      console.log(`[KNOWLEDGE] Syncing knowledge base from Google Drive (File ID: ${fileId})...`);

      // First, check the file metadata
      let metadata;
      try {
        metadata = await drive.files.get({ fileId, fields: 'mimeType, name' });
      } catch (metaErr: any) {
        if (metaErr.code === 404) throw new Error(`File not found. Check File ID: ${fileId}`);
        if (metaErr.code === 403) throw new Error(`Permission denied. Ensure service account (${email}) has 'Viewer' access to the file.`);
        throw metaErr;
      }

      const mimeType = metadata.data.mimeType;
      const fileName = metadata.data.name;
      console.log(`[KNOWLEDGE] Found file: "${fileName}" (${mimeType})`);
      
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
