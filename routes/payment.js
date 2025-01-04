import express from 'express';
import connection from '../config/database.js';

const router = express.Router();

// Get all store data by id
router.get('/:storeId', (req, res) => {
  const storeId = req.params.storeId;
  const query = `SELECT * FROM payment WHERE storeId = ?`;

  connection.query(query, [storeId], (err, results) => {
    if (err) {
      console.error('Error fetching payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal mengambil data payment.' 
      });
    }
    res.status(200).json(results);
  });
});

// Add new payment info
router.post('/', (req, res) => {
  const {
    storeId,
    eWallets, 
    qris, 
    bankAccounts, 
  } = req.body;

  if (!storeId) {
    return res.status(400).json({ message: 'Store ID harus diisi.' });
  }

  const paymentData = {
    storeId,
    eWallets: JSON.stringify(eWallets || {}),
    qris: JSON.stringify(qris || {}),
    bankAccounts: JSON.stringify(bankAccounts || {}),
  };

  const query = `INSERT INTO payment SET ?`;

  connection.query(query, paymentData, (err, result) => {
    if (err) {
      console.error('Error inserting payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal menambahkan data payment.' 
      });
    }
    res.status(201).json({ 
      message: 'Data payment berhasil ditambahkan.',
      id: result.insertId
    });
  });
});

// Update data payment by ID
router.put('/:id', (req, res) => {
  const paymentId = req.params.id;
  const {
    storeId,
    eWallets,
    qris,
    bankAccounts,
  } = req.body;

  if (!storeId) {
    return res.status(400).json({ message: 'Store ID harus diisi.' });
  }

  const paymentData = {
    storeId,
    eWallets: JSON.stringify(eWallets || {}),
    qris: JSON.stringify(qris || {}),
    bankAccounts: JSON.stringify(bankAccounts || {}),
  };

  const query = `UPDATE payment SET ? WHERE id = ?`;

  connection.query(query, [paymentData, paymentId], (err, result) => {
    if (err) {
      console.error('Error updating payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal mengupdate data payment.' 
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Data payment tidak ditemukan.' 
      });
    }
    res.status(200).json({ 
      message: 'Data payment berhasil diupdate.' 
    });
  });
});

// Delete data payment by ID
router.delete('/:id', (req, res) => {
  const paymentId = req.params.id;
  const query = `DELETE FROM payment WHERE id = ?`;

  connection.query(query, [paymentId], (err, result) => {
    if (err) {
      console.error('Error deleting payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal menghapus data payment.' 
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Data payment tidak ditemukan.' 
      });
    }
    res.status(200).json({ 
      message: 'Data payment berhasil dihapus.' 
    });
  });
});

export default router;
