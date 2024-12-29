import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// get all
router.get('/', (req, res) => {
  db.query('SELECT * FROM buttons', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil data buttons jir' });
      return;
    }
    res.json(results);
  });
});

// get berdasarkan id
router.get('/:id', (req, res) => {
  const idButton = req.params.id;
  const query = 'SELECT * FROM buttons WHERE id_button = ?';

  db.query(query, [idButton], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil data buttons jir' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: 'ID Buttons nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json(result[0]);
  });
});

// nambah button baru
router.post('/', (req, res) => {
  const newButton = req.body;
  const query = `
    INSERT INTO buttons (link, image_src, title, promo_label, sub_title, img_header) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    newButton.link,
    newButton.image_src,
    newButton.title,
    newButton.promo_label,
    newButton.sub_title,
    newButton.img_header
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal membuat buttons baru han' });
      return;
    }
    res.status(201).json({
      message: 'Button berhasil dibuat han. Cek ulang ya',
      id_button: result.insertId
    });
  });
});

// update/edit button
router.put('/:id', (req, res) => {
  const idButton = req.params.id;
  const updatedButton = req.body;
  const query = `
    UPDATE buttons 
    SET link = ?, image_src = ?, title = ?, promo_label = ?, sub_title = ?, img_header = ? 
    WHERE id_button = ?
  `;
  const values = [
    updatedButton.link,
    updatedButton.image_src,
    updatedButton.title,
    updatedButton.promo_label,
    updatedButton.sub_title,
    updatedButton.img_header,
    idButton
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengupdate buttons baru jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Buttons nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Button nya berhasil di update' });
  });
});

// hapus button berdasarkan id
router.delete('/:id', (req, res) => {
  const idButton = req.params.id;
  const query = 'DELETE FROM buttons WHERE id_button = ?';

  db.query(query, [idButton], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menghapus button nya jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Buttons nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Button nya berhadil di hapus' });
  });
});

export default router;
