import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', async (req, res) => {
  const { emoji1, emoji2 } = req.query;

  if (!emoji1 || !emoji2) {
    return res.status(400).json({
      error: 'Parameter `emoji1` dan `emoji2` harus diisi!'
    });
  }

  try {
    const apiRes = await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`)
    if (!apiRes.ok) {
        return res.status(500).json({
          error: `Gagal mengambil data dari Tenor: ${await apiRes.text()}`
        });
    }
    
    const json = await apiRes.json();
    if (!json.results || json.results.length === 0) {
      return res.status(404).json({
        error: 'Kombinasi emoji tidak ditemukan.'
      });
    }

    const imageUrl = json.results[0].url;

    res.status(200).json({
      data: imageUrl
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat memproses emoji, gunakan emoji lain.'
    });
  }
});

export default router;
