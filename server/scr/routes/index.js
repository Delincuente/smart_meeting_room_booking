import express from 'express';
import { getRooms } from '../controllers/roomController.js';
import { createBookings, getBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({ message: 'Welcome to the Smart Meeting Room Booking System' });
});
router.route('/rooms').get(getRooms);
router.route('/bookings').get(getBookings);
router.route('/book-room').post(createBookings);

export default router;