export default function Footer() {
  return (
    <footer className="border-t border-cream/10 px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm font-semibold">
          nightshift<span className="text-accent">.</span>
        </p>
        <p className="font-mono text-xs text-cream/40">
          © {new Date().getFullYear()} NightShift · Built by Sergio
        </p>
      </div>
    </footer>
  )
}
