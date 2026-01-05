//+------------------------------------------------------------------+
//|                                          TradeWebhook_MT4.mq4    |
//|                          Expert Advisor - SaaS Trade Journaling  |
//|                                    Synchronisation MT4 → API     |
//+------------------------------------------------------------------+
#property copyright "SaaS Trade Journal"
#property link      ""
#property version   "1.00"
#property description "EA webhook pour synchroniser les trades MT4 vers votre SaaS de journaling"
#property strict

//+------------------------------------------------------------------+
//| PARAMÈTRES D'ENTRÉE (INPUTS)                                     |
//+------------------------------------------------------------------+
input string InpUserToken = "";                                    // Token API utilisateur (généré sur ALTIORA)
input string InpApiUrl    = "https://altiora.app/api/integrations/metatrader/webhook"; // URL de l'endpoint webhook
input int    InpCheckIntervalSeconds = 5;                          // Intervalle de vérification (secondes)

//+------------------------------------------------------------------+
//| CONSTANTES                                                       |
//+------------------------------------------------------------------+
#define HTTP_TIMEOUT    5000   // Timeout des requêtes HTTP en ms
#define MAX_RETRIES     3      // Nombre maximum de tentatives

//+------------------------------------------------------------------+
//| VARIABLES GLOBALES                                               |
//+------------------------------------------------------------------+
int      g_lastHistoryCount = 0;     // Dernier nombre d'ordres dans l'historique
datetime g_lastOrderCloseTime = 0;   // Timestamp du dernier ordre traité
bool     g_initialized = false;       // État d'initialisation

