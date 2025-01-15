import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const router = express.Router();

const cookieJar = new tough.CookieJar();
const axiosInstance = wrapper(axios.create({ jar: cookieJar }));

function xUrl(originalUrl) {
  const baseUrl = 'https://spowload.com/spotify';
  const urlParts = originalUrl.split('/');
  const trackId = urlParts[urlParts.length - 1];
  return `${baseUrl}/track-${trackId}`;
}

function cleanUrl(url) {
  return url.replace(/\\\\/g, '/').replace(/\\/g, '');
}

async function downloadTrack(songUrl, coverImage, csrfToken) {
  const baseUrl = 'https://spowload.com';
  const url = `${baseUrl}/convert`;

  const requestData = {
    urls: cleanUrl(songUrl),
    cover: coverImage,
  };

  try {
    const response = await axiosInstance.post(url, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
    });

    if (response.data.error === false) {
      return response.data.url;
    } else {
      return { message: response.data.status || 'Gagal mengunduh track.' };
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return { message: error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Gagal mengunduh track.' };
  }
}

async function spotifydl(originalUrl) {
  const convertedUrl = xUrl(originalUrl);
  try {
    const response = await axiosInstance.get(convertedUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    const scripts = $('script');

    let urldata = null;
    let csrfToken = $('meta[name="csrf-token"]').attr('content');

    scripts.each((index, script) => {
      const scriptContent = $(script).html();
      const jsonMatch = scriptContent.match(/let urldata = "(.*?)";/);
      if (jsonMatch && jsonMatch[1]) {
        urldata = jsonMatch[1].replace(/\\\"/g, '"');
        return false;
      }
    });

    if (urldata) {
      const trackData = JSON.parse(urldata);
      const downloadUrl = await downloadTrack(
        trackData.external_urls.spotify,
        cleanUrl(trackData.album.images[0].url),
        csrfToken
      );

      if (downloadUrl.message) {
        return downloadUrl;
      }

      return {
        title: trackData.name,
        artist: trackData.artists[0].name,
        album: trackData.album.name,
        releaseDate: trackData.album.release_date,
        totalTracks: trackData.album.total_tracks,
        thumbnail: cleanUrl(trackData.album.images[0].url),
        popularity: trackData.popularity,
        music: downloadUrl,
      };
    } else {
      return { message: 'Data tidak ditemukan.' };
    }
  } catch (error) {
    console.error('Error:', error);
    return { message: error.response && error.response.data ? error.response.data.message || 'Gagal memproses URL Spotify.' : 'Gagal memproses URL Spotify.' };
  }
}

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      message: 'Parameter `url` harus diisi!',
    });
  }

  if (!url.includes('open.spotify.com')) {
    return res.status(400).json({
      message: 'URL tidak valid. Pastikan URL berasal dari open.spotify.com',
    });
  }

  try {
    const result = await spotifydl(url);
    if (result.message) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
