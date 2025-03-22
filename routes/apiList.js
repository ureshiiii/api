import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const apiData = require('../../data/apiEndpoints.json');
    res.json(apiData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load API list', details: error.message });
  }
});

export default router;