import express from 'express';

const router = express.Router();

const convertESMToCJS = (code) => {
  return code
    .replace(/import (\w+) from ['"](.+?)['"];/g, "const $1 = require('$2');")
    .replace(/import \* as (\w+) from ['"](.+?)['"];/g, "const $1 = require('$2');")
    .replace(/import \{(.*?)\} from ['"](.+?)['"];/g, (match, imports, module) => {
      const formattedImports = imports.split(",").map((i) => i.trim()).join(", ");
      return `const { ${formattedImports} } = require('${module}');`;
    })
    .replace(/export default (.*?);?/g, "module.exports = $1;")
    .replace(/export const (\w+) = (.*?);?/g, "exports.$1 = $2;")
    .replace(/export (.*?) from ['"](.+?)['"];/g, "module.exports.$1 = require('$2');");
};

router.post('/', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      error: 'Parameter `code` harus diisi dalam body request (POST)!'
    });
  }

  try {
    const result = convertESMToCJS(code);
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
