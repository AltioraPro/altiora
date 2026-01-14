"use client";

import {
    RiAlertLine,
    RiArrowRightLine,
    RiCheckLine,
    RiDownloadLine,
    RiExchangeLine,
    RiFileCopyLine,
    RiPencilLine,
    RiRobot2Line,
} from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/orpc/client";
import { useCreateJournalStore } from "@/store/create-journal-store";

type JournalSource = "manual" | "ctrader" | "metatrader" | null;
type Step = "source" | "details" | "metatrader-setup";
type Platform = "mt4" | "mt5";

export function CreateJournalModal() {
    const router = useRouter();
    const _queryClient = useQueryClient();
    const { isOpen, close } = useCreateJournalStore();
    const [step, setStep] = useState<Step>("source");
    const [_selectedSource, setSelectedSource] = useState<JournalSource>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startingCapital, setStartingCapital] = useState("10000");

    // MetaTrader setup state
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>("mt5");
    const [createdJournalId, setCreatedJournalId] = useState<string | null>(
        null
    );
    const [webhookToken, setWebhookToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Debug: Log when step changes
    useEffect(() => {}, []);

    const { mutateAsync: createJournal, isPending } = useMutation(
        orpc.trading.createJournal.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getJournals.queryKey({ input: {} }),
                ],
            },
        })
    );

    const { mutateAsync: generateToken, isPending: isGeneratingToken } =
        useMutation(
            orpc.integrations.metatrader.generateToken.mutationOptions()
        );

    const handleSourceSelect = async (source: JournalSource) => {
        setSelectedSource(source);

        if (source === "manual") {
            setStep("details");
        } else if (source === "ctrader") {
            try {
                const journal = await createJournal({
                    name: "cTrader Account",
                    description: "Auto-synced from cTrader",
                    startingCapital: "10000",
                    usePercentageCalculation: true,
                });
                close();
                window.location.href = `/api/integrations/ctrader/authorize?journalId=${journal.id}`;
            } catch (error) {
                console.error("[CreateJournalModal] cTrader error:", error);
                toast.error("Failed to create journal");
            }
        } else if (source === "metatrader") {
            setStep("metatrader-setup");
        }
    };

    const handleMetaTraderSetup = async () => {
        try {
            // 1. Create the journal
            const journal = await createJournal({
                name: "MetaTrader Account",
                description: "Auto-synced from MetaTrader",
                startingCapital: "10000",
                usePercentageCalculation: true,
            });
            setCreatedJournalId(journal.id);

            // 2. Generate webhook token
            const result = await generateToken({
                journalId: journal.id,
                platform: selectedPlatform,
            });
            setWebhookToken(result.webhookToken);

            toast.success("Journal created! Now configure your MetaTrader EA.");
        } catch (_error) {
            toast.error("Failed to setup MetaTrader");
        }
    };

    const handleCreateManual = async () => {
        try {
            const journal = await createJournal({
                name,
                description,
                startingCapital,
                usePercentageCalculation: true,
            });

            toast.success("Journal created successfully!");
            close();
            router.push(`/trading/journals/${journal.id}`);
        } catch (_error) {
            toast.error("Failed to create journal");
        }
    };

    const handleCopyToken = async () => {
        if (webhookToken) {
            await navigator.clipboard.writeText(webhookToken);
            setCopied(true);
            toast.success("Token copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCopyUrl = async () => {
        const url = `${window.location.origin}/api/integrations/metatrader/webhook`;
        await navigator.clipboard.writeText(url);
        toast.success("URL copied!");
    };

    const handleDownloadEA = (platform: Platform) => {
        const filename =
            platform === "mt4"
                ? "TradeWebhook_MT4.mq4"
                : "TradeWebhook_MT5.mq5";
        const link = document.createElement("a");
        link.href = `/${filename}`;
        link.download = filename;
        link.click();
        toast.success(`${filename} downloaded!`);
    };

    const handleFinishMetaTrader = () => {
        if (createdJournalId) {
            close();
            router.push(`/trading/journals/${createdJournalId}`);
        }
    };

    const handleClose = () => {
        close();
        setTimeout(() => {
            setStep("source");
            setSelectedSource(null);
            setName("");
            setDescription("");
            setStartingCapital("10000");
            setSelectedPlatform("mt5");
            setCreatedJournalId(null);
            setWebhookToken(null);
        }, 200);
    };

    // Use state to avoid hydration mismatch
    const [webhookUrl, setWebhookUrl] = useState(
        "https://altiora.app/api/integrations/metatrader/webhook"
    );
    const [baseUrl, setBaseUrl] = useState("https://altiora.app");

    // Set the actual URL on the client side only
    useEffect(() => {
        if (typeof window !== "undefined") {
            setWebhookUrl(
                `${window.location.origin}/api/integrations/metatrader/webhook`
            );
            setBaseUrl(window.location.origin);
        }
    }, []);

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-black/95 backdrop-blur-xl sm:max-w-[700px]">
                {step === "source" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-white">
                                Choose Journal Type
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                Select how you want to track your trades
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-6">
                            {/* Manual Entry */}
                            <button
                                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 text-left transition-all hover:border-white/20 hover:from-white/10 hover:shadow-xl"
                                onClick={() => handleSourceSelect("manual")}
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 transition-all group-hover:scale-110 group-hover:bg-white/15">
                                        <RiPencilLine className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-1 font-semibold text-lg text-white">
                                            Manual Entry
                                        </h3>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Create a traditional journal and
                                            manually log your trades.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white/70" />
                                </div>
                            </button>

                            {/* cTrader */}
                            <button
                                className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-left transition-all hover:border-blue-500/30 hover:from-blue-500/15 hover:shadow-blue-500/10 hover:shadow-xl disabled:opacity-60"
                                disabled={isPending}
                                onClick={() => handleSourceSelect("ctrader")}
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 transition-all group-hover:scale-110 group-hover:bg-blue-500/30">
                                        <RiExchangeLine className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-semibold text-lg text-white">
                                                cTrader
                                            </h3>
                                            <Badge
                                                className="text-xs"
                                                variant="secondary"
                                            >
                                                Auto-sync
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Connect via OAuth for automatic
                                            synchronization.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-blue-400/40 transition-all group-hover:translate-x-1 group-hover:text-blue-400" />
                                </div>
                            </button>

                            {/* MetaTrader */}
                            <button
                                className="group relative overflow-hidden rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-6 text-left transition-all hover:border-green-500/30 hover:from-green-500/15 hover:shadow-green-500/10 hover:shadow-xl disabled:opacity-60"
                                disabled={isPending}
                                onClick={() => {
                                    handleSourceSelect("metatrader");
                                }}
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 transition-all group-hover:scale-110 group-hover:bg-green-500/30">
                                        <RiRobot2Line className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-semibold text-lg text-white">
                                                MetaTrader 4/5
                                            </h3>
                                            <Badge
                                                className="text-xs"
                                                variant="secondary"
                                            >
                                                Auto-sync
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Install an EA to sync trades
                                            automatically.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-green-400/40 transition-all group-hover:translate-x-1 group-hover:text-green-400" />
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {step === "details" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-white">
                                Create Manual Journal
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                Set up your trading journal details
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-6">
                            <div className="space-y-2">
                                <Label className="text-white" htmlFor="name">
                                    Journal Name
                                </Label>
                                <Input
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                    id="name"
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My Trading Journal"
                                    value={name}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    className="text-white"
                                    htmlFor="description"
                                >
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                    id="description"
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Track my day trading performance..."
                                    rows={3}
                                    value={description}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white" htmlFor="capital">
                                    Starting Capital
                                </Label>
                                <Input
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                    id="capital"
                                    onChange={(e) =>
                                        setStartingCapital(e.target.value)
                                    }
                                    placeholder="10000"
                                    type="number"
                                    value={startingCapital}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
                                disabled={isPending}
                                onClick={() => setStep("source")}
                                variant="outline"
                            >
                                Back
                            </Button>
                            <Button
                                className="flex-1 bg-white text-black hover:bg-gray-100"
                                disabled={isPending || !name}
                                onClick={handleCreateManual}
                            >
                                {isPending ? "Creating..." : "Create Journal"}
                            </Button>
                        </div>
                    </>
                )}

                {step === "metatrader-setup" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                                <RiRobot2Line className="h-7 w-7 text-green-400" />
                                MetaTrader Setup
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                {webhookToken
                                    ? "Configure your MetaTrader EA with the information below"
                                    : "Select your platform and generate your connection token"}
                            </DialogDescription>
                        </DialogHeader>

                        {webhookToken ? (
                            // Step 2: Show token and setup instructions
                            <div className="space-y-6 py-4">
                                {/* Download EA */}
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 font-medium text-white">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 font-bold text-xs">
                                            1
                                        </span>
                                        Download the Expert Advisor
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            className="h-auto flex-col gap-1 border-white/10 py-3 hover:bg-white/5"
                                            onClick={() =>
                                                handleDownloadEA("mt5")
                                            }
                                            variant="outline"
                                        >
                                            <RiDownloadLine className="h-5 w-5" />
                                            <span className="font-medium">
                                                MT5 EA
                                            </span>
                                        </Button>
                                        <Button
                                            className="h-auto flex-col gap-1 border-white/10 py-3 hover:bg-white/5"
                                            onClick={() =>
                                                handleDownloadEA("mt4")
                                            }
                                            variant="outline"
                                        >
                                            <RiDownloadLine className="h-5 w-5" />
                                            <span className="font-medium">
                                                MT4 EA
                                            </span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Token */}
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 font-medium text-white">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 font-bold text-xs">
                                            2
                                        </span>
                                        Your Token (InpUserToken)
                                    </h4>
                                    <div className="flex gap-2">
                                        <Input
                                            className="border-white/10 bg-white/5 font-mono text-sm text-white"
                                            readOnly
                                            value={webhookToken}
                                        />
                                        <Button
                                            className="shrink-0 border-white/10 hover:bg-white/5"
                                            onClick={handleCopyToken}
                                            size="icon"
                                            variant="outline"
                                        >
                                            {copied ? (
                                                <RiCheckLine className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <RiFileCopyLine className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* URL */}
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 font-medium text-white">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 font-bold text-xs">
                                            3
                                        </span>
                                        Webhook URL (InpApiUrl)
                                    </h4>
                                    <div className="flex gap-2">
                                        <Input
                                            className="border-white/10 bg-white/5 font-mono text-white text-xs"
                                            readOnly
                                            value={webhookUrl}
                                        />
                                        <Button
                                            className="shrink-0 border-white/10 hover:bg-white/5"
                                            onClick={handleCopyUrl}
                                            size="icon"
                                            variant="outline"
                                        >
                                            <RiFileCopyLine className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Important note */}
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                                    <div className="flex items-start gap-2">
                                        <RiAlertLine className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                        <div className="text-white/70">
                                            <p className="font-medium text-amber-400">
                                                Important!
                                            </p>
                                            <p className="mt-1">
                                                In MetaTrader, go to{" "}
                                                <strong className="text-white">
                                                    Tools → Options → Expert
                                                    Advisors
                                                </strong>
                                            </p>
                                            <p>
                                                Enable &quot;Allow WebRequest
                                                for listed URL&quot; and add:{" "}
                                                <code className="rounded bg-black/30 px-1">
                                                    {baseUrl}
                                                </code>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-green-500 text-white hover:bg-green-600"
                                    onClick={handleFinishMetaTrader}
                                >
                                    <RiCheckLine className="mr-2 h-4 w-4" />
                                    Done - Go to Journal
                                </Button>
                            </div>
                        ) : (
                            // Step 1: Choose platform and generate token
                            <div className="space-y-6 py-4">
                                <div className="space-y-3">
                                    <Label className="text-white">
                                        Select your platform
                                    </Label>
                                    <Tabs
                                        onValueChange={(v) =>
                                            setSelectedPlatform(v as Platform)
                                        }
                                        value={selectedPlatform}
                                    >
                                        <TabsList className="grid w-full grid-cols-2 bg-white/5">
                                            <TabsTrigger
                                                className="gap-2 data-[state=active]:bg-green-500/20"
                                                value="mt5"
                                            >
                                                MT5{" "}
                                                <Badge
                                                    className="text-xs"
                                                    variant="secondary"
                                                >
                                                    Recommended
                                                </Badge>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                className="data-[state=active]:bg-green-500/20"
                                                value="mt4"
                                            >
                                                MT4
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent
                                            className="mt-4"
                                            value="mt5"
                                        >
                                            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-white/70">
                                                <p>
                                                    <strong className="text-white">
                                                        MetaTrader 5
                                                    </strong>{" "}
                                                    uses event-driven
                                                    synchronization.
                                                </p>
                                                <p className="mt-2">
                                                    Trades are synced{" "}
                                                    <span className="font-medium text-green-400">
                                                        instantly
                                                    </span>{" "}
                                                    when closed.
                                                </p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent
                                            className="mt-4"
                                            value="mt4"
                                        >
                                            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-white/70">
                                                <p>
                                                    <strong className="text-white">
                                                        MetaTrader 4
                                                    </strong>{" "}
                                                    uses polling-based
                                                    synchronization.
                                                </p>
                                                <p className="mt-2">
                                                    Trades are checked every{" "}
                                                    <span className="font-medium text-yellow-400">
                                                        5 seconds
                                                    </span>
                                                    .
                                                </p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
                                        disabled={
                                            isPending || isGeneratingToken
                                        }
                                        onClick={() => setStep("source")}
                                        variant="outline"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        className="flex-1 bg-green-500 text-white hover:bg-green-600"
                                        disabled={
                                            isPending || isGeneratingToken
                                        }
                                        onClick={handleMetaTraderSetup}
                                    >
                                        {isPending || isGeneratingToken
                                            ? "Creating..."
                                            : "Create & Generate Token"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
