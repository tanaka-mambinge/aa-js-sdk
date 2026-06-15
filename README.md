# AA Node SDK

Use this SDK for inline approval waits.

## Flow

1. Call `client.approvals.create(...)`.
2. Poll `client.approvals.get(id)` until `status === "approved"`.
3. If `status` is `rejected`, `cancelled`, or `timed_out`, stop and return error.
4. If approved, run real work inside same async fn.

## Example

```ts
import { createAaClient } from "@iamt12e/aa";

const client = createAaClient({
  baseUrl: "http://127.0.0.1:8087/api/v1",
});

async function waitForApproval(id: string, timeoutMs = 300_000) {
  const start = Date.now();

  while (true) {
    const approval = await client.approvals.get(id);

    if (
      approval.status === "approved" ||
      approval.status === "rejected" ||
      approval.status === "cancelled" ||
      approval.status === "timed_out"
    ) {
      return approval;
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Approval timeout");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function doSomething() {
  const request = await client.approvals.create({
    action: "task.complete",
    risk: "high",
    title: "Complete task",
    summary: "Needs human approval before final action",
    extra: { taskId: "task_123" },
  });

  const approval = await waitForApproval(request.id);

  if (approval.status !== "approved") {
    throw new Error(`approval ${approval.status}`);
  }

  return runActualCode();
}
```

## Notes

- No resume token.
- No extra approval credential.
- Approval is source of truth.
- Keep action idempotent.
