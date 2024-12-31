import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import os from 'os';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Semua middleware
app.use(morgan('dev')); 
app.use(express.json()); 
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public'))); 

// Validasi apikey
const apiKeyMiddleware = (req, res, next) => {
  const excludedPaths = ['/public', '/server-info', '/website/list']; 
  if (excludedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const key = req.path.split('/')[1];
  req.url = req.url.replace(`/${key}`, '');
  if (!key) return res.status(401).json({ message: 'API Key tidak diberikan.' });
  if (key !== process.env.API_KEY) return res.status(401).json({ message: 'API Key tidak valid.' });

  next();
};

app.use(apiKeyMiddleware);

// All route disini
app.get('/website/list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use('/buttons', buttonRoutes);
app.use('/datadonate', donorDataRoutes);
app.use('/kategori', kategoriRoutes);
app.use('/layanan', layananRoutes);
app.use('/produk', produkRoutes);
app.use('/survey', responsesRoutes);
app.use('/user', usersRoutes);
app.use('/store', storeRoutes);
app.use('/liststore', liststoreRoutes);

// Server info biar keren
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
      arsitektur: `${os.arch()} Core`,
      inti: `${os.cpus().length}`,
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') { 
    return res.status(400).json({ errors: err.errors });
  }
  res.status(500).json({ message: 'Terjadi kesalahan di server.', error: err.message }); 
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
                         
