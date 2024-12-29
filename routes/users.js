import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// get all user
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil users jir' });
      return;
    }
    res.json(results);
  });
});

// get users berdasarkan id
router.get('/:id', (req, res) => {
  const idUser = req.params.id;
  const query = 'SELECT * FROM users WHERE id = ?';

  db.query(query, [idUser], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengambil users jir' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ message: 'ID Users nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json(result[0]);
  });
});

// menambahkan users baru
router.post('/', (req, res) => {
  const newUser = req.body;
  const query = `
    INSERT INTO users (Username, Email, Age, Password, role, profile_picture, last_profile_update) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    newUser.Username,
    newUser.Email,
    newUser.Age,
    newUser.Password,
    newUser.role,
    newUser.profile_picture,
    newUser.last_profile_update
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal membuat users baru han' });
      return;
    }
    res.status(201).json({
      message: 'Users berhasil dibuat han. Cek ulang ya',
      id: result.insertId
    });
  });
});

// edit/ubah users berdasarkan id
router.put('/:id', (req, res) => {
  const idUser = req.params.id;
  const updatedUser = req.body;
  const query = `
    UPDATE users 
    SET Username = ?, Email = ?, Age = ?, Password = ?, role = ?, profile_picture = ?, last_profile_update = ? 
    WHERE id = ?
  `;
  const values = [
    updatedUser.Username,
    updatedUser.Email,
    updatedUser.Age,
    updatedUser.Password,
    updatedUser.role,
    updatedUser.profile_picture,
    updatedUser.last_profile_update,
    idUser
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal mengupdate users baru jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Users nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Users nya berhasil di update' });
  });
});

// menghapus users berdasarkan id
router.delete('/:id', (req, res) => {
  const idUser = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [idUser], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Gagal menghapus users jir' });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'ID Users nya gada kocak, coba cek lagi id nya' });
      return;
    }
    res.json({ message: 'Users nya berhasil di hapus' });
  });
});

export default router;