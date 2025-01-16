import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import os from 'os';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/database.js';
import swaggerSpec from './swagger.js';

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
import paymentRoutes from './routes/payment.js';

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'api.ureshii.my.id';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(morgan('dev'));
app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const corsOptions = (req, callback) => {
  const allowedOrigins = ['https://ureshii.my.id', /\.ureshii\.my\.id$/];
  const origin = req.headers.origin;
  let corsConfig;

  if (req.method === 'GET') {
    corsConfig = { origin: '*' };
  } else if (
    allowedOrigins.some((allowedOrigin) =>
      allowedOrigin instanceof RegExp
        ? allowedOrigin.test(origin)
        : allowedOrigin === origin
    )
  ) {
    corsConfig = { origin: origin };
  } else {
    corsConfig = { origin: false };
  }

  callback(null, corsConfig);
};

app.use(cors(corsOptions));

const apiKeyMiddleware = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey) {
      return res
        .status(400)
        .json({ message: 'API Key tidak ditemukan dalam header request.' });
    }

    if (apiKey !== validApiKey) {
      return res.status(401).json({ message: 'API Key tidak valid.' });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Terjadi kesalahan saat validasi API Key.' });
  }
};

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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

    res.json({
      status: 'Database nya aktif hann :3',
      pesan: 'Hacker jangan menyerang!',
      server: server,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

app.get('/', async (req, res) => {
  const displayedRoutes = {
    private: {},
    api: {},
  };

  const addRouteToDisplay = (basePath, routePath, category, methods) => {
    const fullPath = `${basePath}${routePath}`;
    if (!displayedRoutes[category][basePath]) {
      displayedRoutes[category][basePath] = [];
    }
    displayedRoutes[category][basePath].push(`${fullPath} [${methods}]`);
  };

  const privateRoutes = [
    { path: '/buttons', route: buttonRoutes },
    { path: '/datadonate', route: donorDataRoutes },
    { path: '/kategori', route: kategoriRoutes },
    { path: '/layanan', route: layananRoutes },
    { path: '/produk', route: produkRoutes },
    { path: '/survey', route: responsesRoutes },
    { path: '/user', route: usersRoutes },
    { path: '/store', route: storeRoutes },
    { path: '/liststore', route: liststoreRoutes },
    { path: '/payment', route: paymentRoutes },
  ];

  privateRoutes.forEach(({ path, route }) => {
    route.stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .filter((method) => layer.route.methods[method])
          .join(', ');
        addRouteToDisplay(path, '', 'private', methods);
      }
    });
  });

  res.json(displayedRoutes);
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
app.use('/payment', apiKeyMiddleware, paymentRoutes);

app.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;

    const [rows] = await db.query(
      'SELECT original_url FROM urls WHERE short_id = ?',
      [shortId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'URL pendek tidak ditemukan.' });
    }

    const originalUrl = rows[0].original_url;
    res.redirect(301, originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengalihkan URL.' });
  }
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ errors: err.errors });
  }
  console.error(err);
  res
    .status(500)
    .json({ message: 'Terjadi kesalahan di server.', error: err.message });
});

swaggerSpec;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});