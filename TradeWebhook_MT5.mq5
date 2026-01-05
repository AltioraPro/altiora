//+------------------------------------------------------------------+
//|                                               TradeWebhook.mq5   |
//|                          Expert Advisor - SaaS Trade Journaling  |
//|                                    Synchronisation MT5 → API     |
//+------------------------------------------------------------------+
#property copyright "SaaS Trade Journal"
#property link      ""
#property version   "1.00"
#property description "EA webhook pour synchroniser les trades MT5 vers votre SaaS de journaling"
#property strict

//+------------------------------------------------------------------+
//| PARAMÈTRES D'ENTRÉE (INPUTS)                                     |
//+------------------------------------------------------------------+
input string InpUserToken = "";                                    // Token API utilisateur (généré sur ALTIORA)
input string InpApiUrl    = "https://altiora.app/api/integrations/metatrader/webhook"; // URL de l'endpoint webhook

//+------------------------------------------------------------------+
//| CONSTANTES                                                       |
//+------------------------------------------------------------------+
#define HTTP_TIMEOUT    5000   // Timeout des requêtes HTTP en ms
#define MAX_RETRIES     3      // Nombre maximum de tentatives

//+------------------------------------------------------------------+
//| VARIABLES GLOBALES                                               |
//+------------------------------------------------------------------+
datetime g_lastSyncTime = 0;   // Horodatage de la dernière synchronisation
bool     g_initialized = false; // État d'initialisation

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
   
   //--- Vérification que l'URL est autorisée dans MT5
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   Print("🚀 TradeWebhook EA - Initialisation");
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   Print("📡 URL API: ", InpApiUrl);
   Print("🔑 Token configuré: ", StringSubstr(InpUserToken, 0, 8), "...");
   Print("");
   Print("⚠️  IMPORTANT: Assurez-vous que l'URL est autorisée dans:");
   Print("   Outils → Options → Expert Advisors → Autoriser WebRequest pour:");
   Print("   ", ExtractDomain(InpApiUrl));
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   
   //--- Synchronisation de l'historique initial
   Print("");
   Print("📥 Démarrage de la synchronisation de TOUT l'historique...");
   
   int syncCount = SyncHistoricalDeals();
   
   if(syncCount >= 0)
   {
      Print("✅ Synchronisation initiale terminée: ", syncCount, " trade(s) envoyé(s)");
   }
   else
   {
      Print("⚠️  La synchronisation initiale a rencontré des erreurs (voir logs ci-dessus)");
   }
   
   g_initialized = true;
   g_lastSyncTime = TimeCurrent();
   
   Print("");
   Print("🎯 L'EA est maintenant actif et surveille les nouveaux trades en temps réel.");
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Fonction de désinitialisation                                    |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
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
   Print("🛑 TradeWebhook EA - Arrêt");
   Print("   Raison: ", reasonText);
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

//+------------------------------------------------------------------+
//| Fonction de surveillance des transactions en temps réel          |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
{
   //--- Ne traiter que les ajouts à l'historique (transactions terminées)
   if(trans.type != TRADE_TRANSACTION_HISTORY_ADD)
      return;
   
   //--- Vérifier que l'EA est bien initialisé
   if(!g_initialized)
      return;
   
   Print("");
   Print("📊 Nouvelle transaction détectée (Deal #", trans.deal, ")");
   
   //--- Récupérer et envoyer les informations du deal
   if(ProcessAndSendDeal(trans.deal))
   {
      Print("✅ Trade #", trans.deal, " synchronisé avec succès");
   }
   else
   {
      Print("❌ Échec de la synchronisation du trade #", trans.deal);
   }
}

