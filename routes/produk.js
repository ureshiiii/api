import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all produk data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM produk');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data produk.' });
  }
});

// Get produk data by ID
router.get('/:id', async (req, res) => {
  const idProduk = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM produk WHERE id_produk = ?', [idProduk]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'ID produk tidak ditemukan.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data produk.' });
  }
});

// Add new produk data
router.post('/', async (req, res) => {
  const newProduk = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO produk (id_layanan, nama_produk, harga, icon) VALUES (?, ?, ?, ?)',
      [newProduk.id_layanan, newProduk.nama_produk, newProduk.harga, newProduk.icon]
    );
    res.status(201).json({ message: 'Data produk berhasil ditambahkan.', id_produk: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data produk.' });
  }
});

// Update produk data by ID
router.put('/:id', async (req, res) => {
  const idProduk = req.params.id;
  const updatedProduk = req.body;
  try {
    const [result] = await db.query(
      'UPDATE produk SET id_layanan = ?, nama_produk = ?, harga = ?, icon = ? WHERE id_produk = ?',
      [updatedProduk.id_layanan, updatedProduk.nama_produk, updatedProduk.harga, updatedProduk.icon, idProduk]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID produk tidak ditemukan.' });
    }
    res.json({ message: 'Data produk berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data produk.' });
  }
});

// Delete produk data by ID
router.delete('/:id', async (req, res) => {
  const idProduk = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM produk WHERE id_produk = ?', [idProduk]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID produk tidak ditemukan.' });
    }
    res.json({ message: 'Data produk berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data produk.' });
  }
});

export default router;