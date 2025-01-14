import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const apiKey = 'VxxFjtUSju0FF6y9MZtBdEbOg6FeysaE69xoW3Rn';

router.get('/', async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const randomDate = new Date(
      startDate.getTime() +
        Math.random() * (new Date().getTime() - startDate.getTime())
    );
    const formattedDate = randomDate.toISOString().split('T')[0];

    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${formattedDate}`
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    res.status(200).json({
      data: {
        title: result.title,
        date: result.date,
        explanation: result.explanation,
        imgHd: result.hdurl,
        imgSd: result.url,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message:
        'Maaf, terjadi kesalahan saat mengambil gambar. Silakan coba lagi nanti.',
    });
  }
});

export default router;
