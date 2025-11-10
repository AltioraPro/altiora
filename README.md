# Altiora

![Altiora](./public/img/logo.png)

<p align="center">
  <a href="https://discord.gg/4mU5pEw8Gs"><img src="https://img.shields.io/badge/Join%20the%20community-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://x.com/AltioraPro"><img src="https://img.shields.io/twitter/follow/Altiora?style=social" alt="Follow Altiora"></a>
</p>

[Altiora](https://altiora.pro) is a self-coaching platform for traders and makers that merges productivity tooling, trading journals, and behavioral coaching.

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/AltioraPro/altiora
```

2. Enter the project directory

```bash
cd altiora
```

3. Prepare environment variables

```bash
copy .env.example .env
```

4. Install dependencies

```bash
bun install
```

5. Push the database schema (Drizzle + PostgreSQL)

```bash
bun db:push
```

6. Start the development server

```bash
bun dev
```

The app serves on `http://localhost:3000`.

## Quality and Contributions

- Formatting and linting: `bun checks`
- Drizzle migrations: `bun db:migrate`
- Database studio: `bun db:studio`

## License

The license definition is in progress.
