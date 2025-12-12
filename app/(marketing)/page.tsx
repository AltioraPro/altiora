import { Header } from "@/components/header";
import { AdvantagesSection } from "./_components/advantages-section";
import { CTASection } from "./_components/cta-section";
import { HeroSection } from "./_components/hero-section";
import { IntegrationSection } from "./_components/integration-section";
import { LeaderboardSection } from "./_components/leaderboard-section";
import { ProductivitySection } from "./_components/productivity-section";

export default function HomePage() {
    return (
        <div>
            <Header />

            <main className="scroll-target-container px-6">
                <div className="relative mx-auto w-full max-w-7xl overflow-hidden pb-20">
                    <HeroSection />
                    <AdvantagesSection id="features" />
                    <ProductivitySection id="productivity" />
                    <LeaderboardSection id="leaderboard" />
                    <IntegrationSection id="integrations" />
                    {/* <PricingSection id="pricing" />
                    <FAQSection id="faq" /> */}
                    <CTASection id="cta" />
                </div>
            </main>
        </div>
    );
}
