import { useState, useEffect, useRef } from 'react';
import '../styles/pages/DictionaryPage.css';
import { getWordDefinition, translateText } from '../services/api';

const DictionaryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchLanguage, setSearchLanguage] = useState('tr'); // tr: Türkçeden İngilizceye, en: İngilizceden Türkçeye
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [translation, setTranslation] = useState('');
  
  // Sayfa yüklendiğinde yerel depolama alanından son aramaları yükle
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentDictionarySearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  // Son aramaları yerel depolama alanına kaydet
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentDictionarySearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);
  
  // Öneri kelimeler için fonksiyon (gerçek uygulamada API'den gelir)
  const getSuggestions = (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }
    
    // Burada normalde API çağrısı yapılır, biz örnek veriler kullanıyoruz
    const sampleSuggestions = {
      tr: [
        'merhaba', 'nasılsın', 'kitap', 'kalem', 'elma', 'okul',
        'araba', 'ev', 'masa', 'sandalye', 'bilgisayar', 'telefon'
      ],
      en: [
        'hello', 'how are you', 'book', 'pencil', 'apple', 'school', 
        'car', 'house', 'table', 'chair', 'computer', 'phone'
      ]
    };
    
    const currentLangSuggestions = sampleSuggestions[searchLanguage];
    const filtered = currentLangSuggestions.filter(
      s => s.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };
  
  // Kullanıcı kelime aradığında
  const handleSearch = async (e) => {
    e && e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      console.log("Sözlük araması yapılıyor:", searchTerm);
      
      // Paralel olarak hem tanım hem çeviri al
      const [definitionResult, translationResult] = await Promise.all([
        getWordDefinition(searchTerm.trim()).catch(err => {
          console.error("Tanım alınırken hata:", err);
          return "Tanım alınamadı";
        }),
        translateText(searchTerm.trim(), searchLanguage === 'en' ? 'tr' : 'en').catch(err => {
          console.error("Çeviri alınırken hata:", err);
          return "Çeviri alınamadı";
        })
      ]);
      
      console.log("Tanım sonucu:", definitionResult);
      console.log("Çeviri sonucu:", translationResult);
      
      setTranslation(translationResult);
      setDefinition(definitionResult);
      
      // Son aramaları güncelle
      updateRecentSearches(searchTerm);
      
    } catch (err) {
      console.error('Sözlük araması sırasında hata oluştu:', err);
      setError('Arama yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setTranslation('');
      setDefinition('');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Son aramaları güncelle
  const updateRecentSearches = (term) => {
    // Aynı terim zaten varsa, listeden çıkar
    const updatedSearches = recentSearches.filter(s => s !== term);
    
    // Terimi en başa ekle
    const newSearches = [term, ...updatedSearches].slice(0, 5); // Son 5 aramayı tut
    setRecentSearches(newSearches);
  };
  
  // Arama dilini değiştir
  const toggleSearchLanguage = () => {
    setSearchLanguage(prev => prev === 'tr' ? 'en' : 'tr');
    setSearchTerm('');
    setTranslation('');
    setDefinition('');
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  // Önerilen kelimeyi seç
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Seçilen öneriyi arama kutusuna yazıldıktan sonra hemen ara
    setTimeout(() => {
      handleSearch();
    }, 0);
  };
  
  // Son aramadan bir kelimeyi yeniden ara
  const searchRecentTerm = (term) => {
    setSearchTerm(term);
    // Bir süre sonra ara
    setTimeout(() => {
      handleSearch();
    }, 100);
  };
  
  // Telaffuz özelliği ekleyin
  const speakWord = (word) => {
    if (!word) return;
    
    const speech = new SpeechSynthesisUtterance();
    speech.text = word;
    speech.lang = searchLanguage === 'tr' ? 'tr-TR' : 'en-US';
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
  };
  
  // İlişkili kelimeler bölümü ekleyin (sonuç bölümünde)
  const getRelatedWords = (word) => {
    // Mock veri, gerçek uygulamada API'den alınabilir
    const relatedWordsDB = {
      'book': ['read', 'page', 'library', 'author', 'novel'],
      'hello': ['greeting', 'hi', 'welcome', 'howdy'],
      'car': ['vehicle', 'drive', 'road', 'wheel', 'transport'],
      'computer': ['laptop', 'keyboard', 'screen', 'technology', 'device'],
      'love': ['affection', 'care', 'heart', 'like', 'emotion'],
      'water': ['liquid', 'drink', 'ocean', 'rain', 'lake'],
      'world': ['earth', 'global', 'planet', 'international', 'society']
    };
    
    return relatedWordsDB[word.toLowerCase()] || [];
  };
  
  // Sahte API sonuçları
  const getMockResults = (term, lang) => {
    // Gerçekte bir API kullanılır, bu sadece demo amaçlıdır
    const dictionary = {
      tr: {
        "merhaba": [
          { word: "hello", type: "noun", definition: "a greeting" },
          { word: "hi", type: "interjection", definition: "gayri resmi selamlama" }
        ],
        "kitap": [
          { word: "book", type: "noun", definition: "a written or printed work consisting of pages" },
          { word: "volume", type: "noun", definition: "a collection of written or printed sheets bound together" }
        ],
        "elma": [
          { word: "apple", type: "noun", definition: "the round fruit of a tree of the rose family" }
        ],
        "sevmek": [
          { word: "to love", type: "verb", definition: "feel deep affection for someone" },
          { word: "to like", type: "verb", definition: "find agreeable, enjoyable, or satisfactory" }
        ],
        "ev": [
          { word: "house", type: "noun", definition: "a building for human habitation" },
          { word: "home", type: "noun", definition: "the place where one lives permanently" }
        ]
      },
      en: {
        "hello": [
          { word: "merhaba", type: "noun", definition: "bir selamlama" },
          { word: "selam", type: "ünlem", definition: "gayri resmi selamlama" }
        ],
        "book": [
          { word: "kitap", type: "isim", definition: "basılı sayfalardan oluşan yazılı bir eser" }
        ],
        "apple": [
          { word: "elma", type: "isim", definition: "gül familyasına ait bir ağacın yuvarlak meyvesi" }
        ],
        "love": [
          { word: "sevmek", type: "fiil", definition: "birine karşı derin bir sevgi duymak" },
          { word: "aşk", type: "isim", definition: "derin duygusal ve romantik bağlılık" }
        ],
        "home": [
          { word: "ev", type: "isim", definition: "insanların yaşadığı bir bina" },
          { word: "yuva", type: "isim", definition: "sürekli olarak yaşanılan yer" }
        ]
      }
    };
    
    const results = dictionary[lang][term.toLowerCase()] || [];
    
    if (results.length === 0) {
      // Bulunamadıysa Levenshtein mesafesine göre en yakın kelimeyi bul
      // Bu gerçek bir sözlük API'sinde "Bunu mu demek istediniz?" özelliğidir
      const allTerms = Object.keys(dictionary[lang]);
      const closest = allTerms.reduce((closest, current) => {
        if (current.toLowerCase().includes(term.toLowerCase())) {
          return current;
        }
        return closest;
      }, null);
      
      if (closest) {
        return [
          { notExact: true, suggestion: closest, results: dictionary[lang][closest] }
        ];
      }
    }
    
    return results;
  };
  
  return (
    <div className="dictionary-page">
      <div className="dictionary-container">
        <div className="dictionary-header">
          <h1>İngilizce-Türkçe Sözlük</h1>
          <p className="dictionary-description">
            Anlamını öğrenmek istediğiniz İngilizce kelimeyi aratın.
          </p>
        </div>
        
        <div className="search-section">
          <div className="language-toggle">
            <button 
              className={`toggle-btn ${searchLanguage === 'tr' ? 'active' : ''}`}
              onClick={() => searchLanguage !== 'tr' && toggleSearchLanguage()}
            >
              Türkçe → İngilizce
            </button>
            <button 
              className={`toggle-btn ${searchLanguage === 'en' ? 'active' : ''}`}
              onClick={() => searchLanguage !== 'en' && toggleSearchLanguage()}
            >
              İngilizce → Türkçe
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder={searchLanguage === 'tr' ? 'Türkçe kelime girin...' : 'Enter English word...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  getSuggestions(e.target.value);
                }}
                onFocus={() => {
                  getSuggestions(searchTerm);
                }}
                onBlur={() => {
                  // Tıklama olaylarının işlenmesi için küçük bir gecikme
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              <button type="submit" className="search-button">
                <i className="fas fa-search"></i>
              </button>
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className="suggestion-item"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
          
          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <h3>Son Aramalar</h3>
              <div className="recent-search-items">
                {recentSearches.map((term, idx) => (
                  <button 
                    key={idx} 
                    className="recent-search-item"
                    onClick={() => searchRecentTerm(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="results-section">
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Aranıyor...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          ) : searchTerm && (!translation && !definition) ? (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>"{searchTerm}" için sonuç bulunamadı.</p>
              <p className="no-results-tip">Yazımı kontrol edin veya başka bir kelime deneyin.</p>
            </div>
          ) : !searchTerm ? (
            <div className="empty-state">
              <i className="fas fa-book"></i>
              <p>Bir kelime arayarak başlayın</p>
              <p className="empty-state-tip">İngilizce kelimeleri arayıp Türkçe karşılıklarını görebilirsiniz</p>
            </div>
          ) : (
            <div className="result-container">
              <h2>
                "{searchTerm}" Kelimesi
                <button className="pronunciation-btn" onClick={() => speakWord(searchTerm)}>
                  <i className="fas fa-volume-up"></i>
                </button>
              </h2>
              
              {translation && (
                <div className="translation-section">
                  <h3>{searchLanguage === 'tr' ? 'İngilizce Karşılığı:' : 'Türkçe Karşılığı:'}</h3>
                  <p>
                    {translation}
                    <button className="pronunciation-btn small" onClick={() => speakWord(translation)}>
                      <i className="fas fa-volume-up"></i>
                    </button>
                  </p>
                </div>
              )}
              
              {definition && (
                <div className="definition-section">
                  <h3>Tanım:</h3>
                  <p>{definition}</p>
                </div>
              )}
              
              {/* İlişkili kelimeler bölümü */}
              {searchLanguage === 'en' && (
                <div className="related-words">
                  <h3>İlişkili Kelimeler:</h3>
                  <div className="related-words-list">
                    {getRelatedWords(searchTerm).map((word, idx) => (
                      <button 
                        key={idx} 
                        className="related-word-item"
                        onClick={() => searchRecentTerm(word)}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DictionaryPage; 