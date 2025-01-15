import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';

const router = express.Router();

async function getAppleProducts(search) {
  try {
    const { data } = await axios.get(`https://www.apple.com/us/search/${search}?src=serp`);
    const $ = cheerio.load(data);

    const products = [];

    $('.rf-producttile').each((i, el) => {
      const name = $(el).find('.rf-producttile-name a').text().trim();
      const price = $(el).find('.rf-producttile-pricecurrent').text().trim();
      const link = $(el).find('.rf-producttile-name a').attr('href');
      const fullLink = link ? `https://www.apple.com${link}`: null;
      const colors = [];

      $(el).find('.rf-producttile-colorswatch img').each((j, colorEl) => {
        const color = $(colorEl).attr('alt') || 'No Colors';
        colors.push(color);
      });

      products.push({ name, price, link: fullLink, colors });
    });

    return products;
  } catch (error) {
    console.error('Error fetching Apple products:', error);
    return { message: 'Error fetching Apple products' };
  }
}

router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!search) {
    return res.status(400).json({
      message: 'Parameter `query` harus diisi!',
    });
  }

  try {
    const result = await getAppleProducts(search);
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