"use client";

import { useState, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Edit, Trash2, ExternalLink, Camera, Loader2 } from "lucide-react";
import { api } from "@/trpc/client";
import html2canvas from "html2canvas";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import Image from "next/image";

interface JournalPerformanceCardProps {
  journal: {
    id: string;
    name: string;
    description: string | null;
    order: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function JournalPerformanceCard({ journal, onEdit, onDelete }: JournalPerformanceCardProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const flexCardRef = useRef<HTMLDivElement>(null);

  const { data: tradesData } = api.trading.getTrades.useQuery(
    { journalId: journal.id },
    { enabled: !!journal.id }
  );

  const cumulativeData = useMemo(() => {
    if (!tradesData || tradesData.length === 0) return [];

    return tradesData
      .slice()
      .sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime())
      .reduce((acc, trade, index) => {
        const pnl = trade.profitLossPercentage ? parseFloat(trade.profitLossPercentage) || 0 : 0;
        const previous = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        const cumulative = previous + pnl;
        acc.push({ tradeNumber: index + 1, cumulative });
        return acc;
      }, [] as Array<{ tradeNumber: number; cumulative: number }>);
  }, [tradesData]);

  const chartData = cumulativeData.length > 0 ? cumulativeData : [{ tradeNumber: 0, cumulative: 0 }];

  const { data: stats } = api.trading.getStats.useQuery(
    { journalId: journal.id },
    { enabled: !!journal.id }
  );

  const bestTrade = tradesData && tradesData.length > 0
    ? tradesData.reduce((best, current) => {
      const currentPnl = Number(current.profitLossPercentage || 0);
      const bestPnl = Number(best.profitLossPercentage || 0);
      return currentPnl > bestPnl ? current : best;
    })
    : null;


  const finalCumulative = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].cumulative : Number(stats?.totalPnL || 0);

  const handleFlexCapture = async () => {
    if (!flexCardRef.current) return;

    setIsCapturing(true);

    try {
      const canvas = await html2canvas(flexCardRef.current, {
        backgroundColor: "#000000",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: flexCardRef.current.scrollWidth,
        height: flexCardRef.current.scrollHeight,
      });

      const imageDataUrl = canvas.toDataURL("image/png", 0.95);
      setCapturedImage(imageDataUrl);
      setShowPreview(true);
    } catch (error) {
      console.error("Erreur lors de la capture:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;

    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = `altiora-${journal.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setCapturedImage(null);
  };

  return (
    <>
      <div
        ref={flexCardRef}
        className="fixed -top-[9999px] left-0 bg-black p-4 rounded-lg"
        style={{
          width: "400px",
          height: "500px",
          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
        }}
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-argesta text-white mb-1">{journal.name}</h2>
          <p className="text-white/60 text-xs">Trading Performance</p>
        </div>

        {stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.winRate.toFixed(1)}%
                </div>
                <div className="text-white/60 text-xs mt-1">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.totalTrades}
                </div>
                <div className="text-white/60 text-xs mt-1">Trades</div>
              </div>
              <div className="text-center">
                 <div className="text-2xl font-bold text-white">
                   {(() => {
                     if (!stats) return "0.00";
                     
                     const totalPnL = typeof stats.totalPnL === 'string' ? parseFloat(stats.totalPnL) || 0 : stats.totalPnL;
                     const avgWin = stats.winningTrades > 0 ? totalPnL / stats.winningTrades : 0;
                     const avgLoss = stats.losingTrades > 0 ? Math.abs(totalPnL) / stats.losingTrades : 0;
                     const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
                     
                     return profitFactor.toFixed(2);
                   })()}
                 </div>
                <div className="text-white/60 text-xs mt-1">Profit Factor</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}></div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{stats.tpTrades}</div>
                <div className="text-white/60 text-xs mt-1">TP</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{stats.beTrades}</div>
                <div className="text-white/60 text-xs mt-1">BE</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{stats.slTrades}</div>
                <div className="text-white/60 text-xs mt-1">SL</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="bg-black/20 rounded border border-white/10 p-4">
            <div className="flex justify-between items-center text-white/60 text-xs mb-2">
              <span>Cumulative Performance (%)</span>
              <span className="text-white text-sm font-semibold">{finalCumulative >= 0 ? '+' : ''}{finalCumulative.toFixed(2)}%</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`journal-cumulative-${journal.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis
                    dataKey="tradeNumber"
                    tickLine={false}
                    axisLine={false}
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#ffffff"
                    strokeOpacity={0.4}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill={`url(#journal-cumulative-${journal.id})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Image
              src="/img/logo.png"
              alt="Altiora"
              width={16}
              height={16}
              className="opacity-60"
            />
            <span className="text-white/40 text-xs">altiora.pro</span>
          </div>
        </div>
      </div>

      <Card className="border border-white/10 bg-black/20 hover:border-white/20 transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg font-argesta text-white line-clamp-1">{journal.name}</CardTitle>
              </div>
              <CardDescription className="text-white/60 line-clamp-2">
                {journal.description || "No description"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-black/20 rounded-lg border border-white/10">
                <div className={`text-xl font-bold ${Number(stats.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(stats.totalPnL) >= 0 ? '+' : ''}{Number(stats.totalPnL).toFixed(2)}%
                </div>
                <div className="text-xs text-white/60">Performance</div>
              </div>
              <div className="text-center p-3 bg-black/20 rounded-lg border border-white/10">
                <div className="text-xl text-green-400">
                  {stats.winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-white/60">Win Rate</div>
              </div>
              <div className="text-center p-3 bg-black/20 rounded-lg border border-white/10">
                <div className="text-xl text-white">
                  {stats.totalTrades}
                </div>
                <div className="text-xs text-white/60">Total</div>
              </div>
            </div>
          )}

          {bestTrade && (
            <div className={`mb-4 p-3 rounded-lg border ${Number(bestTrade.profitLossPercentage || 0) >= 0
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`w-4 h-4 ${Number(bestTrade.profitLossPercentage || 0) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                    }`} />
                  <span className={`text-sm ${Number(bestTrade.profitLossPercentage || 0) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                    }`}>
                    Best trade
                  </span>
                </div>
                <Badge className={`${Number(bestTrade.profitLossPercentage || 0) >= 0
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                  {Number(bestTrade.profitLossPercentage || 0) >= 0 ? '+' : ''}{bestTrade.profitLossPercentage}%
                </Badge>
              </div>
              <div className="mt-1 text-sm text-white/80">
                {bestTrade.symbol.replace(/\s*#\d+\s*$/, '')} • {new Date(bestTrade.tradeDate).toLocaleDateString('en-US')}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center space-x-1">
              <Button
                onClick={handleFlexCapture}
                disabled={isCapturing}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {isCapturing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                onClick={onEdit}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={onDelete}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <a href={`/trading?journalId=${journal.id}`}>
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPreview && capturedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClosePreview}
        >
          <div
            className="bg-gradient-to-br from-black/90 to-black/80 rounded-2xl border border-white/20 p-4 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3">
              <h3 className="text-lg font-argesta text-white mb-1">Performance Preview</h3>
              <p className="text-white/60 text-xs">Review your trading statistics before sharing</p>
            </div>

            <div className="mb-4">
              <Image
                src={capturedImage}
                alt="Trading performance screenshot"
                width={400}
                height={500}
                className="w-full rounded-xl border border-white/10 shadow-lg"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-white/40 text-sm">
                {journal.name} • {new Date().toLocaleDateString('fr-FR')}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClosePreview}
                  className="px-6 py-3 text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-200 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Download Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 