import { HttpClient } from "./http.js";
import type { Approval, ApprovalListResponse, CreateApprovalInput } from "./types.js";

export class ApprovalsClient {
  constructor(private readonly http: HttpClient) {}

  create(input: CreateApprovalInput): Promise<Approval> {
    return this.http.request<Approval>("/approvals", {
      method: "POST",
      body: JSON.stringify({ extra: {}, ...input }),
    });
  }

  list(): Promise<ApprovalListResponse> {
    return this.http.request<ApprovalListResponse>("/approvals");
  }

  get(id: string): Promise<Approval> {
    return this.http.request<Approval>(`/approvals/${encodeURIComponent(id)}`);
  }

  cancel(id: string): Promise<Approval> {
    return this.http.request<Approval>(`/approvals/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
    });
  }
}
