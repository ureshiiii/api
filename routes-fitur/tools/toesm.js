import express from 'express';

const router = express.Router();

const convertCJSToESM = (code) => {
  return code
    .replace(/const (\w+) = require\(['"](.+?)['"]\);?/g, "import $1 from '$2';")
    .replace(/let (\w+) = require\(['"](.+?)['"]\);?/g, "import $1 from '$2';")
    .replace(/var (\w+) = require\(['"](.+?)['"]\);?/g, "import $1 from '$2';")
    .replace(/module\.exports\s*=\s*(.*?);?/g, "export default $1;")
    .replace(/exports\.(\w+)\s*=\s*(.*?);?/g, "export const $1 = $2;")
    .replace(/require\(['"](.+?)['"]\)/g, "import('$1')");
};

router.post('/', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      error: 'Parameter `code` harus diisi dalam body request (POST)!'
    });
  }

  try {
    const result = convertCJSToESM(code);
    res.status(200).json({
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Terjadi kesalahan saat mengonversi kode.'
    });
  }
});

export default router;
