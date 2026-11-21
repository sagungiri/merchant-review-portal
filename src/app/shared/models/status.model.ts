export type StatusTone = 'neutral' | 'info' | 'success' | 'danger';

export interface Status<T extends string = string> {
  value: T;
  label: string;
  tone: StatusTone;
  final?: boolean;
}

export function statusByValue<T extends string>(statuses: readonly Status<T>[], value: T): Status<T> {
  return statuses.find((status) => status.value === value) ?? { value, label: value, tone: 'neutral' };
}

export function isFinalStatus<T extends string>(statuses: readonly Status<T>[], value: T): boolean {
  return statusByValue(statuses, value).final === true;
}
