import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "blog.db");
const db = new Database(dbPath);

const posts = db.prepare("SELECT id, title FROM posts").all();
console.log("Current Posts in DB:");
console.log(JSON.stringify(posts, null, 2));

const targetTitle = "SYSTEMS OUTLAST HEROICS";
const newTitle = "WHY SPEED BECOMES DANGEROUS INSIDE GROWING ORGANIZATIONS";
const exists = posts.find(p => p.title.toUpperCase() === targetTitle.toUpperCase());

if (exists) {
  console.log(`Found post: ${exists.id}. Updating title.`);
  db.prepare("UPDATE posts SET title = ? WHERE id = ?").run(newTitle, exists.id);
  console.log("Update complete.");
} else {
  console.log("Post not found in DB.");
}
