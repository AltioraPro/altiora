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
                <div className="pb-8 md:ml-[70px]">
                    <Header />
                    <div className="mx-auto px-6 py-8">{children}</div>
                </div>
            </div>
        </ModalProvider>
    );
}
