import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 md:px-12">
      <a href="#top" className="text-lg font-semibold tracking-tight">
        nightshift<span className="text-accent">.</span>
      </a>
      <Link
        to="/app"
        className="rounded-full border border-cream/20 bg-cream/5 px-5 py-2 text-sm font-medium backdrop-blur transition hover:border-cream/40 hover:bg-cream/10"
      >
        Get Started
      </Link>
    </header>
  )
}
