import { useState, useRef } from 'react';
import { checkGrammar } from '../services/api';
import '../styles/pages/GrammarCheckPage.css';

const GrammarCheckPage = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [mode, setMode] = useState('simple'); // 'simple' veya 'detailed'
  
  const textareaRef = useRef(null);
  
  // Metni düzeltme fonksiyonu
  const handleCheckGrammar = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Backend üzerinden istek gönderme
      const result = await checkGrammar(inputText);
      setCorrectedText(result);
      setExplanation('');
      
      // Sohbet geçmişine ekle
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'user', 
          text: inputText 
        },
        { 
          type: 'bot', 
          text: result 
        }
      ]);
    } catch (err) {
      console.error('Gramer kontrolü sırasında hata:', err);
      setError('Gramer kontrol edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Textarea yüksekliğini otomatik ayarlama
  const autoResizeTextarea = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  
  // Modu değiştirme
  const toggleMode = () => {
    setMode(prev => prev === 'simple' ? 'detailed' : 'simple');
  };
  
  // Sohbeti temizleme
  const clearChat = () => {
    setChatHistory([]);
    setInputText('');
    setCorrectedText('');
    setExplanation('');
    textareaRef.current.style.height = 'auto';
  };
  
  // Detaylı mod için açıklama elde etme - backend'den elde etme
  const getExplanation = async (text, correctedText) => {
    // Basit bir karşılaştırma ile açıklama oluştur
    const textWords = text.split(' ');
    const correctedWords = correctedText.split(' ');
    
    let explanation = '';
    
    for (let i = 0; i < Math.min(textWords.length, correctedWords.length); i++) {
      if (textWords[i] !== correctedWords[i]) {
        explanation += `• '${textWords[i]}' → '${correctedWords[i]}'\n`;
      }
    }
    
    return explanation || 'Metin doğru görünüyor.';
  };
  
  return (
    <div className="grammar-check-page">
      <div className="grammar-container">
        <div className="grammar-header">
          <h1>İngilizce Gramer Kontrolü</h1>
          <p className="grammar-description">
            İngilizce metinlerinizdeki gramer hatalarını düzeltin ve daha iyi yazın
          </p>
        </div>
        
        <div className="grammar-content">
          <div className="input-section">
            <div className="textarea-container">
              <textarea
                ref={textareaRef}
                className="grammar-input"
                placeholder="İngilizce metninizi buraya yazın..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyUp={autoResizeTextarea}
              />
              
              <div className="input-options">
                <button 
                  className={`mode-toggle ${mode === 'detailed' ? 'detailed-mode' : ''}`} 
                  onClick={toggleMode}
                >
                  <span className="toggle-thumb"></span>
                  <span className="toggle-label">Detaylı Mod</span>
                </button>
                
                <span className="input-length">
                  {inputText.length} / 2000
                </span>
              </div>
            </div>
            
            <button 
              className="check-button" 
              onClick={handleCheckGrammar}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Kontrol Ediliyor...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Gramer Kontrolü</span>
                </>
              )}
            </button>
          </div>
          
          <div className="chat-section">
            <div className="chat-header">
              <h3>Gramer Asistanı</h3>
              {chatHistory.length > 0 && (
                <button className="clear-chat-btn" onClick={clearChat}>
                  <i className="fas fa-trash"></i>
                  <span>Temizle</span>
                </button>
              )}
            </div>
            
            <div className="chat-messages">
              {chatHistory.length === 0 ? (
                <div className="empty-chat">
                  <i className="fas fa-robot"></i>
                  <p>İngilizce metninizi yazın ve "Gramer Kontrolü" butonuna tıklayın.</p>
                  <p className="small-text">
                    AI asistanımız metninizi analiz edecek ve gramer hatalarını düzeltecek.
                  </p>
                </div>
              ) : (
                <>
                  {chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`chat-message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
                    >
                      <div className="message-avatar">
                        {msg.type === 'user' ? (
                          <i className="fas fa-user"></i>
                        ) : (
                          <i className="fas fa-robot"></i>
                        )}
                      </div>
                      <div className="message-content">
                        {msg.text.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grammar-tips">
          <h3>İpuçları</h3>
          <ul>
            <li>Gramer kontrolü için İngilizce bir metin yazın ve "Gramer Kontrolü" butonuna tıklayın.</li>
            <li>Detaylı mod, hataların neden yanlış olduğunu ve nasıl düzeltildiğini açıklar.</li>
            <li>En iyi sonuçlar için kısa paragraflar halinde kontrol edin.</li>
            <li>AI, dilbilgisi ve yazım hatalarını düzeltir ancak içeriğin doğruluğunu kontrol etmez.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GrammarCheckPage; 