import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

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
        <>
            <Header />
            {children}
        </>
    );
}
