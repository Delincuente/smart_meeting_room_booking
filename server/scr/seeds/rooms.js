import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
dotenv.config();

const seedRooms = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        const rooms = [
            { name: 'Blue Room' },
            { name: 'Red Room' },
            { name: 'Yellow Room' }
        ];

        for (const room of rooms) {
            const existingRoom = await Room.findOne({ name: room.name });
            if (existingRoom) {
                console.log(`${room.name} room already exists`);
            } else {
                await Room.create(room);
                console.log(`${room.name} room inserted`);
            }
        }

        console.log('Seeding completed');

        // Exit process
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedRooms();