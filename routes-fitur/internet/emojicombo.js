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
    const { data } = await axios.get(`https://emojicombos.com/${encodedQuery}`);
    const $ = cheerio.load(data);
    const result = [];
    $(".combo-ctn").each((index, element) => {
      const combo = $(element).attr("data-combo");
      if (combo && result.length < 10) {
        result.push(combo); 
      }
    });

    if (!result.length) {
      return {
        symbols: [],
        error: 'Tidak ada kombinasi emoji yang ditemukan untuk permintaan ini.',
      };
    }

    return {
      symbols: result,
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
