import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

async function alightScrape(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://alight.link',
      },
    });

    const $ = cheerio.load(response.data);
    const title = $('meta[property="og:title"]').attr('content') || 'Tidak ditemukan';
    const description = $('meta[property="og:description"]').attr('content') || 'Tidak ditemukan';
    return {
      title,
      description,
    };
  } catch (error) {
    throw new Error('Gagal mengambil data dari URL Alight Motion.');
  }
}

router.get('/', async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({
      error: 'Parameter `link` harus diisi!'
    });
  }

  if (!(link.includes('http://') || link.includes('https://'))) {
    return res.status(400).json({
      error: 'URL harus diawali dengan `https://` atau `http://`'
    });
  }

  if (!(link.includes('alight.link') || link.includes('alightcreative.com'))) {
    return res.status(400).json({
      error: 'URL harus merupakan URL Alight Motion yang valid.'
    });
  }

  try {
    const result = await alightScrape(link);
    res.status(200).json({
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
