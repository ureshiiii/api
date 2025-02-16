import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

router.post('/', async (req, res) => {
  const { text, logic } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Parameter `text` harus diisi!' });
  }

  try {
    const apiKey = 'AIzaSyDf8t7WLokfC9bBlHzmBgTcDvSEOOBkt34';
    const modelName = 'gemini-2.0-pro-exp-02-05';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: logic || '',
    });

    const result = await model.generateContent(text);
    let responseText = result.response.candidates[0].content.parts[0].text;
    responseText = responseText.trimEnd();

    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ message: 'Terjadi kesalahan saat memproses permintaan.' });
  }
});

export default router;
