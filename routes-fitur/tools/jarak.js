import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import uploadImage from '../../lib/uploadImage.js';

const router = express.Router();

async function jarak(dari, ke) {
  try {
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent('jarak ' + dari + ' ke ' + ke)}&hl=id`);
    const html = response.data;
    const $ = cheerio.load(html);
    let obj = {};
    const img = html.split("var s=\'")?.[1]?.split("\'")?.[0];
    if (/^data:.*?\/.*?;base64,/i.test(img)) {
        const base64Data = img.split(`,`)[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const imageUrl = await uploadImage(imageBuffer);
        obj.img = imageUrl;
    }
    obj.desc = $('div.BNeawe.deIvCb.AP7Wnd').text()?.trim();
    return obj;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Gagal mengambil data jarak.');
  }
}

router.get('/', async (req, res) => {
  const { dari, ke } = req.query;

  if (!dari || !ke) {
    return res.status(400).json({
      error: 'Parameter `dari` dan `ke` harus diisi!'
    });
  }

  try {
    const data = await jarak(dari, ke);
    res.status(200).json({
      data: data
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
