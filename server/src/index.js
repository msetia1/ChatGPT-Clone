import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import generateTextRoutes from './routes/generateText.js';
import process from 'process';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api', generateTextRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});