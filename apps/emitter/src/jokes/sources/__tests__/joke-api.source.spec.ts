import { describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { JokeApiSource } from '../joke-api.source';

const rawJoke = {
  id: 42,
  category: 'Programming',
  setup: 'Why do programmers prefer dark mode?',
  delivery: 'Because light attracts bugs.',
  flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false },
};

describe('JokeApiSource', () => {
  it('has id "joke-api"', () => {
    const source = new JokeApiSource({ get: vi.fn() } as never);
    expect(source.id).toBe('joke-api');
  });

  it('has name "JokeAPI.dev"', () => {
    const source = new JokeApiSource({ get: vi.fn() } as never);
    expect(source.name).toBe('JokeAPI.dev');
  });

  it('fetch() calls HttpService.get with correct jokeapi.dev URL', () => {
    const http = { get: vi.fn(() => of({ data: rawJoke })) };
    const source = new JokeApiSource(http as never);

    source.fetch().subscribe();

    expect(http.get).toHaveBeenCalledWith('https://v2.jokeapi.dev/joke/Any?type=twopart');
  });

  it('transforms raw response to NormalizedJoke with source field', () => {
    const http = { get: vi.fn(() => of({ data: rawJoke })) };
    const source = new JokeApiSource(http as never);
    const result: unknown[] = [];

    source.fetch().subscribe((j) => result.push(j));

    expect(result[0]).toEqual({
      id: 42,
      source: 'joke-api',
      category: 'Programming',
      setup: 'Why do programmers prefer dark mode?',
      delivery: 'Because light attracts bugs.',
      flags: rawJoke.flags,
    });
  });

  it('preserves all flag fields from the raw response', () => {
    const http = { get: vi.fn(() => of({ data: rawJoke })) };
    const source = new JokeApiSource(http as never);
    let normalized: { flags: unknown } | undefined;

    source.fetch().subscribe((j) => (normalized = j));

    expect(normalized?.flags).toEqual(rawJoke.flags);
  });
});
