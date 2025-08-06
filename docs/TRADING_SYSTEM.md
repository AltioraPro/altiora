# Système de Journal de Trading Avancé

## Vue d'ensemble

Le système de journal de trading d'Altiora est un système complet et avancé pour suivre, analyser et optimiser vos performances de trading. Il est basé sur la structure SQL fournie et adapté à l'architecture moderne de l'application.

## Architecture

### Tables principales

1. **`trading_journals`** - Journaux de trading
   - Organisateurs principaux des trades
   - Support multi-journaux par utilisateur
   - Journal par défaut configurable

2. **`trading_assets`** - Instruments financiers
   - Paires de devises, métaux, indices
   - Symboles et descriptions
   - Liés à un journal spécifique

3. **`trading_sessions`** - Sessions de trading
   - Périodes de trading (London, New York, etc.)
   - Horaires et fuseaux horaires
   - Analyse par session

4. **`trading_setups`** - Stratégies de trading
   - Méthodes et setups (LIT CYCLE, BINKS, etc.)
   - Niveaux de risque
   - Performance par stratégie

5. **`advanced_trades`** - Transactions avancées
   - Métadonnées complètes des trades
   - Raisonnement et notes
   - Tags et catégorisation
   - Calculs automatiques de P&L

### Fonctionnalités clés

#### 📊 Statistiques avancées
- **P&L total et moyen** : Calculs automatiques
- **Taux de réussite** : Trades gagnants vs perdants
- **Profit Factor** : Ratio gain/perte
- **Performance par symbole** : Analyse par instrument
- **Performance par setup** : Efficacité des stratégies

#### 🏷️ Système de tags
- Catégorisation flexible des trades
- Tags personnalisables
- Filtrage et recherche avancée

#### 📈 Métriques détaillées
- Gain moyen vs perte moyenne
- P&L par trade
- Analyse temporelle
- Performance par session

## Utilisation

### Création d'un journal

```typescript
// Créer un nouveau journal
const journal = await api.trading.createJournal.mutate({
  name: "Mon Journal Principal",
  description: "Journal pour mes trades quotidiens",
  isDefault: true
});
```

### Ajout d'un trade

```typescript
// Créer un nouveau trade
const trade = await api.trading.createTrade.mutate({
  symbol: "XAUUSD",
  side: "buy",
  quantity: 1,
  entryPrice: "1950.50",
  reasoning: "Support sur la zone 1950, rebond attendu",
  notes: "Trade basé sur l'analyse technique",
  tags: JSON.stringify(["support", "rebond", "technique"]),
  journalId: journalId,
  tradeDate: new Date(),
  entryTime: new Date()
});
```

### Récupération des statistiques

```typescript
// Obtenir les statistiques
const stats = await api.trading.getStats.query({
  journalId: journalId,
  startDate: new Date("2024-01-01"),
  endDate: new Date()
});
```

### Filtrage des trades

```typescript
// Filtrer les trades
const trades = await api.trading.getTrades.query({
  journalId: journalId,
  symbol: "XAUUSD",
  isClosed: true,
  startDate: new Date("2024-01-01"),
  limit: 50,
  offset: 0
});
```

## Interface utilisateur

### Page principale (`/trading`)
- Vue d'ensemble des performances
- Statistiques en temps réel
- Trades récents
- Sélection de journal

### Modal de création de trade
- Formulaire complet
- Sélection d'assets, sessions, setups
- Système de tags
- Validation en temps réel

### Composants réutilisables
- `TradingStats` : Affichage des statistiques
- `CreateTradeModal` : Création de trades
- Filtres et recherche

## Scripts utilitaires

### Import de données
```bash
npm run import-trading-data <userId>
```
Importe les données CSV du système existant.

### Test du système
```bash
npm run test-trading
```
Teste toutes les fonctionnalités du système.

## Structure des données

### Format des tags
```json
["support", "rebond", "technique", "gagnant"]
```

### Calculs automatiques
- **P&L** : `(exitPrice - entryPrice) * quantity * side_multiplier`
- **Pourcentage** : `(P&L / (entryPrice * quantity)) * 100`
- **Taux de réussite** : `(trades_gagnants / trades_fermés) * 100`

## Sécurité et performance

### Sécurité
- Isolation par utilisateur
- Validation des données
- Protection contre l'injection SQL

### Performance
- Index optimisés
- Requêtes paginées
- Cache intelligent
- Optimisations de base de données

## Évolutions futures

### Fonctionnalités prévues
- [ ] Graphiques et visualisations
- [ ] Export de données (PDF, Excel)
- [ ] Alertes et notifications
- [ ] Intégration API de prix
- [ ] Backtesting de stratégies
- [ ] Analyse de corrélation
- [ ] Gestion du risque avancée

### Améliorations techniques
- [ ] Cache Redis pour les statistiques
- [ ] WebSockets pour les mises à jour temps réel
- [ ] API REST publique
- [ ] Intégration avec des brokers
- [ ] Système de plugins

## Support

Pour toute question ou problème avec le système de trading, consultez :
- La documentation technique
- Les logs d'erreur
- L'équipe de développement

---

*Système développé pour Altiora - Journal de trading avancé* 