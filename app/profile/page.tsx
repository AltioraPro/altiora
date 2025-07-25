import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SubscriptionStatus } from "@/components/profile/SubscriptionStatus";

export default async function ProfilePage() {
  try {
    const user = await api.auth.getCurrentUser();

    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Profil</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informations du compte */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4">Informations du compte</h2>
                  <ProfileForm user={user} />
                </div>
              </div>

              {/* Statut d'abonnement */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4">Abonnement</h2>
                  <SubscriptionStatus user={user} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Si l'utilisateur n'est pas connecté, rediriger vers login
    redirect("/auth/login");
  }
} 