import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// get all layanan
router.get('/', (req, res) => {
  db.query('SELECT * FROM layanan', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil layanan jir' });
      return;
    }
    res.json(results);
  });
});

// get layanan berdasarkan id
router.get('/:id', (req, res) => {
  const idLayanan = req.params.id;
  const query = 'SELECT * FROM layanan WHERE id_layanan = ?';

  db.query(query, [idLayanan], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil layanan jir' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: 'ID Layanan nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json(result[0]);
  });
});

// menambahkan layanan baru
router.post('/', (req, res) => {
  const newLayanan = req.body;
  const query = `
    INSERT INTO layanan (id_kategori, nama_layanan) 
    VALUES (?, ?)
  `;
  const values = [
    newLayanan.id_kategori,
    newLayanan.nama_layanan
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal membuat layanan baru han' });
      return;
    }
    res.status(201).json({
      message: 'Layanan berhasil dibuat han. Cek ulang ya',
      id_layanan: result.insertId
    });
  });
});

// edit/update layanan berdasarkan id
router.put('/:id', (req, res) => {
  const idLayanan = req.params.id;
  const updatedLayanan = req.body;
  const query = `
    UPDATE layanan 
    SET id_kategori = ?, nama_layanan = ? 
    WHERE id_layanan = ?
  `;
  const values = [
    updatedLayanan.id_kategori,
    updatedLayanan.nama_layanan,
    idLayanan
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengupdate layanan baru jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Layanan nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Layanan nya berhasil di update' });
  });
});

// delete layanan berdasarkan id
router.delete('/:id', (req, res) => {
  const idLayanan = req.params.id;
  const query = 'DELETE FROM layanan WHERE id_layanan = ?';

  db.query(query, [idLayanan], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menghapus layanan jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Layanan nya gada kocak, coba cek lagi idnya' });
      return;
    }
    res.json({ message: 'Layanan nya berhasil di hapus' });
  });
});

export default router;