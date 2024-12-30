import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all list store data with pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [results] = await db.query(`
      SELECT 
          s.nama_store, 
          k.nama_kategori, 
          i.nama_item, 
          i.harga
      FROM 
          store s
      LEFT JOIN 
          produkStore k ON s.id = k.id_store
      LEFT JOIN 
          itemStore i ON k.id = i.id_kategori
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [totalData] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM store s 
      LEFT JOIN produkStore k ON s.id = k.id_store 
      LEFT JOIN itemStore i ON k.id = i.id_kategori
    `);

    const total = totalData[0]?.total || 0;

    res.json({
      data: results,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data list store.', error: err.message });
  }
});

// Get list store data by store ID with pagination
router.get('/store/:id', async (req, res) => {
  const idStore = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [results] = await db.query(`
      SELECT 
          s.nama_store, 
          k.nama_kategori, 
          i.nama_item, 
          i.harga
      FROM 
          store s
      LEFT JOIN 
          produkStore k ON s.id = k.id_store
      LEFT JOIN 
          itemStore i ON k.id = i.id_kategori
      WHERE 
          s.id = ?
      LIMIT ? OFFSET ?
    `, [idStore, limit, offset]);

    const [totalData] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM store s 
      LEFT JOIN produkStore k ON s.id = k.id_store 
      LEFT JOIN itemStore i ON k.id = i.id_kategori
      WHERE s.id = ?
    `, [idStore]);

    const total = totalData[0]?.total || 0;

    if (total === 0) {
      return res.status(404).json({ message: 'ID store tidak ditemukan atau tidak memiliki data.' });
    }

    res.json({
      data: results,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data list store.', error: err.message });
  }
});

// Add new list store data
router.post('/', async (req, res) => {
  const { id_store, nama_kategori, items } = req.body;

  if (!id_store || !nama_kategori || !Array.isArray(items)) {
    return res.status(400).json({ message: 'id_store, nama_kategori, dan items (array) wajib diisi.' });
  }

  try {
    await db.query('START TRANSACTION');

    const [existingKategori] = await db.query(
      'SELECT id FROM produkStore WHERE id_store = ? AND nama_kategori = ?',
      [id_store, nama_kategori]
    );

    let idKategori;
    if (existingKategori.length > 0) {
      idKategori = existingKategori[0].id;
    } else {
      const [resultKategori] = await db.query(
        'INSERT INTO produkStore (id_store, nama_kategori) VALUES (?, ?)',
        [id_store, nama_kategori]
      );
      idKategori = resultKategori.insertId;
    }

    if (items.length > 0) {
      const values = items.map(item => [idKategori, item.nama_item, item.harga]);
      await db.query(
        'INSERT INTO itemStore (id_kategori, nama_item, harga) VALUES ?',
        [values]
      );
    }

    await db.query('COMMIT');
    res.status(201).json({ message: 'Data list store berhasil ditambahkan.' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data list store.', error: err.message });
  }
});

// Update kategori by ID
router.put('/kategori/:id', async (req, res) => {
  const idKategori = req.params.id;
  const { nama_kategori } = req.body;

  if (!nama_kategori) {
    return res.status(400).json({ message: 'nama_kategori wajib diisi.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE produkStore SET nama_kategori = ? WHERE id = ?',
      [nama_kategori, idKategori]
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

// Update item by ID
router.put('/item/:id', async (req, res) => {
  const idItem = req.params.id;
  const { nama_item, harga } = req.body;

  if (!nama_item && !harga) {
    return res.status(400).json({ message: 'Tidak ada data yang diperbarui.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE itemStore SET nama_item = COALESCE(?, nama_item), harga = COALESCE(?, harga) WHERE id = ?',
      [nama_item, harga, idItem]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID item tidak ditemukan.' });
    }

    res.json({ message: 'Data item berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data item.', error: err.message });
  }
});

// Delete item by ID
router.delete('/item/:id', async (req, res) => {
  const idItem = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM itemStore WHERE id = ?', [idItem]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID item tidak ditemukan.' });
    }

    res.json({ message: 'Data item berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data item.', error: err.message });
  }
});

export default router;
           
