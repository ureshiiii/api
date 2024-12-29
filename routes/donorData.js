import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// get all donordata
router.get('/', (req, res) => {
  db.query('SELECT * FROM donorData', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil data donate jir' });
      return;
    }
    res.json(results);
  });
});

// get donordata berdasarkan id
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM donorData WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil data donate jir' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: 'ID Data donate nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json(result[0]);
  });
});

// menambahkan donordata baru
router.post('/', (req, res) => {
  const newDonor = req.body;
  const query = `
    INSERT INTO donorData (donor, amount, icon) 
    VALUES (?, ?, ?)
  `;
  const values = [
    newDonor.donor,
    newDonor.amount,
    newDonor.icon
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal membuat data donate baru han' });
      return;
    }
    res.status(201).json({
      message: 'Data donate berhasil dibuat han. Cek ulang ya',
      id: result.insertId
    });
  });
});

// mengubah/mengedit donordata berdasarkan id
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const updatedDonor = req.body;
  const query = `
    UPDATE donorData 
    SET donor = ?, amount = ?, icon = ? 
    WHERE id = ?
  `;
  const values = [
    updatedDonor.donor,
    updatedDonor.amount,
    updatedDonor.icon,
    id
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengupdate data donate baru jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Data donate nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Data donate nya berhasil di update' });
  });
});

// menghapus donordata berdasarkan id
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM donorData WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menghapus data donate nya jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Data donate nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Data donate nya berhasil di hapus' });
  });
});

export default router;