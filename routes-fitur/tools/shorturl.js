import express from 'express';
import crypto from 'crypto';
import db from '../../config/database.js';

const router = express.Router();

function generateSecureId(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

router.get('/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Parameter `url` diperlukan.' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'URL tidak valid.' });
    }

    let shortId;
    let maxAttempts = 5;
    let isDuplicate = true;

    while (isDuplicate && maxAttempts > 0) {
      shortId = generateSecureId(7);

      const [rows] = await db.query(
        'SELECT 1 FROM urls WHERE short_id = ?',
        [shortId]
      );

      isDuplicate = rows.length > 0;
      maxAttempts--;
    }

    if (isDuplicate) {
      return res.status(500).json({ error: 'Gagal menghasilkan URL pendek unik. Silakan coba lagi.' });
    }

    const shortUrl = `https://${req.get('host')}/u/${shortId}`;

    const [result] = await db.query(
      'INSERT INTO urls (short_id, original_url) VALUES (?, ?)',
      [shortId, url]
    );

    if (result.affectedRows === 1) {
      res.status(201).json({ shortUrl });
    } else {
      throw new Error('Gagal menyimpan URL ke database.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses URL.' });
  }
});

export default router;
