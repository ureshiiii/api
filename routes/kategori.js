import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all kategori data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM kategori');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data kategori.' });
  }
});

// Get kategori data by ID
router.get('/:id', async (req, res) => {
  const idKategori = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM kategori WHERE id_kategori = ?', [idKategori]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'ID kategori tidak ditemukan.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data kategori.' });
  }
});

// Add new kategori data
router.post('/', async (req, res) => {
  const newKategori = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO kategori (nama_kategori) VALUES (?)',
      [newKategori.nama_kategori]
    );
    res.status(201).json({ message: 'Data kategori berhasil ditambahkan.', id_kategori: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data kategori.' });
  }
});

// Update kategori data by ID
router.put('/:id', async (req, res) => {
  const idKategori = req.params.id;
  const updatedKategori = req.body;
  try {
    const [result] = await db.query(
      'UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?',
      [updatedKategori.nama_kategori, idKategori]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID kategori tidak ditemukan.' });
    }
    res.json({ message: 'Data kategori berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data kategori.' });
  }
});

// Delete kategori data by ID
router.delete('/:id', async (req, res) => {
  const idKategori = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM kategori WHERE id_kategori = ?', [idKategori]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID kategori tidak ditemukan.' });
    }
    res.json({ message: 'Data kategori berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data kategori.' });
  }
});

export default router;