import express from 'express';
import db from './config/database.js';

const app = express();
const port = process.env.PORT || 3000;

db.connect(err => {
  if (err) {
    console.error('Error connect ke db han: ', err);
    return;
  }
  console.log('Anjay connect ke db berhasil');
});

app.use(express.json());

import buttonRoutes from './routes/buttons.js';
import donorDataRoutes from './routes/donorData.js';
import kategoriRoutes from './routes/kategori.js';
import layananRoutes from './routes/layanan.js';
import produkRoutes from './routes/produk.js';
import responsesRoutes from './routes/responses.js';
import usersRoutes from './routes/users.js';

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.query.apiKey;
  if (apiKey === 'lovefirsha') {
    next();
  } else {
    res.status(401).json({ message: 'Apaansi tolol lu bukan parhan. Error: “Parameter Apikey salah”' });
  }
};

app.use('/buttons', apiKeyMiddleware, buttonRoutes);
app.use('/datadonate', apiKeyMiddleware, donorDataRoutes);
app.use('/kategori', apiKeyMiddleware, kategoriRoutes);
app.use('/layanan', apiKeyMiddleware, layananRoutes);
app.use('/produk', apiKeyMiddleware, produkRoutes);
app.use('/survey', apiKeyMiddleware, responsesRoutes);
app.use('/user', usersRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
