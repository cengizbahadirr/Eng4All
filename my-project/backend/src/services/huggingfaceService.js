const { HfInference } = require('@huggingface/inference');
const dotenv = require('dotenv');

dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Metin çevirisi için fonksiyon
const translateText = async (text, targetLang = 'tr') => {
  try {
    console.log(`Çeviri isteği: ${text} dilden ${targetLang} diline`);
    
    // Kaynak ve hedef dili belirle
    let model;
    if (targetLang === 'tr') {
      model = 'Helsinki-NLP/opus-mt-en-tr'; // İngilizceden Türkçeye
    } else {
      model = 'Helsinki-NLP/opus-mt-tr-en'; // Türkçeden İngilizceye
    }
    
    console.log(`Kullanılacak model: ${model}`);
    
    const result = await hf.translation({
      model: model,
      inputs: text,
    });
    
    console.log("Çeviri sonucu:", result);
    return result.translation_text;
  } catch (error) {
    console.error('Çeviri hatası:', error);
    throw new Error('Çeviri işlemi sırasında bir hata oluştu');
  }
};

// Gramer kontrolü için fonksiyon
const checkGrammar = async (text) => {
  try {
    // Doğrudan Spaces API'sine bağlanabiliriz
    const response = await fetch('https://alperendemirtas-firstchatbot.hf.space/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          `Please check and correct the grammar in this English text: "${text}"`,
          [] // boş history
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0];
  } catch (error) {
    console.error('Gramer kontrolü hatası:', error);
    throw new Error('Gramer kontrolü sırasında bir hata oluştu');
  }
};

// Kelime anlamı için fonksiyon
const getWordDefinition = async (word) => {
  try {
    console.log(`Tanım isteği: ${word}`);
    
    // Mock veri kullanarak hızlı tanım sonucu döndürelim
    // Gerçek projede Dictionary API kullanılabilir (Oxford, Merriam-Webster, vs.)
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
      "apple": "The round fruit of a tree of the rose family, which typically has thin red or green skin.",
      "water": "A colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain.",
      "fire": "Combustion or burning, in which substances combine chemically with oxygen from the air and typically give out bright light, heat, and smoke.",
      "earth": "The planet on which we live; the world.",
      "air": "The invisible gaseous substance surrounding the earth, a mixture mainly of oxygen and nitrogen."
    };
    
    // İngilizce kelimeyse basit tanım döndür
    if (mockDefinitions[word.toLowerCase()]) {
      return mockDefinitions[word.toLowerCase()];
    }
    
    // Kelimenin tanımını bulamadıysak API'yi kullan
    const result = await hf.textGeneration({
      model: 'gpt2',
      inputs: `The definition of the word "${word}" is: `,
      parameters: {
        max_new_tokens: 30,
        temperature: 0.7,
        return_full_text: false
      }
    });
    
    console.log("Tanım API sonucu:", result);
    return result.generated_text.trim();
  } catch (error) {
    console.error('Kelime tanımı hatası:', error);
    throw new Error('Kelime tanımı alınırken bir hata oluştu');
  }
};

module.exports = {
  translateText,
  checkGrammar,
  getWordDefinition
}; 