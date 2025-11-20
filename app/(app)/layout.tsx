import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";
import { ModalProvider } from "@/providers/modal-provider";
import { Header } from "./_components/header";
import { ImpersonationBanner } from "./_components/impersonation-banner";
import { Sidebar } from "./_components/sidebar";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session?.user) {
        redirect(PAGES.SIGN_IN);
    }

    const isImpersonating = !!session.session.impersonatedBy;

    return (
        <ModalProvider>
            <div className="relative bg-background">
                <Sidebar />

                <div className="pb-8 md:ml-[70px]">
                    {isImpersonating && (
                        <ImpersonationBanner userName={session.user.name} />
                    )}
                    <Header />
                    <div className="mx-auto px-6 py-8">{children}</div>
                </div>
            </div>
        </ModalProvider>
    );
}
