import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import { formatDateTime } from '../utils/dateUtils.js';
import { createError } from '../utils/errorUtils.js';
import mongoose from 'mongoose';

export const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.roomId) {
      query.roomId = req.query.roomId;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('roomId', "name")
        .lean(),
      Booking.countDocuments(query)
    ]);

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      startTime: formatDateTime(booking.startTime),
      endTime: formatDateTime(booking.endTime)
    }));

    res.json({
      data: formattedBookings,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error)
  }
}

export const createBookings = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, userEmail, startTime, endTime } = req.body;

    if (!roomId || !userEmail || !startTime || !endTime) {
      await session.abortTransaction();
      throw createError('All fields are required', 400);
    }

    if (!userEmail.match(/.+@.+\..+/)) {
      await session.abortTransaction();
      throw createError('Invalid email', 400);
    }

    if (new Date(startTime) >= new Date(endTime)) {
      await session.abortTransaction();
      throw createError('End time must be strictly after Start time', 400);
    }

    const room = await Room.findById(roomId).session(session);
    if (!room) {
      await session.abortTransaction();
      throw createError('Room not found', 404);
    }

    const overlappingBooking = await Booking.findOne({
      roomId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    }).session(session);

    if (overlappingBooking) {
      await session.abortTransaction();
      throw createError(`Room is unavailable from ${formatDateTime(startTime)} to ${formatDateTime(endTime)}`, 400);
    }

    const booking = new Booking({
      roomId,
      userEmail,
      startTime,
      endTime
    });

    await booking.save({ session });

    await session.commitTransaction();

    return res.status(201).json({ success: true, message: 'Booking created successfully', booking });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};