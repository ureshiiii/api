import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import uploadImage from '../../lib/uploadImage.js';

const router = express.Router();

async function jarak(dari, ke) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(`jarak ${dari} ke ${ke}`)}&hl=id`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const hasil = {};

    const img = html.split("var s=\'")?.[1]?.split("\'")?.[0];
    if (/^data:.*?\/.*?;base64,/i.test(img)) {
      const imageBuffer = Buffer.from(img.split`,`[1], 'base64');
      hasil.img = await uploadImage(imageBuffer);
    } else {
      const imgElement = $('g-img > img');
      const imgUrl = imgElement.attr('data-src');
      if (imgUrl) hasil.img = imgUrl;
    }

    hasil.desc = $('div.BNeawe.deIvCb.AP7Wnd').text()?.trim()

    return hasil;
  } catch (error) {
    console.error('Error saat mengambil/memproses data jarak:', error);
    throw new Error(`Gagal mengambil data jarak: ${error.message}`);
  }
}

router.get('/', async (req, res) => {
  const { dari, ke } = req.query;

  if (!dari || !ke) {
    return res.status(400).json({
      pesan: 'Parameter `dari` dan `ke` harus diisi!'
    });
  }

  try {
    const dataJarak = await jarak(dari, ke);
    res.status(200).json({
      data: dataJarak
    });
  } catch (error) {
    res.status(500).json({
      pesan: error.message
    });
  }
});

export default router;
