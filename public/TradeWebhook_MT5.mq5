//+------------------------------------------------------------------+
//|                                               TradeWebhook.mq5   |
//|                          Expert Advisor - Trade Journaling       |
//|                                    Synchronization MT5 → API     |
//|                                                                  |
//| This EA automatically syncs your closed MT5 trades to Altiora.   |
//| It sends trade data via webhook when positions are closed.       |
//+------------------------------------------------------------------+
#property copyright "Altiora Trade Journal"
#property link      "https://altiora.app"
#property version   "1.00"
#property strict

input string InpUserToken = "";
input string InpApiUrl    = "https://altiora.app/api/integrations/metatrader/webhook";

#define HTTP_TIMEOUT    5000
#define MAX_RETRIES     3

datetime g_lastSyncTime = 0;
bool     g_initialized = false;

int OnInit()
{
   if(StringLen(InpUserToken) == 0)
   {
      Print("ERROR: User token (InpUserToken) is required!");
      return INIT_PARAMETERS_INCORRECT;
   }
   
   if(StringLen(InpApiUrl) == 0)
   {
      Print("ERROR: API URL (InpApiUrl) is required!");
      return INIT_PARAMETERS_INCORRECT;
   }
   
   Print("TradeWebhook EA - Initialization");
   Print("API URL: ", InpApiUrl);
   Print("Token: ", StringSubstr(InpUserToken, 0, 8), "...");
   Print("IMPORTANT: Add URL to Tools > Options > Expert Advisors > Allow WebRequest");
   Print("Domain: ", ExtractDomain(InpApiUrl));
   
   Print("Starting full history sync...");
   
   int syncCount = SyncHistoricalDeals();
   
   if(syncCount >= 0)
      Print("Initial sync complete: ", syncCount, " trade(s) sent");
   else
      Print("Initial sync encountered errors");
   
   g_initialized = true;
   g_lastSyncTime = TimeCurrent();
   
   Print("EA is now active and monitoring trades in real-time.");
   
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   Print("TradeWebhook EA - Stopped (reason: ", reason, ")");
}

void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
{
   if(trans.type != TRADE_TRANSACTION_HISTORY_ADD)
      return;
   
   if(!g_initialized)
      return;
   
   Print("New transaction detected (Deal #", trans.deal, ")");
   
   if(ProcessAndSendDeal(trans.deal))
      Print("Trade #", trans.deal, " synced successfully");
   else
      Print("Failed to sync trade #", trans.deal);
}

int SyncHistoricalDeals()
{
   int sentCount = 0;
   int errorCount = 0;
   
   datetime fromDate = 0;
   datetime toDate = TimeCurrent();
   
   if(!HistorySelect(fromDate, toDate))
   {
      Print("ERROR: Unable to select deal history");
      return -1;
   }
   
   int totalDeals = HistoryDealsTotal();
   Print(totalDeals, " deal(s) found in history");
   
   for(int i = 0; i < totalDeals; i++)
   {
      ulong dealTicket = HistoryDealGetTicket(i);
      
      if(dealTicket == 0)
         continue;
      
      ENUM_DEAL_ENTRY dealEntry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      
      if(dealEntry != DEAL_ENTRY_OUT)
         continue;
      
      if(ProcessAndSendDeal(dealTicket))
         sentCount++;
      else
         errorCount++;
      
      Sleep(100);
   }
   
   if(errorCount > 0)
      Print(errorCount, " deal(s) could not be synced");
   
   return sentCount;
}

bool ProcessAndSendDeal(ulong dealTicket)
{
   if(!HistoryDealSelect(dealTicket))
   {
      datetime fromDate = TimeCurrent() - (7 * 24 * 60 * 60);
      HistorySelect(fromDate, TimeCurrent());
      
      if(!HistoryDealSelect(dealTicket))
      {
         Print("Deal #", dealTicket, " not found in history");
         return false;
      }
   }
   
   string symbol     = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
   double volume     = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
   double profit     = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
   double commission = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
   double swap       = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
   double price      = HistoryDealGetDouble(dealTicket, DEAL_PRICE);
   string comment    = HistoryDealGetString(dealTicket, DEAL_COMMENT);
   long   magic      = HistoryDealGetInteger(dealTicket, DEAL_MAGIC);
   long   positionId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
   datetime dealTime = (datetime)HistoryDealGetInteger(dealTicket, DEAL_TIME);
   
   ENUM_DEAL_TYPE dealType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(dealTicket, DEAL_TYPE);
   string typeStr = "";
   
   switch(dealType)
   {
      case DEAL_TYPE_BUY:  typeStr = "buy";  break;
      case DEAL_TYPE_SELL: typeStr = "sell"; break;
      default:             typeStr = "other"; break;
   }
   
   datetime openTime = 0;
   double   openPrice = 0;
   
   if(!GetPositionOpenInfo(positionId, openTime, openPrice))
   {
      openTime = dealTime;
      openPrice = price;
   }
   
   string json = BuildDealJson(
      dealTicket, symbol, typeStr, volume, openPrice, price,
      profit, commission, swap, comment, magic, positionId, openTime, dealTime
   );
   
   return SendToServer(json);
}

