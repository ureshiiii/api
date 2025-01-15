import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';

const router = express.Router();

async function getJktNews() {
  try {
    let { data } = await axios.get(`https://jkt48.com/news/list?lang=id`); // Langsung menggunakan 'id'
    let $ = cheerio.load(data);

    const news = [];

    $('.entry-news__list li').each((index, element) => {
      const title = $(element).find('h3 a').text().trim();
      const link = $(element).find('h3 a').attr('href');
      const date = $(element).find('time').text().trim();

      news.push({ title, link: 'https://jkt48.com' + link, date });
    });

    return news;
  } catch (error) {
    console.error('Error fetching JKT48 news:', error);
    return { message: 'Error fetching JKT48 news' };
  }
}

router.get('/', async (req, res) => {
  try {
    const result = await getJktNews();
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
