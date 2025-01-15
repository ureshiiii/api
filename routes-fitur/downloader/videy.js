import axios from 'axios';
import express from 'express';

const router = express.Router();

async function getVideyVideo(url) {
  try {
    const isVide = (url) => url.includes('videy.co') || url.includes('videy');
    if (!isVide(url)) {
      return { message: 'Ups, masukan URL Videy yang valid' };
    }

    const link = url.replace("v?id=", "").replace("https://", "https://cdn.");
    const videoUrl = link + ".mp4";

    const response = await axios.head(videoUrl);
    if (response.status === 200) {
      return { video: videoUrl };
    } else {
      return { message: 'Tidak dapat mengunduh video dari URL yang diberikan.' };
    }
  } catch (error) {
    console.error('Error:', error);
    return { message: 'Terjadi kesalahan saat memproses permintaan.' };
  }
}

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      message: 'Parameter `url` harus diisi!',
    });
  }

  try {
    const result = await getVideyVideo(url);
    if (result.message) {
      res.status(400).json(result);
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
