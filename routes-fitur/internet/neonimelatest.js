import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';

const router = express.Router();

async function neonimeLatest() {
    try {
        const { data } = await axios.get('https://neonime.me/');
        const $ = cheerio.load(data);
        
        const animeList = [];

        $('.item.episode-home').each((index, element) => {
            const title = $(element).find('.tt.title-episode').text();
            const url = $(element).find('a').attr('href');
            const image = $(element).find('img').attr('data-src');
            const episodeTitle = $(element).find('.tt').text();
            const description = $(element).find('.ttx').text();
            const episodeNumber = $(element).find('.fixyear h2.text-center').text();

            animeList.push({
                title,
                url,
                image,
                episodeTitle,
                description,
                episodeNumber
            });
        });

        return JSON.stringify(animeList, null, 2);
    } catch (error) {
        return error.message;
    }
}

router.get('/', async (req, res) => {
  try {
    const result = await neonimeLatest();
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
