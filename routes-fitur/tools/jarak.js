import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { uploadImage } from '../../lib/uploadImage.js';

const router = express.Router();

async function hitungJarak(dari, ke) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(`jarak ${dari} ke ${ke}`)}&hl=id`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);

    const hasil = {
      jarak: $('div.BNeawe.deIvCb.AP7Wnd').first().text().trim(),
      waktu_tempuh: $('div.BNeawe.deIvCb.AP7Wnd').eq(1).text().trim(),
      rute: $('div.BNeawe.uEec3.AP7Wnd').text().trim(),
      img: null
    };

    const imgElement = $('g-img > img');
    if (imgElement.length) {
        const base64Img = imgElement.attr('src');
        if (base64Img && /^data:image\/(png|jpe?g);base64,/i.test(base64Img)) {
            const imageBuffer = Buffer.from(base64Img.split(',')[1], 'base64');
            hasil.img = await uploadImage(imageBuffer);
        } else {
            const imgUrl = imgElement.attr('data-src');
            if (imgUrl) hasil.img = imgUrl;
        }
    }

    if (!hasil.jarak) {
        throw new Error("Tidak dapat menemukan informasi jarak.");
    }

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
    const dataJarak = await hitungJarak(dari, ke);
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
