import express from 'express';
import connection from '../config/database.js';

const router = express.Router();

// Get payment by ID
router.get('/:storeId', (req, res) => {
  const storeId = req.params.storeId;

  if (!storeId) {
    return res.status(400).json({ message: 'Store ID harus diisi.' });
  }

  const query = `SELECT * FROM payment WHERE store_id = ?`;

  connection.query(query, [storeId], (err, results) => {
    if (err) {
      console.error('Error fetching payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal mengambil data payment.',
        error: err.message 
      });
    }
    res.status(200).json(results);
  });
});

// Add payment by ID
router.post('/:storeId', (req, res) => {
  const storeId = req.params.storeId;

  if (!storeId) {
    return res.status(400).json({ message: 'Store ID harus diisi.' });
  }

  const { eWallets, qris, bankAccounts } = req.body;

  const checkQuery = `SELECT id FROM payment WHERE store_id = ?`;
  connection.query(checkQuery, [storeId], (err, results) => {
    if (err) {
      console.error('Error checking payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal mengecek data payment.',
        error: err.message
      });
    }

    if (results.length > 0) {
      return res.status(400).json({ 
        message: 'Store sudah memiliki data payment.' 
      });
    }

    const paymentData = {
      store_id: storeId,
      eWallets: JSON.stringify(eWallets || {}),
      qris: JSON.stringify(qris || {}),
      bankAccounts: JSON.stringify(bankAccounts || {}),
    };

    const query = `INSERT INTO payment SET ?`;

    connection.query(query, paymentData, (err, result) => {
      if (err) {
        console.error('Error inserting payment data:', err);
        return res.status(500).json({ 
          message: 'Gagal menambahkan data payment.',
          error: err.message
        });
      }
      res.status(201).json({ 
        message: 'Data payment berhasil ditambahkan.',
        id: result.insertId
      });
    });
  });
});

// Update payment by ID
router.put('/:storeId/:id', (req, res) => {
  const storeId = req.params.storeId;
  const paymentId = req.params.id;

  if (!storeId) {
    return res.status(400).json({ message: 'Store ID harus diisi.' });
  }
  if (!paymentId) {
    return res.status(400).json({ message: 'Payment ID harus diisi.' });
  }

  const { eWallets, qris, bankAccounts } = req.body;

  const paymentData = {
    eWallets: JSON.stringify(eWallets || {}),
    qris: JSON.stringify(qris || {}),
    bankAccounts: JSON.stringify(bankAccounts || {}),
  };

  const query = `UPDATE payment SET ? WHERE id = ? AND store_id = ?`;

  connection.query(query, [paymentData, paymentId, storeId], (err, result) => {
    if (err) {
      console.error('Error updating payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal mengupdate data payment.',
        error: err.message
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

// Delete payment by ID
router.delete('/:storeId/:id', (req, res) => {
  const storeId = req.params.storeId;
  const paymentId = req.params.id;

  if (!storeId) {
    return res.status(400).json({ message: 'Store ID harus diisi.' });
  }
  if (!paymentId) {
    return res.status(400).json({ message: 'Payment ID harus diisi.' });
  }

  const query = `DELETE FROM payment WHERE id = ? AND store_id = ?`;

  connection.query(query, [paymentId, storeId], (err, result) => {
    if (err) {
      console.error('Error deleting payment data:', err);
      return res.status(500).json({ 
        message: 'Gagal menghapus data payment.',
        error: err.message
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
