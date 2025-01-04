import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all payment for the specified user ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [results] = await db.query(
      'SELECT * FROM payment WHERE user_id = ?',
      [userId]
    );
    res.json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data payment.', error: err.message });
  }
});

// Add new payment for the specified user ID
router.post('/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, nomor, kategori } = req.body;

  if (!name || !nomor || !kategori) {
    return res.status(400).json({ message: 'Nama, nomor, dan kategori payment wajib diisi.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO payment (user_id, name, nomor, kategori) VALUES (?, ?, ?, ?)',
      [userId, name, nomor, kategori]
    );
    res.status(201).json({ message: 'Payment berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan payment.', error: err.message });
  }
});

// Update payment by ID for the specified user ID
router.put('/:userId/:id', async (req, res) => {
  const userId = req.params.userId;
  const paymentId = req.params.id;
  const { name, nomor, kategori } = req.body;

  if (!name && !nomor && !kategori) {
    return res.status(400).json({ message: 'Minimal nama, nomor, atau kategori payment harus diisi.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE payment SET name = COALESCE(?, name), nomor = COALESCE(?, nomor), kategori = COALESCE(?, kategori) WHERE id = ? AND user_id = ?', // Tambahkan kategori di query
      [name, nomor, kategori, paymentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID payment tidak ditemukan.' });
    }

    res.json({ message: 'Payment berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui payment.', error: err.message });
  }
});

// Delete payment by ID for the specified user ID
router.delete('/:userId/:id', async (req, res) => {
  const userId = req.params.userId;
  const paymentId = req.params.id;

  try {
    const [result] = await db.query(
      'DELETE FROM payment WHERE id = ? AND user_id = ?',
      [paymentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID payment tidak ditemukan.' });
    }

    res.json({ message: 'Payment berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus payment.', error: err.message });
  }
});

export default router;
