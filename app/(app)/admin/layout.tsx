import { redirect } from "next/navigation";
import { PAGES } from "@/constants/pages";
import { USER_ROLES } from "@/constants/roles";
import { getServerSession } from "@/lib/auth/utils";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();

    if (!session?.user) {
        redirect(PAGES.SIGN_IN);
    }

    if (session.user.role !== USER_ROLES.ADMIN) {
        redirect(PAGES.DASHBOARD);
    }

    return <div>{children}</div>;
}
