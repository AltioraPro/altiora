"use client";

import { RiAddLine, RiSparklingLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import SpotlightCard from "@/components/SpotlightCard";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/client";
import { useCreateJournalStore } from "@/store/create-journal-store";

export function CreateJournalCard() {
  const router = useRouter();
  const { open } = useCreateJournalStore();

  const { mutateAsync: createJournal, isPending: isCreatingJournal } =
    useMutation(
      orpc.trading.createJournal.mutationOptions({
        meta: {
          invalidateQueries: [
            orpc.trading.getJournals.queryKey({ input: {} }),
            orpc.trading.getTrades.queryKey({ input: {} }),
            orpc.trading.getStats.queryKey({ input: {} }),
          ],
        },
      }),
    );

  const { mutateAsync: createTrade } = useMutation(
    orpc.trading.createTrade.mutationOptions({
      meta: {
        invalidateQueries: [
          orpc.trading.getTrades.queryKey({ input: {} }),
          orpc.trading.getStats.queryKey({ input: {} }),
        ],
      },
    }),
  );

  const handleGenerateJournalExample = async () => {
    try {
      const journal = await createJournal({
        name: "Demo Trading Journal",
        description:
          "Example journal with sample trades to help you get started",
        startingCapital: "10000",
        usePercentageCalculation: true,
      });

      const sampleTrades = [
        {
          tradeDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],

          profitLossPercentage: "2.5",
          notes: "Perfect confirmation, clean breakout with strong momentum",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],

          profitLossPercentage: "-1.0",
          notes: "Stopped out early, market conditions changed",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],

          profitLossPercentage: "1.8",
          notes: "Good entry, patience paid off",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],

          profitLossPercentage: "3.2",
          notes: "Excellent risk/reward ratio on this one",
          isClosed: true,
          journalId: journal.id,
        },
        {
          tradeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],

          profitLossPercentage: "-0.8",
          notes: "Small loss, cut quickly when confirmation invalidated",
          isClosed: true,
          journalId: journal.id,
        },
      ];

      for (const trade of sampleTrades) {
        await createTrade({
          ...trade,
          tradeDate: new Date(trade.tradeDate).toISOString().split("T")[0],
          assetId: "123",
          exitReason: "Manual",
          profitLossPercentage: String(trade.profitLossPercentage),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      router.push("/trading/journals");
    } catch (error) {
      console.error("Error generating journal example:", error);
    }
  };

  return (
    <div className="group border border-neutral-800 p-8">
      <div className="flex h-full flex-col p-6">
        <div className="relative mb-6 flex h-48 items-center justify-center overflow-hidden border border-neutral-800">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="relative h-full w-full">
              <div className="group-hover:-rotate-12 absolute top-2 left-4 h-40 w-32 rotate-[-8deg] transform rounded-lg border border-white/20 bg-linear-to-br from-white/10 to-white/5 shadow-xl transition-all duration-500 group-hover:translate-x-[-4px]" />

              <div className="-rotate-2 absolute top-1 left-12 h-40 w-32 transform rounded-lg border border-white/30 bg-linear-to-br from-white/15 to-white/5 shadow-xl transition-all duration-500 group-hover:translate-y-[-2px] group-hover:rotate-[-4deg]">
                <div className="space-y-2 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                    <div className="h-2 flex-1 rounded bg-white/30 transition-all duration-300 group-hover:bg-white/40" />
                  </div>
                  <div className="h-1.5 w-3/4 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                  <div className="h-1.5 w-1/2 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                  <div className="mt-3 space-y-1.5">
                    <div className="h-1 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                    <div className="h-1 w-5/6 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                    <div className="h-1 w-4/6 rounded bg-white/15 transition-all duration-300 group-hover:bg-white/25" />
                  </div>
                </div>
              </div>

              <div className="absolute top-0 left-20 h-40 w-32 rotate-[4deg] transform rounded-lg border border-white/40 bg-linear-to-br from-white/20 to-white/10 shadow-2xl transition-all duration-500 group-hover:translate-x-[4px] group-hover:translate-y-[-4px] group-hover:rotate-[8deg] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-400 transition-all duration-300 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      <div className="h-2 w-12 rounded bg-white/40 transition-all duration-300 group-hover:bg-white/50" />
                    </div>
                    <div className="text-[8px] text-white/60 transition-all duration-300 group-hover:font-semibold group-hover:text-green-400">
                      +2.5%
                    </div>
                  </div>
                  <div className="h-1.5 w-2/3 rounded bg-white/25 transition-all duration-300 group-hover:bg-white/35" />
                  <div className="mt-3 border-white/20 border-t pt-2 transition-all duration-300 group-hover:border-white/30">
                    <div className="space-y-1">
                      <div className="h-1 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                      <div className="h-1 w-4/5 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                      <div className="h-1 w-3/5 rounded bg-white/20 transition-all duration-300 group-hover:bg-white/30" />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <div className="h-1 w-1 rounded-full bg-purple-400/60 transition-all duration-300 group-hover:bg-purple-400 group-hover:shadow-[0_0_6px_rgba(192,132,252,0.6)]" />
                    <div className="h-1 w-1 rounded-full bg-blue-400/60 transition-all duration-300 group-hover:bg-blue-400 group-hover:shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
                    <div className="h-1 w-1 rounded-full bg-pink-400/60 transition-all duration-300 group-hover:bg-pink-400 group-hover:shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h3 className="mb-3 font-semibold text-lg text-white">
          Create a Journal
        </h3>
        <p className="mb-6 flex-1 text-sm text-white/60 leading-relaxed">
          Create your first trading journal to start building your performance
          knowledge base.
        </p>
        <div className="flex flex-col gap-3">
          <Button disabled={isCreatingJournal} onClick={() => open()}>
            <RiAddLine className="size-4" />
            Create Journal
          </Button>
          <Button
            variant="dashed"
            disabled={isCreatingJournal}
            onClick={handleGenerateJournalExample}
            title="Generate example journal"
          >
            <RiSparklingLine className="h-4 w-4" />
            {isCreatingJournal ? "Generating..." : "Generate example"}
          </Button>
        </div>
      </div>
    </div>
  );
}
