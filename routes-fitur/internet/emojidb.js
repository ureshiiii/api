import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

async function symbols(query) {
  try {
    if (!query.trim()) {
      return {
        query: query,
        total: 0,
        symbols: [],
        error: 'Permintaan tidak boleh kosong.',
      };
    }

    const response = await axios.get(
      `https://emojidb.org/${query
        .toLowerCase()
        .trim()
        .split(' ')
        .join('-')}-emojis`,
      {
        headers: {
          pragma: 'no-cache',
          priority: 'u=0, i',
          'sec-ch-ua':
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      }
    );

    const $ = cheerio.load(response.data);
    const emojis = $('div.emoji-list > div.emoji-ctn')
      .map((i, el) => $(el).find('div.emoji').text().trim())
      .get();

    if (!emojis.length) {
      return {
        query: query,
        total: 0,
        symbols: [],
        error: 'Tidak ada emoji yang ditemukan untuk permintaan ini.',
      };
    }

    const limitedEmojis = emojis.slice(0, 100);

    const formattedEmojis = limitedEmojis.map(
      (emoji, index) => `${index + 1}. ${emoji}`
    );

    return {
      query: query,
      total: limitedEmojis.length,
      symbols: formattedEmojis,
    };
  } catch (error) {
    console.error('Gagal mengambil emoji:', error);
    return {
      query: query,
      total: 0,
      symbols: [],
      error: 'Gagal mengambil emoji dari situs web.',
    };
  }
}

router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await symbols(query);

    if (result.error) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Kesalahan:', error);
    res.status(500).json({
      query: req.query.query,
      total: 0,
      symbols: [],
      error: 'Terjadi kesalahan saat memproses permintaan.',
    });
  }
});

export default router;
