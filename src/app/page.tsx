import Link from "next/link";
import DownloadPdfButton from "./DownloadPdfButton";

export const metadata = {
  title: "Thinking and Understanding",
};

const h2 = "mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-[#6C3FD1]";
const h3 = "mt-7 mb-2 text-base font-semibold text-[#1F1B2E]";
const p = "mb-4 leading-[1.8]";
const ul = "mb-4 list-disc space-y-2 pl-5 leading-[1.8]";

const FEEDBACK_COLUMNS = [
  "S.No",
  "Feedback given",
  "Underlying ask",
  "What does it mean for us?",
  "Type of failure",
  "Type of request",
] as const;

const FEEDBACK_ITEMS: string[][] = [
  [
    "1",
    "“Candidates keep saying the AI sounds like it's reading a script when we screen for the restaurant manager roles. Feels robotic, not like a real conversation.”",
    "I want Nova to have a more natural conversational style that encourages candidates to engage.",
    "Candidates perceive Nova as scripted, which may reduce engagement.",
    "Speaking failure",
    "Conversation quality gap",
  ],
  [
    "2",
    "“Our engineering screens are going fine but I noticed Nova doesn't push back when a candidate gives a vague answer to a technical question. It just moves to the next question.”",
    "I want Nova to challenge vague or incomplete candidate responses.",
    "Nova is moving through questions without establishing sufficient evidence.",
    "Reacting failure",
    "Conversation quality gap",
  ],
  [
    "3",
    "“Can Nova ask follow-up questions based on what the candidate just said, instead of just going down a fixed list?”",
    "I want Nova to ask relevant follow-up questions based on the candidate's responses to better assess their experience and fit.",
    "Users want Nova to adapt to candidate responses rather than follow a fixed flow.",
    "Reacting failure",
    "Conversation quality gap",
  ],
  [
    "4",
    "“We had a candidate hang up mid-call for a tutor role screen. When we checked the transcript, Nova had asked 3 questions back to back without giving them room to actually finish talking.”",
    "I want Nova to listen and respond appropriately so that the candidate is also happy in responding.",
    "Poor turn-taking can prevent candidates from fully expressing themselves.",
    "Listening failure",
    "Conversation quality gap",
  ],
  [
    "5",
    "“Love the product overall, huge time save. One thing, the confidence score for two candidates who I later hired myself both came back 'medium' when honestly they were clearly strong. Not sure what's driving that score.”",
    "I want to understand whether Nova is accurately assessing candidates and what is driving the score.",
    "There is a trust gap in the confidence score, but the root cause is unclear.",
    "Need more info",
    "Diagnostic",
  ],
  [
    "6",
    "“Is there a way to have Nova sound different for different roles? Like, more formal for engineering, more warm for the tutor and frontline stuff. Right now it sounds the same for everything.”",
    "I want Nova to adapt its tone and communication style to the role so that candidates feel more comfortable engaging in the conversation.",
    "A single conversational style may not work across different candidate populations.",
    "Speaking failure",
    "Conversation quality gap",
  ],
  [
    "7",
    "“A candidate complained they weren't told upfront this was an AI, not a human. We do have the consent line at the start but I think it's getting glossed over too fast in the call.”",
    "I want Nova to make the AI disclosure clear and ensure the candidate understands they're speaking with an AI before proceeding.",
    "Important transparency information is not being communicated clearly enough.",
    "Speaking failure",
    "Conversation quality gap",
  ],
  [
    "8",
    "“We need Nova to handle candidates who ask questions back, like 'what's the salary range' or 'what's the team like.' Right now it just says it can't answer that and moves on, which feels weird and kills the vibe.”",
    "I want Nova to handle candidate questions naturally and appropriately during the conversation.",
    "Nova needs to become better at reacting to the candidate, rather than treating the interview as a one-way sequence of questions.",
    "Reacting failure",
    "Feature request",
  ],
  [
    "9",
    "“For engineering candidates, when they mention a specific technology or project, Nova doesn't dig into it at all. Feels like a missed opportunity, a human recruiter would always ask more.”",
    "Nova should recognize relevant information in an engineering candidate's answer and use it to ask a deeper, relevant follow-up question.",
    "Nova is missing valuable signals volunteered by candidates.",
    "Reacting failure",
    "Conversation quality gap",
  ],
  [
    "10",
    "“Our restaurant manager screens are converting well, but our software engineer screens have a much lower pass-to-next-round rate than when our human recruiters used to do first screens. Not sure if it's the questions or the conversation itself.”",
    "I want to understand why Nova's engineering screens underperform human-led screens and whether the issue is the questions or the conversation.",
    "There is a measurable engineering screening gap, but we don't yet know whether questions or conversation are responsible.",
    "Diagnostic",
    "Diagnostic",
  ],
  [
    "11",
    "“Small thing, but the AI's voice pace feels too fast when it's explaining next steps at the end of the call. A couple candidates asked us to repeat what happens next because they didn't catch it.”",
    "I want Nova to communicate next steps clearly and at an appropriate pace so candidates understand what happens next.",
    "Delivery quality can affect whether candidates understand important information.",
    "Speaking failure",
    "Conversation quality gap",
  ],
  [
    "12",
    "“Can we get a summary sent to us not just as a score, but as 2-3 lines on why the candidate got that score? Right now we just see 'Medium confidence' and nothing else.”",
    "I want Nova to explain the evidence behind its confidence score so I can understand and trust the assessment.",
    "Recruiters need evidence behind the score to trust and act on it.",
    "Scoring failure",
    "Feature request",
  ],
];

