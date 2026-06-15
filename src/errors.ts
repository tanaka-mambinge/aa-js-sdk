export class AaApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "AaApiError";
    this.status = status;
    this.detail = detail;
  }
}
