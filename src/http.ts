import { AaApiError } from "./errors.js";

export interface HttpClientOptions {
  baseUrl: string;
  token?: string;
  fetchImpl?: typeof fetch;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private token?: string;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.token = options.token;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  setToken(token: string | undefined): void {
    this.token = token;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);

    if (!headers.has("content-type") && init.body !== undefined) {
      headers.set("content-type", "application/json");
    }

    if (this.token) {
      headers.set("authorization", `Bearer ${this.token}`);
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const detail = await readResponseBody(response);
      const message = getErrorMessage(detail, response.statusText);
      throw new AaApiError(message, response.status, detail);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "object" && detail !== null && "detail" in detail) {
    const value = (detail as { detail: unknown }).detail;
    if (typeof value === "string") {
      return value;
    }
  }

  if (typeof detail === "string") {
    return detail;
  }

  return fallback || "AA API request failed";
}
