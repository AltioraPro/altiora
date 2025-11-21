import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";
import { ModalProvider } from "@/providers/modal-provider";
import { Header } from "./_components/header";
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

    return (
        <ModalProvider>
            <div className="relative bg-background">
                <Sidebar />

                <div className="md:ml-[70px]">
                    {/* {isImpersonating && (
                        <ImpersonationBanner userName={session.user.name} />
                    )} */}
                    <Header />
                    <main className="mx-auto">{children}</main>
                </div>
            </div>
        </ModalProvider>
    );
}
