"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    RiPencilLine,
    RiRobot2Line,
    RiExchangeLine,
    RiArrowRightLine,
    RiCheckLine,
    RiFileCopyLine,
    RiDownloadLine,
    RiAlertLine,
    RiInformationLine,
} from "@remixicon/react";
import { useCreateJournalStore } from "@/store/create-journal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";
import { toast } from "sonner";

type JournalSource = "manual" | "ctrader" | "metatrader" | null;
type Step = "source" | "details" | "metatrader-setup";
type Platform = "mt4" | "mt5";

export function CreateJournalModal() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isOpen, close } = useCreateJournalStore();
    const [step, setStep] = useState<Step>("source");
    const [selectedSource, setSelectedSource] = useState<JournalSource>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startingCapital, setStartingCapital] = useState("10000");

    // MetaTrader setup state
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>("mt5");
    const [createdJournalId, setCreatedJournalId] = useState<string | null>(null);
    const [webhookToken, setWebhookToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Debug: Log when component renders
    console.log("[CreateJournalModal] Rendering, isOpen:", isOpen, "step:", step);

    // Debug: Log when step changes
    useEffect(() => {
        console.log("[CreateJournalModal] Step changed to:", step);
    }, [step]);

    const { mutateAsync: createJournal, isPending } = useMutation(
        orpc.trading.createJournal.mutationOptions({
            meta: {
                invalidateQueries: [orpc.trading.getJournals.queryKey({ input: {} })],
            },
        }),
    );

    const { mutateAsync: generateToken, isPending: isGeneratingToken } = useMutation(
        orpc.integrations.metatrader.generateToken.mutationOptions()
    );

    const handleSourceSelect = async (source: JournalSource) => {
        console.log("[CreateJournalModal] Source selected:", source);
        setSelectedSource(source);

        if (source === "manual") {
            console.log("[CreateJournalModal] Going to details step");
            setStep("details");
        } else if (source === "ctrader") {
            console.log("[CreateJournalModal] Creating cTrader journal");
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
            console.log("[CreateJournalModal] Going to metatrader-setup step");
            setStep("metatrader-setup");
            console.log("[CreateJournalModal] Step set to metatrader-setup");
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
        } catch (error) {
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
        } catch (error) {
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
        const filename = platform === "mt4" ? "TradeWebhook_MT4.mq4" : "TradeWebhook_MT5.mq5";
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
    const [webhookUrl, setWebhookUrl] = useState("https://altiora.app/api/integrations/metatrader/webhook");
    const [baseUrl, setBaseUrl] = useState("https://altiora.app");

    // Set the actual URL on the client side only
    useEffect(() => {
        if (typeof window !== "undefined") {
            setWebhookUrl(`${window.location.origin}/api/integrations/metatrader/webhook`);
            setBaseUrl(window.location.origin);
        }
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-white/10 bg-black/95 backdrop-blur-xl">
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
                                onClick={() => handleSourceSelect("manual")}
                                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 text-left transition-all hover:border-white/20 hover:from-white/10 hover:shadow-xl"
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 transition-all group-hover:bg-white/15 group-hover:scale-110">
                                        <RiPencilLine className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-1 font-semibold text-lg text-white">
                                            Manual Entry
                                        </h3>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Create a traditional journal and manually log your trades.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white/70" />
                                </div>
                            </button>

                            {/* cTrader */}
                            <button
                                onClick={() => handleSourceSelect("ctrader")}
                                disabled={isPending}
                                className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6 text-left transition-all hover:border-blue-500/30 hover:from-blue-500/15 hover:shadow-xl hover:shadow-blue-500/10 disabled:opacity-60"
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 transition-all group-hover:bg-blue-500/30 group-hover:scale-110">
                                        <RiExchangeLine className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-semibold text-lg text-white">cTrader</h3>
                                            <Badge variant="secondary" className="text-xs">Auto-sync</Badge>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Connect via OAuth for automatic synchronization.
                                        </p>
                                    </div>
                                    <RiArrowRightLine className="h-5 w-5 text-blue-400/40 transition-all group-hover:translate-x-1 group-hover:text-blue-400" />
                                </div>
                            </button>

                            {/* MetaTrader */}
                            <button
                                onClick={() => {
                                    console.log("[MetaTrader Button] CLICKED!");
                                    handleSourceSelect("metatrader");
                                }}
                                disabled={isPending}
                                className="group relative overflow-hidden rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-6 text-left transition-all hover:border-green-500/30 hover:from-green-500/15 hover:shadow-xl hover:shadow-green-500/10 disabled:opacity-60"
                            >
                                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                <div className="relative flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 transition-all group-hover:bg-green-500/30 group-hover:scale-110">
                                        <RiRobot2Line className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-semibold text-lg text-white">MetaTrader 4/5</h3>
                                            <Badge variant="secondary" className="text-xs">Auto-sync</Badge>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            Install an EA to sync trades automatically.
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
                                <Label htmlFor="name" className="text-white">Journal Name</Label>
                                <Input
                                    id="name"
                                    placeholder="My Trading Journal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Track my day trading performance..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capital" className="text-white">Starting Capital</Label>
                                <Input
                                    id="capital"
                                    type="number"
                                    placeholder="10000"
                                    value={startingCapital}
                                    onChange={(e) => setStartingCapital(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep("source")}
                                className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
                                disabled={isPending}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreateManual}
                                className="flex-1 bg-white text-black hover:bg-gray-100"
                                disabled={isPending || !name}
                            >
                                {isPending ? "Creating..." : "Create Journal"}
                            </Button>
                        </div>
                    </>
                )}

                {step === "metatrader-setup" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-white flex items-center gap-3">
                                <RiRobot2Line className="h-7 w-7 text-green-400" />
                                MetaTrader Setup
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                {webhookToken
                                    ? "Configure your MetaTrader EA with the information below"
                                    : "Select your platform and generate your connection token"
                                }
                            </DialogDescription>
                        </DialogHeader>

                        {!webhookToken ? (
                            // Step 1: Choose platform and generate token
                            <div className="space-y-6 py-4">
                                <div className="space-y-3">
                                    <Label className="text-white">Select your platform</Label>
                                    <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)}>
                                        <TabsList className="grid w-full grid-cols-2 bg-white/5">
                                            <TabsTrigger value="mt5" className="gap-2 data-[state=active]:bg-green-500/20">
                                                MT5 <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="mt4" className="data-[state=active]:bg-green-500/20">MT4</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="mt5" className="mt-4">
                                            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm text-white/70">
                                                <p><strong className="text-white">MetaTrader 5</strong> uses event-driven synchronization.</p>
                                                <p className="mt-2">Trades are synced <span className="text-green-400 font-medium">instantly</span> when closed.</p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="mt4" className="mt-4">
                                            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-white/70">
                                                <p><strong className="text-white">MetaTrader 4</strong> uses polling-based synchronization.</p>
                                                <p className="mt-2">Trades are checked every <span className="text-yellow-400 font-medium">5 seconds</span>.</p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep("source")}
                                        className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
                                        disabled={isPending || isGeneratingToken}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleMetaTraderSetup}
                                        className="flex-1 bg-green-500 text-white hover:bg-green-600"
                                        disabled={isPending || isGeneratingToken}
                                    >
                                        {isPending || isGeneratingToken ? "Creating..." : "Create & Generate Token"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Step 2: Show token and setup instructions
                            <div className="space-y-6 py-4">
                                {/* Download EA */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-white flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold">1</span>
                                        Download the Expert Advisor
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-white/10 hover:bg-white/5" onClick={() => handleDownloadEA("mt5")}>
                                            <RiDownloadLine className="h-5 w-5" />
                                            <span className="font-medium">MT5 EA</span>
                                        </Button>
                                        <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-white/10 hover:bg-white/5" onClick={() => handleDownloadEA("mt4")}>
                                            <RiDownloadLine className="h-5 w-5" />
                                            <span className="font-medium">MT4 EA</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Token */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-white flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold">2</span>
                                        Your Token (InpUserToken)
                                    </h4>
                                    <div className="flex gap-2">
                                        <Input readOnly value={webhookToken} className="font-mono text-sm bg-white/5 border-white/10 text-white" />
                                        <Button variant="outline" size="icon" onClick={handleCopyToken} className="shrink-0 border-white/10 hover:bg-white/5">
                                            {copied ? <RiCheckLine className="h-4 w-4 text-green-500" /> : <RiFileCopyLine className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* URL */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-white flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold">3</span>
                                        Webhook URL (InpApiUrl)
                                    </h4>
                                    <div className="flex gap-2">
                                        <Input readOnly value={webhookUrl} className="font-mono text-xs bg-white/5 border-white/10 text-white" />
                                        <Button variant="outline" size="icon" onClick={handleCopyUrl} className="shrink-0 border-white/10 hover:bg-white/5">
                                            <RiFileCopyLine className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Important note */}
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                                    <div className="flex items-start gap-2">
                                        <RiAlertLine className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="text-white/70">
                                            <p className="font-medium text-amber-400">Important!</p>
                                            <p className="mt-1">In MetaTrader, go to <strong className="text-white">Tools → Options → Expert Advisors</strong></p>
                                            <p>Enable &quot;Allow WebRequest for listed URL&quot; and add: <code className="bg-black/30 px-1 rounded">{baseUrl}</code></p>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleFinishMetaTrader} className="w-full bg-green-500 text-white hover:bg-green-600">
                                    <RiCheckLine className="mr-2 h-4 w-4" />
                                    Done - Go to Journal
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
