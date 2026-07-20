# Matkewaali Ceramics

Website for [matkewaali.com](https://matkewaali.com) — a handmade ceramics shop by Meghna Polimera.

## Structure

```
matkewaali/
├── frontend/          # React 18 + TypeScript (Vite)
├── backend/           # AWS Lambda function (TypeScript)
└── infrastructure/
    └── backend/       # AWS SAM templates
```

## Local Development

```sh
cd frontend
npm install
npm run dev
```

## Deployment

See [CLAUDE.md](./CLAUDE.md) for the full developer guide including environment setup, AWS prerequisites, and deploy commands.
