const express = require('express');
const router = express.Router();
const huggingfaceService = require('../services/huggingfaceService');

// Çeviri API'si
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    console.log(`Çeviri isteği alındı: "${text}" -> ${targetLang}`);
    
    if (!text) {
      return res.status(400).json({ error: 'Çevrilecek metin gereklidir' });
    }
    
    const translatedText = await huggingfaceService.translateText(text, targetLang);
    console.log(`Çeviri sonucu: "${translatedText}"`);
    
    res.json({ 
      success: true,
      originalText: text,
      translatedText: translatedText 
    });
  } catch (error) {
    console.error('Çeviri route hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gramer kontrolü API'si
router.post('/grammar-check', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Kontrol edilecek metin gereklidir' });
    }
    
    const correctedText = await huggingfaceService.checkGrammar(text);
    res.json({ correctedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kelime tanımı API'si
router.get('/define/:word', async (req, res) => {
  try {
    const { word } = req.params;
    console.log(`Sözlük isteği alındı: "${word}"`);
    
    if (!word) {
      return res.status(400).json({ error: 'Tanımlanacak kelime gereklidir' });
    }
    
    const definition = await huggingfaceService.getWordDefinition(word);
    console.log(`"${word}" için tanım bulundu: ${definition}`);
    
    res.json({ 
      success: true,
      word: word,
      definition: definition 
    });
  } catch (error) {
    console.error('Kelime tanımı route hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 