import express from 'express';
import db from '../../config/database.js';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';

const router = express.Router();

function generateSecureId(length) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

router.post('/', async (req, res) => {
  try {
    const { data, expired } = req.body;
    if (!data) return res.status(400).json({ error: 'Data yang ingin di upload tidak di temukan' });

    const fileBuffer = Buffer.from(data, 'base64');
    const fileType = await fileTypeFromBuffer(fileBuffer) || { mime: 'application/octet-stream', ext: 'bin' };
    const secureId = generateSecureId(10);
    const filename = `${secureId}.${fileType.ext}`;

    let expireAt = null;
    if (expired === 'permanen') {
      expireAt = null;
    } else if (expired) {
      const expDate = new Date(expired);
      expireAt = isNaN(expDate) ? new Date(Date.now() + 3600000) : expDate;
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
