import { ref, onUnmounted } from 'vue';
import { io, type Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import type { Joke } from '../table/types';

const GATEWAY_URL = `${import.meta.env.VITE_GATEWAY_URL}/jokes`;

export function useJokeSocket() {
  const jokes = ref<Joke[]>([]);
  const running = ref(false);
  const error = ref<string | null>(null);

  const challenge = uuidv4();
  let socket: Socket | null = null;

  function connect() {
    socket = io(GATEWAY_URL, { query: { challenge } });

    socket.on('joke', (data: Joke) => {
      jokes.value.push(data);
      error.value = null;
    });

    socket.on('connect_error', () => {
      error.value = 'Connection error. Is the gateway running?';
      running.value = false;
    });
  }

  function start(intervalSec: number, sources: string[] = ['joke-api']) {
    if (!socket?.connected) connect();
    running.value = true;
    error.value = null;
    socket?.emit('start', { intervalSec, sources });
  }

  function stop() {
    running.value = false;
    socket?.emit('stop');
  }

  function changeInterval(intervalSec: number) {
    socket?.emit('change-interval', { intervalSec });
  }

  onUnmounted(() => {
    socket?.emit('stop');
    socket?.disconnect();
  });

  return { jokes, running, error, start, stop, changeInterval };
}
