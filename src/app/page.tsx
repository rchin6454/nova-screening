import Link from "next/link";
import DownloadPdfButton from "./DownloadPdfButton";

export const metadata = {
  title: "Thinking and Understanding",
};

const h2 = "mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-[#6C3FD1]";
const h3 = "mt-7 mb-2 text-base font-semibold text-[#1F1B2E]";
const p = "mb-4 leading-[1.8]";
const ul = "mb-4 list-disc space-y-2 pl-5 leading-[1.8]";

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
            <li>Implication: Fix how Nova conducts the conversation</li>
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

          <h2 className={h2}>Part B</h2>

          <p className={p}>
            Read the full analysis here:{" "}
            <a
              href="/Prioritization-Matrix.xlsx"
              download
              className="font-medium text-[#6C3FD1] hover:underline"
            >
              Prioritization Matrix.xlsx ↓
            </a>
          </p>

          <h3 className={h3}>Summary</h3>

          <h3 className={h3}>1. Conversation quality &amp; candidate experience — P1 in real life</h3>
          <p className={p}>
            Five of twelve items across both role families point to Nova feeling scripted, rushed,
            or insufficiently tailored. These issues directly affect whether candidates can engage,
            finish the conversation, and understand important information. High-priority, must-have
            improvements, with medium effort for most items.
          </p>

          <h3 className={h3}>2. Adaptive &amp; reactive interviewing — P2 in real life</h3>
          <p className={p}>
            Four items show that Nova follows the question flow rather than responding to what
            candidates actually say. Candidates can give vague answers, volunteer relevant
            experience, or ask questions, but Nova often moves on without probing. A high-impact,
            must-have area, but also high effort because it requires Nova to interpret candidate
            responses and adapt the conversation.
          </p>

          <h3 className={h3}>3. Engineering screening effectiveness — P2 in real life</h3>
          <p className={p}>
            The engineering screens have a measurable problem: their pass-to-next-round rate is
            lower than it was with human recruiters. However, the feedback does not establish
            whether the problem is the questions, conversation quality, or assessment itself. A
            diagnostic issue requiring more information, rather than an immediate product fix.
          </p>

          <h3 className={h3}>4. Scoring &amp; recruiter trust — P3 in real life, P1 in prototype</h3>
          <p className={p}>
            Recruiters do not have enough visibility into what drives Nova&apos;s confidence score,
            and there are examples where candidates later hired by recruiters received only a
            medium score. Scoring explanation is a small-effort, low-effort-for-assignment
            opportunity, making it the highest-priority item to prototype even though the broader
            scoring/trust theme is P3 for the real product.
          </p>

          <h3 className={h3}>Business priority against prototype priority</h3>
          <p className={p}>
            The table separates what matters most for Nova&apos;s product from what is practical to
            build in this assignment. Conversation quality &amp; candidate experience is the{" "}
            <strong>P1 business priority</strong>, followed by adaptive/reactive interviewing.
            However, those areas require more complex changes, while scoring explanation is{" "}
            <strong>P1 for the prototype</strong> because it is a smaller, more buildable feature.
          </p>
        </article>
      </div>
    </div>
  );
}
