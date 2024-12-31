import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import os from 'os';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

import buttonRoutes from './routes/buttons.js';
import donorDataRoutes from './routes/donorData.js';
import kategoriRoutes from './routes/kategori.js';
import layananRoutes from './routes/layanan.js';
import produkRoutes from './routes/produk.js';
import responsesRoutes from './routes/responses.js';
import usersRoutes from './routes/users.js';
import storeRoutes from './routes/store.js';
import liststoreRoutes from './routes/liststore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const whitelist = ['185.27.134.168', '127.0.0.1', '66.33.60.129', '76.76.21.93']; 

const ipWhitelistMiddleware = (req, res, next) => {
  const clientIp = req.ip;
  if (whitelist.includes(clientIp)) {
    next();
  } else {
    res.status(403).json({ message: `IP kamu "${clientIp}" ditolak masuk ke server` });
  }
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(morgan('dev'));
app.use(express.json());
app.use(helmet());

const allowedOrigins = ['https://www.ureshii.my.id', 'https://api.ureshii.my.id']; 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Domain kamu ditolak masuk ke server.'), false);
    }
    return callback(null, true);
  }
}));

app.use(ipWhitelistMiddleware);

const all = [
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

// Ubah path menjadi /server-info
app.get('/server-info', async (req, res) => { 
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
      arsitektur: `${os.arch()}`,
      inti: `${os.cpus().length}`,
      kecepatan: `${(os.cpus()[0].speed / 1000).toFixed(2)} GHz`,
      uptime: `${days} hari ${hours} jam ${minutes} menit`,
    };

    res.json({
      status: "Database nya aktif hann :3",
      pesan: "Hacker jangan menyerang !",
      server: server,
      all,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data.", error: error.message });
  }
});

const apiKeyMiddleware = (req, res, next) => {
  // Lewati middleware jika request ditujukan ke /public
  if (req.path.startsWith('/public')) {
    return next();
  }

  const key = req.path.split('/')[1];
  req.url = req.url.replace(`/${key}`, '');
  if (!key) return res.status(401).json({ message: 'API Key tidak diberikan.' });
  if (key !== process.env.API_KEY) return res.status(401).json({ message: 'API Key tidak valid.' });
  next();
};

app.use(apiKeyMiddleware);
app.use('/buttons', buttonRoutes);
app.use('/datadonate', donorDataRoutes);
app.use('/kategori', kategoriRoutes);
app.use('/layanan', layananRoutes);
app.use('/produk', produkRoutes);
app.use('/survey', responsesRoutes);
app.use('/user', usersRoutes);
app.use('/store', storeRoutes);
app.use('/liststore', liststoreRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Terjadi kesalahan di server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
               }
