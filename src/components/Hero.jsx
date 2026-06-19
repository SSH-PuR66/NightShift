import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <div className="hero-glow absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[120px]" />
      <div className="relative">
        <h1 className="mx-auto max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
          Your AI Team That Works
          <br />
          <span className="bg-gradient-to-r from-accent-soft via-accent to-accent-soft bg-clip-text text-transparent">
            While You Sleep
          </span>
        </h1>
        <div className="mt-12">
          <Link
            to="/app"
            className="inline-block rounded-full bg-cream px-8 py-4 text-base font-semibold text-ink transition hover:scale-105 hover:bg-white"
          >
            Get Started — Free
          </Link>
        </div>
      </div>
      <div className="scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cream/50">
          Scroll to discover
        </p>
      </div>
    </section>
  )
}