bool GetPositionOpenInfo(long positionId, datetime& openTime, double& openPrice)
{
   datetime fromDate = 0;
   
   if(!HistorySelect(fromDate, TimeCurrent()))
      return false;
   
   int totalDeals = HistoryDealsTotal();
   
   for(int i = 0; i < totalDeals; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      
      if(ticket == 0)
         continue;
      
      if(HistoryDealGetInteger(ticket, DEAL_POSITION_ID) != positionId)
         continue;
      
      ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY);
      
      if(entry == DEAL_ENTRY_IN)
      {
         openTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
         openPrice = HistoryDealGetDouble(ticket, DEAL_PRICE);
         return true;
      }
   }
   
   return false;
}

string BuildDealJson(ulong ticket, string symbol, string type, double volume,
                     double openPrice, double closePrice, double profit,
                     double commission, double swap, string comment,
                     long magic, long positionId, datetime openTime, datetime closeTime)
{
   string safeComment = EscapeJsonString(comment);
   
   string json = "{";
   json += "\"token\":\"" + InpUserToken + "\",";
   json += "\"ticket\":" + IntegerToString(ticket) + ",";
   json += "\"position_id\":" + IntegerToString(positionId) + ",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"type\":\"" + type + "\",";
   json += "\"volume\":" + DoubleToString(volume, 2) + ",";
   json += "\"open_price\":" + DoubleToString(openPrice, 5) + ",";
   json += "\"close_price\":" + DoubleToString(closePrice, 5) + ",";
   json += "\"profit\":" + DoubleToString(profit, 2) + ",";
   json += "\"commission\":" + DoubleToString(commission, 2) + ",";
   json += "\"swap\":" + DoubleToString(swap, 2) + ",";
   json += "\"comment\":\"" + safeComment + "\",";
   json += "\"magic\":" + IntegerToString(magic) + ",";
   json += "\"open_time\":\"" + TimeToString(openTime, TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"close_time\":\"" + TimeToString(closeTime, TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"account\":" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN)) + ",";
   json += "\"broker\":\"" + EscapeJsonString(AccountInfoString(ACCOUNT_COMPANY)) + "\",";
   json += "\"currency\":\"" + AccountInfoString(ACCOUNT_CURRENCY) + "\"";
   json += "}";
   
   return json;
}

string EscapeJsonString(string text)
{
   string result = text;
   StringReplace(result, "\\", "\\\\");
   StringReplace(result, "\"", "\\\"");
   StringReplace(result, "\n", "\\n");
   StringReplace(result, "\r", "\\r");
   StringReplace(result, "\t", "\\t");
   return result;
}

bool SendToServer(string jsonData)
{
   int retryCount = 0;
   
   while(retryCount < MAX_RETRIES)
   {
      string headers = "Content-Type: application/json\r\n";
      headers += "x-user-token: " + InpUserToken + "\r\n";
      headers += "User-Agent: MT5-TradeWebhook/1.0\r\n";
      
      char postData[];
      char responseData[];
      string responseHeaders;
      
      StringToCharArray(jsonData, postData, 0, WHOLE_ARRAY, CP_UTF8);
      
      int dataSize = ArraySize(postData);
      if(dataSize > 0 && postData[dataSize-1] == 0)
         ArrayResize(postData, dataSize - 1);
      
      ResetLastError();
      int responseCode = WebRequest("POST", InpApiUrl, headers, HTTP_TIMEOUT, postData, responseData, responseHeaders);
      
      if(responseCode == -1)
      {
         int errorCode = GetLastError();
         
         if(errorCode == 4060)
         {
            Print("ERROR 4060: URL not allowed. Add to Tools > Options > Expert Advisors: ", ExtractDomain(InpApiUrl));
            return false;
         }
         
         Print("WebRequest error (", errorCode, "), attempt ", retryCount + 1, "/", MAX_RETRIES);
         retryCount++;
         Sleep(1000 * retryCount);
         continue;
      }
      
      if(responseCode >= 200 && responseCode < 300)
         return true;
      
      if(responseCode >= 400 && responseCode < 500)
      {
         string responseText = CharArrayToString(responseData, 0, WHOLE_ARRAY, CP_UTF8);
         Print("Server error (HTTP ", responseCode, "): ", responseText);
         return false;
      }
      
      if(responseCode >= 500)
      {
         Print("Server error (HTTP ", responseCode, "), attempt ", retryCount + 1, "/", MAX_RETRIES);
         retryCount++;
         Sleep(1000 * retryCount);
         continue;
      }
      
      retryCount++;
      Sleep(500);
   }
   
   Print("Failed after ", MAX_RETRIES, " attempts");
   return false;
}

string ExtractDomain(string url)
{
   string result = url;
   StringReplace(result, "https://", "");
   StringReplace(result, "http://", "");
   int slashPos = StringFind(result, "/");
   if(slashPos > 0)
      result = StringSubstr(result, 0, slashPos);
   return result;
}

void OnTick() {}
void OnTimer() {}
