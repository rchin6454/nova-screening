import Link from "next/link";
import DownloadPdfButton from "./DownloadPdfButton";

export const metadata = {
  title: "Thinking and Understanding",
};

const h2 = "mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-[#6C3FD1]";
const p = "mb-4 leading-[1.8]";

const FEEDBACK_COLUMNS = [
  "S.No",
  "Feedback Given",
  "Underlying Ask",
  "What does it mean for us?",
  "What type of failure is it?",
  "Type of Request",
  "Classification",
  "Impact",
  "Effort to build",
  "Effort to build for this assignment",
  "Priority to build in IRL",
  "Priority to build in prototype",
] as const;

const FEEDBACK_ITEMS: string[][] = [
  [
    "1",
    "“Candidates keep saying the AI sounds like it's reading a script when we screen for the restaurant manager roles. Feels robotic, not like a real conversation.”",
    "I want Nova to have a more natural conversational style that encourages candidates to engage.",
    "Candidates perceive Nova as scripted, which may reduce engagement.",
    "Speaking failure",
    "Conversation quality gap",
    "Must have",
    "Medium",
    "Medium",
    "High",
    "P1",
    "P2",
  ],
  [
    "2",
    "“Our engineering screens are going fine but I noticed Nova doesn't push back when a candidate gives a vague answer to a technical question. It just moves to the next question.”",
    "I want Nova to challenge vague or incomplete candidate responses.",
    "Nova is moving through questions without establishing sufficient evidence.",
    "Reacting failure",
    "Conversation quality gap",
    "Must have",
    "High",
    "High",
    "High",
    "P2",
    "P3",
  ],
  [
    "3",
    "“Can Nova ask follow-up questions based on what the candidate just said, instead of just going down a fixed list?”",
    "I want Nova to ask relevant follow-up questions based on the candidate's responses to better assess their experience and fit.",
    "Users want Nova to adapt to candidate responses rather than follow a fixed flow.",
    "Reacting failure",
    "Conversation quality gap",
    "Must have",
    "High",
    "High",
    "High",
    "P2",
    "P3",
  ],
  [
    "4",
    "“We had a candidate hang up mid-call for a tutor role screen. When we checked the transcript, Nova had asked 3 questions back to back without giving them room to actually finish talking.”",
    "I want Nova to listen and respond appropriately so that the candidate is also happy in responding",
    "Poor turn-taking can prevent candidates from fully expressing themselves.",
    "Listening failure",
    "Conversation quality gap",
    "Must have",
    "High",
    "Medium",
    "High",
    "P1",
    "P2",
  ],
  [
    "5",
    "“Love the product overall, huge time save. One thing, the confidence score for two candidates who I later hired myself both came back 'medium' when honestly they were clearly strong. Not sure what's driving that score.”",
    "I want to understand whether Nova is accurately assessing candidates and what is driving the score.",
    "There is a trust gap in the confidence score, but the root cause is unclear.",
    "Need more info",
    "Diagnostic",
    "Must have",
    "Need more info",
    "Need more info",
    "Need more info",
    "P3",
    "P2",
  ],
  [
    "6",
    "“Is there a way to have Nova sound different for different roles? Like, more formal for engineering, more warm for the tutor and frontline stuff. Right now it sounds the same for everything.”",
    "I want Nova to adapt its tone and communication style to the role so that candidates feel more comfortable engaging in the conversation.",
    "A single conversational style may not work across different candidate populations.",
    "Speaking failure",
    "Conversation quality gap",
    "Must have",
    "High",
    "Medium",
    "High",
    "P1",
    "P2",
  ],
  [
    "7",
    "“A candidate complained they weren't told upfront this was an AI, not a human. We do have the consent line at the start but I think it's getting glossed over too fast in the call.”",
    "I want Nova to make the AI disclosure clear and ensure the candidate understands they're speaking with an AI before proceeding.",
    "Important transparency information is not being communicated clearly enough.",
    "Speaking failure",
    "Conversation quality gap",
    "Must have",
    "High",
    "Medium",
    "High",
    "P1",
    "P2",
  ],
  [
    "8",
    "“We need Nova to handle candidates who ask questions back, like 'what's the salary range' or 'what's the team like.' Right now it just says it can't answer that and moves on, which feels weird and kills the vibe.”",
    "I want Nova to handle candidate questions naturally and appropriately during the conversation.",
    "Nova needs to become better at reacting to the candidate, rather than treating the interview as a one-way sequence of questions.",
    "Reacting failure",
    "Feature request",
    "Good to have",
    "Medium",
    "Medium",
    "High",
    "P2",
    "P3",
  ],
  [
    "9",
    "“For engineering candidates, when they mention a specific technology or project, Nova doesn't dig into it at all. Feels like a missed opportunity, a human recruiter would always ask more.”",
    "Nova should recognize relevant information in an engineering candidate's answer and use it to ask a deeper, relevant follow-up question.",
    "Nova is missing valuable signals volunteered by candidates.",
    "Reacting failure",
    "Conversation quality gap",
    "Must have",
    "High",
    "High",
    "High",
    "P2",
    "P3",
  ],
  [
    "10",
    "“Our restaurant manager screens are converting well, but our software engineer screens have a much lower pass-to-next-round rate than when our human recruiters used to do first screens. Not sure if it's the questions or the conversation itself.”",
    "I want to understand why Nova's engineering screens underperform human-led screens and whether the issue is the questions or the conversation.",
    "There is a measurable engineering screening gap, but we don't yet know whether questions or conversation are responsible.",
    "Diagnostic",
    "Diagnostic",
    "Must have",
    "Need more info",
    "Need more info",
    "Need more info",
    "P2",
    "P2",
  ],
  [
    "11",
    "“Small thing, but the AI's voice pace feels too fast when it's explaining next steps at the end of the call. A couple candidates asked us to repeat what happens next because they didn't catch it.”",
    "I want Nova to communicate next steps clearly and at an appropriate pace so candidates understand what happens next.",
    "Delivery quality can affect whether candidates understand important information.",
    "Speaking failure",
    "Conversation quality gap",
    "Must have",
    "Medium",
    "Medium",
    "High",
    "P1",
    "P2",
  ],
  [
    "12",
    "“Can we get a summary sent to us not just as a score, but as 2-3 lines on why the candidate got that score? Right now we just see 'Medium confidence' and nothing else.”",
    "I want Nova to explain the evidence behind its confidence score so I can understand and trust the assessment",
    "Recruiters need evidence behind the score to trust and act on it.",
    "Scoring Failure",
    "Feature request",
    "Must have",
    "High",
    "Small",
    "Low",
    "P3",
    "P1",
  ],
];

