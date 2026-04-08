
console.log("Checking environment keys...");
const keys = Object.keys(process.env);
console.log("Total keys:", keys.length);
const targetKeys = [
  "EMAIL", "KEY", "DOC_ID", 
  "GOOGLE_SERVICE_ACCOUNT_EMAIL", 
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", 
  "GOOGLE_DRIVE_KNOWLEDGE_FILE_ID",
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY"
];

targetKeys.forEach(k => {
  const val = process.env[k];
  console.log(`${k}: ${val ? 'PRESENT (' + val.length + ' chars)' : 'MISSING'}`);
});

console.log("\nSearching for other potential keys...");
keys.forEach(k => {
  if (k.includes("KEY") || k.includes("API") || k.includes("TOKEN")) {
    console.log(`${k}: PRESENT (${process.env[k]?.length} chars)`);
  }
});
