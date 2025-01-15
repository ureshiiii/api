import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/', async (req, res) => {
  const { query } = req.query;
  const link = `https://www.tvonenews.com/cari?q=${query}`;

  if (!query) {
    return res.status(400).json({
      message: 'Parameter `query` harus diisi!',
    });
  }

  try {
    const ress = await axios.get(link);
    const $ = cheerio.load(ress.data);
    let data = [];

    $('div.article-list-info.content_center').each((i, el) => {
      const title = $(el).find('h2').text().trim();
      const link = $(el).find('a').attr('href');
      const time = $(el).find('li.ali-date.content_center').text().trim();
      const desc = $(el).find('div.ali-desc').text().trim();

      if (title && time && link && desc) {
        data.push({
          title: title,
          url: link,
          waktu: time,
          description: desc
        });
      }
    });

    res.status(200).json({
      data: data
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: `Gagal mengambil data berita dari TV One dengan kata kunci: ${query}, coba lagi nanti`,
    });
  }
});

export default router;