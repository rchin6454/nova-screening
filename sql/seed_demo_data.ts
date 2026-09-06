import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

interface DemoTurn {
  role: "assistant" | "user";
  content: string;
}

interface DemoDimension {
  rating: "strong" | "adequate" | "weak" | "not_assessed";
  evidence: string;
}

interface DemoScore {
  score: "high" | "medium" | "low";
  rationale: string;
  dimensions: {
    communication: DemoDimension;
    role_relevant_experience: DemoDimension;
    motivation_and_fit: DemoDimension;
    availability_constraints: DemoDimension;
  };
  blocking_constraints: string[];
  time_sensitive_flags: string[];
  insufficient_evidence: boolean;
  unasked_areas: string[];
}

const SEED_NOTE =
  "SEED DATA (not model-generated): synthetic demo transcript authored for prototype seeding, informed by publicly documented phone-screen question patterns (see conversation record for sources). OpenAI credits were unavailable at seed time.";

async function getRoleId(name: string): Promise<string> {
  const { rows } = await pool.query(`SELECT id FROM roles WHERE name = $1`, [name]);
  if (rows.length === 0) throw new Error(`Role not found: ${name}. Run npm run db:seed first.`);
  return rows[0].id;
}

async function alreadySeeded(roleId: string, candidateName: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT id FROM sessions WHERE role_id = $1 AND candidate_name = $2`,
    [roleId, candidateName]
  );
  return rows.length > 0;
}

async function seedDemoSession(
  roleId: string,
  candidateName: string,
  turns: DemoTurn[],
  score: DemoScore
) {
  if (await alreadySeeded(roleId, candidateName)) {
    console.log(`Skipping ${candidateName} (already seeded).`);
    return;
  }

  const { rows: sessionRows } = await pool.query(
    `INSERT INTO sessions (role_id, candidate_name, status) VALUES ($1, $2, 'awaiting_consent') RETURNING id`,
    [roleId, candidateName]
  );
  const sessionId: string = sessionRows[0].id;

  await pool.query(
    `INSERT INTO events (session_id, event_type, payload) VALUES ($1, 'session_started', $2)`,
    [sessionId, JSON.stringify({ role_id: roleId, candidate_name: candidateName })]
  );

  await pool.query(`UPDATE sessions SET status = 'active' WHERE id = $1`, [sessionId]);
  await pool.query(`INSERT INTO events (session_id, event_type) VALUES ($1, 'consent_given')`, [sessionId]);

  for (const turn of turns) {
    await pool.query(
      `INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)`,
      [sessionId, turn.role, turn.content]
    );
    await pool.query(
      `INSERT INTO events (session_id, event_type, payload) VALUES ($1, 'message_sent', $2)`,
      [sessionId, JSON.stringify({ role: turn.role })]
    );
  }

  // Same consistency guard as src/lib/scoreSession.ts: a blocking
  // constraint or insufficient evidence forces the score to "low"
  // regardless of what's otherwise stated, so seed data can't drift
  // from the enforcement the real scoring path applies.
  const mustBeLow = score.blocking_constraints.length > 0 || score.insufficient_evidence;
  const finalScore = mustBeLow ? "low" : score.score;
  const overridden = mustBeLow && score.score !== "low";

  await pool.query(
    `INSERT INTO scores (session_id, version, score, rationale, dimensions, blocking_constraints, time_sensitive_flags, insufficient_evidence, unasked_areas, raw_response)
     VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      sessionId,
      finalScore,
      score.rationale,
      JSON.stringify(score.dimensions),
      JSON.stringify(score.blocking_constraints),
      JSON.stringify(score.time_sensitive_flags),
      score.insufficient_evidence,
      JSON.stringify(score.unasked_areas),
      SEED_NOTE,
    ]
  );

  await pool.query(
    `INSERT INTO events (session_id, event_type, payload) VALUES ($1, 'score_generated', $2)`,
    [sessionId, JSON.stringify({ score: finalScore, error: false, version: 1, score_overridden: overridden })]
  );

  if (score.insufficient_evidence) {
    await pool.query(
      `INSERT INTO events (session_id, event_type, payload) VALUES ($1, 'insufficient_evidence_flagged', $2)`,
      [sessionId, JSON.stringify({ unasked_areas: score.unasked_areas })]
    );
  }

  for (const constraint of score.blocking_constraints) {
    await pool.query(
      `INSERT INTO events (session_id, event_type, payload) VALUES ($1, 'blocking_constraint_detected', $2)`,
      [sessionId, JSON.stringify({ constraint })]
    );
  }

  await pool.query(`UPDATE sessions SET status = 'completed', ended_at = now() WHERE id = $1`, [sessionId]);
  await pool.query(`INSERT INTO events (session_id, event_type) VALUES ($1, 'session_ended')`, [sessionId]);

  console.log(`Seeded ${candidateName} -> ${finalScore}${overridden ? " (overridden)" : ""}`);
}

