import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

const base_url = "https://fruityblox.com";
const base_header = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ms;q=0.6",
  "Cache-Control": "no-cache",
  Cookie: "_ga_F55Y1PYQ4M=GS1.1.1735536080.1.1.1735537683.0.0.0",
  Pragma: "no-cache",
  Priority: "u=0, i",
  "Sec-CH-UA": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

async function getStock() {
  try {
    const r = await axios.get(`${base_url}/stock`, {
      headers: {
        ...base_header,
      },
    });
    const $ = cheerio.load(r.data);
    const c = $('div.col-span-full div[class="grid grid-cols-1 lg:grid-cols-2 gap-4"]').children("div");
    const d = {
      normal: c
        .eq(0)
        .children("div")
        .map((i, el) => ({
          name: $(el).find("img").attr("alt").toUpperCase(),
          image: $(el).find("img").attr("src"),
          price: $(el)
            .find("p")
            .map((i, el) => $(el).text().trim())
            .get(),
          link: base_url + $(el).find("a").attr("href"),
        }))
        .get(),
      mirage: c
        .eq(1)
        .children("div")
        .map((i, el) => ({
          name: $(el).find("img").attr("alt").toUpperCase(),
          image: $(el).find("img").attr("src"),
          price: $(el)
            .find("p")
            .map((i, el) => $(el).text().trim())
            .get(),
          link: base_url + $(el).find("a").attr("href"),
        }))
        .get(),
    };

    return {
      data: d
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      error: 'Terjadi kesalahan saat mengambil data stock Blox Fruit.'
    };
  }
}

router.get('/', async (req, res) => {
  try {
    const data = await getStock();

    if (data.error) {
        return res.status(500).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

export default router;
