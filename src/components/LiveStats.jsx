import { useLiveStats } from '../hooks/useLiveStats'
import { useCountUp } from '../hooks/useCountUp'

function StatCard({ label, value, prefix = '', big = false }) {
  const target = Math.round(Number(value) || 0)
  const [ref, animated] = useCountUp(target)
  return (
    <div
      ref={ref}
      className={`reveal rounded-2xl border border-cream/10 bg-cream/[0.03] p-6 ${
        big ? 'md:col-span-2' : ''
      }`}
    >
      <p
        className={`font-mono tabular-nums tracking-tight ${
          big ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'
        }`}
      >
        {prefix}
        {animated.toLocaleString('en-US')}
      </p>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-cream/40">
        {label}
      </p>
    </div>
  )
}

const AGENT_COLORS = {
  CEO: 'text-amber-300',
  Engineering: 'text-sky-300',
  Marketing: 'text-fuchsia-300',
  Support: 'text-emerald-300',
  Sales: 'text-orange-300',
  Chat: 'text-cream',
}

export default function LiveStats() {
  const { stats, active_executions: executions, isLive } = useLiveStats()

  return (
    <section className="relative px-6 py-40 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="reveal flex items-center gap-3">
          <span className="live-dot h-2.5 w-2.5 rounded-full bg-green-400" />
          <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-cream/60">
            {isLive ? 'Live right now' : 'Connecting...'}
          </h2>
        </div>
        <p className="reveal mt-4 max-w-xl text-sm text-cream/50">
          Real numbers from this platform — every stat below is counted live from actual
          activity. We're just getting started.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue" value={stats.revenue_usd} prefix="$" big />
          <StatCard label="Tasks completed" value={stats.tasks_completed} />
          <StatCard label="Messages sent" value={stats.messages_sent} />
          <StatCard label="Companies" value={stats.companies} />
          <StatCard label="Founders" value={stats.founders} />
          <StatCard label="Tasks in last 24h" value={stats.tasks_completed_24h} />
          <StatCard label="Companies in 24h" value={stats.companies_created_24h} />
        </div>

        <div className="reveal mt-16 overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.02]">
          <div className="flex items-center justify-between border-b border-cream/10 px-6 py-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream/50">
              Agents working right now
            </p>
            <p className="font-mono text-xs text-cream/40">{executions.length} active</p>
          </div>
          {executions.length === 0 ? (
            <p className="px-6 py-8 font-mono text-sm text-cream/40">
              All quiet — agents go to work the moment a founder asks.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-cream/5 overflow-y-auto">
              {executions.slice(0, 12).map((ex, i) => (
                <li
                  key={ex.id}
                  className="feed-row flex items-center justify-between px-6 py-3"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span
                      className={`font-mono text-sm ${
                        AGENT_COLORS[ex.agent_name] ?? 'text-cream/80'
                      }`}
                    >
                      {ex.agent_name}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-cream/40">{ex.company_label}</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-cream/30">
                    {ex.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
