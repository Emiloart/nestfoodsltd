declare module "pg" {
  export type QueryResult<T = unknown> = {
    rows: T[];
  };

  export class Pool {
    constructor(config?: { connectionString?: string });
    query<T = unknown>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
