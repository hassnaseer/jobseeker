export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function initialAsyncState<T>(data: T): AsyncState<T> {
  return { data, loading: false, error: null };
}
