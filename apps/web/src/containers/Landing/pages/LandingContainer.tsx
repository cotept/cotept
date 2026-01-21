import {
  LandingCTA,
  LandingFeatures,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingPainPoints,
  LandingVerification,
} from "@/features/landing/ui"

const LandingContainer = () => {
  return (
    <div className="bg-background text-foreground selection:bg-primary/30 min-h-screen">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingPainPoints />
        <LandingFeatures />
        <LandingVerification />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}

export default LandingContainer
