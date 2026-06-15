import { describe, expect, it, vi } from "vitest";

import { AaApiError, createAaClient } from "../src/index.js";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("createAaClient", () => {
  it("creates approvals using the single baseUrl", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        id: "apr_1",
        workspace_id: "ws_1",
        requester_id: "user_1",
        action: "domain.root.delete",
        risk: "critical",
        status: "pending",
        title: "Delete root domain",
        summary: "Delete example.com",
        extra: { domain: "example.com" },
        decision: null,
        expires_at: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      }),
    );

    const client = createAaClient({
      baseUrl: "http://127.0.0.1:8087/api/v1/",
      token: "cli-token",
      fetch: fetchMock,
    });

    const approval = await client.approvals.create({
      action: "domain.root.delete",
      risk: "critical",
      title: "Delete root domain",
      summary: "Delete example.com",
      extra: { domain: "example.com" },
    });

    expect(approval.id).toBe("apr_1");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8087/api/v1/approvals",
      expect.objectContaining({ method: "POST" }),
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer cli-token");
    expect(JSON.parse(init.body as string)).toEqual({
      action: "domain.root.delete",
      risk: "critical",
      title: "Delete root domain",
      summary: "Delete example.com",
      extra: { domain: "example.com" },
    });
  });

  it("cancels an approval", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        id: "apr_1",
        workspace_id: "ws_1",
        requester_id: "user_1",
        action: "domain.root.delete",
        risk: "critical",
        status: "cancelled",
        title: "Delete root domain",
        summary: "Delete example.com",
        extra: {},
        decision: { status: "cancelled", resolved_at: "2026-01-01T00:00:00Z" },
        expires_at: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      }),
    );

    const client = createAaClient({
      baseUrl: "http://127.0.0.1:8087/api/v1",
      token: "cli-token",
      fetch: fetchMock,
    });

    const approval = await client.approvals.cancel("apr_1");

    expect(approval.status).toBe("cancelled");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8087/api/v1/approvals/apr_1/cancel",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("lets callers update the bearer token", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ approvals: [] }));
    const client = createAaClient({
      baseUrl: "http://127.0.0.1:8087/api/v1",
      fetch: fetchMock,
    });

    client.setToken("new-token");
    await client.approvals.list();

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer new-token");
  });

  it("throws typed API errors", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({ detail: "Invalid CLI token" }, { status: 401, statusText: "Unauthorized" }),
    );
    const client = createAaClient({
      baseUrl: "http://127.0.0.1:8087/api/v1",
      fetch: fetchMock,
    });

    await expect(client.approvals.get("apr_1")).rejects.toMatchObject({
      name: "AaApiError",
      status: 401,
      message: "Invalid CLI token",
    } satisfies Partial<AaApiError>);
  });
});
