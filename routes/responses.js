import express from 'express';
import db from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
          SUM(CASE WHEN response = 'Puas' THEN 1 ELSE 0 END) as total_puas,
          SUM(CASE WHEN response = 'Tidak Puas' THEN 1 ELSE 0 END) as total_tidak_puas,
          COUNT(*) as total_suara
      FROM responses
    `;
    const [results] = await db.query(query);
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil hasil survey.' });
  }
});

export default router;