import dotenv from "dotenv"
dotenv.config({ quite: true });
import express from 'express';
import cors from 'cors';
import mongoose from "mongoose";
import errorHandler from "./middleware/errorHandler.js";
import apiRouter from './routes/index.js';

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extends: true }));
app.use((req, res, next) => {
    console.log(req.url);
    next();
})
app.get('/', (req, res) => {
    res.json({ message: 'Welcome...' });
});
app.use('/api', apiRouter);
app.use(errorHandler);
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        console.log(process.env.MONGO_URI)
        const conn = await mongoose.connect(process.env.MONGO_URI);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
})();