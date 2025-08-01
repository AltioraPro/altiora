-- Script d'initialisation des plans d'abonnement
-- À exécuter directement dans la base de données

-- Supprimer les plans existants
DELETE FROM subscription_plan;

-- Insérer les nouveaux plans
INSERT INTO subscription_plan (
  id, name, display_name, description, price, currency, billing_interval, 
  stripe_price_id, is_active, max_habits, max_trading_entries, max_annual_goals, 
  max_quarterly_goals, max_monthly_goals, has_discord_integration, has_priority_support, 
  has_early_access, has_monthly_challenges, has_premium_discord, created_at, updated_at
) VALUES 
-- Free Plan
(
  'clx_free_plan_001',
  'FREE',
  'Free Plan',
  'Plan gratuit avec fonctionnalités de base',
  0,
  'EUR',
  'monthly',
  NULL,
  true,
  3,
  10,
  1,
  1,
  0,
  false,
  false,
  false,
  false,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Pro Plan
(
  'clx_pro_plan_002',
  'PRO',
  'Pro Plan',
  'Plan professionnel avec fonctionnalités avancées',
  2900,
  'EUR',
  'monthly',
  NULL,
  true,
  999,
  999,
  5,
  999,
  0,
  true,
  true,
  false,
  false,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
-- Altiorans Plan
(
  'clx_altiorans_plan_003',
  'ALTIORANS',
  'Altiorans',
  'Plan premium avec accès exclusif',
  4900,
  'EUR',
  'monthly',
  NULL,
  true,
  999,
  999,
  999,
  999,
  999,
  true,
  true,
  true,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Afficher les plans créés
SELECT 
  name,
  display_name,
  price / 100 as price_eur,
  max_habits,
  max_trading_entries,
  max_annual_goals,
  max_quarterly_goals,
  max_monthly_goals,
  has_discord_integration,
  has_priority_support,
  has_early_access,
  has_monthly_challenges,
  has_premium_discord
FROM subscription_plan
ORDER BY price;