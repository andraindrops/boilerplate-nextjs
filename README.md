## Architecture

- `_SPEC.md`

## Getting Started

- `git clone https://github.com/[org]/[product].git`
- `cp .env.example      .env`
- `cp .env.test.example .env.test`
- Write `.env`
- Write `.env.test`
- `pnpm install`
- `docker compose up -d`
- `pnpm prisma migrate dev`
- `pnpm dev`

### to stg or prd

- *
- Set `BASIC_AUTH_USER` and `BASIC_AUTH_PASS`

### to GitHub Actions

- *
- Set `VERCEL_DEPLOY_HOOK_URL` from Vercel > Settings > Git > Deploy Hooks
  ```
  - name:   main
  - branch: main
  ```

## Linting

```bash
pnpm run lint
```

## Testing

```bash
pnpm run test
```

## Testing - E2E

```bash
pnpm run e2e-test
```