export default function ThinkingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5FC] print:bg-white">
      <div className="mx-auto max-w-[720px] px-6 py-16 text-[17px] text-[#1F1B2E]">
        <h1 className="mb-5 mt-6 text-3xl font-semibold leading-tight">Thinking and Understanding</h1>

        <div className="mb-10 flex flex-wrap items-center gap-3 print:hidden">
          <Link
            href="/screening"
            className="rounded-full bg-[#6C3FD1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5c33b3]"
          >
            Try the prototype →
          </Link>
          <DownloadPdfButton />
        </div>

        <article id="thinking-content">
          <h2 className={h2}>Part 1: Triage and Synthesis</h2>
          <p className={p}>Twelve items, three themes.</p>

          <h3 className={h3}>1. Conversation quality and candidate experience — items 1, 4, 6, 7, 11</h3>
          <ul className={ul}>
            <li>Nova feels scripted, rushed, and the same regardless of role.</li>
            <li>The failures are naturalness, pacing, turn-taking, tone and transparency.</li>
            <li>Largest cluster, both role families, every call. P1 in real life.</li>
            <li>Implication: fix how Nova conducts the conversation, not what it asks.</li>
          </ul>

          <h3 className={h3}>2. Adaptive and reactive interviewing — items 2, 3, 8, 9</h3>
          <ul className={ul}>
            <li>Nova follows its question flow instead of the candidate.</li>
            <li>
              It does not probe vague answers, explore volunteered experience, or handle questions
              back.
            </li>
            <li>Matters most in engineering screens, where depth is the signal.</li>
            <li>Implication: move from a fixed sequence to response-driven follow-ups.</li>
          </ul>

          <h3 className={h3}>3. Scoring and recruiter trust — items 5, 10, 12</h3>
          <ul className={ul}>
            <li>
              Recruiters do not trust or understand the confidence score. Engineering screens
              underperform human-led ones.
            </li>
            <li>Items 5 and 10 are diagnostic. We know there is a problem, not why.</li>
            <li>
              Item 12 is buildable, and it addresses the trust half by showing the evidence.
            </li>
            <li>
              Implication: make scoring explainable, then use that visibility to diagnose the
              rest.
            </li>
          </ul>

          <h3 className={h3}>Takeaway</h3>
          <p className={p}>
            The gap is between Nova as a screening workflow and Nova as a good recruiter. A good
            recruiter does not just ask the next question. They listen, adapt, probe, and
            communicate naturally. The opportunity is to improve the conversation while making the
            assessment understandable.
          </p>

          <h2 className={h2}>Part 2: Prioritisation</h2>

          <p className={p}>Yes.</p>

          <h3 className={h3}>1. Conversation quality &amp; candidate experience — P1 in real life</h3>
          <p className={p}>
            Five of twelve items across both role families point to Nova feeling scripted, rushed,
            or insufficiently tailored. These issues directly affect whether candidates can engage,
            finish the conversation, and understand important information. The table rates these as{" "}
            <strong>high-priority, must-have improvements</strong>, with medium effort for most
            items.
          </p>

          <h3 className={h3}>2. Adaptive &amp; reactive interviewing — P2 in real life</h3>
          <p className={p}>
            Four items show that Nova follows the question flow rather than responding to what
            candidates actually say. Candidates can give vague answers, volunteer relevant
            experience, or ask questions, but Nova often moves on without probing. This is a{" "}
            <strong>high-impact, must-have area</strong>, but also high effort because it requires
            Nova to interpret candidate responses and adapt the conversation.
          </p>

          <h3 className={h3}>3. Engineering screening effectiveness — P2 in real life</h3>
          <p className={p}>
            The engineering screens have a measurable problem: their pass-to-next-round rate is
            lower than it was with human recruiters. However, the feedback does not establish
            whether the problem is the questions, conversation quality, or assessment itself. The
            table therefore treats this as a{" "}
            <strong>diagnostic issue requiring more information</strong>, rather than recommending
            an immediate product fix.
          </p>

          <h3 className={h3}>4. Scoring &amp; recruiter trust — P3 in real life, P1 in prototype</h3>
          <p className={p}>
            Recruiters do not have enough visibility into what drives Nova&apos;s confidence score,
            and there are examples where candidates later hired by recruiters received only a
            medium score. The table identifies{" "}
            <strong>scoring explanation as a small-effort, low-effort-for-assignment opportunity</strong>,
            making it the highest-priority item to prototype even though the broader scoring/trust
            theme is P3 for the real product.
          </p>

          <h3 className={h3}>Business priority against prototype priority</h3>
          <p className={p}>
            The table separates what matters most for Nova&apos;s product from what is practical to
            build in this assignment. <strong>Conversation quality &amp; candidate experience is the
            P1 business priority</strong>, followed by adaptive/reactive interviewing. However, those
            areas require more complex changes, while{" "}
            <strong>scoring explanation is explicitly P1 for the prototype</strong> because it is a
            smaller, more buildable feature.
          </p>

          <h2 className={h2}>Appendix A: Feedback Classification</h2>
          <div className="relative left-1/2 right-1/2 mb-4 -mx-[50vw] w-screen px-6 print:static print:left-0 print:right-0 print:mx-0 print:w-full print:px-0">
            <div className="overflow-x-auto rounded-md border border-[#6C3FD1]/20">
              <table className="min-w-[1450px] border-collapse text-left text-xs leading-relaxed">
                <thead>
                  <tr className="bg-[#6C3FD1]/10">
                    {FEEDBACK_COLUMNS.map((col) => (
                      <th
                        key={col}
                        className="border-b border-[#6C3FD1]/20 px-3 py-2 font-semibold uppercase tracking-wide text-[#6C3FD1]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEEDBACK_ITEMS.map((row, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-[#6C3FD1]/5" : undefined}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="max-w-[280px] border-b border-[#6C3FD1]/10 px-3 py-2 align-top"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <Link
          href="/screening"
          className="mt-12 inline-block text-sm font-medium text-[#6C3FD1] hover:underline print:hidden"
        >
          ← Back to Nova Screening
        </Link>
      </div>
    </div>
  );
}
