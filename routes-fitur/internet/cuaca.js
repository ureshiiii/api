import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', async (req, res) => {
  const { kota } = req.query;

  if (!kota) {
    return res.status(400).json({
      error: 'Parameter `kota` harus diisi!'
    });
  }

  try {
    const apiRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${kota}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);

    if (!apiRes.ok) {
      return res.status(404).json({
        error: 'Lokasi tidak ditemukan'
      });
    }

    const json = await apiRes.json();

    if (json.cod !== 200) {
        return res.status(500).json({
            error: 'Gagal mendapatkan data cuaca',
            message: json
        });
    }

    const result = {
        data: {
            cuaca: json.weather[0].description,
            kelembapan: json.main.humidity,
            angin: json.wind.speed,
            suhu_saat_ini: json.main.temp,
            suhu_tertinggi: json.main.temp_max,
            suhu_terendah: json.main.temp_min,
            lokasi: json.name,
            negara: json.sys.country
        }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat memproses permintaan.'
    });
  }
});

export default router;
