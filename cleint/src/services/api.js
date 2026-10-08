import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const getRooms = () => api.get('/rooms');
export const getBookings = (roomId, page = 1, limit = 10) => api.get(`/bookings?roomId=${roomId}&page=${page}&limit=${limit}`);
export const createBooking = (data) => api.post('/book-room', data);

export default api;
