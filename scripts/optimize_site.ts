import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "blog.db");
const db = new Database(dbPath);

async function optimizeSite() {
  console.log("Starting Website Optimization Agent...");
  
  const posts = db.prepare("SELECT * FROM posts").all();
  
  for (const post of posts) {
    console.log(`Optimizing post: ${post.title}`);
    let content = post.content;
    
    // 1. Ensure structure (H2, H3) - simple check
    if (!content.includes("##")) {
      content = content.replace(/###/g, "##"); // Promote H3 to H2 if no H2
    }
    
    // 2. Add Summary Block if missing
    if (!content.includes("### Summary") && !content.includes("## Summary")) {
      content += `\n\n## Summary\nThis article explores the critical transition from founder-led heroics to system-driven execution. By designing robust operating models, businesses can scale without compounding pressure on leadership.`;
    }
    
    // 3. Add Decision Checklist if missing
    if (!content.includes("Checklist")) {
      content += `\n\n## Decision Checklist\n- [ ] Identify current bottlenecks in decision-making\n- [ ] Map decision ownership to specific roles\n- [ ] Document the 'Operating Spine' of your core processes\n- [ ] Test system resilience by removing founder involvement from a single workflow`;
    }
    
    // 4. Ensure conceptual language consistency
    // (Operating Spine, Founder Dependency, Structural Execution Failure)
    if (!content.includes("Operating Spine")) {
      content = content.replace("operating design", "Operating Spine (operating design)");
    }
    
    db.prepare("UPDATE posts SET content = ? WHERE id = ?").run(content, post.id);
  }
  
  console.log("Optimization complete.");
}

optimizeSite().catch(console.error);
