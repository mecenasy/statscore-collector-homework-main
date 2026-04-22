export interface NormalizedJoke {
  id: number;
  source: string;
  category: string;
  setup: string;
  delivery: string;
  flags: Record<string, boolean>;
}
