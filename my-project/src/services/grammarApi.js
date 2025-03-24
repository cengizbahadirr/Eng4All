// HuggingFace API'si ile iletişim kuran servis

// API URL'ini doğru şekilde ayarlayın
const API_URL = 'https://alperendemirtas-firstchatbot.hf.space';

export async function checkGrammar(text) {
  try {
    const response = await fetch(`${API_URL}/api/predict`, {
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
    // Gradio API'nin yanıt yapısına göre data.data[0] şeklinde erişim 
    return data.data[0];
  } catch (error) {
    console.error('Gramer kontrolü sırasında hata oluştu:', error);
    throw error;
  }
}

export async function explainGrammarErrors(text) {
  try {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          `Please find grammar errors in this English text, correct them, and explain each correction: "${text}"`,
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
    console.error('Gramer açıklaması sırasında hata oluştu:', error);
    throw error;
  }
} 