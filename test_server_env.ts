
import { config } from 'dotenv';
config(); // Load .env if it exists

console.log("--- SERVER ENVIRONMENT TEST ---");
const keys = Object.keys(process.env);
console.log(`Total Env Keys: ${keys.length}`);

const targets = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
  "KEY",
  "GOOGLE_DRIVE_KNOWLEDGE_FILE_ID",
  "DOC_ID",
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "VITE_GEMINI_API_KEY"
];

targets.forEach(k => {
  const val = process.env[k];
  if (val) {
    console.log(`${k}: PRESENT (Length: ${val.length}, Preview: ${val.substring(0, 5)}...)`);
  } else {
    console.log(`${k}: MISSING`);
  }
});

console.log("--- END TEST ---");
