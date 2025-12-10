import { Header } from "@/components/header";
import { CTASection } from "./_components/cta-section";
import { HeroSection } from "./_components/hero-section";
import { IntegrationSection } from "./_components/integration-section";
import { ProductivitySection } from "./_components/productivity-section";

export default function HomePage() {
    return (
        <div>
            <Header />

            <main className="relative mx-auto w-full max-w-7xl overflow-hidden border-neutral-800 border-r border-l pb-20">
                <HeroSection />
                <ProductivitySection />
                <IntegrationSection />
                <CTASection />
            </main>
        </div>
    );
}
