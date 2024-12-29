import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import donorRoutes from './routes/donorData.js';

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
  const apiKey = req.query.apiKey;
  if (!apiKey) {
    return res.status(401).json({ message: 'API Key tidak diberikan.' });
  }
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'API Key tidak valid.' });
  }
  next();
};

app.use(morgan('dev'));
app.use(express.json());
app.use('/buttons', apiKeyMiddleware, buttonRoutes);
app.use('/datadonate', apiKeyMiddleware, donorDataRoutes);
app.use('/kategori', apiKeyMiddleware, kategoriRoutes);
app.use('/layanan', apiKeyMiddleware, layananRoutes);
app.use('/produk', apiKeyMiddleware, produkRoutes);
app.use('/survey', apiKeyMiddleware, responsesRoutes);
app.use('/user', usersRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan di server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
                          
