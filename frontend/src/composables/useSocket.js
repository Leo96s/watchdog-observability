import { onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { resolveApiOrigin } from '../utils/resolveApiUrl';

/**
 * Connects to the backend's Socket.IO server and wires up the two events it
 * emits: a full snapshot right after connecting, and a per-service update
 * every time a health check completes. Disconnects automatically when the
 * consuming component unmounts.
 */
export function useServiceSocket({ onSnapshot, onUpdate }) {
  const socket = io(resolveApiOrigin(import.meta.env.VITE_API_URL), {
    transports: ['websocket', 'polling'],
  });

  socket.on('services:snapshot', (snapshot) => onSnapshot?.(snapshot));
  socket.on('service:update', (update) => onUpdate?.(update));

  onUnmounted(() => socket.disconnect());

  return socket;
}
