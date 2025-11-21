"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PAGES } from "@/constants/pages";
import { auth } from "@/lib/auth";

export async function signOut() {
    await auth.api.signOut({
        headers: await headers(),
    });
    revalidatePath(PAGES.SIGN_IN);
    redirect(PAGES.SIGN_IN);
}
