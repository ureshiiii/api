import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all users data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, Username, Email, Age, role, profile_picture, last_profile_update FROM users');
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
    const [results] = await db.query('SELECT id, Username, Email, Age, role, profile_picture, last_profile_update FROM users WHERE id = ?', [idUser]);
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
  if (!newUser.Password || !newUser.Email || !newUser.Username) {
    return res.status(400).json({ message: 'Input password, email, dan username wajib diisi.' });
  }
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

// Update user data
router.put('/:id', async (req, res) => {
  const idUser = req.params.id;
  const updatedUser = req.body;
  try {
    let query = 'UPDATE users SET ';
    let values = [];
    let fieldCount = 0;
    if (updatedUser.Username) {
      query += `Username = ?, `;
      values.push(updatedUser.Username);
      fieldCount++;
    }
    if (updatedUser.Email) {
      query += `Email = ?, `;
      values.push(updatedUser.Email);
      fieldCount++;
    }
    if (updatedUser.Age) {
      query += `Age = ?, `;
      values.push(updatedUser.Age);
      fieldCount++;
    }
    if (updatedUser.Password) {
      query += `Password = ?, `;
      values.push(updatedUser.Password);
      fieldCount++;
    }
    if (updatedUser.role) {
      query += `role = ?, `;
      values.push(updatedUser.role);
      fieldCount++;
    }
    if (fieldCount > 0) {
      query = query.slice(0, -2); 
    } else {
      return res.status(400).json({ message: 'Tidak ada data yang diperbarui.' });
    }
    query += ` WHERE id = ?`;
    values.push(idUser);
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID user tidak ditemukan.' });
    }
    res.json({ message: 'Data user berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data users.' });
  }
});

// Delete user data
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