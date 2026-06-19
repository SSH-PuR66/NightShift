import { Link } from 'react-router-dom'

export default function NeverHire() {
  return (
    <section className="relative px-6 py-40 md:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="reveal font-mono text-sm uppercase tracking-[0.3em] text-accent-soft">
          Your First Employee
        </h2>
        <div className="mt-10 space-y-6">
          <p className="reveal text-3xl font-semibold leading-snug tracking-tight md:text-5xl">
            You have the idea. You need the team.
          </p>
          <p className="reveal text-3xl font-semibold leading-snug tracking-tight text-cream/60 md:text-5xl">
            NightShift clocks in when you clock out.
          </p>
          <p className="reveal text-3xl font-semibold leading-snug tracking-tight text-cream/35 md:text-5xl">
            No salaries. No credits. Free to start.
          </p>
        </div>
        <div className="reveal mt-14">
          <Link
            to="/app"
            className="inline-block rounded-full border border-cream/25 px-7 py-3 text-sm font-semibold transition hover:border-accent hover:text-accent-soft"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}
