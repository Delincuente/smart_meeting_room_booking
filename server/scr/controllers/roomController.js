import Room from '../models/Room.js';

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    next(error)
  }
}