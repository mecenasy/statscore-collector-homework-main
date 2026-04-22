import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

vi.mock('../../composables/useJokeSocket');

import { useJokeSocket } from '../../composables/useJokeSocket';
import JokeList from '../JokeList.vue';

const mockJoke = {
  id: 1,
  category: 'Programming',
  setup: 'Why do programmers prefer dark mode?',
  delivery: 'Because light attracts bugs.',
  flags: { nsfw: false, religious: false, political: false, racist: false, sexist: false, explicit: false },
};

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
});

describe('JokeList page', () => {
  it('renders the page title', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.find('h1').text()).toBe('Jokes');
  });

  it('renders "Start" button when not running', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.find('button').text()).toContain('Start');
  });

  it('renders "Stop" button when running', () => {
    vi.mocked(useJokeSocket).mockReturnValue(makeSocket({ running: ref(true) }) as never);
    const wrapper = mount(JokeList);
    expect(wrapper.find('button').text()).toContain('Stop');
  });

  it('renders category select', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('renders interval radio buttons', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.findAll('input[type="radio"]').length).toBeGreaterThan(0);
  });

  it('shows empty text when no jokes', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.text()).toContain('Click "Start" to load jokes.');
  });

  it('calls start() with intervalSec on Start click', async () => {
    const socket = makeSocket();
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');

    expect(socket.start).toHaveBeenCalledWith(expect.any(Number));
  });

  it('calls stop() on Stop click when running', async () => {
    const socket = makeSocket({ running: ref(true) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');

    expect(socket.stop).toHaveBeenCalled();
  });

  it('displays jokes in table', () => {
    const socket = makeSocket({ jokes: ref([mockJoke]) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    expect(wrapper.text()).toContain('Programming');
    expect(wrapper.text()).toContain('Why do programmers prefer dark mode?');
  });

  it('displays multiple jokes as multiple rows', () => {
    const socket = makeSocket({
      jokes: ref([mockJoke, { ...mockJoke, id: 2, category: 'Dark' }]),
    });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('filters jokes by selected category', async () => {
    const socket = makeSocket({
      jokes: ref([mockJoke, { ...mockJoke, id: 2, category: 'Dark', setup: 'Dark setup' }]),
    });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

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

    await wrapper.find('select').setValue('');

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('populates category select from joke list', () => {
    const socket = makeSocket({ jokes: ref([mockJoke]) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    const options = wrapper.findAll('option').map((o) => o.text());
    expect(options).toContain('Programming');
  });

  it('shows error message from composable', () => {
    const socket = makeSocket({ error: ref('Connection error. Is the gateway running?') });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    expect(wrapper.text()).toContain('Connection error. Is the gateway running?');
  });

  it('calls changeInterval when radio changes while running', async () => {
    const socket = makeSocket({ running: ref(true) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[1].trigger('change');

    expect(socket.changeInterval).toHaveBeenCalled();
  });

  it('does not call changeInterval when radio changes while stopped', async () => {
    const socket = makeSocket({ running: ref(false) });
    vi.mocked(useJokeSocket).mockReturnValue(socket as never);
    const wrapper = mount(JokeList);

    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[1].trigger('change');

    expect(socket.changeInterval).not.toHaveBeenCalled();
  });
});
