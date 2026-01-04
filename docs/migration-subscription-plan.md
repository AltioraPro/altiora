# Plan de Migration : Autumn vers Better-Auth Stripe Plugin

## Objectif
Migrer de Autumn (wrapper Stripe) vers le plugin officiel `@better-auth/stripe` avec :
- 14 jours d'essai gratuit pour tous les utilisateurs
- Indicateur de jours restants dans le header
- Modal bloquante quand le trial expire (redirection vers Stripe Checkout)

---

## Avantages du Plugin Better-Auth Stripe

Le plugin gere automatiquement :
- Creation du customer Stripe a l'inscription
- Table `subscription` dans la DB (avec trialStart, trialEnd, status, etc.)
- Webhooks Stripe (checkout.session.completed, customer.subscription.updated/deleted)
- Free trial integre dans la config du plan
- Endpoints client pour checkout, portal, subscriptions

---

## Phase 1 : Installation et Configuration

### 1.1 Installer le package
```bash
bun add @better-auth/stripe stripe
bun remove autumn-js
```

### 1.2 Variables d'environnement
**Modifier :** `env.ts`
- Ajouter : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- Supprimer : `AUTUMN_SECRET_KEY`

**Modifier :** `.env`
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

---

## Phase 2 : Configuration Backend

### 2.1 Configurer le plugin Stripe
**Modifier :** `lib/auth.ts`

```typescript
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY);

export const auth = betterAuth({
    // ... existing config
    plugins: [
        // Remplacer autumn() par:
        stripe({
            stripeClient,
            stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
            createCustomerOnSignUp: true,
            subscription: {
                enabled: true,
                plans: [
                    {
                        name: "pro",
                        priceId: env.STRIPE_PRICE_ID,
                        freeTrial: {
                            days: 14,
                            onTrialExpired: async (subscription) => {
                                // Optionnel: envoyer email
                            }
                        }
                    }
                ]
            }
        }),
        // ... autres plugins
    ]
});
```

### 2.2 Generer la migration DB
```bash
bun generate:auth 
bun db:generate && bun db:push
```

Le plugin cree automatiquement la table `subscription` avec :
- id, referenceId (userId)
- plan, status (active, trialing, canceled, etc.)
- trialStart, trialEnd
- periodStart, periodEnd
- stripeCustomerId, stripeSubscriptionId

---

## Phase 3 : Configuration Client

### 3.1 Configurer le client Stripe
**Modifier :** `lib/auth-client.ts`

```typescript
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
    plugins: [
        stripeClient({
            subscription: true
        }),
        // ... autres plugins
    ]
});
```

### 3.2 Supprimer AutumnProvider
**Modifier :** `app/providers.tsx`
- Supprimer import `AutumnProvider` de `autumn-js/react`
- Supprimer le wrapper `<AutumnProvider>` (plus necessaire)

---

## Phase 4 : Hook Subscription

### 4.1 Creer le hook
**Fichier a creer :** `hooks/use-subscription.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { differenceInDays, isPast } from "date-fns";

export function useSubscription() {
    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            const result = await authClient.stripe.listSubscriptions();
            return result.data?.subscriptions ?? [];
        },
        staleTime: 1000 * 60 * 5,
    });

    const activeSubscription = subscriptions?.find(
        (sub) => sub.status === "active" || sub.status === "trialing"
    );

    const isTrial = activeSubscription?.status === "trialing";
    const trialEndsAt = activeSubscription?.trialEnd
        ? new Date(activeSubscription.trialEnd)
        : null;

    const trialDaysRemaining = trialEndsAt && isTrial
        ? Math.max(0, differenceInDays(trialEndsAt, new Date()))
        : null;

    const hasAccess = activeSubscription?.status === "active"
        || (isTrial && trialEndsAt && !isPast(trialEndsAt));

    return {
        subscription: activeSubscription,
        subscriptions,
        isLoading,
        hasAccess,
        isTrial,
        trialDaysRemaining,
        trialEndsAt,
        status: activeSubscription?.status ?? "expired",
    };
}
```

---

## Phase 5 : Composants UI

### 5.1 Indicateur trial (header)
**Fichier a creer :** `components/subscription/trial-indicator.tsx`

```typescript
"use client";

import { RiTimeLine } from "@remixicon/react";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";

export function TrialIndicator() {
    const { isTrial, trialDaysRemaining, isLoading } = useSubscription();

    if (isLoading || !isTrial || trialDaysRemaining === null) {
        return null;
    }

    const isUrgent = trialDaysRemaining <= 3;

    return (
        <div className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            isUrgent ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
        )}>
            <RiTimeLine className="size-3.5" />
            <span>
                {trialDaysRemaining === 0
                    ? "Trial ends today"
                    : `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} left`}
            </span>
        </div>
    );
}
```

