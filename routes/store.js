import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all stores data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, username, thumbnail, nama_store, foto_profile, deskripsi FROM store');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data store.' });
  }
});

// Get store data by ID
router.get('/:id', async (req, res) => {
  const idStore = req.params.id;
  try {
    const [results] = await db.query('SELECT id, username, thumbnail, nama_store, foto_profile, deskripsi FROM store WHERE id = ?', [idStore]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'ID store tidak ditemukan.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data store.' });
  }
});

// Add new store data
router.post('/', async (req, res) => {
  const newStore = req.body;

  newStore.thumbnail = newStore.thumbnail || 'https://via.placeholder.com/1280x720';
  newStore.foto_profile = newStore.foto_profile || 'https://via.placeholder.com/500';
  newStore.deskripsi = newStore.deskripsi || 'Kami adalah store online yang terpercaya oleh banyak pelanggan. Jadi sudah pasti aman';

  if (!newStore.username || !newStore.password || !newStore.nama_store) {
    return res.status(400).json({ message: 'Username, password, dan nama store wajib diisi.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO store (username, password, thumbnail, nama_store, foto_profile, deskripsi) VALUES (?, ?, ?, ?, ?, ?)',
      [newStore.username, newStore.password, newStore.thumbnail, newStore.nama_store, newStore.foto_profile, newStore.deskripsi]
    );
    res.status(201).json({ message: 'Data store berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data store.' });
  }
});

// Update store data
router.put('/:id', async (req, res) => {
  const idStore = req.params.id;
  const updatedStore = req.body;
  try {
    let query = 'UPDATE store SET ';
    let values = [];
    let fieldCount = 0;
    if (updatedStore.username) {
      query += `username = ?, `;
      values.push(updatedStore.username);
      fieldCount++;
    }
    if (updatedStore.password) {
      query += `password = ?, `;
      values.push(updatedStore.password);
      fieldCount++;
    }
    if (updatedStore.thumbnail) {
      query += `thumbnail = ?, `;
      values.push(updatedStore.thumbnail);
      fieldCount++;
    }
    if (updatedStore.nama_store) {
      query += `nama_store = ?, `;
      values.push(updatedStore.nama_store);
      fieldCount++;
    }
    if (updatedStore.foto_profile) {
      query += `foto_profile = ?, `;
      values.push(updatedStore.foto_profile);
      fieldCount++;
    }
    if (updatedStore.deskripsi) { 
      query += `deskripsi = ?, `;
      values.push(updatedStore.deskripsi);
      fieldCount++;
    }
    if (fieldCount > 0) {
      query = query.slice(0, -2); 
    } else {
      return res.status(400).json({ message: 'Tidak ada data yang diperbarui.' });
    }
    query += ` WHERE id = ?`;
    values.push(idStore);
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID store tidak ditemukan.' });
    }
    res.json({ message: 'Data store berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data store.' });
  }
});

// Delete store data
router.delete('/:id', async (req, res) => {
  const idStore = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM store WHERE id = ?', [idStore]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID store tidak ditemukan.' });
    }
    res.json({ message: 'Data store berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data store.' });
  }
});

export default router;