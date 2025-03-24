import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Önbellek mekanizması
const cache = {
  translations: {},
  definitions: {}
};

// HuggingFace API istekleri
export const translateText = async (text, targetLang = 'tr') => {
  try {
    // Önbellek kontrolü
    const cacheKey = `${text}:${targetLang}`;
    if (cache.translations[cacheKey]) {
      console.log("Önbellekten çeviri alındı:", cacheKey);
      return cache.translations[cacheKey];
    }
    
    // Mock çeviri veritabanı (hızlı yanıt için)
    const mockTranslations = {
      // İngilizceden Türkçeye
      "hello": "merhaba",
      "world": "dünya",
      "book": "kitap", 
      "pencil": "kalem",
      "school": "okul",
      "house": "ev",
      "car": "araba",
      "computer": "bilgisayar",
      "phone": "telefon",
      "love": "sevgi",
      "food": "yemek",
      "water": "su",
      "fire": "ateş",
      "air": "hava",
      
      // Türkçeden İngilizceye
      "merhaba": "hello",
      "dünya": "world",
      "kitap": "book",
      "kalem": "pencil",
      "okul": "school",
      "ev": "house",
      "araba": "car",
      "bilgisayar": "computer",
      "telefon": "phone",
      "sevgi": "love",
      "yemek": "food",
      "su": "water",
      "ateş": "fire",
      "hava": "air"
    };
    
    // İlk olarak mock veritabanında kontrol et
    const textLower = text.toLowerCase();
    if (mockTranslations[textLower]) {
      const result = mockTranslations[textLower];
      // Önbelleğe ekle
      cache.translations[cacheKey] = result;
      return result;
    }
    
    // Değilse API'ye istek gönder
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniye timeout
    
    const response = await fetch(`${API_URL}/huggingface/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Önbelleğe ekle
    cache.translations[cacheKey] = data.translatedText;
    
    return data.translatedText;
  } catch (error) {
    console.error('Çeviri hatası:', error);
    if (error.name === 'AbortError') {
      return "API yanıt süre sınırı aşıldı";
    }
    throw error;
  }
};

export const checkGrammar = async (text) => {
  try {
    const response = await fetch(`${API_URL}/huggingface/grammar-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }
    
    const data = await response.json();
    return data.correctedText;
  } catch (error) {
    console.error('Gramer kontrolü hatası:', error);
    throw error;
  }
};

export const getWordDefinition = async (word) => {
  try {
    // Önbellek kontrolü
    if (cache.definitions[word.toLowerCase()]) {
      console.log("Önbellekten tanım alındı:", word);
      return cache.definitions[word.toLowerCase()];
    }
    
    // Mock tanım veritabanı (hızlı yanıt için)
    const mockDefinitions = {
      "hello": "A greeting used when meeting someone or answering the telephone.",
      "world": "The earth, together with all of its countries and peoples.",
      "book": "A written or printed work consisting of pages glued or sewn together.",
      "example": "A thing characteristic of its kind or illustrating a general rule.",
      "computer": "An electronic device for storing and processing data.",
      "language": "The method of human communication, either spoken or written.",
      "peace": "Freedom from disturbance; tranquility.",
      "love": "An intense feeling of deep affection.",
      "time": "The indefinite continued progress of existence and events.",
      "day": "A period of 24 hours as a unit of time.",
      "apple": "The round fruit of a tree of the rose family.",
      "water": "A colorless, transparent, odorless liquid that forms seas and rain.",
      "fire": "Combustion or burning, producing heat and light.",
      "earth": "The planet on which we live; the world.",
      "air": "The invisible gaseous substance surrounding the earth."
    };
    
    // İlk olarak mock veritabanında kontrol et
    const wordLower = word.toLowerCase();
    if (mockDefinitions[wordLower]) {
      const result = mockDefinitions[wordLower];
      // Önbelleğe ekle
      cache.definitions[wordLower] = result;
      return result;
    }
    
    // API'ye istek gönder (timeout ile)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 saniye timeout
    
    const response = await fetch(`${API_URL}/huggingface/define/${encodeURIComponent(word)}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Önbelleğe ekle
    cache.definitions[wordLower] = data.definition;
    
    return data.definition;
  } catch (error) {
    console.error('Kelime tanımı hatası:', error);
    if (error.name === 'AbortError') {
      return "Tanım API'si süre sınırını aştı";
    }
    throw error;
  }
};

export default api; 