### 5.2 Modal de paiement bloquante
**Fichier a creer :** `components/subscription/payment-modal.tsx`

```typescript
"use client";

import { useState } from "react";
import { RiVipCrownLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useSubscription } from "@/hooks/use-subscription";
import { getBaseUrl } from "@/lib/auth";

export function PaymentModal() {
    const { hasAccess, isLoading } = useSubscription();
    const [isPending, setIsPending] = useState(false);

    const isOpen = !isLoading && !hasAccess;

    const handleSubscribe = async () => {
        setIsPending(true);
        try {
            const baseUrl = getBaseUrl();
            const result = await authClient.stripe.createCheckoutSession({
                successUrl: `${baseUrl}/profile?subscription=success`,
                cancelUrl: `${baseUrl}/profile?subscription=canceled`,
            });
            if (result.data?.url) {
                window.location.href = result.data.url;
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-500/10">
                        <RiVipCrownLine className="size-8 text-amber-400" />
                    </div>
                    <DialogTitle className="text-center text-xl">
                        Your trial has ended
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Subscribe now to continue using Altiora.
                    </DialogDescription>
                </DialogHeader>

                <Button className="w-full mt-6" disabled={isPending} onClick={handleSubscribe}>
                    {isPending ? "Redirecting..." : "Subscribe Now"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
```

### 5.3 Provider subscription
**Fichier a creer :** `providers/subscription-provider.tsx`

```typescript
"use client";

import type { ReactNode } from "react";
import { PaymentModal } from "@/components/subscription/payment-modal";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <PaymentModal />
        </>
    );
}
```

---

## Phase 6 : Integration

### 6.1 Header
**Modifier :** `app/(app)/_components/header.tsx`
- Ajouter `<TrialIndicator />` avant `<DropdownUser />`

### 6.2 Layout App
**Modifier :** `app/(app)/layout.tsx`
- Wrapper avec `<SubscriptionProvider>`

### 6.3 Activity Stats
**Modifier :** `app/(app)/profile/_components/activity-stats.tsx`
- Remplacer `useCustomer()` par `useSubscription()`
- Afficher le status du plan

---

## Phase 7 : Webhook Stripe Dashboard

Configurer dans Stripe Dashboard → Developers → Webhooks :
- URL: `https://altiora.pro/api/auth/stripe/webhook`
- Events a selectionner :
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

---

## Phase 8 : Migration Utilisateurs Existants

**Fichier a creer :** `scripts/migrate-to-trial.ts`

```typescript
// Pour chaque utilisateur sans subscription:
// 1. Creer un customer Stripe
// 2. Creer une subscription en trial de 14 jours
```

Ou alternative : laisser les utilisateurs s'auto-migrer au premier acces (le plugin cree le customer automatiquement).

---

## Ordre d'Implementation

1. **Packages** : `bun add @better-auth/stripe stripe && bun remove autumn-js`
2. **Env** : Ajouter variables Stripe, supprimer AUTUMN_SECRET_KEY
3. **Backend** : Configurer plugin dans `lib/auth.ts`
4. **DB** : `bun db:generate && bun db:push`
5. **Client** : Configurer `stripeClient()` dans `lib/auth-client.ts`
6. **Providers** : Supprimer AutumnProvider
7. **Hook** : Creer `use-subscription.ts`
8. **UI** : TrialIndicator, PaymentModal, SubscriptionProvider
9. **Integration** : Header, Layout, Activity Stats
10. **Stripe Dashboard** : Configurer webhook
11. **Migration** : Script pour utilisateurs existants (optionnel)

---

## Fichiers a Modifier/Creer

| Action | Fichier |
|--------|---------|
| Modifier | `lib/auth.ts` - Remplacer autumn() par stripe() |
| Modifier | `lib/auth-client.ts` - Ajouter stripeClient() |
| Modifier | `app/providers.tsx` - Supprimer AutumnProvider |
| Modifier | `app/(app)/_components/header.tsx` - Ajouter TrialIndicator |
| Modifier | `app/(app)/layout.tsx` - Ajouter SubscriptionProvider |
| Modifier | `app/(app)/profile/_components/activity-stats.tsx` - useSubscription |
| Modifier | `env.ts` - Variables Stripe |
| Creer | `hooks/use-subscription.ts` |
| Creer | `components/subscription/trial-indicator.tsx` |
| Creer | `components/subscription/payment-modal.tsx` |
| Creer | `providers/subscription-provider.tsx` |
| Optionnel | `scripts/migrate-to-trial.ts` |
