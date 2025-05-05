import { io, Socket } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_APP_SOCKET_URL;

const socket: Socket = io(socketUrl);

export default socket;