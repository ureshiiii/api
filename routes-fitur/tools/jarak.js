import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import uploadImage from '../../lib/uploadImage.js';

const router = express.Router();

async function jarak(dari, ke) {
	var html = (await axios(`https://www.google.com/search?q=${encodeURIComponent('jarak ' + dari + ' ke ' + ke)}&hl=id`)).data
	var $ = cheerio.load(html), obj = {}
	const img = html.split("var s=\'")?.[1]?.split("\'")?.[0];
	if (/^data:.*?\/.*?;base64,/i.test(img)) {
      const imageBuffer = Buffer.from(img.split`,`[1], 'base64');
      obj.img = await uploadImage(imageBuffer);
    } else {
      const imgElement = $('g-img > img');
      const imgUrl = imgElement.attr('data-src');
      if (imgUrl) obj.img = imgUrl;
    }
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
        jarak: data.desc,
      }
    });
  } catch (error) {
    res.status(500).json({
      pesan: error.message
    });
  }
});

export default router;
