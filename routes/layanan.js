import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all layanan data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM layanan');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data layanan.' });
  }
});

// Get layanan data by ID
router.get('/:id', async (req, res) => {
  const idLayanan = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM layanan WHERE id_layanan = ?', [idLayanan]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'ID layanan tidak ditemukan.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data layanan.' });
  }
});

// Add new layanan data
router.post('/', async (req, res) => {
  const newLayanan = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO layanan (id_kategori, nama_layanan) VALUES (?, ?)',
      [newLayanan.id_kategori, newLayanan.nama_layanan]
    );
    res.status(201).json({ message: 'Data layanan berhasil ditambahkan.', id_layanan: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data layanan.' });
  }
});

// Update layanan data by ID
router.put('/:id', async (req, res) => {
  const idLayanan = req.params.id;
  const updatedLayanan = req.body;
  try {
    const [result] = await db.query(
      'UPDATE layanan SET id_kategori = ?, nama_layanan = ? WHERE id_layanan = ?',
      [updatedLayanan.id_kategori, updatedLayanan.nama_layanan, idLayanan]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID layanan tidak ditemukan.' });
    }
    res.json({ message: 'Data layanan berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data layanan.' });
  }
});

// Delete layanan data by ID
router.delete('/:id', async (req, res) => {
  const idLayanan = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM layanan WHERE id_layanan = ?', [idLayanan]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID layanan tidak ditemukan.' });
    }
    res.json({ message: 'Data layanan berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data layanan.' });
  }
});

export default router;