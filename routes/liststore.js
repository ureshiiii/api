import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// --- Kategori Store ---

// Get all categories for the specified user ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [results] = await db.query(
      'SELECT * FROM kategoriStore WHERE user_id = ?',
      [userId]
    );
    res.json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data kategori.', error: err.message });
  }
});

// Add new category for the specified user ID
router.post('/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, deskripsi_kategori } = req.body;

  if (!name || !deskripsi_kategori) {
    return res.status(400).json({ message: 'Nama dan deskripsi kategori wajib diisi.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO kategoriStore (user_id, name, deskripsi_kategori) VALUES (?, ?, ?)',
      [userId, name, deskripsi_kategori] // Tambahkan deskripsi_kategori di query
    );
    res.status(201).json({ message: 'Kategori berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan kategori.', error: err.message });
  }
});

// Update category by ID for the specified user ID
router.put('/:userId/:id', async (req, res) => {
  const userId = req.params.userId;
  const categoryId = req.params.id;
  const { name, deskripsi_kategori } = req.body;

  if (!name && !deskripsi_kategori) {
    return res.status(400).json({ message: 'Minimal nama atau deskripsi kategori harus diisi.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE kategoriStore SET name = COALESCE(?, name), deskripsi_kategori = COALESCE(?, deskripsi_kategori) WHERE id = ? AND user_id = ?',
      [name, deskripsi_kategori, categoryId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID kategori tidak ditemukan.' });
    }

    res.json({ message: 'Kategori berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui kategori.', error: err.message });
  }
});

// Delete category by ID for the specified user ID
router.delete('/:userId/:id', async (req, res) => {
  const userId = req.params.userId;
  const categoryId = req.params.id;

  try {
    await db.query('START TRANSACTION');

    await db.query('DELETE FROM itemStore WHERE category_id = ?', [categoryId]);

    const [result] = await db.query(
      'DELETE FROM kategoriStore WHERE id = ? AND user_id = ?',
      [categoryId, userId]
    );

    await db.query('COMMIT');

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID kategori tidak ditemukan.' });
    }

    res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus kategori.', error: err.message });
  }
});


// --- Item Store ---

// Get all items for a category
router.get('/:categoryId/items', async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    const [results] = await db.query(
      'SELECT * FROM itemStore WHERE category_id = ?',
      [categoryId]
    );
    res.json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data item.', error: err.message });
  }
});

// Add new item to a category
router.post('/:categoryId/items', async (req, res) => {
  const categoryId = req.params.categoryId;
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Nama item dan harga wajib diisi.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO itemStore (category_id, name, price) VALUES (?, ?, ?)',
      [categoryId, name, price]
    );
    res.status(201).json({ message: 'Item berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan item.', error: err.message });
  }
});

// Update item by ID
router.put('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  const { name, price } = req.body;

  if (!name && !price) {
    return res.status(400).json({ message: 'Tidak ada data yang diperbarui.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE itemStore SET name = COALESCE(?, name), price = COALESCE(?, price) WHERE id = ?',
      [name, price, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID item tidak ditemukan.' });
    }

    res.json({ message: 'Item berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui item.', error: err.message });
  }
});

// Delete item by ID
router.delete('/items/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM itemStore WHERE id = ?', [itemId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID item tidak ditemukan.' });
    }

    res.json({ message: 'Item berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus item.', error: err.message });
  }
});

export default router;