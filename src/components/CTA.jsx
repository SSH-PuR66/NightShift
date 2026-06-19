import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section
      id="cta"
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <div className="absolute left-1/2 top-1/2 h-[50vmax] w-[50vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]" />
      <div className="relative">
        <h2 className="reveal text-5xl font-bold tracking-tight md:text-7xl">
          Start your company tonight
        </h2>
        <div className="reveal mt-12">
          <Link
            to="/app"
            className="inline-block rounded-full bg-cream px-10 py-4 text-base font-semibold text-ink transition hover:scale-105 hover:bg-white"
          >
            Get Started
          </Link>
        </div>
        <p className="reveal mt-6 font-mono text-xs text-cream/40">
          No credit card required · Free forever core
        </p>
      </div>
    </section>
  )
}
