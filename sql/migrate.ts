import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  const migrationFiles = readdirSync(__dirname)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort();

  for (const file of migrationFiles) {
    console.log(`Running ${file}...`);
    const sql = readFileSync(join(__dirname, file), "utf-8");
    await pool.query(sql);
  }

  await pool.end();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
