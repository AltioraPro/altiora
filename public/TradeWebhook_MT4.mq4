//+------------------------------------------------------------------+
//|                                          TradeWebhook_MT4.mq4    |
//|                          Expert Advisor - Trade Journaling       |
//|                                    Synchronization MT4 → API     |
//|                                                                  |
//| This EA automatically syncs your closed MT4 trades to Altiora.   |
//| It polls for new closed orders and sends them via webhook.       |
//+------------------------------------------------------------------+
#property copyright "Altiora Trade Journal"
#property link      "https://altiora.app"
#property version   "1.00"
#property strict

input string InpUserToken = "";
input string InpApiUrl    = "https://altiora.app/api/integrations/metatrader/webhook";
input int    InpCheckIntervalSeconds = 5;

#define HTTP_TIMEOUT    5000
#define MAX_RETRIES     3

int      g_lastHistoryCount = 0;
datetime g_lastOrderCloseTime = 0;
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
   
   Print("TradeWebhook MT4 EA - Initialization");
   Print("API URL: ", InpApiUrl);
   Print("Token: ", StringSubstr(InpUserToken, 0, 8), "...");
   Print("Check interval: ", InpCheckIntervalSeconds, " seconds");
   Print("IMPORTANT: Add URL to Tools > Options > Expert Advisors > Allow WebRequest");
   Print("Domain: ", ExtractDomain(InpApiUrl));
   
   EventSetTimer(InpCheckIntervalSeconds);
   g_lastHistoryCount = OrdersHistoryTotal();
   
   Print("Starting full history sync...");
   
   int syncCount = SyncHistoricalOrders();
   
   if(syncCount >= 0)
      Print("Initial sync complete: ", syncCount, " trade(s) sent");
   else
      Print("Initial sync encountered errors");
   
   g_initialized = true;
   
   Print("EA is now active and monitoring trades.");
   
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("TradeWebhook MT4 EA - Stopped (reason: ", reason, ")");
}

void OnTimer()
{
   if(!g_initialized)
      return;
   CheckForNewClosedOrders();
}

void OnTick()
{
   if(!g_initialized)
      return;
   
   static datetime lastCheck = 0;
   
   if(TimeCurrent() - lastCheck >= InpCheckIntervalSeconds)
   {
      CheckForNewClosedOrders();
      lastCheck = TimeCurrent();
   }
}

void CheckForNewClosedOrders()
{
   int currentHistoryCount = OrdersHistoryTotal();
   
   if(currentHistoryCount > g_lastHistoryCount)
   {
      Print("New orders detected in history...");
      
      for(int i = g_lastHistoryCount; i < currentHistoryCount; i++)
      {
         if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         {
            int orderType = OrderType();
            
            if(orderType == OP_BUY || orderType == OP_SELL)
            {
               if(ProcessAndSendOrder(OrderTicket()))
                  Print("Trade #", OrderTicket(), " synced successfully");
               else
                  Print("Failed to sync trade #", OrderTicket());
            }
         }
      }
      
      g_lastHistoryCount = currentHistoryCount;
   }
}

int SyncHistoricalOrders()
{
   int sentCount = 0;
   int errorCount = 0;
   
   int totalOrders = OrdersHistoryTotal();
   Print(totalOrders, " order(s) found in history");
   
   for(int i = 0; i < totalOrders; i++)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         continue;
      
      int orderType = OrderType();
      
      if(orderType != OP_BUY && orderType != OP_SELL)
         continue;
      
      if(ProcessAndSendOrder(OrderTicket()))
         sentCount++;
      else
         errorCount++;
      
      Sleep(100);
   }
   
   g_lastHistoryCount = totalOrders;
   
   if(errorCount > 0)
      Print(errorCount, " order(s) could not be synced");
   
   return sentCount;
}

bool ProcessAndSendOrder(int ticket)
{
   if(!OrderSelect(ticket, SELECT_BY_TICKET, MODE_HISTORY))
   {
      Print("Order #", ticket, " not found in history");
      return false;
   }
   
   string symbol     = OrderSymbol();
   int    orderType  = OrderType();
   double lots       = OrderLots();
   double openPrice  = OrderOpenPrice();
   double closePrice = OrderClosePrice();
   double profit     = OrderProfit();
   double commission = OrderCommission();
   double swap       = OrderSwap();
   string comment    = OrderComment();
   int    magic      = OrderMagicNumber();
   datetime openTime = OrderOpenTime();
   datetime closeTime= OrderCloseTime();
   
   string typeStr = "";
   
   switch(orderType)
   {
      case OP_BUY:  typeStr = "buy";  break;
      case OP_SELL: typeStr = "sell"; break;
      default:      typeStr = "other"; break;
   }
   
   string json = BuildOrderJson(
      ticket, symbol, typeStr, lots, openPrice, closePrice,
      profit, commission, swap, comment, magic, openTime, closeTime
   );
   
   return SendToServer(json);
}

string BuildOrderJson(int ticket, string symbol, string type, double volume,
                      double openPrice, double closePrice, double profit,
                      double commission, double swap, string comment,
                      int magic, datetime openTime, datetime closeTime)
{
   string safeComment = EscapeJsonString(comment);
   
   string json = "{";
   json += "\"token\":\"" + InpUserToken + "\",";
   json += "\"ticket\":" + IntegerToString(ticket) + ",";
   json += "\"position_id\":" + IntegerToString(ticket) + ",";
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
   json += "\"account\":" + IntegerToString(AccountNumber()) + ",";
   json += "\"broker\":\"" + EscapeJsonString(AccountCompany()) + "\",";
   json += "\"currency\":\"" + AccountCurrency() + "\",";
   json += "\"platform\":\"MT4\"";
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
      headers += "User-Agent: MT4-TradeWebhook/1.0\r\n";
      
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
