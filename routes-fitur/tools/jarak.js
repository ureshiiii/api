import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import uploadImage from '../../lib/uploadImage.js';

const router = express.Router();

async function jarak(dari, ke) {
	var html = (await axios(`https://www.google.com/search?q=${encodeURIComponent('jarak ' + dari + ' ke ' + ke)}&hl=id`)).data
	var $ = cheerio.load(html), obj = {}
	var img = html.split("var s=\'")?.[1]?.split("\'")?.[0]
	obj.img = /^data:.*?\/.*?;base64,/i.test(img) ? Buffer.from(img.split`,` [1], 'base64') : ''
	obj.desc = $('div.BNeawe.deIvCb.AP7Wnd').text()?.trim()
	return obj
}

router.get('/', async (req, res) => {
  const { dari, ke } = req.query;

  if (!dari || !ke) {
    return res.status(400).json({
      pesan: 'Parameter `dari` dan `ke` harus diisi!'
    });
  }

  try {
    const data = await jarak(dari, ke);
    res.status(200).json({
      data: {
        img: data.img,
        jarak: data.desc.trim(),
      }
    });
  } catch (error) {
    res.status(500).json({
      pesan: error.message
    });
  }
});

export default router;
