import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { getServerSession } from "@/lib/auth/utils";

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (session?.user) {
        redirect(PAGES.DASHBOARD);
    }
    return <>{children}</>;
}
