
async function testDiagnostic() {
  try {
    const response = await fetch('http://localhost:3000/api/diagnostic');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Fetch failed:", err.message);
  }
}
testDiagnostic();
