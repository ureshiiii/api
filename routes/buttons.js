import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all buttons data
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM buttons');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data buttons.' });
  }
});

// Get button data by ID
router.get('/:id', async (req, res) => {
  const idButton = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM buttons WHERE id_button = ?', [idButton]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'ID button tidak ditemukan.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data buttons.' });
  }
});

// Add new button data
router.post('/', async (req, res) => {
  const newButton = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO buttons (link, image_src, title, promo_label, sub_title, img_header) VALUES (?, ?, ?, ?, ?, ?)',
      [newButton.link, newButton.image_src, newButton.title, newButton.promo_label, newButton.sub_title, newButton.img_header]
    );
    res.status(201).json({ message: 'Data button berhasil ditambahkan.', id_button: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan data buttons.' });
  }
});

// Update button data by ID
router.put('/:id', async (req, res) => {
  const idButton = req.params.id;
  const updatedButton = req.body;
  try {
    const [result] = await db.query(
      'UPDATE buttons SET link = ?, image_src = ?, title = ?, promo_label = ?, sub_title = ?, img_header = ? WHERE id_button = ?',
      [updatedButton.link, updatedButton.image_src, updatedButton.title, updatedButton.promo_label, updatedButton.sub_title, updatedButton.img_header, idButton]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID button tidak ditemukan.' });
    }
    res.json({ message: 'Data button berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data buttons.' });
  }
});

// Delete button data by ID
router.delete('/:id', async (req, res) => {
  const idButton = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM buttons WHERE id_button = ?', [idButton]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ID button tidak ditemukan.' });
    }
    res.json({ message: 'Data button berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data buttons.' });
  }
});

export default router;