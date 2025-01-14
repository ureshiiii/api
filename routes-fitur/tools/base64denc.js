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
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    res.status(200).json({
      data: decoded
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat mendekripsi teks.'
    });
  }
});

export default router;
