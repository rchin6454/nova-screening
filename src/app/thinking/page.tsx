import Link from "next/link";
import DownloadPdfButton from "./DownloadPdfButton";

export const metadata = {
  title: "Thinking and Understanding",
};

const h2 = "mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-[#6C3FD1]";
const p = "mb-4 leading-[1.8]";

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
          I treated Nova as a goal seeking system. Any goal seeking system needs four things: a
          goal, a clear image of what reaching that goal looks like, actions taken towards it, and
          feedback that corrects the path. The idea comes from Maxwell Maltz.
        </p>
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

        <h2 className={h2}>Why the score is the thing that matters</h2>
        <p className={p}>
          Screening is a decision under uncertainty, and the two errors do not cost the same.
        </p>
        <p className={p}>
          Passing a weak candidate costs a wasted interview, lost hours for the hiring team, and
          trust in the recruiter&apos;s judgement. If it keeps happening, the work moves to someone
          more senior.
        </p>
        <p className={p}>
          Rejecting a strong candidate costs nothing visible on the day. Over time it costs a
          great deal. The role stays open. The department that raised the need suffers. The
          workload shifts onto someone already employed, who is unfairly loaded because of a
          decision made elsewhere. Recruiting is expensive, and the company pays again for a
          candidate it already had.
        </p>
        <p className={p}>
          A score with no stated reason cannot be audited. Neither error can be caught. That is
          the failure the customer in item 5 described: two candidates scored medium, both later
          hired directly by the manager. The manager did the screen himself, which removes the
          reason Nova exists.
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