//+------------------------------------------------------------------+
//| Synchronise TOUT l'historique des deals                          |
//| Retourne le nombre de deals envoyés, ou -1 en cas d'erreur       |
//+------------------------------------------------------------------+
int SyncHistoricalDeals()
{
   int sentCount = 0;
   int errorCount = 0;
   
   //--- Prendre TOUT l'historique (depuis 1970)
   datetime fromDate = 0;  // 1er janvier 1970
   datetime toDate = TimeCurrent();
   
   //--- Sélectionner l'historique des deals
   if(!HistorySelect(fromDate, toDate))
   {
      Print("❌ ERREUR: Impossible de sélectionner l'historique des deals");
      return -1;
   }
   
   int totalDeals = HistoryDealsTotal();
   Print("   📋 ", totalDeals, " deal(s) trouvé(s) dans l'historique");
   
   //--- Parcourir tous les deals de l'historique
   for(int i = 0; i < totalDeals; i++)
   {
      ulong dealTicket = HistoryDealGetTicket(i);
      
      if(dealTicket == 0)
         continue;
      
      //--- Ne traiter que les clôtures de position (DEAL_ENTRY_OUT)
      ENUM_DEAL_ENTRY dealEntry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
      
      if(dealEntry != DEAL_ENTRY_OUT)
         continue;
      
      //--- Envoyer le deal au serveur
      if(ProcessAndSendDeal(dealTicket))
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
   
   if(errorCount > 0)
   {
      Print("   ⚠️  ", errorCount, " deal(s) n'ont pas pu être synchronisé(s)");
   }
   
   return sentCount;
}

//+------------------------------------------------------------------+
//| Traite un deal et l'envoie au serveur API                        |
//| Retourne true si l'envoi a réussi, false sinon                   |
//+------------------------------------------------------------------+
bool ProcessAndSendDeal(ulong dealTicket)
{
   //--- Vérifier que le deal existe dans l'historique
   if(!HistoryDealSelect(dealTicket))
   {
      //--- Essayer de recharger l'historique récent
      datetime fromDate = TimeCurrent() - (7 * 24 * 60 * 60); // 7 derniers jours
      HistorySelect(fromDate, TimeCurrent());
      
      if(!HistoryDealSelect(dealTicket))
      {
         Print("   ⚠️  Deal #", dealTicket, " non trouvé dans l'historique");
         return false;
      }
   }
   
   //--- Récupérer les informations du deal
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
   
   //--- Déterminer le type (BUY/SELL) - Attention: pour DEAL_ENTRY_OUT, le type est inversé
   ENUM_DEAL_TYPE dealType = (ENUM_DEAL_TYPE)HistoryDealGetInteger(dealTicket, DEAL_TYPE);
   string typeStr = "";
   
   switch(dealType)
   {
      case DEAL_TYPE_BUY:  typeStr = "buy";  break;  // Clôture d'un SELL
      case DEAL_TYPE_SELL: typeStr = "sell"; break;  // Clôture d'un BUY
      default:             typeStr = "other"; break;
   }
   
   //--- Récupérer les informations d'ouverture depuis l'historique des positions
   datetime openTime = 0;
   double   openPrice = 0;
   
   if(GetPositionOpenInfo(positionId, openTime, openPrice))
   {
      // Informations d'ouverture trouvées
   }
   else
   {
      // Si on ne trouve pas l'info d'ouverture, utiliser le temps du deal
      openTime = dealTime;
      openPrice = price;
   }
   
   //--- Construire le JSON avec formatage propre des nombres
   string json = BuildDealJson(
      dealTicket,
      symbol,
      typeStr,
      volume,
      openPrice,
      price,
      profit,
      commission,
      swap,
      comment,
      magic,
      positionId,
      openTime,
      dealTime
   );
   
   //--- Envoyer au serveur
   return SendToServer(json);
}

//+------------------------------------------------------------------+
//| Récupère les informations d'ouverture d'une position             |
//+------------------------------------------------------------------+
bool GetPositionOpenInfo(long positionId, datetime& openTime, double& openPrice)
{
   //--- Sélectionner tout l'historique pour trouver le deal d'ouverture
   datetime fromDate = 0;  // 1er janvier 1970
   
   if(!HistorySelect(fromDate, TimeCurrent()))
      return false;
   
   int totalDeals = HistoryDealsTotal();
   
   for(int i = 0; i < totalDeals; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      
      if(ticket == 0)
         continue;
      
      //--- Vérifier si c'est le même position ID
      if(HistoryDealGetInteger(ticket, DEAL_POSITION_ID) != positionId)
         continue;
      
      //--- Vérifier si c'est un deal d'entrée
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

//+------------------------------------------------------------------+
//| Construit le JSON du deal avec formatage précis des nombres      |
//+------------------------------------------------------------------+
string BuildDealJson(ulong ticket, string symbol, string type, double volume,
                     double openPrice, double closePrice, double profit,
                     double commission, double swap, string comment,
                     long magic, long positionId, datetime openTime, datetime closeTime)
{
   //--- Échapper les caractères spéciaux dans le commentaire
   string safeComment = EscapeJsonString(comment);
   
   //--- Construire le JSON avec formatage précis (2 décimales pour les montants)
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
      headers += "User-Agent: MT5-TradeWebhook/1.0\r\n";
      
      //--- Convertir le JSON en tableau de bytes
      char postData[];
      char responseData[];
      string responseHeaders;
      
      StringToCharArray(jsonData, postData, 0, WHOLE_ARRAY, CP_UTF8);
      
      //--- Supprimer le caractère nul de fin ajouté par StringToCharArray
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
            Print("   ❌ ERREUR 4060: L'URL n'est pas autorisée dans MetaTrader 5");
            Print("      Allez dans: Outils → Options → Expert Advisors");
            Print("      Ajoutez: ", ExtractDomain(InpApiUrl));
            return false; // Pas de retry pour cette erreur
         }
         else if(errorCode == 4051) // Pas de connexion
         {
            Print("   ⚠️  Erreur de connexion (code ", errorCode, "), tentative ", retryCount + 1, "/", MAX_RETRIES);
         }
         else
         {
            Print("   ❌ Erreur WebRequest (code ", errorCode, "): ", GetErrorDescription(errorCode));
         }
         
         retryCount++;
         Sleep(1000 * retryCount); // Backoff exponentiel
         continue;
      }
      
      //--- Vérifier le code de réponse HTTP
      if(responseCode >= 200 && responseCode < 300)
      {
         // Succès
         return true;
      }
      else if(responseCode >= 400 && responseCode < 500)
      {
         // Erreur client - ne pas réessayer
         string responseText = CharArrayToString(responseData, 0, WHOLE_ARRAY, CP_UTF8);
         Print("   ❌ Erreur serveur (HTTP ", responseCode, "): ", responseText);
         return false;
      }
      else if(responseCode >= 500)
      {
         // Erreur serveur - réessayer
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
   
   //--- Supprimer le protocole
   StringReplace(result, "https://", "");
   StringReplace(result, "http://", "");
   
   //--- Trouver la fin du domaine (premier / ou fin de chaîne)
   int slashPos = StringFind(result, "/");
   if(slashPos > 0)
   {
      result = StringSubstr(result, 0, slashPos);
   }
   
   return result;
}

//+------------------------------------------------------------------+
//| Retourne une description lisible des codes d'erreur courants     |
//+------------------------------------------------------------------+
string GetErrorDescription(int errorCode)
{
   switch(errorCode)
   {
      case 4014: return "Erreur système";
      case 4051: return "Fonction non autorisée dans le testeur";
      case 4060: return "URL non autorisée dans la liste";
      case 4061: return "Autorisation WebRequest requise";
      case 4062: return "Trop de requêtes simultanées";
      case 4063: return "Téléchargement des données interdit";
      case 4064: return "Erreur de protocole";
      case 5203: return "Timeout de connexion";
      case 5200: return "Erreur interne";
      case 5201: return "Paramètres invalides";
      case 5202: return "Nombre de fichiers ouverts dépassé";
      default:   return "Erreur inconnue";
   }
}

//+------------------------------------------------------------------+
//| Fonction OnTick - Non utilisée mais requise                      |
//+------------------------------------------------------------------+
void OnTick()
{
   // L'EA n'effectue pas d'actions sur chaque tick
   // Toute la logique est dans OnTradeTransaction
}

//+------------------------------------------------------------------+
//| Fonction OnTimer - Peut être utilisée pour des health checks     |
//+------------------------------------------------------------------+
void OnTimer()
{
   // Peut être activée pour des vérifications périodiques
   // Utiliser EventSetTimer() dans OnInit() si nécessaire
}

//+------------------------------------------------------------------+
