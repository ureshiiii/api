import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';

const router = express.Router();

async function getObatSearch(penyakit) {
  try {
    const { data } = await axios.get(`https://www.halodoc.com/obat-dan-vitamin/search/${penyakit}`);
    const $ = cheerio.load(data);
    const obatList = [];

    $('li.custom-container__list__container').each((index, element) => {
      const title = $(element).find('.hd-base-product-search-card__title').text().trim();
      const subtitle = $(element).find('.hd-base-product-search-card__subtitle').text().trim();
      const price = $(element).find('.hd-base-product-search-card__price').text().trim();
      const image = $(element).find('.hd-base-image-mapper__img').attr('src');
      const link = $(element).find('.hd-base-product-search-card__content a').attr('href');

      obatList.push({
        title,
        subtitle,
        price,
        image,
        link: `https://www.halodoc.com${link}`,
      });
    });

    return obatList;
  } catch (error) {
    console.error('Error fetching Halodoc obat:', error);
    return { message: 'Error fetching Halodoc obat' };
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
    const result = await getObatSearch(penyakit);
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