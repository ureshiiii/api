import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import db from './config/database.js';

const app = express();
const port = process.env.PORT || 3000;

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

import buttonRoutes from './routes/buttons.js';
import donorDataRoutes from './routes/donorData.js';
import kategoriRoutes from './routes/kategori.js';
import layananRoutes from './routes/layanan.js';
import produkRoutes from './routes/produk.js';
import responsesRoutes from './routes/responses.js';
import usersRoutes from './routes/users.js';

const apiKeyMiddleware = (req, res, next) => {
  const key = req.query.key;
  if (!key) {
    return res.status(401).json({ message: 'API Key tidak diberikan.' });
  }
  if (key !== "lovefirsha") {
    return res.status(401).json({ message: 'API Key tidak valid.' });
  }
  next();
};

app.use('/buttons', apiKeyMiddleware, buttonRoutes);
app.use('/datadonate', apiKeyMiddleware, donorDataRoutes);
app.use('/kategori', apiKeyMiddleware, kategoriRoutes);
app.use('/layanan', apiKeyMiddleware, layananRoutes);
app.use('/produk', apiKeyMiddleware, produkRoutes);
app.use('/survey', apiKeyMiddleware, responsesRoutes);
app.use('/user', usersRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
