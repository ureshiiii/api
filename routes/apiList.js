import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/apiEndpoints.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const apiData = JSON.parse(data);
    
    res.json(apiData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to load API list', 
      details: error.message 
    });
  }
});

export default router;