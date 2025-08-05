-- Optimisation des performances pour les goals
-- Ajout d'index pour les requêtes fréquentes

-- Index pour les goals par utilisateur et type
CREATE INDEX IF NOT EXISTS idx_goals_user_type ON goals(user_id, type);

-- Index pour les goals par utilisateur et statut
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, is_completed);

-- Index pour les goals par utilisateur et date de création
CREATE INDEX IF NOT EXISTS idx_goals_user_created ON goals(user_id, created_at);

-- Index pour les goals par utilisateur et deadline
CREATE INDEX IF NOT EXISTS idx_goals_user_deadline ON goals(user_id, deadline);

-- Index pour les habits par utilisateur et statut actif
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active);

-- Index pour les trades par utilisateur et date de création
CREATE INDEX IF NOT EXISTS idx_trades_user_created ON trades(user_id, created_at);

-- Index pour les utilisateurs par plan d'abonnement
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_plan);

-- Index pour l'utilisation mensuelle par utilisateur et mois
CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_usage(user_id, month);

-- Optimisation des statistiques avec des vues matérialisées (optionnel)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_goal_stats AS
-- SELECT 
--   user_id,
--   type,
--   COUNT(*) as count,
--   COUNT(*) FILTER (WHERE is_completed = true) as completed_count
-- FROM goals 
-- GROUP BY user_id, type;

-- CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_goal_stats ON mv_user_goal_stats(user_id, type); 