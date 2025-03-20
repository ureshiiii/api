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

function isValidCustomId(id) {
  const regex = /^[A-Za-z0-9_-]+$/;
  return regex.test(id);
}

router.get('/', async (req, res) => {
  try {
    const { url, customId } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Parameter `url` diperlukan.' });
    }
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'URL tidak valid.' });
    }
    let shortId;
    if (customId) {
      if (!isValidCustomId(customId)) {
        return res.status(400).json({ error: 'Custom ID hanya boleh berisi huruf, angka, strip (-) dan garis bawah (_).' });
      }
      const [rows] = await db.query('SELECT 1 FROM urls WHERE short_id = ?', [customId]);
      if (rows.length > 0) {
        return res.status(400).json({ error: 'Custom ID sudah digunakan. Silakan coba dengan ID yang lain.' });
      }
      shortId = customId;
    } else {
      let maxAttempts = 5;
      let isDuplicate = true;
      while (isDuplicate && maxAttempts > 0) {
        shortId = generateSecureId(7);
        const [rows] = await db.query('SELECT 1 FROM urls WHERE short_id = ?', [shortId]);
        isDuplicate = rows.length > 0;
        maxAttempts--;
      }
      if (isDuplicate) {
        return res.status(500).json({ error: 'Gagal menghasilkan URL pendek unik. Silakan coba lagi.' });
      }
    }
    const shortUrl = `https://${req.get('host')}/u/${shortId}`;
    const [result] = await db.query('INSERT INTO urls (short_id, original_url) VALUES (?, ?)', [shortId, url]);
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