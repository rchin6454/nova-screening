import Link from "next/link";

export const metadata = {
  title: "Thinking and Understanding",
};

const h2 = "mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-[#6C3FD1]";
const p = "mb-4 leading-[1.8]";

export default function ThinkingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5FC]">
      <div className="mx-auto max-w-[720px] px-6 py-16 text-[17px] text-[#1F1B2E]">
        <Link href="/" className="text-sm font-medium text-[#6C3FD1] hover:underline">
          ← Back to Nova Screening
        </Link>

        <h1 className="mb-8 mt-6 text-3xl font-semibold leading-tight">Thinking and Understanding</h1>

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

        <h2 className={h2}>What I could not build, and what I built instead</h2>
        <p className={p}>
          My first priority is not buildable in this exercise. Voice is out of scope, and the
          speaking and listening problems live there.
        </p>
        <p className={p}>
          My second priority is buildable but not in the time available. Teaching Nova to generate
          genuinely good follow ups on the fly is the largest piece of work on the list.
        </p>
        <p className={p}>
          So I built the third. That is the instruction the assignment gives: take the highest
          priority item you can actually build.
        </p>
        <p className={p}>
          There is a second reason it is the right choice, and it is the one I would argue in the
          room.
        </p>
        <p className={p}>
          Items 5 and 10 both describe a score that appears wrong, and neither tells us why. Nova
          may not have asked enough. The candidate may have given only enough to earn that score.
          The scoring logic may be wrong. The expectations may have shifted since the screen. We
          do not know which, and finding out needs call outcome data that does not exist.
        </p>
        <p className={p}>
          The summary is the instrument that separates those cases. A score that states what it
          was based on, and what it was never able to assess, tells you whether you are looking at
          a weak candidate or a weak conversation. Ranked third for the business. First as a
          diagnostic.
        </p>

        <h2 className={h2}>What I built</h2>
        <p className={p}>
          A chat screening conversation that ends in a confidence score, a written rationale, and
          the evidence behind each dimension.
        </p>
        <p className={p}>
          The part that does the work is what happens when the evidence is not there. Any
          dimension the conversation did not genuinely probe is marked not assessed. It is never
          guessed and never defaulted to the middle. When two or more dimensions are unassessed,
          the report says there is not enough evidence to score, and lists what was never asked.
        </p>
        <p className={p}>
          Most systems hide this by returning medium. That is exactly the output the customer
          complained about. A medium score with no reason is indistinguishable from an unasked
          question.
        </p>
        <p className={p}>
          Scored on four dimensions: communication, role relevant experience, motivation and fit,
          and availability and constraints.
        </p>
        <p className={p}>
          Availability and constraints exists because of the disqualifier list a real recruiter
          keeps. A candidate who has accepted another offer is not a pass, however well they
          interview.
        </p>

        <h2 className={h2}>The prompt: what I put in and what I left out</h2>
        <p className="mb-3 font-semibold">In.</p>
        <p className={p}>
          One question per turn, with compound questions explicitly prohibited. Item 4 is a
          candidate who hung up after three stacked questions.
        </p>
        <p className={p}>
          An acknowledgement of something specific from the answer before the next question. This
          is the text equivalent of not sounding scripted.
        </p>
        <p className={p}>
          One follow up whenever a candidate names a technology, project or responsibility, and a
          definition of what makes a follow up good: it asks for something only a person who did
          the work would know.
        </p>
        <p className={p}>
          A consent gate that must be answered before screening begins. In the prototype this is a
          button, not a line of dialogue, so it cannot be glossed past.
        </p>
        <p className={p}>
          A rule in the scorer that fluency is not competence. A polished answer with no specifics
          is weak evidence, not strong evidence. This exists because of the junior recruiter
          problem described above.
        </p>
        <p className="mb-3 mt-6 font-semibold">Deliberately out.</p>
        <p className={p}>
          Problem solving as a scoring dimension. A first screen does not have the evidence to
          judge it, and grading it manufactures exactly the false confidence the customer
          reported.
        </p>
        <p className={p}>
          Substantive answers to candidate questions about salary or team detail. Nova
          acknowledges, defers to a human recruiter, and returns to the screen. Inventing a salary
          band is worse than deferring.
        </p>
        <p className={p}>
          Voice grade naturalism. Nova must respond to what the candidate said. It is not required
          to be indistinguishable from a person.
        </p>

        <h2 className={h2}>What I would cut with half the time</h2>
        <p className={p}>
          The event log, the role adaptation between engineering and frontline modes, and the
          version history. I would keep the four dimensions, the evidence lines, and the not
          assessed behaviour. Without those there is no product, only a score with a paragraph
          attached.
        </p>

        <h2 className={h2}>What I would build next</h2>
        <p className={p}>
          The score is currently unfalsifiable. Nothing tells us whether it was right.
        </p>
        <p className={p}>
          The next thing is an outcome loop: record what the recruiter did with each screen, and
          whether that candidate was eventually hired. Once a few hundred of those exist, item 5
          stops being a mystery. The unasked areas already captured here are the input to that
          analysis, because they separate a weak candidate from a weak conversation.
        </p>
        <p className={p}>
          After that, the speaking and listening work I ranked first for the business, on the
          voice layer where it belongs.
        </p>

        <h2 className={h2}>What I have not solved</h2>
        <p className={p}>
          The score has not been validated against a single real hiring outcome. It cannot be,
          yet.
        </p>
        <p className={p}>
          Role adaptation is currently two tones rather than two genuinely different screens.
        </p>
        <p className={p}>
          And the prototype is text. Two of the twelve items, the scripted delivery and the
          rushed pacing, exist in the voice channel. I translated them into turn structure and
          message density, which is honest but not the same thing.
        </p>

        <Link href="/" className="mt-12 inline-block text-sm font-medium text-[#6C3FD1] hover:underline">
          ← Back to Nova Screening
        </Link>
      </div>
    </div>
  );
}
