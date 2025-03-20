import express from 'express';
import https from 'https';
import crypto from 'crypto';

const router = express.Router();
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const agent = new https.Agent({ keepAlive: true });
const sessions = {};

router.use(express.json({ limit: '50mb' }));
router.use((req, res, next) => {
  let sid;
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('sid=')) {
        sid = cookie.substring(4);
        break;
      }
    }
  }
  if (!sid || !sessions[sid]) {
    sid = crypto.randomBytes(16).toString('hex');
    sessions[sid] = {};
    res.setHeader('Set-Cookie', `sid=${sid}; HttpOnly; Path=/`);
  }
  req.session = sessions[sid];
  next();
});

router.post('/', async (req, res) => {
  const { text, logic, imageBuffer, imageUrl, audioBuffer, audioUrl, mimeType, audioMime } = req.body;
  if (!text) return res.status(400).json({ message: 'Parameter `text` harus diisi!' });
  
  try {
    if (!req.session.messages) req.session.messages = [];
    if (logic && !req.session.systemInstructionAdded) {
      req.session.messages.push({ role: "system", content: [{ type: "text", text: logic }] });
      req.session.systemInstructionAdded = true;
    }
    
    const userMessage = { role: "user", content: [] };
    
    if (audioBuffer || audioUrl) {
      let audioDataUrl;
      const finalAudioMime = audioMime || 'audio/mp3';
      
      if (audioBuffer) {
        audioDataUrl = `data:${finalAudioMime};base64,${audioBuffer}`;
      } else {
        const audioResponse = await globalThis.fetch(audioUrl, { agent });
        
        if (!audioResponse.ok) return res.status(400).json({ message: 'Gagal mengambil audio dari URL.' });
        
        const arrayBuffer = await audioResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');
        
        audioDataUrl = `data:${finalAudioMime};base64,${base64Audio}`;
      }
      
      userMessage.content.push({ type: "audio_url", audio_url: { url: audioDataUrl } });
      userMessage.content.push({ type: "text", text: text + ' . Gunakan bahasa Indonesia' });
    } else if (imageBuffer || imageUrl) {
      let imageDataUrl;
      const finalImageMime = mimeType || 'image/jpeg';
      
      if (imageBuffer) {
        imageDataUrl = `data:${finalImageMime};base64,${imageBuffer}`;
      } else {
        const imageResponse = await globalThis.fetch(imageUrl, { agent });
        
        if (!imageResponse.ok) return res.status(400).json({ message: 'Gagal mengambil gambar dari URL.' });
        
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        
        imageDataUrl = `data:${finalImageMime};base64,${base64Image}`;
      }
      
      userMessage.content.push({ type: "image_url", image_url: { url: imageDataUrl } });
      userMessage.content.push({ type: "text", text: text + ' . Gunakan bahasa Indonesia' });
    } else {
      userMessage.content.push({ type: "text", text: text });
    }
    
    req.session.messages.push(userMessage);
    
    const body = { model: "google/gemini-2.0-flash-thinking-exp-1219:free", messages: req.session.messages };
    const response = await globalThis.fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      agent: agent
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ message: 'Terjadi kesalahan saat memproses permintaan dari OpenRouter API.', details: errorText });
    }
    
    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content?.text || result.choices?.[0]?.message?.content || '';
    
    req.session.messages.push({ role: "assistant", content: [{ type: "text", text: responseText.trimEnd() }] });
    res.status(200).json({ response: responseText.trimEnd() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memproses permintaan.' });
  }
});

export default router;
