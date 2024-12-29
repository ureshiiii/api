import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all donor data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM donorData');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data donor.' });
  }
});

// Get donor data by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM donorData WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'ID donor tidak ditemukan.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data donor.' });
  }
});

// Add new donor data
router.post('/', async (req, res) => {
  const { donor, amount, icon } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO donorData (donor, amount, icon) VALUES (?, ?, ?)',
      [donor, amount, icon]
    );
    res.status(201).json({ message: 'Data donor berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data donor.' });
  }
});

// Update donor data by ID
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { donor, amount, icon } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE donorData SET donor = ?, amount = ?, icon = ? WHERE id = ?',
      [donor, amount, icon, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID donor tidak ditemukan.' });
    }
    res.json({ message: 'Data donor berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data donor.' });
  }
});

// Delete donor data by ID
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM donorData WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID donor tidak ditemukan.' });
    }
    res.json({ message: 'Data donor berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data donor.' });
  }
});

export default router;