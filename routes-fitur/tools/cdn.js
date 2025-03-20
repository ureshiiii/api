import express from 'express';
import db from '../../config/database.js';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';

const router = express.Router();

function generateSecureId(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

router.use(express.json({ limit: '50mb' }));

router.post('/', async (req, res) => {
  try {
    const { data, expired } = req.body;
    if (!data) return res.status(400).json({ error: 'Data yang ingin di upload tidak ditemukan' });
    
    const fileBuffer = Buffer.from(data, 'base64');
    const fileType = await fileTypeFromBuffer(fileBuffer) || { mime: 'application/octet-stream', ext: 'bin' };
    const secureId = generateSecureId(10);
    const filename = `${secureId}.${fileType.ext}`;

    let expireAt;
    if (expired && expired.toLowerCase() === 'permanen') {
      expireAt = null;
    } else if (expired) {
      const match = expired.match(/^(\d+)(h|d)$/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === 'h' && value >= 1 && value <= 24) {
          expireAt = new Date(Date.now() + value * 3600000);
        } else if (unit === 'd' && value >= 1 && value <= 30) {
          expireAt = new Date(Date.now() + value * 86400000);
        } else {
          return res.status(400).json({ error: 'Input expired tidak valid. Gunakan format "1-24h" atau "1-30d", atau "permanen".' });
        }
      } else {
        return res.status(400).json({ error: 'Input expired tidak valid. Gunakan format "1-24h" atau "1-30d", atau "permanen".' });
      }
    } else {
      expireAt = new Date(Date.now() + 3600000);
    }

    await db.query(
      'INSERT INTO cdn_files (secure_id, filename, file_type, data, expired_at, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [secureId, filename, fileType.mime, fileBuffer, expireAt]
    );

    const fileUrl = `https://${req.get('host')}/cdn/${secureId}`;
    res.status(201).json({ fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing request.' });
  }
});

export default router;
