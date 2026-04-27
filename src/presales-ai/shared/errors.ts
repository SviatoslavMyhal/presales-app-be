export class DealNotFoundError extends Error {
  constructor(id: string) {
    super(`Deal not found: ${id}`);
    this.name = "DealNotFoundError";
  }
}

export class PipelineError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PipelineError";
  }
}
