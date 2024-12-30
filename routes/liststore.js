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
      JOIN 
          produkStore k ON s.id = k.id_store
      JOIN 
          itemStore i ON k.id = i.id_kategori
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Hitung total data untuk pagination
    const [totalData] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM store s 
      JOIN produkStore k ON s.id = k.id_store 
      JOIN itemStore i ON k.id = i.id_kategori
    `);
    const total = totalData[0].total;

    res.json({
      data: results,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data list store.' });
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
      JOIN 
          produkStore k ON s.id = k.id_store
      JOIN 
          itemStore i ON k.id = i.id_kategori
      WHERE 
          s.id = ?
      LIMIT ? OFFSET ?
    `, [idStore, limit, offset]);

    // Hitung total data untuk pagination
    const [totalData] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM store s 
      JOIN produkStore k ON s.id = k.id_store 
      JOIN itemStore i ON k.id = i.id_kategori
      WHERE s.id = ?
    `, [idStore]);
    const total = totalData[0].total;

    if (total === 0) {
      return res.status(404).json({ message: 'ID store tidak ditemukan atau store tidak memiliki list.' });
    }

    res.json({
      data: results,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data list store.' });
  }
});

// Add new list store data (support kategori baru dan yang sudah ada)
router.post('/', async (req, res) => {
  const { id_store, nama_kategori, items } = req.body; 

  if (!id_store || !nama_kategori || !items || !Array.isArray(items)) {
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

    const values = items.map(item => [idKategori, item.nama_item, item.harga]);
    await db.query(
      'INSERT INTO itemStore (id_kategori, nama_item, harga) VALUES ?',
      [values]
    );

    await db.query('COMMIT');
    res.status(201).json({ message: 'Data list store berhasil ditambahkan.' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data list store.' });
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
    res.status(500).json({ message: 'Gagal memperbarui kategori.' });
  }
});

// Update list store data (update item by id)
router.put('/item/:id', async (req, res) => {
  const idItem = req.params.id;
  const updatedItem = req.body;

  try {
    let query = 'UPDATE itemStore SET ';
    let values = [];
    let fieldCount = 0;

    if (updatedItem.nama_item) {
      query += `nama_item = ?, `;
      values.push(updatedItem.nama_item);
      fieldCount++;
    }
    if (updatedItem.harga) {
      query += `harga = ?, `;
      values.push(updatedItem.harga);
      fieldCount++;
    }

    if (fieldCount > 0) {
      query = query.slice(0, -2); 
    } else {
      return res.status(400).json({ message: 'Tidak ada data yang diperbarui.' });
    }
    query += ` WHERE id = ?`;
    values.push(idItem);

    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID item tidak ditemukan.' });
    }
    res.json({ message: 'Data item berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data item.' });
  }
});

// Delete list store data (delete item by id)
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
    res.status(500).json({ message: 'Gagal menghapus data item.' });
  }
});

export default router;
