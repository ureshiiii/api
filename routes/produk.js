import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// get all produk
router.get('/', (req, res) => {
  db.query('SELECT * FROM produk', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil produk jir' });
      return;
    }
    res.json(results);
  });
});

// get produk berdasarkan id
router.get('/:id', (req, res) => {
  const idProduk = req.params.id;
  const query = 'SELECT * FROM produk WHERE id_produk = ?';

  db.query(query, [idProduk], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil produk jir' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: 'ID Produk nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json(result[0]);
  });
});

// menambah produk baru
router.post('/', (req, res) => {
  const newProduk = req.body;
  const query = `
    INSERT INTO produk (id_layanan, nama_produk, harga, icon) 
    VALUES (?, ?, ?, ?)
  `;
  const values = [
    newProduk.id_layanan,
    newProduk.nama_produk,
    newProduk.harga,
    newProduk.icon
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal membuat produk baru han' });
      return;
    }
    res.status(201).json({
      message: 'Produk berhasil dibuat han. Cek ulang ya',
      id_produk: result.insertId
    });
  });
});

// edit/ubah produk berdasarkan id
router.put('/:id', (req, res) => {
  const idProduk = req.params.id;
  const updatedProduk = req.body;
  const query = `
    UPDATE produk 
    SET id_layanan = ?, nama_produk = ?, harga = ?, icon = ? 
    WHERE id_produk = ?
  `;
  const values = [
    updatedProduk.id_layanan,
    updatedProduk.nama_produk,
    updatedProduk.harga,
    updatedProduk.icon,
    idProduk
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengupdate produk baru jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Produk nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Produk nya berhasil di update' });
  });
});

// menghapus produk berdasarkan id
router.delete('/:id', (req, res) => {
  const idProduk = req.params.id;
  const query = 'DELETE FROM produk WHERE id_produk = ?';

  db.query(query, [idProduk], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menghapus produk jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Produk nya gada kocak, coba cek lagi id ya' });
      return;
    }
    res.json({ message: 'Produk nya berhasil di hapus' });
  });
});

export default router;