import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";
import { shouldShowUpgradeContent } from "@/lib/trial";
import { api } from "@/orpc/server";
import { ModalProvider } from "@/providers/modal-provider";
import { Header } from "./_components/header";
import { ImpersonationBanner } from "./_components/impersonation-banner";
import { Sidebar } from "./_components/sidebar";
import { UpgradeContent } from "./_components/upgrade-content";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session?.user) {
        redirect(PAGES.SIGN_IN);
    }

    const user = await api.auth.getCurrentUser();

    const activeSubscription = user.subscriptions?.find(
        (sub) => sub.status === "active" || sub.status === "trialing"
    );

    const hasActiveSubscription = !!activeSubscription;

    const shouldUpgradeContent = shouldShowUpgradeContent(
        activeSubscription?.trialEnd?.toISOString() ?? null,
        activeSubscription?.status ?? null,
        hasActiveSubscription
    );

    const isImpersonating = !!session.session.impersonatedBy;

    return (
        <ModalProvider>
            <div className="relative bg-background">
                <Sidebar />

                <div className="md:ml-[70px]">
                    {isImpersonating && (
                        <ImpersonationBanner userName={session.user.name} />
                    )}
                    <Header />
                    <main className="mx-auto">
                        {shouldUpgradeContent ? (
                            <UpgradeContent userName={session.user.name} />
                        ) : (
                            children
                        )}
                    </main>
                </div>
            </div>
        </ModalProvider>
    );
}
