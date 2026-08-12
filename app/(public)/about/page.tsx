export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">About Luvia</h1>
      <p className="mt-3 text-white/70">
        Luvia is a focused educational platform built around one course at a time. We
        prioritize depth, clarity, and outcome over breadth.
      </p>
      <div className="mt-8 space-y-6 text-white/80">
        <section>
          <h2 className="text-lg font-semibold text-white">Our approach</h2>
          <p className="mt-2">
            Every learner applies for access. Our team reviews the request, creates a
            personal account, and shares login details through WhatsApp or email. The
            result: a curated student body, not a marketplace.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">What makes Luvia different</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>One primary course, designed with care.</li>
            <li>Premium, minimal interface. Mobile-first.</li>
            <li>Live classes and announcements from your instructors.</li>
            <li>Verifiable certificates on completion.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
