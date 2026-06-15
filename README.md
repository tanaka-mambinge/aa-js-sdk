# AA Node SDK

TypeScript SDK for agents to create and track Agent Approvals requests.

## Usage

```ts
import { createAaClient } from "@iamt12e/aa";

const client = createAaClient({
  baseUrl: "http://127.0.0.1:8087/api/v1",
});

const approval = await client.approvals.create({
  action: "domain.root.delete",
  risk: "critical",
  title: "Delete root domain",
  summary: "Delete example.com",
  extra: { domain: "example.com" },
});

// Poll for a decision
const current = await client.approvals.get(approval.id);

// Cancel a request the agent no longer needs
await client.approvals.cancel(approval.id);
```

`baseUrl` is the single API v1 URL. There is no separate approvals URL.

## Authentication

Create a project token in the dashboard (Project tokens → New token) and set it as
`AA_TOKEN` in that project's environment (e.g. `.env`). `createAaClient` reads
`process.env.AA_TOKEN` automatically when `token` isn't passed explicitly, so each
project's token is picked up without extra config — and approvals created with it
can be filtered by project in the dashboard.

To override the env var (e.g. for tests or multi-tenant setups), pass `token` explicitly:

```ts
const client = createAaClient({
  baseUrl: "http://127.0.0.1:8087/api/v1",
  token: "aa_xxx", // overrides AA_TOKEN
});
```

## Scripts

```bash
npm run typecheck
npm run test
npm run build
```
