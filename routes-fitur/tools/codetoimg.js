import express from 'express';
import fetch from 'node-fetch';
import uploadImage from '../../lib/uploadImage.js';

const router = express.Router();

async function code2img(code) {
  const API_ENDPOINT = "https://code2img.vercel.app";
  const themes = [
    "a11y-dark",
    "atom-dark",
    "base16-ateliersulphurpool.light",
    "cb",
    "darcula",
    "default",
    "dracula",
    "duotone-dark",
    "duotone-earth",
    "duotone-forest",
    "duotone-light",
    "duotone-sea",
    "duotone-space",
    "ghcolors",
    "hopscotch",
    "material-dark",
    "material-light",
    "material-oceanic",
    "nord",
    "pojoaque",
    "shades-of-purple",
    "synthwave84",
    "vs",
    "vsc-dark-plus",
    "xonokai",
  ];

  const detectLanguage = (code) => {
    if (/^\s*import\s.*\sfrom\s'.*'/.test(code)) return "javascript";
    if (/^\s*def\s\w+\s*\(.*\):/.test(code)) return "python";
    if (/^\s*class\s\w+/.test(code)) return "java";
    if (/^\s*#[^\n]*\n/.test(code)) return "python";
    if (/^\s*public\s+class\s+\w+/.test(code)) return "java";
    if (/^\s*<!DOCTYPE\shtml>/.test(code)) return "html";
    return "javascript";
  };

  const defaultPreferences = {
    backgroundColor: "#FFFFFF",
    showBackground: "true",
    showLineNumbers: "false",
    backgroundPadding: 5,
  };

  const selectedLanguage = detectLanguage(code);
  const selectedTheme = themes[Math.floor(Math.random() * themes.length)];

  const queryParams = new URLSearchParams({
    language: selectedLanguage,
    theme: selectedTheme,
    "background-color": defaultPreferences.backgroundColor,
    "show-background": defaultPreferences.showBackground,
    "line-numbers": defaultPreferences.showLineNumbers,
    padding: defaultPreferences.backgroundPadding,
  });

  const requestUrl = `${API_ENDPOINT}/api/to-image?${queryParams.toString()}`;
  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: code,
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil gambar: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  } catch (error) {
    throw error;
  }
}

router.get('/', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      error: 'Parameter `code` harus diisi dalam body request (POST)!'
    });
  }

  try {
    const imageBuffer = await code2img(code);
    const imageUrl = await uploadImage(imageBuffer);
    res.status(200).json({
      data: imageUrl
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message || 'Terjadi kesalahan saat memproses gambar.'
    });
  }
});

export default router;
