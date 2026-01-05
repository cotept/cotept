import {
  LandingHeader,
  LandingHero,
  LandingPainPoints,
  LandingFeatures,
  LandingVerification,
  LandingCTA,
  LandingFooter,
} from "@/features/landing/ui"

const LandingContainer = () => {
  return (
    <div className="bg-background text-foreground selection:bg-brand-primary/30 min-h-screen">
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
