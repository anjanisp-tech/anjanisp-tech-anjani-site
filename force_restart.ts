
console.log("--- FORCING SERVER RESTART ---");
console.log("Current Process ID:", process.pid);
console.log("Timestamp:", new Date().toISOString());

setTimeout(() => {
  console.log("Exiting process now...");
  process.exit(0);
}, 1000);
