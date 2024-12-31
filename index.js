import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import os from 'os';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

import buttonRoutes from './routes/buttons.js';
import donorDataRoutes from './routes/donorData.js';
import kategoriRoutes from './routes/kategori.js';
import layananRoutes from './routes/layanan.js';
import produkRoutes from './routes/produk.js';
import responsesRoutes from './routes/responses.js';
import usersRoutes from './routes/users.js';
import storeRoutes from './routes/store.js';
import liststoreRoutes from './routes/liststore.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.json({ 
      error: "TooManyRequests", 
      message: "Anda telah mengirimkan terlalu banyak permintaan. Silakan coba lagi nanti." 
    });
  }
});
app.use(limiter);

const apiKeyMiddleware = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.json({ error: 'MissingApiKey', message: 'API Key tidak ditemukan dalam header request.' });
    }

    if (apiKey !== validApiKey) {
      return res.json({ error: 'InvalidApiKey', message: 'API Key tidak valid.' });
    } 

    next();

  } catch (error) {
    console.error("Error saat validasi API Key:", error);
    res.json({ error: 'ApiKeyValidationFailed', message: 'Terjadi kesalahan saat validasi API Key.' });
  }
};

const allowedOrigins = [
  'www.ureshii.my.id', 
  'ureshii.my.id', 
  'api.ureshii.my.id', 
  'list-store.ureshii.my.id'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || req.method === 'GET') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  }
  next();
});

app.get('/server-info', (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const uptime = os.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);

    const server = {
      hostname: os.hostname(),
      ram: `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`,
      freeram: `${formatBytes(freeMem)}`,
      model: `${os.cpus()[0].model}`,
      arsitektur: `${os.arch()} Core`,
      inti: `${os.cpus().length}`,
      uptime: `${days} hari ${hours} jam ${minutes} menit`,
    };

    const allRoutes = [
      '/buttons',
      '/datadonate',
      '/kategori',
      '/layanan',
      '/produk',
      '/survey',
      '/user',
      '/store',
      '/liststore',
    ];

    res.json({
      pesan: "Hacker jangan menyerang !",
      server: server,
      all: allRoutes,
    });
  } catch (error) {
    console.error("Error saat mengambil data server:", error); 
    res.json({ error: 'ServerError', message: "Gagal mengambil data server." });
  }
});

app.use('/buttons', apiKeyMiddleware, buttonRoutes);
app.use('/datadonate', apiKeyMiddleware, donorDataRoutes);
app.use('/kategori', apiKeyMiddleware, kategoriRoutes);
app.use('/layanan', apiKeyMiddleware, layananRoutes);
app.use('/produk', apiKeyMiddleware, produkRoutes);
app.use('/survey', apiKeyMiddleware, responsesRoutes);
app.use('/user', apiKeyMiddleware, usersRoutes);
app.use('/store', apiKeyMiddleware, storeRoutes);
app.use('/liststore', apiKeyMiddleware, liststoreRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    return res.json({ error: 'ValidationError', errors: err.errors });
  }
  res.json({ error: 'ServerError', message: 'Terjadi kesalahan di server.', details: err.message });
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
