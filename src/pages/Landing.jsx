import Intro from '../components/Intro.jsx'
import Nav from '../components/Nav.jsx'
import Hero from '../components/Hero.jsx'
import NeverHire from '../components/NeverHire.jsx'
import Team from '../components/Team.jsx'
import LiveStats from '../components/LiveStats.jsx'
import CTA from '../components/CTA.jsx'
import Footer from '../components/Footer.jsx'
import { useReveal } from '../hooks/useReveal.js'

export default function Landing() {
  const revealRef = useReveal()

  return (
    <div ref={revealRef}>
      <Intro />
      <Nav />
      <main>
        <Hero />
        <NeverHire />
        <Team />
        <LiveStats />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
