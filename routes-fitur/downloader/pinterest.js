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
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ message: 'Parameter "url" harus diisi!' });
  }

  const pinRegex = /^https?:\/\/(?:www\.)?pinterest\.com\/pin\/[\w.-]+/;
  if (!pinRegex.test(url)) {
    return res.status(400).json({ message: 'Link bukan merupakan URL Pinterest yang valid.' });
  }

  try {
    const pinId = url.split('/pin/')[1].split('/')[0];
    const cookies = await getCookies();
    if (!cookies) {
      return res.status(400).json({ message: 'Gagal mengambil cookies Pinterest.' });
    }

    const params = {
      source_url: `/pin/${pinId}/`,
      data: JSON.stringify({
        options: {
          field_set_key: "detailed",
          id: pinId,
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
      'x-pinterest-source-url': `/pin/${pinId}/`,
      'x-requested-with': 'XMLHttpRequest',
      'cookie': cookies
    };

    const response = await axios.get(`https://www.pinterest.com/resource/PinResource/get/`, {
      headers,
      params
    });

    const data = response.data;
    if (!data.resource_response.data) {
      return res.status(404).json({ message: 'Pin tidak ditemukan atau sudah tidak tersedia.' });
    }

    const pd = data.resource_response.data;
    const mediaUrls = [];

    if (pd.videos) {
      const videoFormats = Object.values(pd.videos.video_list).sort((a, b) => b.width - a.width);
      videoFormats.forEach(video => {
        mediaUrls.push({
          type: 'video',
          quality: `${video.width}x${video.height}`,
          width: video.width,
          height: video.height,
          duration: pd.videos.duration || null,
          url: video.url,
          file_size: video.file_size || null,
          thumbnail: pd.images.orig.url
        });
      });
    }

    if (pd.images) {
      const images = {
        original: pd.images.orig,
        large: pd.images['736x'],
        medium: pd.images['474x'],
        small: pd.images['236x'],
        thumbnail: pd.images['170x']
      };

      for (const [quality, image] of Object.entries(images)) {
        if (image) {
          mediaUrls.push({
            type: 'image',
            quality,
            width: image.width,
            height: image.height,
            url: image.url,
            size: `${image.width}x${image.height}`
          });
        }
      }
    }

    if (mediaUrls.length === 0) {
      return res.status(404).json({ message: 'Media tidak ditemukan pada pin yang diberikan.' });
    }

    return res.status(200).json({
      id: pd.id,
      title: pd.title || pd.grid_title || "",
      description: pd.description || "",
      created_at: pd.created_at,
      media_urls: mediaUrls,
      statistics: {
        saves: pd.repin_count || 0,
        comments: pd.comment_count || 0,
        reactions: pd.reaction_counts || {},
        total_reactions: pd.total_reaction_count || 0,
        views: pd.view_count || 0
      }
    });
  } catch (error) {
    console.error('Error downloading pin:', error);
    return res.status(error.response?.status || 500)
              .json({ message: 'Terjadi kesalahan pada server, silahkan coba lagi nanti.' });
  }
});

export default router;
