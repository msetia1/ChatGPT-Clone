import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/conversations', async (req, res) => {
    try {
        const { title } = req.body;
        const result = await pool.query(
            'INSERT INTO conversations (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/messages', async (req, res) => {
    try {
        const {conversation_id, role, content } = req.body;
        const result = await pool.query(
            'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [conversation_id, role, content]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.log('Error creating message:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM messages where conversation_id = $1 ORDER BY created_at ASC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;