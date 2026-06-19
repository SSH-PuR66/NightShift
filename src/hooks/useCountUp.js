import { useEffect, useRef, useState } from 'react'

/** Animates a number from 0 to `target` once the element scrolls into view. */
export function useCountUp(target, { duration = 1800 } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          setValue(Math.round(target * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  // If target updates after the animation finished, snap to it
  useEffect(() => {
    if (started.current) setValue(target)
  }, [target])

  return [ref, value]
}
