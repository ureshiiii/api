import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';

const router = express.Router();

async function latestTourMobileLegends() {
    try {
        const { data } = await axios.get('https://infotourney.com/tournament/mobile-legends');
        const $ = cheerio.load(data);
        const tournaments = [];

        $('.items-row .item').each((index, element) => {
            const title = $(element).find('h2 a').text();
            const url = "https://infotourney.com" + $(element).find('h2 a').attr('href');
            const image = "https://infotourney.com" + $(element).find('img').attr('src');
            const startDate = $(element).find('.published time').attr('datetime');
            const startDateText = $(element).find('.published').text().trim();
            const registrationEndDateText = $(element).find('p').last().text().trim();
            const description = $(element).find('p').eq(1).text().trim();
            
            const tags = [];
            $(element).find('.tags a').each((i, tagElement) => {
                tags.push($(tagElement).text());
            });

            tournaments.push({
                title,
                url,
                image,
                startDate,
                startDateText,
                registrationEndDateText,
                description,
                tags
            });
        });

        return tournaments
    } catch (error) {
        return error.message;
    }
}

router.get('/', async (req, res) => {
  try {
    const result = await latestTourMobileLegends();
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
