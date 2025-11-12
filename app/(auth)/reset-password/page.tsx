import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";
import { PAGES } from "@/constants/pages";
import ResetPasswordForm from "./_components/reset-password-form";
import { searchParamsCache } from "./search-params";

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const { error, token } = await searchParamsCache.parse(searchParams);

    if (error) {
        redirect(
            `${PAGES.FORGOT_PASSWORD}?error=This link is invalid or expired`
        );
    }

    if (!token) {
        redirect(PAGES.SIGN_IN);
    }

    return <ResetPasswordForm />;
}
