import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

async function getEmojiSymbols(query) {
  try {
    if (!query.trim()) {
      return {
        symbols: [],
        error: 'Permintaan tidak boleh kosong.',
      };
    }

    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(
      `https://emojicombos.com/search/${encodedQuery}`,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      }
    );

    const $ = cheerio.load(response.data);
    const symbols = [];

    $('div.main > div.mt-4 > div.grid > div.relative').each(
      (index, element) => {
        const symbolText = $(element).find('a > h2').text().trim();
        if (symbolText && symbols.length < 10) {
          symbols.push(symbolText);
        }
      }
    );

    if (!symbols.length) {
      return {
        symbols: [],
        error: 'Tidak ada kombinasi emoji yang ditemukan untuk permintaan ini.',
      };
    }

    return {
      symbols: symbols,
    };
  } catch (error) {
    console.error('Gagal mengambil kombinasi emoji:', error);
    return {
      symbols: [],
      error: 'Gagal mengambil kombinasi emoji dari situs web.',
    };
  }
}

router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await getEmojiSymbols(query);

    if (result.error) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Kesalahan:', error);
    res.status(500).json({
      symbols: [],
      error: 'Terjadi kesalahan saat memproses permintaan.',
    });
  }
});

export default router;
