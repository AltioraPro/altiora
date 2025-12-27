"use client";

import { Section } from "./section";
import { BarChart3, BookOpen, PenLine } from "lucide-react";

interface BentoFeaturesSectionProps {
  id?: string;
}

export function BentoFeaturesSection({ id }: BentoFeaturesSectionProps) {
  return (
    <Section id={id}>
      <h2 className="flex flex-col font-normal text-2xl sm:text-3xl">
        <span>Powerful Features</span>
        <span className="text-neutral-400">
          Tools designed to elevate your trading.
        </span>
      </h2>
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* Top block - Full width */}
          <div className="col-span-1 flex flex-col justify-between gap-4 bg-neutral-900 p-6 lg:col-span-3">
            <div className="flex flex-col gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-medium">Automated Statistics</h3>
              <p className="max-w-2xl text-neutral-400">
                Get instant insights into your trading performance. Profit/loss
                tracking, win rate, risk metrics, and more — all calculated
                automatically.
              </p>
            </div>
            <figure className="relative mt-2 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-800">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-medium text-emerald-400">
                    +24.5%
                  </span>
                  <span className="text-sm text-neutral-400">
                    Monthly Return
                  </span>
                </div>
                <div className="h-16 w-px bg-neutral-700" />
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-medium text-white">68%</span>
                  <span className="text-sm text-neutral-400">Win Rate</span>
                </div>
                <div className="h-16 w-px bg-neutral-700" />
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-medium text-white">2.4</span>
                  <span className="text-sm text-neutral-400">Risk/Reward</span>
                </div>
              </div>
            </figure>
          </div>

          {/* Bottom left - 2/3 width */}
          <div className="col-span-1 flex flex-col justify-between gap-4 bg-neutral-900 p-6 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800">
                <PenLine className="h-6 w-6 text-white" />
              </div>

              <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium">Automated Journaling</h3>
                <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
                  Coming Soon
                </span>
              </div>
              <p className="max-w-xl text-neutral-400">
                Let AI analyze your trades and generate detailed journal
                entries. Understand your patterns, emotions, and decision-making
                process without manual input.
              </p>
            </div>
            <figure className="relative mt-2 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-800">
              <div className="flex w-full max-w-md flex-col gap-3 px-6">
                <div className="h-3 w-3/4 rounded bg-neutral-700" />
                <div className="h-3 w-full rounded bg-neutral-700" />
                <div className="h-3 w-5/6 rounded bg-neutral-700" />
                <div className="mt-2 h-3 w-2/3 rounded bg-neutral-700" />
              </div>
            </figure>
          </div>

          {/* Bottom right - 1/3 width */}
          <div className="col-span-1 flex flex-col justify-between gap-4 bg-neutral-900 p-6">
            <div className="flex flex-col gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-medium">Trading Journal</h3>
              <p className="text-neutral-400">
                Document every trade with context. Notes, screenshots, and tags
                to build your personal playbook.
              </p>
            </div>
            <figure className="relative mt-2 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-800">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-12 w-12 text-neutral-600" />
                <span className="text-sm text-neutral-500">Your Playbook</span>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </Section>
  );
}
