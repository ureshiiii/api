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

  if (!key) {
    return res.status(401).json({ message: 'API Key tidak diberikan.' });
  }
  if (key !== "lovefirsha") {
    return res.status(401).json({ message: 'API Key tidak valid.' });
  }
  next();
};

app.use(morgan('dev'));
app.use(express.json());
app.use(apiKeyMiddleware); 

const getAllData = async () => {
  try {
    const [buttons, donorData, kategori, layanan, produk, responses, users] = await Promise.all([
      Button.find({}), 
      DonorData.find({}),
      Kategori.find({}),
      Layanan.find({}),
      Produk.find({}),
      Responses.find({}),
      User.find({})
    ]);

    return { 
      buttons: buttons.length > 0 ? true : false, 
      donorData: donorData.length > 0 ? true : false,
      kategori: kategori.length > 0 ? true : false,
      layanan: layanan.length > 0 ? true : false,
      produk: produk.length > 0 ? true : false,
      responses: responses.length > 0 ? true : false,
      users: users.length > 0 ? true : false 
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; 
  }
};

app.get('/', async (req, res) => {
  try {
    const allData = await getAllData();

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
      data: allData,
      serverInfo: serverInfo,
    });
  } catch (error) {
    next(error); 
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
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan di server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
