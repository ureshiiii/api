import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

async function searchNews(query) {
  try {
    const response = await axios.get('https://www.pssi.org/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.post-grid-item').each((index, element) => {
      const title = $(element).find('.post-title a').text().trim();
      const link = $(element).find('.post-title a').attr('href');
      const image = $(element).find('img').attr('src');
      const label = $(element).find('.label').text().trim();
      const date = $(element).find('.post-meta').text().trim();

      if (title.toLowerCase().includes(query.toLowerCase())) {
        results.push({ title, link, image, label, date });
      }
    });

    if (results.length === 0) {
        return {
          error: 'Tidak ada berita yang cocok ditemukan. Coba kata kunci lain.'
        };
      }

    return {
        data: results
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      error: 'Terjadi kesalahan saat memproses pencarian berita.'
    };
  }
}

router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: 'Parameter `query` harus diisi!'
    });
  }

  try {
    const data = await searchNews(query);

    if (data.error) {
        return res.status(404).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

export default router;