async function main() {
  const engineeringId = await getRoleId("Senior Software Engineer");
  const tutorId = await getRoleId("Math Tutor");
  const restaurantId = await getRoleId("Restaurant Manager");

  // --- 1. Engineering / high ---
  await seedDemoSession(
    engineeringId,
    "Priya Raman",
    [
      { role: "assistant", content: "Hi Priya, this is Nova, an AI assistant from Northwind Systems. I'm reaching out to conduct an initial screening conversation for the Senior Software Engineer position. Do you consent to speaking with an AI about this opportunity? I want to confirm you're aware I'm artificial intelligence and not a human before we begin." },
      { role: "user", content: "Yes, that's fine, go ahead." },
      { role: "assistant", content: "Great, thank you. Hi Priya, this is Nova calling from Northwind Systems about the Senior Software Engineer position. Is now still a good time for a quick call?" },
      { role: "user", content: "Yes, I have about twenty minutes." },
      { role: "assistant", content: "Perfect. Northwind Systems is hiring a Senior Software Engineer, fully remote. This would be a full-time position. Are you open to exploring a new opportunity right now?" },
      { role: "user", content: "Yes, I'm actively looking." },
      { role: "assistant", content: "Great to hear. Walk me through the key technologies you used in your most recent role and how you evaluated their fit for the problem domain." },
      { role: "user", content: "At my last company I led the migration of our event pipeline from a monolithic Rails app to Go microservices communicating over Kafka. We chose Kafka because we needed at-least-once delivery guarantees and had to handle bursts of up to 40,000 events per second during peak hours." },
      { role: "assistant", content: "That's a strong data point. You mentioned migrating to Kafka for the event pipeline - can you share more about how you handled schema evolution and consumer group rebalancing as the number of services grew?" },
      { role: "user", content: "We used Avro with a schema registry so producers and consumers could evolve independently as long as changes were backward compatible. For rebalancing, we tuned the session timeout and max poll interval, and eventually moved high-throughput consumers to static membership to avoid unnecessary rebalances during deploys." },
      { role: "assistant", content: "Thanks for that detail. Shifting gears slightly, how would you say that experience relates to the Senior Software Engineer position here?" },
      { role: "user", content: "This role also mentions distributed systems and mentoring junior engineers, which is exactly what I did - I paired with two junior engineers during the migration and wrote the internal on-call runbook." },
      { role: "assistant", content: "On that Kafka migration, which components did you personally architect and code versus delegate or inherit from the previous system?" },
      { role: "user", content: "I designed the consumer group topology and the retry and dead-letter-queue pattern myself. The schema registry setup was inherited from a platform team, and I extended it rather than building it from scratch." },
      { role: "assistant", content: "What interests you most about our specific deployment challenges and how does this role fit into your desired technical trajectory over the next few years?" },
      { role: "user", content: "I want to keep growing into a role that mixes hands-on architecture with mentoring - your posting mentioned API design and mentoring junior engineers, which is the direction I want to go rather than pure IC work." },
      { role: "assistant", content: "A couple quick logistics questions before we wrap up - are you considering any other offers currently? And do you have any constraints around start date or location I should pass along to the hiring manager?" },
      { role: "user", content: "No other offers in play right now. I'm remote-only, and I could start within four weeks of an offer." },
      { role: "assistant", content: "To recap, here are the next steps:" },
      { role: "assistant", content: "1. I'll share my notes from this call with the hiring manager and recruiting team." },
      { role: "assistant", content: "2. A human recruiter will follow up within a week to share an update on your application." },
      { role: "assistant", content: "Do those next steps make sense?" },
      { role: "user", content: "Yes, sounds good." },
      { role: "assistant", content: "Thanks Priya, it was great to chat today. Have a great rest of your day!" },
    ],
    {
      score: "high",
      rationale: "Priya gave concrete, quantified technical detail (40,000 events/second, Avro schema registry, static membership tuning) and clearly distinguished what she personally architected versus inherited. Her stated motivation directly maps to the role's mentoring and API design responsibilities, and she has no scheduling or offer constraints.",
      dimensions: {
        communication: { rating: "strong", evidence: "We used Avro with a schema registry so producers and consumers could evolve independently as long as changes were backward compatible." },
        role_relevant_experience: { rating: "strong", evidence: "I designed the consumer group topology and the retry and dead-letter-queue pattern myself." },
        motivation_and_fit: { rating: "strong", evidence: "your posting mentioned API design and mentoring junior engineers, which is the direction I want to go rather than pure IC work" },
        availability_constraints: { rating: "strong", evidence: "No other offers in play right now. I'm remote-only, and I could start within four weeks of an offer." },
      },
      blocking_constraints: [],
      time_sensitive_flags: [],
      insufficient_evidence: false,
      unasked_areas: ["specific salary expectations were not explicitly confirmed"],
    }
  );

  // --- 2. Engineering / low, blocking constraint ---
  await seedDemoSession(
    engineeringId,
    "Daniel Osei",
    [
      { role: "assistant", content: "Hi Daniel, this is Nova, an AI assistant from Halden Data. I'm reaching out to conduct an initial screening conversation for the Senior Software Engineer position. Do you consent to speaking with an AI about this opportunity? I want to confirm you're aware I'm artificial intelligence and not a human before we begin." },
      { role: "user", content: "Sure, that's fine." },
      { role: "assistant", content: "Hi Daniel, this is Nova calling from Halden Data about the Senior Software Engineer position. Is now still a good time for a quick call?" },
      { role: "user", content: "Yes, go ahead, I have a bit of time." },
      { role: "assistant", content: "Halden Data is hiring a Senior Software Engineer, working from our office. This would be a full-time position. Are you open to exploring a new opportunity right now?" },
      { role: "user", content: "I'm open to hearing about it, though I should mention upfront I already accepted another offer last week." },
      { role: "assistant", content: "I appreciate you letting me know early - I've noted that for the team. Let's still go through a few questions in case it's useful context for future roles. Walk me through the key technologies you used in your most recent role and how you evaluated their fit for the problem domain." },
      { role: "user", content: "I mostly worked with a Django backend and Postgres. We picked Postgres because it was already in use company-wide." },
      { role: "assistant", content: "You mentioned the Django backend - can you share more about the scale of traffic it handled and any specific performance issues you had to address?" },
      { role: "user", content: "It wasn't super high traffic, maybe a few thousand requests a day. I didn't really run into major performance issues." },
      { role: "assistant", content: "Understood. Was there a specific optimization or architectural decision from that role you're particularly proud of?" },
      { role: "user", content: "Not really anything specific comes to mind, it was pretty standard CRUD work." },
      { role: "assistant", content: "A couple quick logistics questions before we wrap up - are you considering any other offers currently? And do you have any constraints around start date or location I should pass along to the hiring manager?" },
      { role: "user", content: "As I mentioned, I already accepted an offer elsewhere, so I'm not actively looking, but wanted to be polite and take the call." },
      { role: "assistant", content: "Thanks Daniel, it was great to chat today. We really appreciate you taking the time. Have a great rest of your day!" },
    ],
    {
      score: "low",
      rationale: "Daniel disclosed upfront that he accepted another offer, making this a hard blocking constraint regardless of technical fit. His technical answers also stayed generic (\"pretty standard CRUD work\") without volunteering scale, ownership, or a specific project he could speak to in depth.",
      dimensions: {
        communication: { rating: "adequate", evidence: "It wasn't super high traffic, maybe a few thousand requests a day." },
        role_relevant_experience: { rating: "weak", evidence: "Not really anything specific comes to mind, it was pretty standard CRUD work." },
        motivation_and_fit: { rating: "weak", evidence: "I already accepted an offer elsewhere, so I'm not actively looking, but wanted to be polite and take the call." },
        availability_constraints: { rating: "weak", evidence: "I should mention upfront I already accepted another offer last week." },
      },
      blocking_constraints: ["accepted another offer"],
      time_sensitive_flags: [],
      insufficient_evidence: false,
      unasked_areas: [],
    }
  );

  // --- 3. Frontline Math Tutor / medium ---
  await seedDemoSession(
    tutorId,
    "Jordan Lee",
    [
      { role: "assistant", content: "Hi Jordan, this is Nova, an AI assistant from BrightPath Learning. I'm reaching out to conduct an initial screening conversation for the Math Tutor position. Do you consent to speaking with an AI about this opportunity? I want to confirm you're aware I'm artificial intelligence and not a human before we begin." },
      { role: "user", content: "Yeah that's fine, go for it." },
      { role: "assistant", content: "Hi Jordan, this is Nova calling from BrightPath Learning about the Math Tutor position. Is now still a good time for a quick call?" },
      { role: "user", content: "Yep, now works." },
      { role: "assistant", content: "BrightPath Learning is hiring a Math Tutor working with students after school, a mix of in-person and virtual sessions. This would be a part-time position. Are you open to exploring a new opportunity right now?" },
      { role: "user", content: "Yes I'd love to hear more, I've been looking for tutoring work." },
      { role: "assistant", content: "To start, can you share a story that captures what your day-to-day responsibilities look like when things are at their most challenging?" },
      { role: "user", content: "Sure, I tutor a lot of middle schoolers who get frustrated with fractions. Usually I just try to slow down and use visuals, like pizza slices, to make it click." },
      { role: "assistant", content: "That sounds like a great approach. Can you walk me through a specific time a student was really struggling and how you turned it around?" },
      { role: "user", content: "There was one student who kept shutting down whenever she got a wrong answer. I started having her explain her thinking out loud before I said anything, which helped her catch her own mistakes and built her confidence over a few weeks." },
      { role: "assistant", content: "What parts of that approach did you come up with yourself versus learn from a mentor or program?" },
      { role: "user", content: "The 'explain your thinking out loud' technique I actually picked up from a training at my last tutoring job, but I adapted it and started using it earlier in sessions than they originally suggested." },
      { role: "assistant", content: "Can you share a bit about what caught your attention in the job description for this role?" },
      { role: "user", content: "Honestly the flexible scheduling stood out since I have another part-time job, and I like that it's one-on-one rather than a big classroom." },
      { role: "assistant", content: "A couple quick logistics questions before we wrap up - do you have a sense of your availability for afternoon or weekend sessions? And any other tutoring commitments I should know about?" },
      { role: "user", content: "I can do weekday afternoons after 3pm and most of Saturday. I do tutor for one other family right now but it's only two hours a week, so it shouldn't conflict." },
      { role: "assistant", content: "Thanks Jordan, it was great to chat today. We really appreciate you taking the time. Have a great rest of your day!" },
    ],
    {
      score: "medium",
      rationale: "Jordan described a specific, warm technique for building student confidence and was transparent about which parts came from prior training versus their own adaptation. Motivation leaned more on schedule flexibility than passion for tutoring specifically, and availability is clear with only a minor existing commitment.",
      dimensions: {
        communication: { rating: "strong", evidence: "I started having her explain her thinking out loud before I said anything, which helped her catch her own mistakes and built her confidence over a few weeks." },
        role_relevant_experience: { rating: "adequate", evidence: "The 'explain your thinking out loud' technique I actually picked up from a training at my last tutoring job, but I adapted it." },
        motivation_and_fit: { rating: "adequate", evidence: "Honestly the flexible scheduling stood out since I have another part-time job." },
        availability_constraints: { rating: "strong", evidence: "I can do weekday afternoons after 3pm and most of Saturday." },
      },
      blocking_constraints: [],
      time_sensitive_flags: [],
      insufficient_evidence: false,
      unasked_areas: ["compensation expectations were not discussed"],
    }
  );

  // --- 4. Frontline Restaurant Manager / high ---
  await seedDemoSession(
    restaurantId,
    "Maria Gutierrez",
    [
      { role: "assistant", content: "Hi Maria, this is Nova, an AI assistant from Fernwood Hospitality Group. I'm reaching out to conduct an initial screening conversation for the Restaurant Manager position. Do you consent to speaking with an AI about this opportunity? I want to confirm you're aware I'm artificial intelligence and not a human before we begin." },
      { role: "user", content: "Yes, that's totally fine." },
      { role: "assistant", content: "Hi Maria, this is Nova calling from Fernwood Hospitality Group about the Restaurant Manager position. Is now still a good time for a quick call?" },
      { role: "user", content: "Yes, now is good." },
      { role: "assistant", content: "Fernwood Hospitality Group is hiring a Restaurant Manager, working from our location on-site. This would be a full-time position. Are you open to exploring a new opportunity right now?" },
      { role: "user", content: "Yes, I'm definitely interested, I've been looking to move into a bigger venue." },
      { role: "assistant", content: "To start, can you share a story that captures what your day-to-day responsibilities look like when things are at their most challenging?" },
      { role: "user", content: "At my current restaurant we do about 300 covers on a Friday night. My most challenging days are when we're short-staffed - I'm running the floor, jumping on host duties, and coaching a newer server through a rush all at once." },
      { role: "assistant", content: "Can you walk me through a specific tough service you handled, step by step, and where your judgment came into play?" },
      { role: "user", content: "We had two servers call out sick on a Saturday during a private event plus regular service. I re-sectioned the floor, pulled our strongest server onto the private event, and had our bartender cross-cover two tables during the rush. We finished the night with no major complaints, and I personally checked in on the tables that waited longest." },
      { role: "assistant", content: "What parts of that solution did you drive independently versus rely on existing policy for?" },
      { role: "user", content: "The re-sectioning and pulling the bartender onto tables was my call in the moment - there's no official policy for that exact scenario. Comping the one table that waited nearly 25 minutes for their appetizers was per our standard service-recovery policy." },
      { role: "assistant", content: "Can you share a bit about what caught your attention in the job description for this role and why it aligns with the direction you'd like to take your career?" },
      { role: "user", content: "The higher volume and the multi-unit structure stood out - I want to grow toward a multi-unit manager role eventually, and this looks like the right stepping stone." },
      { role: "assistant", content: "A couple quick logistics questions before we wrap up - are you considering any other offers currently, and do you have any constraints around start date or commute I should pass along?" },
      { role: "user", content: "No other offers right now. I'd need to give my current employer two weeks' notice, and the commute from where I live is about 25 minutes, which works fine for me." },
      { role: "assistant", content: "Thanks Maria, it was great to chat today. We really appreciate you taking the time. Have a great rest of your day!" },
    ],
    {
      score: "high",
      rationale: "Maria gave a concrete, quantified account of handling a double call-out during a private event, clearly separating her own in-the-moment judgment from standard policy. Her motivation ties directly to a stated multi-unit career goal, and she has a short, standard notice period with no other offers or commute issues.",
      dimensions: {
        communication: { rating: "strong", evidence: "At my current restaurant we do about 300 covers on a Friday night." },
        role_relevant_experience: { rating: "strong", evidence: "I re-sectioned the floor, pulled our strongest server onto the private event, and had our bartender cross-cover two tables during the rush." },
        motivation_and_fit: { rating: "strong", evidence: "I want to grow toward a multi-unit manager role eventually, and this looks like the right stepping stone." },
        availability_constraints: { rating: "strong", evidence: "I'd need to give my current employer two weeks' notice, and the commute from where I live is about 25 minutes, which works fine for me." },
      },
      blocking_constraints: [],
      time_sensitive_flags: ["two-week notice period"],
      insufficient_evidence: false,
      unasked_areas: [],
    }
  );

  // --- 5. Engineering / insufficient evidence, short screen ---
  await seedDemoSession(
    engineeringId,
    "Sam Kim",
    [
      { role: "assistant", content: "Hi Sam, this is Nova, an AI assistant from Anchorpoint Systems. I'm reaching out to conduct an initial screening conversation for the Senior Software Engineer position. Do you consent to speaking with an AI about this opportunity? I want to confirm you're aware I'm artificial intelligence and not a human before we begin." },
      { role: "user", content: "Sure." },
      { role: "assistant", content: "Hi Sam, this is Nova calling from Anchorpoint Systems about the Senior Software Engineer position. Is now still a good time for a quick call?" },
      { role: "user", content: "Yeah, quickly, I only have a couple minutes." },
      { role: "assistant", content: "Anchorpoint Systems is hiring a Senior Software Engineer. This would be a full-time position. Are you open to exploring a new opportunity right now?" },
      { role: "user", content: "Maybe, not sure yet." },
      { role: "assistant", content: "No problem, I'll keep it brief. Walk me through the key technologies you used in your most recent role and how you evaluated their fit for the problem domain." },
      { role: "user", content: "Uh, just some backend stuff, nothing too special." },
    ],
    {
      score: "low",
      rationale: "The screen ended after a single, non-specific answer and an expressed lack of certainty about interest in the role. There isn't enough conversation to assess technical experience, communication under follow-up, or motivation - this reflects a short call, not a negative signal about the candidate.",
      dimensions: {
        communication: { rating: "not_assessed", evidence: "Uh, just some backend stuff, nothing too special." },
        role_relevant_experience: { rating: "not_assessed", evidence: "Uh, just some backend stuff, nothing too special." },
        motivation_and_fit: { rating: "weak", evidence: "Maybe, not sure yet." },
        availability_constraints: { rating: "not_assessed", evidence: "Yeah, quickly, I only have a couple minutes." },
      },
      blocking_constraints: [],
      time_sensitive_flags: [],
      insufficient_evidence: true,
      unasked_areas: [
        "technical depth on any named project",
        "notice period and salary expectations",
        "location or remote preference",
        "reason for hesitance about the opportunity",
      ],
    }
  );

  await pool.end();
  console.log("Demo data seed complete.");
}

main().catch((err) => {
  console.error("Demo data seed failed:", err);
  process.exit(1);
});
