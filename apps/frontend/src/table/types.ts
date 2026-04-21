export interface Flags {
  nsfw: boolean;
  religious: boolean;
  political: boolean;
  racist: boolean;
  sexist: boolean;
  explicit: boolean;
}

export interface Joke {
  id: number;
  category: string;
  setup: string;
  delivery: string;
  flags: Flags;
}
