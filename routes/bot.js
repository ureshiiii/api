import express from 'express';
import db from '../config/database.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password, owner_number, machine_id } = req.body;
    if (!username || !password || !owner_number || !machine_id) {
        return res.status(400).json({ success: false, message: 'Masukkan Username, Password, Nomor Owner, dan Machine ID.' });
    }

    try {
        const [results] = await db.query('SELECT id, username, password FROM bot WHERE username = ?', [username]);
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Username atau Password salah.' });
        }

        const user = results[0];

        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'Username atau Password salah.' });
        }

        const userId = user.id;
        const [existingLog] = await db.query('SELECT log_id, machine_id FROM login_logs WHERE user_id = ?', [userId]);

        if (existingLog.length > 0) {
            if (existingLog[0].machine_id && existingLog[0].machine_id !== machine_id) {
                return res.status(409).json({ success: false, message: 'Akun sudah digunakan di perangkat lain.' });
            } else {
              await db.query('UPDATE login_logs SET login_time = CURRENT_TIMESTAMP, owner_number = ? WHERE log_id = ?', [owner_number, existingLog[0].log_id]);
            }
        } else {
            await db.query('INSERT INTO login_logs (user_id, username, machine_id, owner_number) VALUES (?, ?, ?, ?)', [userId, username, machine_id, owner_number]);
        }

        res.status(200).json({ success: true, message: 'Login berhasil.', userId: user.id });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.post('/add', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO bot (username, password) VALUES (?, ?)',
            [username, password]
        );
        const newUserId = result.insertId;
        res.status(201).json({ success: true, message: 'User added successfully.', userId: newUserId });
    } catch (error) {
        console.error("Add user error:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Username already exists.' });
        }
        res.status(500).json({ success: false, message: 'Failed to add user.' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const userId = req.params.id;
    if (!/^\d+$/.test(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
     try {
        const [result] = await db.query('DELETE FROM bot WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        await db.query('DELETE FROM login_logs WHERE user_id=?', [userId]);
        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
});

export default router;
