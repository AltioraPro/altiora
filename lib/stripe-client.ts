import { loadStripe } from "@stripe/stripe-js";
import { env } from "@/env";

if (!env.STRIPE_PUBLIC_KEY) {
    throw new Error("STRIPE_PUBLIC_KEY is not defined");
}

export const stripePromise = loadStripe(env.STRIPE_PUBLIC_KEY);
