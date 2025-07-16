export default function SetupPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Configuration Altiora</h1>
        
        <div className="space-y-6">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">✅ Migration réussie !</h2>
            <p className="mb-4">
              Altiora utilise maintenant <strong>Better Auth</strong> et <strong>Neon PostgreSQL</strong> - 
              une solution moderne et simplifiée !
            </p>
            <ul className="space-y-2 text-sm">
              <li className="text-green-300">✓ Clerk supprimé (plus d'erreurs 422)</li>
              <li className="text-green-300">✓ Better Auth configuré</li>
              <li className="text-green-300">✓ Schéma de base de données mis à jour</li>
              <li className="text-green-300">✓ Pages d'authentification adaptées</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">🗄️ Configuration Neon (5 minutes)</h2>
            
            <ol className="space-y-4 list-decimal list-inside">
              <li>
                <strong>Créez un compte Neon :</strong>
                <br />
                <a 
                  href="https://neon.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Aller sur neon.tech
                </a>
              </li>
              
              <li>
                <strong>Créez un nouveau projet :</strong>
                <ul className="ml-4 mt-2 space-y-1 list-disc list-inside">
                  <li>Nom : "Altiora"</li>
                  <li>Région : Europe (ou proche de vous)</li>
                  <li>Version PostgreSQL : 16 (recommandée)</li>
                </ul>
              </li>
              
              <li>
                <strong>Copiez l'URL de connexion :</strong>
                <br />
                Dans votre dashboard Neon, copiez la <code className="bg-gray-800 px-2 py-1 rounded">Connection string</code>
              </li>
              
              <li>
                <strong>Mettez à jour le fichier .env :</strong>
                <pre className="bg-gray-800 p-4 rounded mt-2 overflow-x-auto">
{`DATABASE_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require"`}
                </pre>
              </li>
              
              <li>
                <strong>Lancez les migrations :</strong>
                <pre className="bg-gray-800 p-4 rounded mt-2">
{`npm run db:migrate`}
                </pre>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">🔐 Better Auth</h2>
            <p className="mb-4">
              L'authentification est maintenant gérée par Better Auth :
            </p>
            <ul className="space-y-2 text-sm">
              <li className="text-yellow-300">• Plus simple que Clerk</li>
              <li className="text-yellow-300">• Pas de configuration externe</li>
              <li className="text-yellow-300">• Entièrement sous votre contrôle</li>
              <li className="text-yellow-300">• Compatible avec votre base Neon</li>
            </ul>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">🚀 Étapes suivantes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded border">
                <h3 className="font-semibold text-green-400 mb-2">✅ Prêt maintenant</h3>
                <ul className="text-sm space-y-1">
                  <li>• Démonstration complète</li>
                  <li>• Interface utilisateur</li>
                  <li>• Design noir/blanc</li>
                </ul>
                <a 
                  href="/demo" 
                  className="inline-block mt-3 px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Voir la démo →
                </a>
              </div>
              
              <div className="bg-black/30 p-4 rounded border">
                <h3 className="font-semibold text-blue-400 mb-2">🗄️ Avec base de données</h3>
                <ul className="text-sm space-y-1">
                  <li>• Sauvegarde des données</li>
                  <li>• Authentification complète</li>
                  <li>• Toutes les fonctionnalités</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">
                  Configurez Neon d'abord
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/20 border border-gray-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-400">📊 Avantages de cette migration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-red-400">❌ Avant (Clerk)</h3>
                <ul className="text-sm space-y-1 text-red-300">
                  <li>• Erreurs 422 constantes</li>
                  <li>• Configuration complexe</li>
                  <li>• Dépendance externe</li>
                  <li>• Clés API à gérer</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-green-400">✅ Maintenant (Better Auth + Neon)</h3>
                <ul className="text-sm space-y-1 text-green-300">
                  <li>• Aucune erreur d'API</li>
                  <li>• Configuration simple</li>
                  <li>• Contrôle total</li>
                  <li>• Base de données moderne</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-x-4">
          <a 
            href="/demo" 
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🎯 Voir la démonstration
          </a>
          <a 
            href="/" 
            className="inline-block px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
} 