import express from 'express';
import { GoogleGenAI } from '@google/genai';
import pool from '../db.js';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import process from 'process';

dotenv.config();
const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many requests, please try again later.'
});

router.use(limiter);
router.get('/generate-stream', async (req, res) => {
    try {
        const { conversation_id, message } = req.query;
        let clientDisconnected = false;
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (!conversation_id || !message) {
            return res.status(400).json({ error: 'Conversation ID and message are required' });
        }
        await pool.query('INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)', [conversation_id, 'user', message]);

        req.on('close', () => { 
            console.log('Client disconnected');
            clientDisconnected = true;
         });
        let fullResponse = ""
        const response = await ai.models.generateContentStream({
            model: process.env.MODEL,
            contents: [
                {
                role: 'user',
                parts: [{text: message}]
                }
            ]
        });
        for await (const chunk of response) {
            if (clientDisconnected) {
                break;
            }
            fullResponse += chunk.text();
            res.write(`data: ${JSON.stringify({content: chunk.text()})}\n\n`);
        }
        if (!clientDisconnected) {
            res.write('data: [DONE]\n\n');
            await pool.query('INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)', [conversation_id, 'assistant', fullResponse]);
        }

        res.end();
    } catch(error) {
        console.error('Error generating text:', error);
        res.write(`data: ${JSON.stringify({ error: 'An error occurred while generating text. Please try again.'})}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
})

export default router;
