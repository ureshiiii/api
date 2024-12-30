import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import buttonRoutes from './routes/buttons.js';
import donorDataRoutes from './routes/donorData.js';
import kategoriRoutes from './routes/kategori.js';
import layananRoutes from './routes/layanan.js';
import produkRoutes from './routes/produk.js';
import responsesRoutes from './routes/responses.js';
import usersRoutes from './routes/users.js';

const apiKeyMiddleware = (req, res, next) => {
  const key = req.path.split('/')[1];
  req.url = req.url.replace(`/${key}`, ''); 
  if (!key) return res.status(401).json({ message: 'API Key tidak diberikan.' });
  if (key !== process.env.API_KEY) return res.status(401).json({ message: 'API Key tidak valid.' });
  next();
};

app.use(morgan('dev'));
app.use(express.json());
app.use(apiKeyMiddleware); 

const availableRoutes = [
  '/buttons',
  '/datadonate',
  '/kategori',
  '/layanan',
  '/produk',
  '/survey',
  '/user',
];

app.get('/', async (req, res) => {
  try {
    const serverInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      cpuCores: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
    };
    res.json({
      status: "Database nya aktif hann :3",
      pesan: "Hacker jangan menyerang !!!",
      serverInfo: serverInfo,
      availableRoutes,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data.", error: error.message });
  }
});

app.use('/buttons', buttonRoutes);
app.use('/datadonate', donorDataRoutes);
app.use('/kategori', kategoriRoutes);
app.use('/layanan', layananRoutes);
app.use('/produk', produkRoutes);
app.use('/survey', responsesRoutes);
app.use('/user', usersRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Terjadi kesalahan di server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
  
