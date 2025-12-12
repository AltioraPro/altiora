"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PAGES } from "@/constants/pages";
import Link from "next/link";
import { Section } from "./section";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Altiora?",
    answer:
      "Altiora is an all-in-one platform designed to help ambitious individuals structure their lives, improve their performance, and achieve their goals. It brings together trading, productivity, and personal development tools in one simple and accessible space.",
  },
  {
    question: "Who is Altiora for?",
    answer:
      "Altiora is for traders (beginners and advanced), entrepreneurs, ambitious students, and anyone looking to improve their discipline, organization, and consistency on a daily basis.",
  },
  {
    question: "How is Altiora different from Notion or other tools?",
    answer:
      "Altiora is not a generic tool. Everything is already structured and designed for performance: a ready-to-use trading journal, habit tracking connected to your progress, organized goals (annual and quarterly), Deep Work tracking, and automations. No complex setup required.",
  },
  {
    question: "Can I try Altiora for free?",
    answer:
      "Yes. Altiora offers a 14-day free trial to explore all the platform's features. After the trial, you can subscribe to continue accessing the full suite of tools.",
  },
  {
    question: "Can I connect my broker for the trading journal?",
    answer:
      "Yes. Altiora supports or will progressively support broker connections to automatically import trades and enable auto-journaling, without manual entry.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Security and data privacy are a priority. Your information is stored securely and is never sold to third parties.",
  },
  {
    question: "Do you offer personalized coaching?",
    answer:
      "Yes. Altiora offers personalized coaching by application, including an initial selection call, a personalized assessment, and regular follow-ups based on your goals.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes. The subscription is commitment-free and can be canceled at any time from your personal dashboard.",
  },
];

interface FAQSectionProps {
  id?: string;
}

export function FAQSection({ id }: FAQSectionProps) {
  return (
    <Section id={id}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-normal text-3xl">
          Your answers might be found here.
        </h2>
        <p className="mt-2 text-neutral-400">
          If you don't find the answer you're looking for, please contact us{" "}
          <Link className="underline" href={PAGES.CONTACT_US}>
            here
          </Link>
          .
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
