import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// get all kategori
router.get('/', (req, res) => {
  db.query('SELECT * FROM kategori', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil kategori jir' });
      return;
    }
    res.json(results);
  });
});

// get kategori berdasarkan id
router.get('/:id', (req, res) => {
  const idKategori = req.params.id;
  const query = 'SELECT * FROM kategori WHERE id_kategori = ?';

  db.query(query, [idKategori], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil kategori jir' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: 'ID Kategori nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json(result[0]);
  });
});

// menambahkan kategori baru
router.post('/', (req, res) => {
  const newKategori = req.body;
  const query = `
    INSERT INTO kategori (nama_kategori) 
    VALUES (?)
  `;
  const values = [
    newKategori.nama_kategori
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal membuat kategori baru han' });
      return;
    }
    res.status(201).json({
      message: 'Kategori berhasil dibuat han. Cek ulang ya',
      id_kategori: result.insertId
    });
  });
});

// edit/ubah kategori berdasarkan id
router.put('/:id', (req, res) => {
  const idKategori = req.params.id;
  const updatedKategori = req.body;
  const query = `
    UPDATE kategori 
    SET nama_kategori = ? 
    WHERE id_kategori = ?
  `;
  const values = [
    updatedKategori.nama_kategori,
    idKategori
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengupdate kategori baru jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Kategori nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Kategori nya berhasil di update' });
  });
});

// hapus kategori berdasarkan id
router.delete('/:id', (req, res) => {
  const idKategori = req.params.id;
  const query = 'DELETE FROM kategori WHERE id_kategori = ?';

  db.query(query, [idKategori], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menghapus kategori nya jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Kategori nya gada kocak, coba cek lagi idnya' });
      return;
    }
    res.json({ message: 'Kategori nya berhasil di hapus' });
  });
});

export default router;