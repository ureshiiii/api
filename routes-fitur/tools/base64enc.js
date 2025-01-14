import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({
      error: 'Parameter `text` harus diisi!'
    });
  }

  try {
    const encoded = Buffer.from(text, 'utf-8').toString('base64');
    res.status(200).json({
      data: encoded
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat mengenkripsi teks.'
    });
  }
});

export default router;
