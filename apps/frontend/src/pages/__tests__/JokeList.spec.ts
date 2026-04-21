import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JokeList from '../JokeList.vue';

vi.mock('axios');
import axios from 'axios';

const mockJoke = {
  id: 1,
  category: 'Programming',
  type: 'twopart',
  setup: 'Why do programmers prefer dark mode?',
  delivery: 'Because light attracts bugs.',
  flags: {
    nsfw: false,
    religious: false,
    political: false,
    racist: false,
    sexist: false,
    explicit: false,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('JokeList page', () => {
  it('renders the page title', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.find('h1').text()).toBe('Jokes');
  });

  it('renders "Fetch a joke" button', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.find('button').text()).toContain('Fetch a joke');
  });

  it('renders category select', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('shows empty text before any fetch', () => {
    const wrapper = mount(JokeList);
    expect(wrapper.text()).toContain('Click "Fetch a joke" to load data.');
  });

  it('adds a joke row after successful fetch', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockJoke });
    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('Programming');
    expect(wrapper.text()).toContain('Why do programmers prefer dark mode?');
  });

  it('accumulates multiple jokes on repeated fetch', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: mockJoke });
    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('shows error message on failed fetch', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));
    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Failed to fetch a joke. Please try again.');
  });

  it('clears error on next successful fetch', async () => {
    vi.mocked(axios.get)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ data: mockJoke });

    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(wrapper.text()).not.toContain('Failed to fetch a joke.');
  });

  it('populates category select after fetch', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockJoke });
    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');
    await flushPromises();

    const options = wrapper.findAll('option').map((o) => o.text());
    expect(options).toContain('Programming');
  });

  it('filters table by selected category', async () => {
    const darkJoke = { ...mockJoke, id: 2, category: 'Dark', setup: 'Dark joke setup' };
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: mockJoke })
      .mockResolvedValueOnce({ data: darkJoke });

    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    await wrapper.find('select').setValue('Programming');

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(wrapper.text()).toContain('Programming');
    expect(wrapper.text()).not.toContain('Dark joke setup');
  });

  it('shows all jokes when "All" is selected', async () => {
    const darkJoke = { ...mockJoke, id: 2, category: 'Dark' };
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: mockJoke })
      .mockResolvedValueOnce({ data: darkJoke });

    const wrapper = mount(JokeList);

    await wrapper.find('button').trigger('click');
    await flushPromises();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    await wrapper.find('select').setValue('');

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('disables button while loading', async () => {
    let resolve!: (v: unknown) => void;
    vi.mocked(axios.get).mockReturnValueOnce(new Promise((r) => (resolve = r)));

    const wrapper = mount(JokeList);
    wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('button').element.disabled).toBe(true);

    resolve({ data: mockJoke });
    await flushPromises();

    expect(wrapper.find('button').element.disabled).toBe(false);
  });
});
