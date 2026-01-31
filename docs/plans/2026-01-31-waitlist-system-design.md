# Waitlist System Design

## Overview

Système de waitlist pour Altiora permettant de collecter les emails des utilisateurs intéressés avant l'ouverture de la beta.

## Décisions de design

| Aspect | Choix |
|--------|-------|
| Redirection auth | Middleware global avec `WAITLIST_ENABLED` |
| Stockage | Double : DB (Drizzle) + Resend audience |
| Champs formulaire | Email + Prénom |
| Confirmation | Email envoyé après inscription |
| Admin | Table avec recherche, tri, suppression |
| Email lancement | Ton engageant avec features highlights |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE                           │
│  (WAITLIST_ENABLED=true → redirige /login, /register, etc.) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PAGE /waitlist                           │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │  Formulaire         │  │  Image décorative           │  │
│  │  - Prénom           │  │  (style pages auth)         │  │
│  │  - Email            │  │                             │  │
│  │  - Bouton submit    │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API /waitlist/join                       │
│  1. Valide les données (Zod)                               │
│  2. Vérifie si email existe déjà                           │
│  3. Insère en DB (table waitlist)                          │
│  4. Ajoute à l'audience Resend                             │
│  5. Envoie email de confirmation                           │
└─────────────────────────────────────────────────────────────┘
```

## Base de données

### Table `waitlist`

```typescript
// server/db/schema/waitlist/schema.ts
export const waitlist = pgTable("waitlist", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Intégration Resend

```typescript
const WAITLIST_AUDIENCE_ID = env.RESEND_WAITLIST_AUDIENCE_ID;

// À l'inscription
await resend.contacts.create({
  audienceId: WAITLIST_AUDIENCE_ID,
  email: data.email,
  firstName: data.firstName,
  unsubscribed: false,
});
```

### Gestion des erreurs

- Email existe déjà en DB → message "Tu es déjà inscrit !"
- Resend échoue → log l'erreur, garde l'inscription DB
- DB échoue → erreur retournée à l'utilisateur

## Page waitlist

Layout identique aux pages auth : formulaire à gauche, animation Dither à droite.

### Validation (Zod)

```typescript
const schema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
});
```

### Comportement

- Utilise les composants `FormInput` existants
- Bouton de submit avec état loading
- Message de succès affiché après inscription (pas de redirection)
- Gestion des erreurs inline

## Templates email

### Email de confirmation

```typescript
// emails/waitlist-confirmation.tsx
<EmailLayout>
  <Logomark />
  <EmailHeading>Bienvenue sur la waitlist !</EmailHeading>
  <EmailBody>
    Salut {firstName},

    Merci de ton intérêt pour Altiora ! Tu es maintenant sur la liste d'attente.

    On te préviendra dès que la beta sera ouverte.
  </EmailBody>
  <EmailFooter>
    À très bientôt,
    L'équipe Altiora
  </EmailFooter>
</EmailLayout>
```

### Email de lancement beta

```typescript
// emails/waitlist-beta-launch.tsx
<EmailLayout>
  <Logomark />
  <EmailHeading>La beta est ouverte ! 🎉</EmailHeading>
  <EmailBody>
    Salut {firstName},

    L'attente est terminée ! Tu peux maintenant créer ton compte sur Altiora.

    Ce qui t'attend :
    • Suivi de tes trades avec analytics détaillés
    • Journal de trading personnalisé
    • Objectifs et habitudes pour progresser

  </EmailBody>
  <EmailButton href="https://altiora.pro/register">
    Créer mon compte
  </EmailButton>
  <EmailFooter>
    À très bientôt,
    L'équipe Altiora
  </EmailFooter>
</EmailLayout>
```

## Table admin

### Structure des fichiers

```
/app/(app)/admin/waitlist/
├── page.tsx
└── _components/
    ├── waitlist-table.tsx
    ├── columns.tsx
    ├── filters.tsx
    ├── actions.tsx
    └── search-params.ts
```

### Colonnes

| Checkbox | Prénom | Email | Date d'inscription | Actions |
|----------|--------|-------|-------------------|---------|
| ☐ | Thomas | thomas@... | 31 jan 2026 | 🗑️ |

### Fonctionnalités

- Recherche par email ou prénom
- Tri par date d'inscription (plus récent par défaut)
- Pagination
- Sélection multiple + suppression en masse
- Compteur total d'inscrits

### API (ORPC)

```typescript
// server/routers/waitlist/router.ts
waitlist: {
  list: adminProcedure.input(listSchema).query(listWaitlist),
  delete: adminProcedure.input(deleteSchema).mutation(deleteWaitlist),
  deleteMany: adminProcedure.input(deleteManySchema).mutation(deleteManyWaitlist),
}
```

## Middleware

```typescript
// middleware.ts
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const isWaitlistEnabled = process.env.WAITLIST_ENABLED === "true";
  const pathname = request.nextUrl.pathname;

  if (isWaitlistEnabled && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/waitlist", request.url));
  }

  if (!isWaitlistEnabled && pathname === "/waitlist") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

## Variables d'environnement

```env
WAITLIST_ENABLED=true
RESEND_WAITLIST_AUDIENCE_ID=aud_xxxxx
```

## Workflow de lancement beta

1. Dashboard Resend → broadcast vers l'audience waitlist avec template `waitlist-beta-launch`
2. Modifier `.env` : `WAITLIST_ENABLED=false`
3. Redéployer l'application
4. Les nouveaux visiteurs accèdent directement aux pages d'auth
5. La page `/waitlist` redirige vers `/login`

## Fichiers à créer

- `middleware.ts` - Modification pour logique waitlist
- `app/(auth)/waitlist/page.tsx` - Page du formulaire
- `app/(auth)/waitlist/_components/waitlist-form.tsx` - Composant formulaire
- `server/db/schema/waitlist/schema.ts` - Schema Drizzle
- `server/db/schema/waitlist/index.ts` - Export
- `server/routers/waitlist/router.ts` - Router ORPC
- `server/routers/waitlist/mutations/join-waitlist.ts` - Mutation inscription
- `server/routers/waitlist/queries/list-waitlist.ts` - Query admin
- `server/routers/waitlist/mutations/delete-waitlist.ts` - Mutation suppression
- `emails/waitlist-confirmation.tsx` - Template confirmation
- `emails/waitlist-beta-launch.tsx` - Template lancement
- `app/(app)/admin/waitlist/page.tsx` - Page admin
- `app/(app)/admin/waitlist/_components/*` - Composants table admin
