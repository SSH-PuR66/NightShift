import { Link } from 'react-router-dom'

const ROLES = [
  { verb: 'plans', noun: 'your strategy.' },
  { verb: 'writes', noun: 'your code.' },
  { verb: 'crafts', noun: 'your marketing.' },
  { verb: 'answers', noun: 'your customers.' },
  { verb: 'drafts', noun: 'your outreach.' },
  { verb: 'works', noun: 'your night shift.' },
]

export default function Team() {
  return (
    <section className="relative border-y border-cream/10 bg-cream/[0.02] px-6 py-40 md:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="reveal text-4xl font-bold tracking-tight md:text-6xl">
          NightShift is your team.
        </h2>
        <ul className="mt-16 space-y-4">
          {ROLES.map((role, i) => (
            <li
              key={role.noun}
              className="reveal flex items-baseline gap-3 text-2xl font-medium md:text-4xl"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="text-accent-soft">NightShift</span>
              <span className="text-cream/80">{role.verb}</span>
              <span className="text-cream/50">{role.noun}</span>
            </li>
          ))}
        </ul>
        <p className="reveal mt-16 text-2xl font-semibold text-cream md:text-3xl">
          One name. Every role.
        </p>
        <div className="reveal mt-10">
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
