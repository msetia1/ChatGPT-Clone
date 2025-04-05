import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all conversations
router.get('/conversations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM conversations ORDER BY created_at DESC');
        res.json(result.rows);
    } catch(error) {
        res.status(500).json({ error: error.message});
    }
});

// Get a single conversation by ID
router.get('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

// Create a new conversation
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

// Delete a conversation and all its messages
router.delete('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query( 'DELETE FROM messages WHERE conversation_id = $1', [id]);
        await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
        res.json({ message: 'Conversation deleted'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Update conversation title
router.put('/conversations/:id', async (req, res) => {
    try {
        const {id } = req.params;
        const { title } = req.body;
        const result = await pool.query('UPDATE conversations SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all messages for a conversation
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

// Create a new message
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



export default router;