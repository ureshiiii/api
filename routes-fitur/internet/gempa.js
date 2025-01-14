import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const link = 'https://data.bmkg.go.id/DataMKG/TEWS/';

router.get('/', async (req, res) => {
  try {
    const response = await fetch(link + 'autogempa.json');
    const data = await response.json();
    const gempa = data.Infogempa.gempa;

    const result = {
      data: {
        wilayah: gempa.Wilayah,
        tanggal: gempa.Tanggal,
        waktu: gempa.Jam,
        potensi: gempa.Potensi,
        magnitude: gempa.Magnitude,
        kedalaman: gempa.Kedalaman,
        koordinat: gempa.Coordinates,
        dirasakan: gempa.Dirasakan || null,
        shakemap: gempa.Shakemap ? link + gempa.Shakemap : null,
      }
    };

    if (gempa.Shakemap) {
      result.data.shakemap_url = link + gempa.Shakemap;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data dari BMKG, coba lagi nanti',
    });
  }
});

export default router;
