import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/env";
import stripeClient from "@/lib/stripe";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripeClient.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (userId) {
                    console.info(`Subscription created for user ${userId}`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    console.info(`Subscription updated for user ${userId}`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    console.info(`Subscription canceled for user ${userId}`);
                }
                break;
            }

            default:
                console.info(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}
