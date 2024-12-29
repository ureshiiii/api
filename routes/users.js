import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all users data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data users.' });
  }
});

// Get user data by ID
router.get('/:id', async (req, res) => {
  const idUser = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [idUser]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'ID user tidak ditemukan.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data users.' });
  }
});

// Add new user data
router.post('/', async (req, res) => {
  const newUser = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (Username, Email, Age, Password, role, profile_picture, last_profile_update) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newUser.Username, newUser.Email, newUser.Age, newUser.Password, newUser.role, newUser.profile_picture, newUser.last_profile_update]
    );
    res.status(201).json({ message: 'Data user berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data users.' });
  }
});

// Update user data by ID
router.put('/:id', async (req, res) => {
  const idUser = req.params.id;
  const updatedUser = req.body;
  try {
    const [result] = await db.query(
      'UPDATE users SET Username = ?, Email = ?, Age = ?, Password = ?, role = ?, profile_picture = ?, last_profile_update = ? WHERE id = ?',
      [updatedUser.Username, updatedUser.Email, updatedUser.Age, updatedUser.Password, updatedUser.role, updatedUser.profile_picture, updatedUser.last_profile_update, idUser]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID user tidak ditemukan.' });
    }
    res.json({ message: 'Data user berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data users.' });
  }
});

// Delete user data by ID
router.delete('/:id', async (req, res) => {
  const idUser = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [idUser]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID user tidak ditemukan.' });
    }
    res.json({ message: 'Data user berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data users.' });
  }
});

export default router;