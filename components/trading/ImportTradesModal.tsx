"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "@/trpc/client";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";

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

// Structure spécifique du fichier Excel
interface ExcelRow {
  [key: number]: unknown;
}

export function ImportTradesModal({ isOpen, onClose, journalId }: ImportTradesModalProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [tradesToImport, setTradesToImport] = useState<ExcelTrade[]>([]);
  const [createdItems, setCreatedItems] = useState<{
    assets: string[];
    sessions: string[];
    setups: string[];
  }>({ assets: [], sessions: [], setups: [] });
  
  // Cache local pour les items créés pendant l'import (synchrone avec useRef)
  const localCacheRef = useRef<{
    assets: Map<string, string>; // name -> id
    sessions: Map<string, string>; // name -> id
    setups: Map<string, string>; // name -> id
  }>({
    assets: new Map(),
    sessions: new Map(),
    setups: new Map()
  });

  const utils = api.useUtils();

  // Mutations
  const createTradeMutation = api.trading.createTrade.useMutation();
  const createAssetMutation = api.trading.createAsset.useMutation();
  const createSessionMutation = api.trading.createSession.useMutation();
  const createSetupMutation = api.trading.createSetup.useMutation();

  // Queries for existing data - use current journal or empty string for global
  const { data: existingAssets } = api.trading.getAssets.useQuery({ journalId: journalId || "" });
  const { data: existingSessions } = api.trading.getSessions.useQuery({ journalId: journalId || "" });
  const { data: existingSetups } = api.trading.getSetups.useQuery({ journalId: journalId || "" });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Lire les données brutes avec les indices de colonnes
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as ExcelRow[];
        
        // Debug: Afficher la structure du fichier Excel
        console.log('📊 Structure du fichier Excel:');
        console.log('Nombre de lignes:', rawData.length);
        if (rawData.length > 0) {
          console.log('Première ligne (en-têtes):', rawData[0]);
          console.log('Deuxième ligne (exemple):', rawData[1]);
        }
        
        // Convertir les données brutes en format structuré
        const processedTrades: ExcelTrade[] = [];
        
        for (let i = 1; i < rawData.length; i++) { // Commencer à 1 pour ignorer l'en-tête
          const row = rawData[i];
          if (!row || !row[0]) continue; // Ignorer les lignes vides
          
                     const trade: ExcelTrade = {
             Date: String(row[0] || ''), // Colonne 0: Date
             Asset: String(row[6] || ''), // Colonne 6: Actif
             Symbol: String(row[6] || ''), // Même que Asset
             Session: String(row[11] || ''), // Colonne 11: Session
             Risk: row[25] as string | number, // Colonne 25: Risk
             Result: row[28] as string | number, // Colonne 28: Profit
             Setup: String(row[31] || ''), // Colonne 31: Setup
             Notes: String(row[45] || ''), // Colonne 45: Notes
             TradingViewLink: String(row[50] || ''), // Colonne 50: Lien
           };
          
          processedTrades.push(trade);
        }

        setTradesToImport(processedTrades);
        setCreatedItems({ assets: [], sessions: [], setups: [] });
        // Reset local cache for new import
        console.log('🔄 Resetting local cache for new import');
        localCacheRef.current = {
          assets: new Map(),
          sessions: new Map(),
          setups: new Map()
        };
        setImportStatus({
          type: 'info',
          message: `${processedTrades.length} trades found in the file. Ready to import.`
        });
      } catch (error) {
        console.error('Error processing Excel file:', error);
        setImportStatus({
          type: 'error',
          message: 'Error reading Excel file. Please check the file format.'
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const findOrCreateAsset = async (assetName: string, symbol: string) => {
    if (!assetName && !symbol) return '';
    
    const assetToUse = assetName || symbol;
    if (!assetToUse) return '';
    
    console.log('🔍 Checking asset:', assetToUse, 'Cache size:', localCacheRef.current.assets.size);
    
    // Check if asset already exists in local cache
    const cachedAssetId = localCacheRef.current.assets.get(assetToUse.toLowerCase());
    if (cachedAssetId) {
      console.log('✅ Found in cache:', assetToUse, '->', cachedAssetId);
      return cachedAssetId;
    }
    
    // Check if asset already exists in current data
    const existingAsset = existingAssets?.find(a => 
      a.name.toLowerCase() === assetToUse.toLowerCase() || 
      (a.symbol && a.symbol.toLowerCase() === assetToUse.toLowerCase())
    );
    
    if (existingAsset) {
      console.log('✅ Found existing asset:', assetToUse, '->', existingAsset.id);
      // Add to local cache
      localCacheRef.current.assets.set(assetToUse.toLowerCase(), existingAsset.id);
      return existingAsset.id;
    }

    // Create new asset
    try {
      console.log('🆕 Creating new asset:', assetToUse);
      const result = await createAssetMutation.mutateAsync({
        journalId: journalId || "",
        name: assetToUse,
        symbol: assetToUse,
        type: "forex"
      });
      
      console.log('✅ Created asset:', assetToUse, '->', result.id);
      
      // Add to local cache
      localCacheRef.current.assets.set(assetToUse.toLowerCase(), result.id);
      console.log('📝 Updated cache, new size:', localCacheRef.current.assets.size);
      
      // Track created asset (only if not already tracked)
      setCreatedItems(prev => ({
        ...prev,
        assets: prev.assets.includes(assetToUse) ? prev.assets : [...prev.assets, assetToUse]
      }));
      
      return result.id;
    } catch (error) {
      console.error("Error creating asset:", error);
      return '';
    }
  };

  const findOrCreateSession = async (sessionName: string) => {
    if (!sessionName || typeof sessionName !== 'string') return null;
    
    const sessionToUse = sessionName.trim();
    if (!sessionToUse) return null;
    
    console.log('🔍 Checking session:', sessionToUse, 'Cache size:', localCacheRef.current.sessions.size);
    
    // Check if session already exists in local cache
    const cachedSessionId = localCacheRef.current.sessions.get(sessionToUse.toLowerCase());
    if (cachedSessionId) {
      console.log('✅ Found in cache:', sessionToUse, '->', cachedSessionId);
      return cachedSessionId;
    }
    
    // Check if session already exists
    const existingSession = existingSessions?.find(s => 
      s.name.toLowerCase() === sessionToUse.toLowerCase()
    );
    
    if (existingSession) {
      console.log('✅ Found existing session:', sessionToUse, '->', existingSession.id);
      // Add to local cache
      localCacheRef.current.sessions.set(sessionToUse.toLowerCase(), existingSession.id);
      return existingSession.id;
    }

    // Create new session
    try {
      console.log('🆕 Creating new session:', sessionToUse);
      const result = await createSessionMutation.mutateAsync({
        journalId: journalId || "",
        name: sessionToUse,
        description: `Imported session: ${sessionToUse}`
      });
      
      console.log('✅ Created session:', sessionToUse, '->', result.id);
      
      // Add to local cache
      localCacheRef.current.sessions.set(sessionToUse.toLowerCase(), result.id);
      console.log('📝 Updated session cache, new size:', localCacheRef.current.sessions.size);
      
      // Track created session (only if not already tracked)
      setCreatedItems(prev => ({
        ...prev,
        sessions: prev.sessions.includes(sessionToUse) ? prev.sessions : [...prev.sessions, sessionToUse]
      }));
      
      return result.id;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const findOrCreateSetup = async (setupName: string) => {
    if (!setupName || typeof setupName !== 'string') return null;
    
    const setupToUse = setupName.trim();
    if (!setupToUse) return null;
    
    console.log('🔍 Checking setup:', setupToUse, 'Cache size:', localCacheRef.current.setups.size);
    
    // Check if setup already exists in local cache
    const cachedSetupId = localCacheRef.current.setups.get(setupToUse.toLowerCase());
    if (cachedSetupId) {
      console.log('✅ Found in cache:', setupToUse, '->', cachedSetupId);
      return cachedSetupId;
    }
    
    // Check if setup already exists
    const existingSetup = existingSetups?.find(s => 
      s.name.toLowerCase() === setupToUse.toLowerCase()
    );
    
    if (existingSetup) {
      console.log('✅ Found existing setup:', setupToUse, '->', existingSetup.id);
      // Add to local cache
      localCacheRef.current.setups.set(setupToUse.toLowerCase(), existingSetup.id);
      return existingSetup.id;
    }

    // Create new setup
    try {
      console.log('🆕 Creating new setup:', setupToUse);
      const result = await createSetupMutation.mutateAsync({
        journalId: journalId || "",
        name: setupToUse,
        description: `Imported setup: ${setupToUse}`,
        strategy: "Imported"
      });
      
      console.log('✅ Created setup:', setupToUse, '->', result.id);
      
      // Add to local cache
      localCacheRef.current.setups.set(setupToUse.toLowerCase(), result.id);
      console.log('📝 Updated setup cache, new size:', localCacheRef.current.setups.size);
      
      // Track created setup (only if not already tracked)
      setCreatedItems(prev => ({
        ...prev,
        setups: prev.setups.includes(setupToUse) ? prev.setups : [...prev.setups, setupToUse]
      }));
      
      return result.id;
    } catch (error) {
      console.error("Error creating setup:", error);
      return null;
    }
  };

  const handleImport = async () => {
    if (!journalId || tradesToImport.length === 0) return;

    setIsImporting(true);
    setImportStatus(null);

    let successCount = 0;
    let errorCount = 0;

    for (const trade of tradesToImport) {
      try {
        // Parse date - handle various formats and ensure YYYY-MM-DD output
        let tradeDate = new Date().toISOString().split('T')[0]; // Default to today
        if (trade.Date) {
          const dateStr = String(trade.Date).trim();
          
          // Check if already in YYYY-MM-DD format
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            tradeDate = dateStr;
          } else {
            // Try to parse various date formats
            let parsedDate: Date;
            
            // Handle Excel date serial numbers (days since 1900-01-01)
            if (/^\d+\.?\d*$/.test(dateStr)) {
              const excelDate = parseFloat(dateStr);
              // Excel date serial number conversion
              parsedDate = new Date((excelDate - 25569) * 86400 * 1000);
            } else {
              // Try standard date parsing
              parsedDate = new Date(dateStr);
            }
            
            // Validate the parsed date
            if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
              tradeDate = parsedDate.toISOString().split('T')[0];
            } else {
              console.warn(`Invalid date format: ${dateStr}, using today's date`);
            }
          }
        }
        
        // Handle asset/symbol
        const assetName = trade.Asset || trade.Symbol || '';
        const symbol = trade.Symbol || trade.Asset || '';
        const assetId = await findOrCreateAsset(assetName, symbol);

        // Handle session
        const sessionId = trade.Session ? await findOrCreateSession(trade.Session) : null;

        // Handle setup
        const setupId = trade.Setup ? await findOrCreateSetup(trade.Setup) : null;

        // Parse numeric values - clean up percentages and commas
        const cleanRiskValue = trade.Risk ? String(trade.Risk).replace(/[%,]/g, '').trim() : '';
        const cleanProfitValue = trade.Result ? String(trade.Result).replace(/[%,]/g, '').trim() : '';
        
        const riskInput = cleanRiskValue || '';
        const profitLossPercentage = cleanProfitValue || '';
        
        // Debug logging
        console.log('Trade data:', {
          originalDate: trade.Date,
          parsedTradeDate: tradeDate,
          originalResult: trade.Result,
          cleanProfitValue,
          profitLossPercentage
        });

        // Map exit reason based on profit/loss
        let exitReason: 'TP' | 'BE' | 'SL' | 'Manual' | undefined = undefined;
        
        // Si profitLossPercentage est vide, null, ou 0, c'est un BE
        if (!profitLossPercentage || profitLossPercentage === '' || profitLossPercentage === '0' || profitLossPercentage === '0.00') {
          exitReason = 'BE';
        } else {
          const profitValue = parseFloat(profitLossPercentage);
          if (!isNaN(profitValue)) {
            if (profitValue > 0) exitReason = 'TP';
            else if (profitValue === 0) exitReason = 'BE';
            else if (profitValue < 0) exitReason = 'SL';
          }
        }
        
        console.log('Exit reason determination:', {
          profitLossPercentage,
          exitReason
        });

        // Validate tradeDate format before sending
        if (!tradeDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.error(`Invalid tradeDate format: ${tradeDate}`);
          throw new Error(`Format de date invalide: ${tradeDate}`);
        }

        // Create trade
        await createTradeMutation.mutateAsync({
          tradeDate,
          assetId: assetId || undefined,
          symbol: symbol, // Keep the original symbol for display
          sessionId: sessionId || undefined,
          setupId: setupId || undefined,
          riskInput,
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
      const createdSummary = [];
      if (createdItems.assets.length > 0) createdSummary.push(`${createdItems.assets.length} assets`);
      if (createdItems.sessions.length > 0) createdSummary.push(`${createdItems.sessions.length} sessions`);
      if (createdItems.setups.length > 0) createdSummary.push(`${createdItems.setups.length} setups`);
      
      const summaryText = createdSummary.length > 0 ? ` (Created: ${createdSummary.join(', ')})` : '';
      
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${successCount} trades!${summaryText}`
      });
      // Invalidate queries to refresh data
      utils.trading.getTrades.invalidate();
      utils.trading.getStats.invalidate();
      utils.trading.getAssets.invalidate();
      utils.trading.getSessions.invalidate();
      utils.trading.getSetups.invalidate();
    } else {
      setImportStatus({
        type: 'error',
        message: `Imported ${successCount} trades, ${errorCount} failed.`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 bg-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-argesta text-white">Import Trades</CardTitle>
              <CardDescription className="text-white/60">
                Import trades from Excel file
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-white">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <Label className="text-white/80 block mb-2">Select Excel File</Label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">Click to select Excel file</p>
                  <p className="text-white/40 text-sm">Supports .xlsx and .xls files</p>
                </label>
              </div>
            </div>

            {/* Import Status */}
            {importStatus && (
              <div className={`p-4 rounded-lg border ${
                importStatus.type === 'success' ? 'border-green-500/20 bg-green-500/10' :
                importStatus.type === 'error' ? 'border-red-500/20 bg-red-500/10' :
                'border-blue-500/20 bg-blue-500/10'
              }`}>
                <div className="flex items-center space-x-2">
                  {importStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : importStatus.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                  )}
                  <span className="text-white">{importStatus.message}</span>
                </div>
              </div>
            )}

            {/* Preview */}
            {tradesToImport.length > 0 && (
              <div>
                <h3 className="text-white/80 mb-3">Preview ({tradesToImport.length} trades)</h3>
                <div className="max-h-40 overflow-y-auto border border-white/10 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-black/20">
                      <tr>
                        <th className="text-left p-2 text-white/60">Date</th>
                        <th className="text-left p-2 text-white/60">Asset</th>
                        <th className="text-left p-2 text-white/60">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradesToImport.slice(0, 5).map((trade, index) => (
                        <tr key={index} className="border-t border-white/5">
                          <td className="p-2 text-white/80">{trade.Date || 'N/A'}</td>
                          <td className="p-2 text-white/80">{trade.Asset || trade.Symbol || 'N/A'}</td>
                          <td className="p-2 text-white/80">{trade.Result || 'N/A'}</td>
                        </tr>
                      ))}
                      {tradesToImport.length > 5 && (
                        <tr>
                          <td colSpan={3} className="p-2 text-white/40 text-center">
                            ... and {tradesToImport.length - 5} more trades
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-white/20 text-white/80 hover:bg-white/10">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={isImporting || tradesToImport.length === 0}
                className="bg-white text-black hover:bg-gray-200"
              >
                {isImporting ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
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
