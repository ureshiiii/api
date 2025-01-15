import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';

const router = express.Router();

async function getArtikelSearch(penyakit) {
  try {
    const { data } = await axios.get(`https://www.halodoc.com/artikel/search/${penyakit}`);
    const $ = cheerio.load(data);
    const articles = [];

    $('magneto-card').each((index, element) => {
      const title = $(element).find('header a').text().trim();
      const description = $(element).find('.description').text().trim();
      const link = $(element).find('header a').attr('href');
      const image = $(element).find('picture img').attr('src');

      articles.push({
        title,
        description,
        link: `https://www.halodoc.com${link}`,
        image,
      });
    });

    return articles;
  } catch (error) {
    console.error('Error fetching Halodoc articles:', error);
    return { message: 'Error fetching Halodoc articles' };
  }
}

router.get('/', async (req, res) => {
  const { penyakit } = req.query;

  if (!penyakit) {
    return res.status(400).json({
      message: 'Parameter `penyakit` harus diisi!',
    });
  }

  try {
    const result = await getArtikelSearch(penyakit);
    if (result.message) {
      res.status(500).json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memproses permintaan.',
    });
  }
});

export default router;