import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

vi.mock('../../composables/useJokeSocket');

import { useJokeSocket } from '../../composables/useJokeSocket';
import JokeList from '../JokeList.vue';

const mockJoke = {
  id: 1,
  source: 'joke-api',
  category: 'Programming',
  setup: 'Why do programmers prefer dark mode?',
  delivery: 'Because light attracts bugs.',
  flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false },
};

const mockSources = [{ id: 'joke-api', name: 'JokeAPI.dev' }];

function makeSocket(overrides: Record<string, unknown> = {}) {
  return {
    jokes: ref([]),
    running: ref(false),
    error: ref<string | null>(null),
    start: vi.fn(),
    stop: vi.fn(),
    changeInterval: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useJokeSocket).mockReturnValue(makeSocket() as never);
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(mockSources),
  }) as never;
});

describe('JokeList page', () => {
  it('renders the page title', async () => {
    const wrapper = mount(JokeList);
    await flushPromises();
    expect(wrapper.find('h1').text()).toBe('Jokes');
  });

  it('renders "Start" button when not running', async () => {
    const wrapper = mount(JokeList);
    await flushPromises();
    expect(wrapper.find('button').text()).toContain('Start');
  });

  it('renders "Stop" button when running', async () => {
    vi.mocked(useJokeSocket).mockReturnValue(makeSocket({ running: ref(true) }) as never);
    const wrapper = mount(JokeList);
    await flushPromises();
    expect(wrapper.find('button').text()).toContain('Stop');
  });

  it('renders category select', async () => {
    const wrapper = mount(JokeList);
    await flushPromises();
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('renders interval radio buttons', async () => {
    const wrapper = mount(JokeList);
    await flushPromises();
    expect(wrapper.findAll('input[type="radio"]').length).toBeGreaterThan(0);
  });

  it('renders source checkboxes from fetched sources', async () => {
    const wrapper = mount(JokeList);
    await flushPromises();
    expect(wrapper.findAll('input[type="checkbox"]').length).toBeGreaterThan(0);
  });

  it('shows empty text when no jokes', async () => {
    const wrapper = mount(JokeList);
    await flushPromises();
    expect(wrapper.text()).toContain('Click "Start" to load jokes.');
  });

  it('calls start() with intervalSec and sources on Start click', async () => {
    const socket = makeSocket();
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    await wrapper.find('button').trigger('click');

    expect(socket.start).toHaveBeenCalledWith(expect.any(Number), expect.any(Array));
  });

  it('calls stop() on Stop click when running', async () => {
    const socket = makeSocket({ running: ref(true) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    await wrapper.find('button').trigger('click');

    expect(socket.stop).toHaveBeenCalled();
  });

  it('displays jokes in table', async () => {
    const socket = makeSocket({ jokes: ref([mockJoke]) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    expect(wrapper.text()).toContain('Programming');
    expect(wrapper.text()).toContain('Why do programmers prefer dark mode?');
  });

  it('displays the source column for each joke', async () => {
    const socket = makeSocket({ jokes: ref([mockJoke]) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    expect(wrapper.text()).toContain('joke-api');
  });

  it('displays multiple jokes as multiple rows', async () => {
    const socket = makeSocket({
      jokes: ref([mockJoke, { ...mockJoke, id: 2, category: 'Dark' }]),
    });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('filters jokes by selected category', async () => {
    const socket = makeSocket({
      jokes: ref([mockJoke, { ...mockJoke, id: 2, category: 'Dark', setup: 'Dark setup' }]),
    });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    await wrapper.find('select').setValue('Programming');

    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).not.toContain('Dark setup');
  });

  it('shows all jokes when All is selected', async () => {
    const socket = makeSocket({
      jokes: ref([mockJoke, { ...mockJoke, id: 2, category: 'Dark' }]),
    });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    await wrapper.find('select').setValue('');

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('populates category select from joke list', async () => {
    const socket = makeSocket({ jokes: ref([mockJoke]) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    const options = wrapper.findAll('option').map((o) => o.text());
    expect(options).toContain('Programming');
  });

  it('shows error message from composable', async () => {
    const socket = makeSocket({ error: ref('Connection error. Is the gateway running?') });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    expect(wrapper.text()).toContain('Connection error. Is the gateway running?');
  });

  it('calls changeInterval when radio changes while running', async () => {
    const socket = makeSocket({ running: ref(true) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[1].trigger('change');

    expect(socket.changeInterval).toHaveBeenCalled();
  });

  it('does not call changeInterval when radio changes while stopped', async () => {
    const socket = makeSocket({ running: ref(false) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);
    await flushPromises();

    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[1].trigger('change');

    expect(socket.changeInterval).not.toHaveBeenCalled();
  });

  it('falls back to default source when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as never;
    const wrapper = mount(JokeList);
    await flushPromises();

    expect(wrapper.findAll('input[type="checkbox"]').length).toBeGreaterThan(0);
  });
});
