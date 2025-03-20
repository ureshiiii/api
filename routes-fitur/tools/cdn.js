import express from 'express';
import crypto from 'crypto';
import db from '../../config/database.js';
import FileType from 'file-type';

const router = express.Router();

function generateSecureId(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length);
}

router.post('/upload', async (req, res) => {
  try {
    const { data, expired } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required.' });
    let fileBuffer;
    try {
      fileBuffer = Buffer.from(data, 'base64');
      if (!fileBuffer || !fileBuffer.length) return res.status(400).json({ error: 'Invalid base64 data.' });
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid base64 format.' });
    }
    let fileTypeResult = await FileType.fromBuffer(fileBuffer);
    if (!fileTypeResult) fileTypeResult = { mime: 'application/octet-stream', ext: 'bin' };
    const secureId = generateSecureId(10);
    const filename = `${secureId}.${fileTypeResult.ext}`;
    let expireAt = null;
    if (expired) {
      if (expired === 'permanen') {
        expireAt = null;
      } else {
        const expDate = new Date(expired);
        expireAt = isNaN(expDate.getTime()) ? new Date(Date.now() + 3600000) : expDate;
      }
    } else {
      expireAt = new Date(Date.now() + 3600000);
    }
    const insertQuery = `
      INSERT INTO cdn_files (secure_id, filename, file_type, data, expired_at, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.query(insertQuery, [
      secureId,
      filename,
      fileTypeResult.mime,
      fileBuffer,
      expireAt,
    ]);
    if (result.affectedRows !== 1) return res.status(500).json({ error: 'Failed to store file data.' });
    const fileUrl = `https://${req.get('host')}/cdn/${secureId}`;
    return res.status(201).json({ fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Error processing request.' });
  }
});

export default router;