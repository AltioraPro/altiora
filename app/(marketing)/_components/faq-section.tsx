"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "./section";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "What is Altiora?",
        answer: "Altiora is a modern productivity and trading self-coaching platform. It combines a trading journal, habit tracking, goal planning, and deep work sessions into one unified experience.",
    },
    {
        question: "Is there a free plan?",
        answer: "Yes! Altiora offers a free plan that includes basic trading journal features, up to 50 trades per month, and 3 habits tracking. You can upgrade anytime to unlock more features.",
    },
    {
        question: "How does the Discord integration work?",
        answer: "Connect your Discord account to Altiora to track deep work sessions with your community. You can see a leaderboard of focused time and get notifications about your progress.",
    },
    {
        question: "Can I import my existing trades?",
        answer: "Absolutely. Altiora supports CSV imports from most trading platforms. You can easily migrate your trading history and continue tracking from where you left off.",
    },
    {
        question: "Is my data secure?",
        answer: "Your data is encrypted at rest and in transit. We use industry-standard security practices and never share your trading data with third parties.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription at any time. Your data will remain accessible until the end of your billing period, and you can always export it.",
    },
];

interface FAQSectionProps {
    id?: string;
}

export function FAQSection({ id }: FAQSectionProps) {
    return (
        <Section id={id}>
            <div className="text-center">
                <h2 className="font-normal text-3xl">
                    Frequently Asked Questions
                </h2>
                <p className="mt-2 text-neutral-400">
                    Everything you need to know about Altiora.
                </p>
            </div>

            <div className="mx-auto w-full max-w-3xl">
                <Accordion className="w-full" collapsible type="single">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            className=""
                            key={faq.question}
                            value={`item-${index}`}
                        >
                            <AccordionTrigger className="text-left font-medium">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-neutral-400 text-sm">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </Section>
    );
}
