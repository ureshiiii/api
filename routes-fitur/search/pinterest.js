import axios from 'axios';
import express from 'express';

const router = express.Router();

async function getCookies() {
  try {
    const response = await axios.get('https://www.pinterest.com');
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      return setCookies.map(cookie => cookie.split(';')[0]).join('; ');
    }
    return null;
  } catch (error) {
    console.error('Error getting cookies:', error);
    return null;
  }
}

router.get('/', async (req, res) => {
  const { query, limit } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Parameter "query" harus diisi!' });
  }
  const pageSize = limit ? parseInt(limit) : 10;

  try {
    const cookies = await getCookies();
    if (!cookies) {
      return res.status(400).json({ message: 'Gagal mengambil cookies Pinterest.' });
    }

    const params = {
      source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
      data: JSON.stringify({
        options: {
          isPrefetch: false,
          query: query,
          scope: 'pins',
          bookmarks: [''],
          no_fetch_context_on_resource: false,
          page_size: pageSize
        },
        context: {}
      }),
      _: Date.now()
    };

    const headers = {
      'accept': 'application/json, text/javascript, */*, q=0.01',
      'referer': 'https://www.pinterest.com/',
      'user-agent': 'Postify/1.0.0',
      'x-app-version': 'a9522f',
      'x-pinterest-appstate': 'active',
      'x-pinterest-pws-handler': 'www/[username]/[slug].js',
      'x-pinterest-source-url': `/search/pins/?q=${encodeURIComponent(query)}`,
      'x-requested-with': 'XMLHttpRequest',
      'cookie': cookies
    };

    const response = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/`, {
      headers,
      params
    });

    const data = response.data;
    const results = data.resource_response.data.results.filter(v => v.images && v.images.orig);
    const pins = results.map(result => ({
      id: result.id,
      title: result.title || "",
      description: result.description,
      pin_url: `https://pinterest.com/pin/${result.id}`,
      media: {
        images: {
          orig: result.images.orig,
          small: result.images['236x'],
          medium: result.images['474x'],
          large: result.images['736x']
        },
        video: result.videos ? {
          video_list: result.videos.video_list,
          duration: result.videos.duration,
          video_url: result.videos.video_url
        } : null
      },
      uploader: {
        username: result.pinner.username,
        full_name: result.pinner.full_name,
        profile_url: `https://pinterest.com/${result.pinner.username}`
      }
    }));

    if (pins.length === 0) {
      return res.status(404).json({ message: `Tidak ditemukan hasil untuk query "${query}"` });
    }

    return res.status(200).json({
      query,
      total: pins.length,
      pins
    });
  } catch (error) {
    console.error('Error searching pins:', error);
    return res.status(error.response?.status || 500)
      .json({ message: "Server error, silahkan coba lagi nanti." });
  }
});

export default router;