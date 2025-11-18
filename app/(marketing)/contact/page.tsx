import { Header } from "@/components/header";
import { ContactForm } from "./_components/contact-form";
import { ContactHeader } from "./_components/contact-header";
import { FloatingElements } from "./_components/floating-elements";

export default function ContactPage() {
    return (
        <div className="relative min-h-screen overflow-hidden text-pure-white">
            <Header />

            <div className="pointer-events-none absolute inset-0">
                <FloatingElements />
            </div>

            <div className="relative z-10 h-screen overflow-hidden px-4 pt-20">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-center">
                    <div className="grid w-full items-center gap-16 lg:grid-cols-2">
                        <ContactHeader />
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
