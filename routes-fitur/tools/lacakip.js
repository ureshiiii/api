import express from 'express';
import axios from 'axios';

const router = express.Router();

async function lacakCuy(ip) {
  try {
    const res = await axios.get(`https://ipwho.is/${ip}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw new Error('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
  }
}

router.get('/', async (req, res) => {
  const { ip } = req.query;

  if (!ip) {
    return res.status(400).json({
      error: 'Parameter `ip` harus diisi!'
    });
  }

  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    return res.status(400).json({
      error: 'Format ip harus dengan titik ( . ), Contoh: 192.832.8372'
    });
  }

  try {
    const data = await lacakCuy(ip);

    res.status(200).json({
      data: {
        ip: data.ip,
        type: data.type,
        continent: data.continent,
        continent_code: data.continent_code,
        country: data.country,
        country_code: data.country_code,
        region: data.region,
        region_code: data.region_code,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        is_eu: data.is_eu,
        postal: data.postal,
        calling_code: data.calling_code,
        capital: data.capital,
        borders: data.borders,
        flag: data.flag,
        connection: {
          asn: data.connection.asn,
          org: data.connection.org,
          isp: data.connection.isp,
          domain: data.connection.domain,
        },
        timezone: {
          id: data.timezone.id,
          abbr: data.timezone.abbr,
          is_dst: data.timezone.is_dst,
          offset: data.timezone.offset,
          utc: data.timezone.utc,
          current_time: data.timezone.current_time,
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
