import { ApprovalsClient } from "./approvals.js";
import { HttpClient } from "./http.js";
import type { AaClientConfig } from "./types.js";

export class AaClient {
  readonly approvals: ApprovalsClient;

  private readonly http: HttpClient;

  constructor(config: AaClientConfig) {
    this.http = new HttpClient({
      baseUrl: config.baseUrl,
      token: config.token ?? readAaTokenFromEnv(),
      fetchImpl: config.fetch,
    });
    this.approvals = new ApprovalsClient(this.http);
  }

  setToken(token: string | undefined): void {
    this.http.setToken(token);
  }
}

export function createAaClient(config: AaClientConfig): AaClient {
  return new AaClient(config);
}

/**
 * Reads the `AA_TOKEN` environment variable, used as the default bearer token
 * for this project when no token is passed explicitly. Returns `undefined` in
 * environments without `process.env` (e.g. browsers).
 */
function readAaTokenFromEnv(): string | undefined {
  return typeof process !== "undefined" ? process.env?.AA_TOKEN : undefined;
}
