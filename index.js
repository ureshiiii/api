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
import addResponseInfo from './routes-fitur/addResponseInfo.js';

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
import botRoutes from './routes/bot.js';

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'api.ureshii.my.id';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

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

app.use(async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  req.visitorIP = ip;

  try {
    await db.query('UPDATE api_stats SET total_requests = total_requests + 1 WHERE id = 1');

    const [rows] = await db.query('SELECT * FROM visitor_stats WHERE visitor_ip = ?', [ip]);
    if (rows.length > 0) {
      await db.query('UPDATE visitor_stats SET request_count = request_count + 1 WHERE visitor_ip = ?', [ip]);
    } else {
      await db.query('INSERT INTO visitor_stats (visitor_ip, request_count) VALUES (?, ?)', [ip, 1]);
    }
  } catch (error) {
    console.error('Error updating API stats:', error);
  }
  next();
});

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

app.get('/server-stat', async (req, res) => {
  try {
    const [statsRows] = await db.query('SELECT total_requests FROM api_stats WHERE id = 1');
    const totalRequests = statsRows.length ? statsRows[0].total_requests : 0;
    const [visitorRows] = await db.query('SELECT COUNT(*) as uniqueCount FROM visitor_stats');
    const uniqueVisitors = visitorRows[0].uniqueCount;

    res.json({
      visitorIP: req.visitorIP,
      totalRequests,
      uniqueVisitors
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
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

    res.json({
      status: 'Database nya aktif hann :3',
      pesan: 'Hacker jangan menyerang!',
      server: server,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data.', error: error.message });
  }
});

async function loadApiRoutes() {
  const apiDir = path.join(__dirname, 'routes-fitur');
  const routes = {};

  async function traverseDir(directory, category = '') {
    const files = await fs.promises.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) {
        await traverseDir(filePath, category ? `${category}/${file}` : file);
      } else if (file.endsWith('.js')) {
        const routeName = file.replace('.js', '');
        const fullCategory = category ? `api/${category}` : 'api';
        const routePath = `/${fullCategory}/${routeName}`;

        if (!routes[fullCategory]) {
          routes[fullCategory] = [];
        }
        routes[fullCategory].push(routePath);

        const moduleUrl = new URL(filePath, `file://${__dirname}/`).href;
        try {
          const module = await import(moduleUrl);
          const route = module.default;

          app.use(
            routePath,
            (req, res, next) => {
              req.isFromRouteFitur = true;
              next();
            },
            addResponseInfo,
            route
          );
        } catch (err) {
          console.error(`Failed to load route ${routePath}:`, err);
        }
      }
    }
  }

  await traverseDir(apiDir);
  return routes;
}

const apiRoutes = await loadApiRoutes();

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
app.use('/bot', apiKeyMiddleware, botRoutes);

app.get('/u/:shortId', async (req, res) => {
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

app.get('/cdn/:secureId', async (req, res) => {
  try {
    const { secureId } = req.params;
    const selectQuery = `
      SELECT filename, file_type, data, expired_at
      FROM cdn_files
      WHERE secure_id = ?
    `;
    const [rows] = await db.query(selectQuery, [secureId]);
    if (!rows.length) return res.status(404).json({ error: 'File not found.' });
    const file = rows[0];
    const expiredAt = file.expired_at ? new Date(file.expired_at) : null;
    if (expiredAt && expiredAt < new Date()) {
      await db.query('DELETE FROM cdn_files WHERE secure_id = ?', [secureId]);
      return res.status(404).json({ error: 'File has expired.' });
    }
    res.setHeader('Content-Type', file.file_type);
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    return res.status(200).send(file.data);
  } catch (error) {
    console.error('File Retrieval Error:', error);
    return res.status(500).json({ error: 'Error retrieving file.' });
  }
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ errors: err.errors });
  }
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan di server.', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});