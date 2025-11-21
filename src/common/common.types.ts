export type FunctionFirstArgument<T> = T extends (...args: any[]) => any
  ? Parameters<T>[0]
  : never;

export interface PaginationControls {
  next: string | null;
  prev: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}
