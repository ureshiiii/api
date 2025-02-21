import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
const router = express.Router();

const apiKey = 'AIzaSyBPmZItWxsRAJ5uqkliMxiZNPh6ArLKTAQ';
const modelName = 'gemini-2.0-flash';

const genAI = new GoogleGenerativeAI(apiKey);
const originalGetGenerativeModel = genAI.getGenerativeModel.bind(genAI);
genAI.getGenerativeModel = function(options) {
  const model = originalGetGenerativeModel(options);
  if (typeof model.fetchFn !== 'function') {
    model.fetchFn = globalThis.fetch.bind(globalThis);
  }
  return model;
};

router.use(express.json({ limit: '50mb' }));
router.post('/', async (req, res) => {
  const { text, logic, imageBuffer, imageUrl, audioBuffer, audioUrl, mimeType, audioMime } = req.body;
  if (!text) return res.status(400).json({ message: 'Parameter `text` harus diisi!' });
  try {
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: logic || '' });
    let result, responseText;
    if (audioBuffer || audioUrl) {
      let inlineData, finalMimeType;
      if (audioBuffer) {
        inlineData = audioBuffer;
        finalMimeType = audioMime || 'audio/mp3';
      } else {
        const response = await globalThis.fetch(audioUrl);
        if (!response.ok) return res.status(400).json({ message: 'Gagal mengambil audio dari URL.' });
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        inlineData = buffer.toString('base64');
        finalMimeType = response.headers.get('content-type') || 'audio/mp3';
      }
      result = await model.generateContent([
        { inlineData: { mimeType: finalMimeType, data: inlineData } },
        { text: text + ' . Gunakan bahasa Indonesia' }
      ]);
      responseText = typeof result.response.text === 'function'
        ? result.response.text()
        : (result.response.candidates?.[0]?.content?.parts?.[0]?.text || '');
    } else if (imageBuffer || imageUrl) {
      let inlineData, finalMimeType;
      if (imageBuffer) {
        inlineData = imageBuffer;
        finalMimeType = mimeType || 'image/jpeg';
      } else {
        const response = await globalThis.fetch(imageUrl);
        if (!response.ok) return res.status(400).json({ message: 'Gagal mengambil gambar dari URL.' });
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        inlineData = buffer.toString('base64');
        finalMimeType = response.headers.get('content-type') || 'image/jpeg';
      }
      result = await model.generateContent([
        { inlineData: { mimeType: finalMimeType, data: inlineData } },
        { text: text + ' . Gunakan bahasa Indonesia' }
      ]);
      responseText = typeof result.response.text === 'function'
        ? result.response.text()
        : (result.response.candidates?.[0]?.content?.parts?.[0]?.text || '');
    } else {
      result = await model.generateContent(text);
      responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    responseText = responseText.trimEnd();
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memproses permintaan.' });
  }
});

export default router;
