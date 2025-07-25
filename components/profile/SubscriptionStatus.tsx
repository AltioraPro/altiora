"use client";

import Link from "next/link";

interface SubscriptionStatusProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export function SubscriptionStatus({ user }: SubscriptionStatusProps) {
  // Pour l'instant, tous les utilisateurs sont gratuits
  const isPro = false;
  const isExpired = false;

  return (
    <div className="space-y-6">
      {/* Statut actuel */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Statut</span>
          <span className={`font-medium ${isPro ? "text-green-400" : "text-white/60"}`}>
            {isPro ? "Pro" : "Gratuit"}
          </span>
        </div>
      </div>

      {/* Badge de statut */}
      <div className="flex items-center space-x-3">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPro 
            ? "bg-green-400/20 text-green-400 border border-green-400/30" 
            : "bg-white/10 text-white/60 border border-white/20"
        }`}>
          {isPro ? "Plan Pro" : "Plan Gratuit"}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!isPro ? (
          <Link
            href="/pricing"
            className="block w-full px-4 py-3 bg-white text-black font-medium rounded-md text-center hover:bg-white/90 transition-colors"
          >
            Passer au plan Pro
          </Link>
        ) : (
          <div className="space-y-3">
            <Link
              href="/billing"
              className="block w-full px-4 py-3 bg-white/10 text-white font-medium rounded-md text-center hover:bg-white/20 transition-colors"
            >
              Gérer l'abonnement
            </Link>
          </div>
        )}
      </div>

      {/* Fonctionnalités */}
      <div className="space-y-3">
        <h4 className="font-medium">Fonctionnalités incluses :</h4>
        <ul className="space-y-2 text-sm text-white/80">
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            <span>Suivi illimité d'habitudes</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            <span>Journal de trading avancé</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            <span>Analyses détaillées</span>
          </li>
          {isPro && (
            <>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-green-400">Intégration Discord</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-green-400">Export de données</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-green-400">Support prioritaire</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
} 