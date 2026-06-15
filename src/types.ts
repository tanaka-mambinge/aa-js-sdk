export type RiskLevel = "low" | "high" | "critical";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "timed_out";

export type DecisionStatus = "approved" | "rejected" | "cancelled";

export interface AaClientConfig {
  /** API v1 URL, e.g. http://127.0.0.1:8087/api/v1 */
  baseUrl: string;
  /** Bearer token for the agent. Defaults to the `AA_TOKEN` environment variable. */
  token?: string;
  /** Custom fetch implementation for tests or non-standard runtimes. */
  fetch?: typeof fetch;
}

export interface ApprovalDecision {
  status: DecisionStatus;
  resolved_at: string;
}

export interface Approval {
  id: string;
  workspace_id: string;
  requester_id: string;
  action: string;
  risk: RiskLevel;
  status: ApprovalStatus;
  title: string;
  summary: string;
  extra: Record<string, unknown>;
  decision: ApprovalDecision | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApprovalInput {
  action: string;
  risk: RiskLevel;
  title: string;
  summary: string;
  extra?: Record<string, unknown>;
  expires_in_seconds?: number | null;
}

export interface ApprovalListResponse {
  approvals: Approval[];
}
