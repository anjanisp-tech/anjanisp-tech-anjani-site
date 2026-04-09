import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from "@google/genai";

export async function executeSeoInstruction(instruction: any) {
  const { action, target, payload } = instruction;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

  const ai = new GoogleGenAI({ apiKey });

  if (action === 'UPDATE_ROBOTS') {
    const dbModule = await import("./db.js");
    const { isPostgres, getSqliteDb } = dbModule;
    
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      await sql`INSERT INTO settings (key, value) VALUES ('robots_txt', ${payload.content}) 
                ON CONFLICT (key) DO UPDATE SET value = ${payload.content}, updated_at = CURRENT_TIMESTAMP`;
    } else {
      const db = getSqliteDb();
      if (db) {
        db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)")
          .run('robots_txt', payload.content);
      }
    }

    // Also try to write to filesystem for local dev/persistence if possible
    try {
      const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
      fs.writeFileSync(robotsPath, payload.content);
    } catch (e) {}

    return { success: true, message: "Updated robots.txt (saved to database)" };
  }

  if (action === 'UPDATE_SITEMAP') {
    const dbModule = await import("./db.js");
    const { isPostgres, getSqliteDb } = dbModule;
    
    let currentXml = "";
    
    // Try database first
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT value FROM settings WHERE key = 'sitemap_xml'`;
      currentXml = rows[0]?.value;
    } else {
      const db = getSqliteDb();
      if (db) {
        const row: any = db.prepare("SELECT value FROM settings WHERE key = ?").get('sitemap_xml');
        currentXml = row?.value;
      }
    }

    // Fallback to filesystem
    if (!currentXml) {
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      if (fs.existsSync(sitemapPath)) {
        currentXml = fs.readFileSync(sitemapPath, 'utf-8');
      } else {
        currentXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
      }
    }
    
    // Use AI to surgically add/remove URLs from XML
    const prompt = `You are an XML expert. Update this sitemap.xml content based on these instructions:
Add URLs: ${JSON.stringify(payload.add || [])}
Remove URLs: ${JSON.stringify(payload.remove || [])}

Current Sitemap:
${currentXml}

Return ONLY the updated XML content. No markdown blocks.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const updatedXml = result.text.trim().replace(/^```xml\n/, '').replace(/\n```$/, '');
    
    // Save back to database
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      await sql`INSERT INTO settings (key, value) VALUES ('sitemap_xml', ${updatedXml}) 
                ON CONFLICT (key) DO UPDATE SET value = ${updatedXml}, updated_at = CURRENT_TIMESTAMP`;
    } else {
      const db = getSqliteDb();
      if (db) {
        db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)")
          .run('sitemap_xml', updatedXml);
      }
    }

    // Also try to write to filesystem
    try {
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      fs.writeFileSync(sitemapPath, updatedXml);
    } catch (e) {}

    return { success: true, message: "Updated sitemap.xml (saved to database)" };
  }

  if (action === 'ADD_PAGE') {
    // Check if filesystem is writable
    try {
      const testFile = path.join(process.cwd(), '.write_test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (e) {
      throw new Error(`Filesystem is read-only. Action 'ADD_PAGE' requires a writable filesystem. Please execute this instruction in the AI Studio environment and then Publish your changes.`);
    }

    const pagePath = path.join(process.cwd(), target);
    const pageContent = `
import Layout from '../components/Layout';
import { motion } from 'motion/react';

export default function ${path.basename(target, '.tsx')}() {
  return (
    <Layout>
      <div className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ${payload.content}
        </motion.div>
      </div>
    </Layout>
  );
}
    `;
    fs.writeFileSync(pagePath, pageContent);

    // Update App.tsx to add the route
    const appPath = path.join(process.cwd(), 'src', 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    const appPrompt = `You are a React expert. Add a new lazy-loaded route to this App.tsx file.
New Page Component Name: ${path.basename(target, '.tsx')}
New Page Path: ${target}
New Route Path: ${payload.route}

Current App.tsx:
${appContent}

Return ONLY the updated App.tsx code. No markdown blocks.`;

    const appResult = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: appPrompt }] }]
    });
    const updatedApp = appResult.text.trim().replace(/^```tsx\n/, '').replace(/\n```$/, '');
    fs.writeFileSync(appPath, updatedApp);

    return { success: true, message: `Created page ${target} and added route ${payload.route}` };
  }

  // Surgical edits for existing pages
  if (!target) throw new Error("Target file is required for this action.");
  const absolutePath = path.join(process.cwd(), target);
  
  // Check if filesystem is writable
  try {
    const testFile = path.join(process.cwd(), '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
  } catch (e) {
    throw new Error(`Filesystem is read-only. Action '${action}' on '${target}' requires a writable filesystem. Please execute this instruction in the AI Studio environment and then Publish your changes.`);
  }

  if (!fs.existsSync(absolutePath)) throw new Error(`Target file ${target} not found.`);

  const currentCode = fs.readFileSync(absolutePath, 'utf-8');
  const prompt = `You are a React and SEO expert. Apply the following SEO instruction to the provided React component code.
Action: ${action}
Payload: ${JSON.stringify(payload)}

Current Code:
${currentCode}

Instructions for the edit:
- If UPDATE_METADATA: Ensure <title> and <meta name="description"> are present/updated. If using a custom SEO component, update its props. If not, inject them into the JSX or use a useEffect to update document.title.
- If UPDATE_OG_TAGS: Ensure og: and twitter: meta tags are present/updated.
- If UPDATE_HEADING_STRUCTURE: Find the element with text matching 'old_text' and change its tag to 'tag' and text to 'new_text'.
- If ADD_INTERNAL_LINK: Find 'after_text' and append a <Link to='url'>anchor_text</Link> after it.
- If UPDATE_IMAGE_ALT: Find <img> with src matching 'image_src' and update its alt attribute.
- If ADD_SCHEMA: Inject a <script type="application/ld+json"> block with the provided data into the component's return.
- If INJECT_CONTENT: Inject 'content' at 'position' relative to 'anchor' (id or text).
- If ADD_CANONICAL: Add <link rel="canonical" href="url" />.
- If ADD_HREFLANG: Add <link rel="alternate" hreflang="lang" href="url" />.
- If UPDATE_PAGE_SPEED: Add loading="lazy" to images, ensure scripts are deferred.

Return ONLY the updated code. No markdown blocks, no explanations.`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });
  const updatedCode = result.text.trim().replace(/^```tsx\n/, '').replace(/\n```$/, '');
  
  // Basic safety check: ensure it's still valid-ish code
  if (!updatedCode.includes('export default')) {
    throw new Error("AI generated invalid code (missing export default). Aborting.");
  }

  fs.writeFileSync(absolutePath, updatedCode);
  return { success: true, message: `Successfully applied ${action} to ${target}` };
}
