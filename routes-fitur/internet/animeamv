import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';

const router = express.Router();

async function animeVideo() {
  try {
    const url = 'https://shortstatusvideos.com/anime-video-status-download/';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const videos = [];

    $('a.mks_button.mks_button_small.squared').each((_, element) => {
      const href = $(element).attr('href');
      const title = $(element).closest('p').prevAll('p').find('strong').text().trim();
      videos.push({ title, source: href });
    });

    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
  } catch (error) {
    console.error('Error fetching anime video (animeVideo):', error);
    return { message: 'Error fetching anime video' };
  }
}

async function animeVideo2() {
  try {
    const url = 'https://mobstatus.com/anime-whatsapp-status-video/';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const videos = [];

    const title = $('strong').first().text().trim(); // Ambil <strong> pertama
    $('a.mb-button.mb-style-glass.mb-size-tiny.mb-corners-pill.mb-text-style-heavy').each((_, element) => {
      const href = $(element).attr('href');
      videos.push({ title, source: href });
    });

    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
  } catch (error) {
    console.error('Error fetching anime video (animeVideo2):', error);
    return { message: 'Error fetching anime video' };
  }
}

router.get('/', async (req, res) => {
  const { source } = req.query;

  try {
    let result;
    if (source === '1') {
      result = await animeVideo();
    } else if (source === '2') {
      result = await animeVideo2();
    } else {
      return res.status(400).json({ message: 'Pilihan tidak valid. Masukan angka 1 atau 2' });
    }

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