//+------------------------------------------------------------------+
//| Fonction d'initialisation de l'Expert Advisor                    |
//+------------------------------------------------------------------+
int OnInit()
{
   //--- Vérification des paramètres obligatoires
   if(StringLen(InpUserToken) == 0)
   {
      Print("❌ ERREUR: Le token utilisateur (InpUserToken) est obligatoire!");
      Print("   Veuillez configurer votre token API dans les paramètres de l'EA.");
      return INIT_PARAMETERS_INCORRECT;
   }
   
   if(StringLen(InpApiUrl) == 0)
   {
      Print("❌ ERREUR: L'URL de l'API (InpApiUrl) est obligatoire!");
      return INIT_PARAMETERS_INCORRECT;
   }
   
   //--- Afficher les informations de démarrage
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   Print("🚀 TradeWebhook MT4 EA - Initialisation");
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   Print("📡 URL API: ", InpApiUrl);
   Print("🔑 Token configuré: ", StringSubstr(InpUserToken, 0, 8), "...");
   Print("⏱️  Intervalle de vérification: ", InpCheckIntervalSeconds, " secondes");
   Print("");
   Print("⚠️  IMPORTANT: Assurez-vous que l'URL est autorisée dans:");
   Print("   Outils → Options → Expert Advisors → Autoriser WebRequest pour:");
   Print("   ", ExtractDomain(InpApiUrl));
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   
   //--- Configurer le timer pour la surveillance périodique
   EventSetTimer(InpCheckIntervalSeconds);
   
   //--- Mémoriser l'état initial de l'historique
   g_lastHistoryCount = OrdersHistoryTotal();
   
   //--- Synchronisation de l'historique initial
   Print("");
   Print("📥 Démarrage de la synchronisation de TOUT l'historique...");
   
   int syncCount = SyncHistoricalOrders();
   
   if(syncCount >= 0)
   {
      Print("✅ Synchronisation initiale terminée: ", syncCount, " trade(s) envoyé(s)");
   }
   else
   {
      Print("⚠️  La synchronisation initiale a rencontré des erreurs");
   }
   
   g_initialized = true;
   
   Print("");
   Print("🎯 L'EA est maintenant actif et surveille les nouveaux trades.");
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Fonction de désinitialisation                                    |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   
   string reasonText = "";
   
   switch(reason)
   {
      case REASON_PROGRAM:     reasonText = "Arrêt par le programme"; break;
      case REASON_REMOVE:      reasonText = "EA supprimé du graphique"; break;
      case REASON_RECOMPILE:   reasonText = "EA recompilé"; break;
      case REASON_CHARTCHANGE: reasonText = "Symbole ou période changé"; break;
      case REASON_CHARTCLOSE:  reasonText = "Graphique fermé"; break;
      case REASON_PARAMETERS:  reasonText = "Paramètres modifiés"; break;
      case REASON_ACCOUNT:     reasonText = "Compte changé"; break;
      default:                 reasonText = "Raison inconnue (" + IntegerToString(reason) + ")";
   }
   
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   Print("🛑 TradeWebhook MT4 EA - Arrêt");
   Print("   Raison: ", reasonText);
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

//+------------------------------------------------------------------+
//| Fonction Timer - Vérifie périodiquement les nouveaux trades      |
//+------------------------------------------------------------------+
void OnTimer()
{
   if(!g_initialized)
      return;
   
   CheckForNewClosedOrders();
}

//+------------------------------------------------------------------+
//| Fonction OnTick - Vérifie aussi à chaque tick                    |
//+------------------------------------------------------------------+
void OnTick()
{
   if(!g_initialized)
      return;
   
   // Vérification légère à chaque tick
   static datetime lastCheck = 0;
   
   if(TimeCurrent() - lastCheck >= InpCheckIntervalSeconds)
   {
      CheckForNewClosedOrders();
      lastCheck = TimeCurrent();
   }
}

//+------------------------------------------------------------------+
//| Vérifie s'il y a de nouveaux ordres clôturés                     |
//+------------------------------------------------------------------+
void CheckForNewClosedOrders()
{
   int currentHistoryCount = OrdersHistoryTotal();
   
   //--- Si le nombre d'ordres dans l'historique a augmenté
   if(currentHistoryCount > g_lastHistoryCount)
   {
      Print("📊 Nouveaux ordres détectés dans l'historique...");
      
      //--- Parcourir les nouveaux ordres
      for(int i = g_lastHistoryCount; i < currentHistoryCount; i++)
      {
         if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         {
            //--- Vérifier que c'est un ordre de trading (pas un dépôt/retrait)
            int orderType = OrderType();
            
            if(orderType == OP_BUY || orderType == OP_SELL)
            {
               if(ProcessAndSendOrder(OrderTicket()))
               {
                  Print("✅ Trade #", OrderTicket(), " synchronisé avec succès");
               }
               else
               {
                  Print("❌ Échec de la synchronisation du trade #", OrderTicket());
               }
            }
         }
      }
      
      g_lastHistoryCount = currentHistoryCount;
   }
}

//+------------------------------------------------------------------+
//| Synchronise TOUT l'historique des ordres                         |
//| Retourne le nombre d'ordres envoyés, ou -1 en cas d'erreur       |
//+------------------------------------------------------------------+
int SyncHistoricalOrders()
{
   int sentCount = 0;
   int errorCount = 0;
   
   int totalOrders = OrdersHistoryTotal();
   Print("   📋 ", totalOrders, " ordre(s) trouvé(s) dans l'historique");
   
   //--- Parcourir TOUS les ordres de l'historique
   for(int i = 0; i < totalOrders; i++)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
         continue;
      
      //--- Ne traiter que les ordres de trading (OP_BUY et OP_SELL)
      int orderType = OrderType();
      
      if(orderType != OP_BUY && orderType != OP_SELL)
         continue;
      
      //--- Envoyer l'ordre au serveur
      if(ProcessAndSendOrder(OrderTicket()))
      {
         sentCount++;
      }
      else
      {
         errorCount++;
      }
      
      //--- Petite pause pour éviter de surcharger le serveur
      Sleep(100);
   }
   
   //--- Mémoriser le nombre d'ordres pour la détection des nouveaux
   g_lastHistoryCount = totalOrders;
   
   if(errorCount > 0)
   {
      Print("   ⚠️  ", errorCount, " ordre(s) n'ont pas pu être synchronisé(s)");
   }
   
   return sentCount;
}

//+------------------------------------------------------------------+
//| Traite un ordre et l'envoie au serveur API                       |
//| Retourne true si l'envoi a réussi, false sinon                   |
//+------------------------------------------------------------------+
bool ProcessAndSendOrder(int ticket)
{
   //--- Sélectionner l'ordre
   if(!OrderSelect(ticket, SELECT_BY_TICKET, MODE_HISTORY))
   {
      Print("   ⚠️  Ordre #", ticket, " non trouvé dans l'historique");
      return false;
   }
   
   //--- Récupérer les informations de l'ordre
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
   
   //--- Déterminer le type (buy/sell)
   string typeStr = "";
   
   switch(orderType)
   {
      case OP_BUY:  typeStr = "buy";  break;
      case OP_SELL: typeStr = "sell"; break;
      default:      typeStr = "other"; break;
   }
   
   //--- Construire le JSON
   string json = BuildOrderJson(
      ticket,
      symbol,
      typeStr,
      lots,
      openPrice,
      closePrice,
      profit,
      commission,
      swap,
      comment,
      magic,
      openTime,
      closeTime
   );
   
   //--- Envoyer au serveur
   return SendToServer(json);
}