export default function ThinkingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5FC] print:bg-white">
      <div className="mx-auto max-w-[720px] px-6 py-16 text-[17px] text-[#1F1B2E]">
        <Link
          href="/"
          className="text-sm font-medium text-[#6C3FD1] hover:underline print:hidden"
        >
          ← Back to Nova Screening
        </Link>

        <h1 className="mb-5 mt-6 text-3xl font-semibold leading-tight">Thinking and Understanding</h1>

        <div className="mb-10 flex flex-wrap items-center gap-3 print:hidden">
          <Link
            href="/"
            className="rounded-full bg-[#6C3FD1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5c33b3]"
          >
            Try the prototype →
          </Link>
          <DownloadPdfButton />
        </div>

        <article id="thinking-content">
        <h2 className={h2}>How I approached this</h2>
        <p className={p}>
          Nova&apos;s goal is to replace the first round of screening a recruiter would otherwise
          do. So the first question is not what Nova gets wrong. It is what a good recruiter
          actually does on that call.
        </p>

        <h2 className={h2}>What the traditional call looks like</h2>
        <p className={p}>
          A recruiter finds a profile and calls. She introduces herself and the role. She asks
          whether it is a good time. She asks whether the candidate is looking. She states the
          company, the location and the work arrangement, and asks whether the candidate is
          interested. Only then does she ask about experience.
        </p>
        <p className={p}>
          Throughout, she is tracking two things at once. The content of the answers, and a
          running list of disqualifiers: not a good time, not looking, already holds an offer,
          will not move on location, will not move on salary.
        </p>
        <p className={p}>
          The difference between a senior and a junior recruiter is what happens next. A senior
          recruiter hears a technology or a project and probes it. She draws the line between what
          the candidate has done and what the role needs. A junior recruiter reads from the script
          and judges on tone and confidence.
        </p>
        <p className={p}>
          That distinction matters more than it first appears. A junior recruiter passes
          candidates who sound confident, because confidence is the only signal they can read.
          This is also the default behaviour of a language model. A fluent answer reads as a
          strong answer. Nova, left alone, screens like a junior recruiter.
        </p>

        <h2 className={h2}>Themes</h2>
        <p className={p}>The twelve items fall into three groups.</p>
        <p className={p}>
          <strong>Speaking and listening.</strong> Items 1, 4, 6, 7 and 11. Nova sounds scripted,
          asks several questions in one breath, sounds the same regardless of role, glosses the
          consent line, and rushes the close. The underlying need is that a candidate will not
          open up to something that is not listening.
        </p>
        <p className={p}>
          <strong>Reacting and probing.</strong> Items 2, 3, 8 and 9. Nova does not push on vague
          answers, does not follow up on what the candidate just said, and cannot handle a
          question asked back. The underlying need is the senior recruiter behaviour described
          above.
        </p>
        <p className={p}>
          <strong>Scoring.</strong> Items 5, 10 and 12. The score is unexplained and possibly
          wrong. The underlying need is a decision the recruiter can audit.
        </p>
        <p className={p}>
          The three groups are not independent. A conversation that does not probe cannot produce
          a score worth trusting. Group three is where the failure is noticed. Groups one and two
          are where it is caused.
        </p>

        <h2 className={h2}>Priorities</h2>
        <p className={p}>
          <strong>First, speaking and listening.</strong> Items 1, 4, 6, 7 and 11. This is the
          highest impact group, and it is also the cheapest place to iterate. The feedback loops
          are short. Define a persona. Check whether there is a pause before Nova speaks again.
          Listen to one call. You know within a single conversation whether a change worked.
        </p>
        <p className={p}>
          That distinction matters. Speaking is high effort to build, because it lives in the
          voice layer. But it is low effort to know whether you got it right. Scoring is the
          opposite: cheap to build, and impossible to verify without hiring outcomes. Those are
          two different kinds of effort and they should not be added together.
        </p>
        <p className={p}>
          <strong>Second, reacting and probing.</strong> Items 2, 3, 8 and 9. Nova has to decide on
          the fly what a good follow up is. That is a much larger piece of work than adjusting how
          it sounds.
        </p>
        <p className={p}>
          <strong>Third, the score summary.</strong> Items 5 and 12. Small impact, small effort,
          and ranked last deliberately.
        </p>
        <p className={p}>
          The summary is a trust artefact, not a correctness fix. If the score is right, the
          recruiter does not strictly need the explanation. It buys confidence in the output. It
          does not make the output better.
        </p>
        <p className={p}>
          And there is a more basic reason it ranks below the speaking work. Nova&apos;s core job
          is to hold a conversation. If that is not working, everything downstream sits on
          nothing. A well explained score drawn from a poor conversation is a well explained wrong
          answer.
        </p>

        <h2 className={h2}>The feedback</h2>
        <p className={p}>The twelve raw items referenced by number throughout this page.</p>
        <div className="mb-4 overflow-x-auto rounded-md border border-[#6C3FD1]/20">
          <table className="min-w-[1600px] border-collapse text-left text-xs leading-relaxed">
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
                      className="max-w-[260px] border-b border-[#6C3FD1]/10 px-3 py-2 align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </article>

        <Link
          href="/"
          className="mt-12 inline-block text-sm font-medium text-[#6C3FD1] hover:underline print:hidden"
        >
          ← Back to Nova Screening
        </Link>
      </div>
    </div>
  );
}
