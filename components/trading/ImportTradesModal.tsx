"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    CheckCircle,
    FileSpreadsheet,
    Upload,
    X,
} from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc/client";

interface ImportTradesModalProps {
    isOpen: boolean;
    onClose: () => void;
    journalId?: string;
}

interface ExcelTrade {
    Date?: string;
    Asset?: string;
    Symbol?: string;
    Session?: string;
    Setup?: string;
    Risk?: string | number;
    Result?: string | number;
    ExitReason?: string;
    Notes?: string;
    TradingViewLink?: string;
}

interface ExcelRow {
    [key: number]: unknown;
}

export function ImportTradesModal({
    isOpen,
    onClose,
    journalId,
}: ImportTradesModalProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState<{
        type: "success" | "error" | "info";
        message: string;
    } | null>(null);
    const [tradesToImport, setTradesToImport] = useState<ExcelTrade[]>([]);
    const [createdItems, setCreatedItems] = useState<{
        assets: string[];
        sessions: string[];
        setups: string[];
    }>({ assets: [], sessions: [], setups: [] });

    const localCacheRef = useRef<{
        assets: Map<string, string>;
        sessions: Map<string, string>;
        setups: Map<string, string>;
    }>({
        assets: new Map(),
        sessions: new Map(),
        setups: new Map(),
    });

    const { mutateAsync: createTrade } = useMutation(
        orpc.trading.createTrade.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getTrades.queryKey({ input: { journalId } }),
                ],
            },
        })
    );
    const { mutateAsync: createAsset } = useMutation(
        orpc.trading.createAsset.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getAssets.queryKey({ input: { journalId } }),
                ],
            },
        })
    );
    const { mutateAsync: createSession } = useMutation(
        orpc.trading.createSession.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getSessions.queryKey({ input: { journalId } }),
                ],
            },
        })
    );
    const { mutateAsync: createSetup } = useMutation(
        orpc.trading.createSetup.mutationOptions({
            meta: {
                invalidateQueries: [
                    orpc.trading.getSetups.queryKey({ input: { journalId } }),
                ],
            },
        })
    );

    const { data: existingAssets } = useQuery(
        orpc.trading.getAssets.queryOptions({ input: { journalId } })
    );
    const { data: existingSessions } = useQuery(
        orpc.trading.getSessions.queryOptions({ input: { journalId } })
    );
    const { data: existingSetups } = useQuery(
        orpc.trading.getSetups.queryOptions({ input: { journalId } })
    );

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const rawData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                }) as ExcelRow[];

                const processedTrades: ExcelTrade[] = [];

                for (let i = 1; i < rawData.length; i++) {
                    const row = rawData[i];

                    if (!row?.[0]) {
                        continue;
                    }

                    const trade: ExcelTrade = {
                        Date: String(row[0] || ""),
                        Asset: String(row[6] || ""),
                        Symbol: String(row[6] || ""),
                        Session: String(row[11] || ""),
                        Risk: row[25] as string | number,
                        Result: row[28] as string | number,
                        Setup: String(row[31] || ""),
                        Notes: String(row[45] || ""),
                        TradingViewLink: String(row[50] || ""),
                    };

                    processedTrades.push(trade);
                }

                setTradesToImport(processedTrades);
                setCreatedItems({ assets: [], sessions: [], setups: [] });

                localCacheRef.current = {
                    assets: new Map(),
                    sessions: new Map(),
                    setups: new Map(),
                };
                setImportStatus({
                    type: "info",
                    message: `${processedTrades.length} trades found in the file. Ready to import.`,
                });
            } catch (error) {
                console.error("Error processing Excel file:", error);
                setImportStatus({
                    type: "error",
                    message:
                        "Error reading Excel file. Please check the file format.",
                });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const findOrCreateAsset = async (assetName: string, symbol: string) => {
        if (!(assetName || symbol)) {
            return "";
        }

        const assetToUse = assetName || symbol;
        if (!assetToUse) {
            return "";
        }

        const cachedAssetId = localCacheRef.current.assets.get(
            assetToUse.toLowerCase()
        );
        if (cachedAssetId) {
            return cachedAssetId;
        }

        const existingAsset = existingAssets?.find(
            (a) =>
                a.name.toLowerCase() === assetToUse.toLowerCase() ||
                (a.symbol &&
                    a.symbol.toLowerCase() === assetToUse.toLowerCase())
        );

        if (existingAsset) {
            localCacheRef.current.assets.set(
                assetToUse.toLowerCase(),
                existingAsset.id
            );
            return existingAsset.id;
        }

        try {
            const result = await createAsset({
                journalId: journalId || "",
                name: assetToUse,
                symbol: assetToUse,
                type: "forex",
            });

            localCacheRef.current.assets.set(
                assetToUse.toLowerCase(),
                result.id
            );

            setCreatedItems((prev) => ({
                ...prev,
                assets: prev.assets.includes(assetToUse)
                    ? prev.assets
                    : [...prev.assets, assetToUse],
            }));

            return result.id;
        } catch (error) {
            console.error("Error creating asset:", error);
            return "";
        }
    };

    const findOrCreateSession = async (sessionName: string) => {
        if (!sessionName || typeof sessionName !== "string") {
            return null;
        }

        const sessionToUse = sessionName.trim();
        if (!sessionToUse) {
            return null;
        }

        const cachedSessionId = localCacheRef.current.sessions.get(
            sessionToUse.toLowerCase()
        );
        if (cachedSessionId) {
            return cachedSessionId;
        }

        const existingSession = existingSessions?.find(
            (s) => s.name.toLowerCase() === sessionToUse.toLowerCase()
        );

        if (existingSession) {
            localCacheRef.current.sessions.set(
                sessionToUse.toLowerCase(),
                existingSession.id
            );
            return existingSession.id;
        }

        try {
            const result = await createSession({
                journalId: journalId || "",
                name: sessionToUse,
                description: `Imported session: ${sessionToUse}`,
            });

            localCacheRef.current.sessions.set(
                sessionToUse.toLowerCase(),
                result.id
            );

            setCreatedItems((prev) => ({
                ...prev,
                sessions: prev.sessions.includes(sessionToUse)
                    ? prev.sessions
                    : [...prev.sessions, sessionToUse],
            }));

            return result.id;
        } catch (error) {
            console.error("Error creating session:", error);
            return null;
        }
    };

    const findOrCreateSetup = async (setupName: string) => {
        if (!setupName || typeof setupName !== "string") {
            return null;
        }

        const setupToUse = setupName.trim();
        if (!setupToUse) {
            return null;
        }

        const cachedSetupId = localCacheRef.current.setups.get(
            setupToUse.toLowerCase()
        );
        if (cachedSetupId) {
            return cachedSetupId;
        }

        const existingSetup = existingSetups?.find(
            (s) => s.name.toLowerCase() === setupToUse.toLowerCase()
        );

        if (existingSetup) {
            localCacheRef.current.setups.set(
                setupToUse.toLowerCase(),
                existingSetup.id
            );
            return existingSetup.id;
        }

        try {
            const result = await createSetup({
                journalId: journalId || "",
                name: setupToUse,
                description: `Imported setup: ${setupToUse}`,
                strategy: "Imported",
            });

            localCacheRef.current.setups.set(
                setupToUse.toLowerCase(),
                result.id
            );

            setCreatedItems((prev) => ({
                ...prev,
                setups: prev.setups.includes(setupToUse)
                    ? prev.setups
                    : [...prev.setups, setupToUse],
            }));

            return result.id;
        } catch (error) {
            console.error("Error creating setup:", error);
            return null;
        }
    };

    const handleImport = async () => {
        if (!journalId || tradesToImport.length === 0) {
            return;
        }

        setIsImporting(true);
        setImportStatus(null);

        let successCount = 0;
        let errorCount = 0;

        for (const trade of tradesToImport) {
            try {
                let tradeDate = new Date().toISOString().split("T")[0];
                if (trade.Date) {
                    const dateStr = String(trade.Date).trim();

                    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        tradeDate = dateStr;
                    } else {
                        let parsedDate: Date;

                        if (/^\d+\.?\d*$/.test(dateStr)) {
                            const excelDate = Number.parseFloat(dateStr);
                            parsedDate = new Date(
                                (excelDate - 25_569) * 86_400 * 1000
                            );
                        } else {
                            parsedDate = new Date(dateStr);
                        }

                        if (
                            !Number.isNaN(parsedDate.getTime()) &&
                            parsedDate.getFullYear() > 1900
                        ) {
                            tradeDate = parsedDate.toISOString().split("T")[0];
                        } else {
                            console.warn(
                                `Invalid date format: ${dateStr}, using today's date`
                            );
                        }
                    }
                }

                const assetName = trade.Asset || trade.Symbol || "";
                const symbol = trade.Symbol || trade.Asset || "";
                const assetId = await findOrCreateAsset(assetName, symbol);

                const sessionId = trade.Session
                    ? await findOrCreateSession(trade.Session)
                    : null;
                const setupId = trade.Setup
                    ? await findOrCreateSetup(trade.Setup)
                    : null;
                const cleanRiskValue = trade.Risk
                    ? String(trade.Risk).replace(/[%,]/g, "").trim()
                    : "";
                const cleanProfitValue = trade.Result
                    ? String(trade.Result).replace(/[%,]/g, "").trim()
                    : "";

                const riskInput = cleanRiskValue || "";
                const profitLossPercentage = cleanProfitValue || "0";

                let exitReason: "TP" | "BE" | "SL" | undefined;
                if (!profitLossPercentage || profitLossPercentage === "") {
                    exitReason = "BE";
                } else {
                    const profitValue = Number.parseFloat(profitLossPercentage);
                    if (Number.isNaN(profitValue)) {
                        exitReason = "BE";
                    } else if (profitValue > 0) {
                        exitReason = "TP";
                    } else if (profitValue === 0) {
                        exitReason = "BE";
                    } else if (profitValue < 0) {
                        exitReason = "SL";
                    }
                }

                if (!tradeDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    console.error(`Invalid tradeDate format: ${tradeDate}`);
                    throw new Error(`Format de date invalide: ${tradeDate}`);
                }

                await createTrade({
                    tradeDate,
                    assetId: assetId || undefined,
                    symbol,
                    sessionId: sessionId || undefined,
                    setupId: setupId || undefined,
                    riskInput,
                    profitLossAmount: profitLossPercentage,
                    profitLossPercentage,
                    exitReason,
                    tradingviewLink: trade.TradingViewLink || undefined,
                    notes: trade.Notes || undefined,
                    journalId,
                    isClosed: true,
                });

                successCount++;
            } catch (error) {
                console.error("Error importing trade:", error);
                errorCount++;
            }
        }

        setIsImporting(false);

        if (errorCount === 0) {
            const createdSummary: string[] = [];
            if (createdItems.assets.length > 0) {
                createdSummary.push(`${createdItems.assets.length} assets`);
            }
            createdSummary.push(`${createdItems.assets.length} assets`);
            if (createdItems.sessions.length > 0) {
                createdSummary.push(`${createdItems.sessions.length} sessions`);
            }
            createdSummary.push(`${createdItems.sessions.length} sessions`);
            if (createdItems.setups.length > 0) {
                createdSummary.push(`${createdItems.setups.length} setups`);
            }

            const summaryText =
                createdSummary.length > 0
                    ? ` (Created: ${createdSummary.join(", ")})`
                    : "";

            setImportStatus({
                type: "success",
                message: `Successfully imported ${successCount} trades!${summaryText}`,
            });
        } else {
            setImportStatus({
                type: "error",
                message: `Imported ${successCount} trades, ${errorCount} failed.`,
            });
        }
    };

    const getIcon = (type: "success" | "error" | "info") => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-400" />;
            case "info":
                return <AlertCircle className="h-5 w-5 text-blue-400" />;
            default:
                return <AlertCircle className="h-5 w-5 text-blue-400" />;
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/10 bg-black/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">
                                Import Trades
                            </CardTitle>
                            <CardDescription className="text-white/60">
                                Import trades from Excel file
                            </CardDescription>
                        </div>
                        <Button
                            className="text-white/60 hover:bg-white/10 hover:text-white"
                            onClick={onClose}
                            size="sm"
                            variant="ghost"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="text-white">
                    <div className="space-y-6">
                        <div>
                            <Label className="mb-2 block text-white/80">
                                Select Excel File
                            </Label>
                            <div className="rounded-lg border-2 border-white/20 border-dashed p-6 text-center">
                                <input
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={handleFileUpload}
                                    type="file"
                                />
                                <label
                                    className="cursor-pointer"
                                    htmlFor="file-upload"
                                >
                                    <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-white/40" />
                                    <p className="mb-2 text-white/60">
                                        Click to select Excel file
                                    </p>
                                    <p className="text-sm text-white/40">
                                        Supports .xlsx and .xls files
                                    </p>
                                </label>
                            </div>
                        </div>

                        {importStatus && (
                            <div
                                className={cn(
                                    "rounded-lg border p-4",
                                    importStatus.type === "success" &&
                                        "border-green-500/20 bg-green-500/10",
                                    importStatus.type === "error" &&
                                        "border-red-500/20 bg-red-500/10",
                                    importStatus.type === "info" &&
                                        "border-blue-500/20 bg-blue-500/10"
                                )}
                            >
                                <div className="flex items-center space-x-2">
                                    {getIcon(importStatus.type)}
                                    <span className="text-white">
                                        {importStatus.message}
                                    </span>
                                </div>
                            </div>
                        )}

                        {tradesToImport.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-white/80">
                                    Preview ({tradesToImport.length} trades)
                                </h3>
                                <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10">
                                    <table className="w-full text-sm">
                                        <thead className="bg-black/20">
                                            <tr>
                                                <th className="p-2 text-left text-white/60">
                                                    Date
                                                </th>
                                                <th className="p-2 text-left text-white/60">
                                                    Asset
                                                </th>
                                                <th className="p-2 text-left text-white/60">
                                                    Result
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tradesToImport
                                                .slice(0, 5)
                                                .map((trade, index) => (
                                                    <tr
                                                        className="border-white/5 border-t"
                                                        key={index}
                                                    >
                                                        <td className="p-2 text-white/80">
                                                            {trade.Date ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-2 text-white/80">
                                                            {trade.Asset ||
                                                                trade.Symbol ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-2 text-white/80">
                                                            {trade.Result ||
                                                                "N/A"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            {tradesToImport.length > 5 && (
                                                <tr>
                                                    <td
                                                        className="p-2 text-center text-white/40"
                                                        colSpan={3}
                                                    >
                                                        ... and{" "}
                                                        {tradesToImport.length -
                                                            5}{" "}
                                                        more trades
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                onClick={onClose}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-white text-black hover:bg-gray-200"
                                disabled={
                                    isImporting || tradesToImport.length === 0
                                }
                                onClick={handleImport}
                                type="button"
                            >
                                {isImporting ? (
                                    <>
                                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Import {tradesToImport.length} Trades
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