//+------------------------------------------------------------------+
//| Construit le JSON de l'ordre avec formatage précis des nombres   |
//+------------------------------------------------------------------+
string BuildOrderJson(int ticket, string symbol, string type, double volume,
                      double openPrice, double closePrice, double profit,
                      double commission, double swap, string comment,
                      int magic, datetime openTime, datetime closeTime)
{
   //--- Échapper les caractères spéciaux dans le commentaire
   string safeComment = EscapeJsonString(comment);
   
   //--- Construire le JSON avec formatage précis
   string json = "{";
   json += "\"token\":\"" + InpUserToken + "\",";
   json += "\"ticket\":" + IntegerToString(ticket) + ",";
   json += "\"position_id\":" + IntegerToString(ticket) + ",";  // MT4 n'a pas de position_id, on utilise le ticket
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
   json += "\"platform\":\"MT4\"";  // Identifie la source comme MT4
   json += "}";
   
   return json;
}

//+------------------------------------------------------------------+
//| Échappe les caractères spéciaux pour JSON                        |
//+------------------------------------------------------------------+
string EscapeJsonString(string text)
{
   string result = text;
   
   //--- Remplacer les caractères qui posent problème en JSON
   StringReplace(result, "\\", "\\\\");  // Backslash en premier!
   StringReplace(result, "\"", "\\\"");  // Guillemets
   StringReplace(result, "\n", "\\n");   // Nouvelle ligne
   StringReplace(result, "\r", "\\r");   // Retour chariot
   StringReplace(result, "\t", "\\t");   // Tabulation
   
   return result;
}

//+------------------------------------------------------------------+
//| Envoie les données JSON au serveur via WebRequest                |
//| Retourne true si l'envoi a réussi, false sinon                   |
//+------------------------------------------------------------------+
bool SendToServer(string jsonData)
{
   int retryCount = 0;
   
   while(retryCount < MAX_RETRIES)
   {
      //--- Préparer les headers
      string headers = "Content-Type: application/json\r\n";
      headers += "x-user-token: " + InpUserToken + "\r\n";
      headers += "User-Agent: MT4-TradeWebhook/1.0\r\n";
      
      //--- Convertir le JSON en tableau de bytes
      char postData[];
      char responseData[];
      string responseHeaders;
      
      StringToCharArray(jsonData, postData, 0, WHOLE_ARRAY, CP_UTF8);
      
      //--- Supprimer le caractère nul de fin
      int dataSize = ArraySize(postData);
      if(dataSize > 0 && postData[dataSize-1] == 0)
      {
         ArrayResize(postData, dataSize - 1);
      }
      
      //--- Effectuer la requête HTTP POST
      ResetLastError();
      int responseCode = WebRequest(
         "POST",           // Méthode HTTP
         InpApiUrl,        // URL
         headers,          // Headers
         HTTP_TIMEOUT,     // Timeout
         postData,         // Données POST
         responseData,     // Réponse (sortie)
         responseHeaders   // Headers de réponse (sortie)
      );
      
      //--- Analyser la réponse
      if(responseCode == -1)
      {
         int errorCode = GetLastError();
         
         if(errorCode == 4060) // URL non autorisée
         {
            Print("   ❌ ERREUR 4060: L'URL n'est pas autorisée dans MetaTrader 4");
            Print("      Allez dans: Outils → Options → Expert Advisors");
            Print("      Ajoutez: ", ExtractDomain(InpApiUrl));
            return false;
         }
         else
         {
            Print("   ⚠️  Erreur WebRequest (code ", errorCode, "), tentative ", retryCount + 1, "/", MAX_RETRIES);
         }
         
         retryCount++;
         Sleep(1000 * retryCount);
         continue;
      }
      
      //--- Vérifier le code de réponse HTTP
      if(responseCode >= 200 && responseCode < 300)
      {
         return true;
      }
      else if(responseCode >= 400 && responseCode < 500)
      {
         string responseText = CharArrayToString(responseData, 0, WHOLE_ARRAY, CP_UTF8);
         Print("   ❌ Erreur serveur (HTTP ", responseCode, "): ", responseText);
         return false;
      }
      else if(responseCode >= 500)
      {
         Print("   ⚠️  Erreur serveur (HTTP ", responseCode, "), tentative ", retryCount + 1, "/", MAX_RETRIES);
         retryCount++;
         Sleep(1000 * retryCount);
         continue;
      }
      else
      {
         Print("   ⚠️  Réponse inattendue (HTTP ", responseCode, ")");
         retryCount++;
         Sleep(500);
         continue;
      }
   }
   
   Print("   ❌ Échec après ", MAX_RETRIES, " tentatives");
   return false;
}

//+------------------------------------------------------------------+
//| Extrait le domaine d'une URL                                     |
//+------------------------------------------------------------------+
string ExtractDomain(string url)
{
   string result = url;
   
   StringReplace(result, "https://", "");
   StringReplace(result, "http://", "");
   
   int slashPos = StringFind(result, "/");
   if(slashPos > 0)
   {
      result = StringSubstr(result, 0, slashPos);
   }
   
   return result;
}

//+------------------------------------------------------------------+
