// shared/api/types.ts
export interface ApiError extends Error {
  response?: {
    status: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
  };
}
