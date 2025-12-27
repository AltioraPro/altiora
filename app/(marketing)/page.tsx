import { Header } from "@/components/header";
import { AdvantagesSection } from "./_components/advantages-section";
import { BentoFeaturesSection } from "./_components/bento-features-section";
import { CTASection } from "./_components/cta-section";
import { FAQSection } from "./_components/faq-section";
import { HeroSection } from "./_components/hero-section";
import { LeaderboardSection } from "./_components/leaderboard-section";
import { PricingSection } from "./_components/pricing-section";
import { ProductivitySection } from "./_components/productivity-section";

export default function HomePage() {
    return (
        <div>
            <Header />

            <main className="scroll-target-container px-4">
                <div className="relative mx-auto w-full max-w-7xl overflow-hidden pb-20">
                    <section id="features">
                        <HeroSection />
                        <AdvantagesSection />
                        <BentoFeaturesSection />
                        <ProductivitySection />
                        <LeaderboardSection />
                        {/* <IntegrationSection /> */}
                    </section>
                    <PricingSection id="pricing" />
                    <FAQSection id="faq" />
                    <CTASection id="cta" />
                </div>
            </main>
        </div>
    );
}
