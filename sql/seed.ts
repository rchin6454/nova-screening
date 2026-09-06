import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Seeding roles...");

  const engDesc = "Senior Software Engineer role. The team builds distributed systems in Go and TypeScript. The role involves designing APIs, mentoring junior engineers, and contributing to system architecture decisions. The team values clear communication about technical trade-offs and experience with production systems at scale.";
  const tutorDesc = "Math Tutor role for grades 6 through 12. Tutors work one-on-one with students in after-school sessions. The role requires patience, the ability to explain concepts at multiple levels, and comfort with both in-person and virtual sessions. Prior teaching or tutoring experience is valued but not required. Scheduling flexibility for afternoon and weekend hours is important.";
  const restaurantDesc = "Restaurant Manager role overseeing a high-volume, full-service restaurant. Responsibilities include staff scheduling and training, inventory and cost control, maintaining service quality during peak hours, and handling guest escalations. The role requires hands-on floor leadership during rushes and comfort balancing service quality against labor and food costs. This is a full-time, on-site position.";

  await sql`INSERT INTO roles (name, role_family, description) VALUES ('Senior Software Engineer', 'engineering', ${engDesc}) ON CONFLICT (name) DO NOTHING`;
  await sql`INSERT INTO roles (name, role_family, description) VALUES ('Math Tutor', 'frontline', ${tutorDesc}) ON CONFLICT (name) DO NOTHING`;
  await sql`INSERT INTO roles (name, role_family, description) VALUES ('Restaurant Manager', 'frontline', ${restaurantDesc}) ON CONFLICT (name) DO NOTHING`;

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
