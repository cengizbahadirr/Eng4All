import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/LevelTestPage.css';

const LevelTestPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 dakika
  const [testQuestions, setTestQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cefr, setCefr] = useState('');
  
  // Test sorularını yükle
  useEffect(() => {
    // Normalde bir API'den sorular çekilir. Şimdilik mock data kullanacağız
    const fetchTestQuestions = async () => {
      setIsLoading(true);
      try {
        // Mock veri - gerçek uygulamada API çağrısı yapılır
        // Soru havuzundan rastgele sorular seçilir
        const testData = generateRandomTest();
        setTestQuestions(testData);
      } catch (error) {
        console.error("Seviye testi soruları yüklenirken hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTestQuestions();
  }, []);
  
  // Süre sayacı
  useEffect(() => {
    if (isLoading || showResults || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTestEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, showResults, timeLeft]);
  
  // Rastgele test oluşturma fonksiyonu
  const generateRandomTest = () => {
    // Gerçek uygulamada, bu işlem sunucu tarafında yapılır ve veritabanından sorular çekilir
    
    // Örnek sorular (gerçek uygulamada daha geniş bir havuz olur)
    const allQuestions = [
      // A1-A2 Seviyesi Sorular (Kolay)
      {
        id: "q1",
        level: "A1-A2",
        question: "What ___ your name?",
        options: ["are", "is", "am", "be"],
        answer: "is",
      },
      {
        id: "q2",
        level: "A1-A2",
        question: "She ___ from Turkey.",
        options: ["is", "are", "am", "be"],
        answer: "is",
      },
      {
        id: "q3",
        level: "A1-A2",
        question: "I ___ coffee every morning.",
        options: ["drink", "drinks", "drinking", "am drink"],
        answer: "drink",
      },
      
      // B1-B2 Seviyesi Sorular (Orta)
      {
        id: "q4",
        level: "B1-B2",
        question: "If I ___ rich, I would travel the world.",
        options: ["am", "was", "were", "have been"],
        answer: "were",
      },
      {
        id: "q5",
        level: "B1-B2",
        question: "She asked me what I ___ doing the next day.",
        options: ["am", "was", "were", "would be"],
        answer: "would be",
      },
      {
        id: "q6",
        level: "B1-B2",
        question: "The film ___ by the time we got to the cinema.",
        options: ["started", "was starting", "has started", "had started"],
        answer: "had started",
      },
      
      // C1-C2 Seviyesi Sorular (Zor)
      {
        id: "q7",
        level: "C1-C2",
        question: "Had they ___ about the consequences, they might have acted differently.",
        options: ["thought", "think", "thinks", "thinking"],
        answer: "thought",
      },
      {
        id: "q8",
        level: "C1-C2",
        question: "Seldom ___ such talented musicians in our small town.",
        options: ["we see", "see we", "do we see", "we do see"],
        answer: "do we see",
      },
      {
        id: "q9",
        level: "C1-C2",
        question: "No sooner ___ home than the phone rang.",
        options: ["I had got", "had I got", "I got", "I have got"],
        answer: "had I got",
      },
      
      // Farklı seviyede daha fazla soru...
    ];
    
    // Soruları karıştır ve test için rastgele 20 soru seç
    return shuffleArray(allQuestions).slice(0, 20);
  };
  
  // Diziyi karıştıran yardımcı fonksiyon
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // CEFR seviyesini hesapla
  const calculateCEFRLevel = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100;
    
    if (percentage < 25) return "A1";
    else if (percentage < 45) return "A2";
    else if (percentage < 65) return "B1";
    else if (percentage < 80) return "B2";
    else if (percentage < 95) return "C1";
    else return "C2";
  };
  
  // Cevabı işle
  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };
  
  // Sonraki soruya geç
  const handleNextQuestion = () => {
    // Cevap doğruysa skoru artır
    if (selectedAnswer === testQuestions[currentQuestion].answer) {
      setScore(prevScore => prevScore + 1);
    }
    
    // Sonraki soruya geç veya testi tamamla
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < testQuestions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer('');
    } else {
      handleTestEnd();
    }
  };
  
  // Testi sonlandır
  const handleTestEnd = () => {
    const finalScore = selectedAnswer === testQuestions[currentQuestion]?.answer 
      ? score + 1 
      : score;
    
    setScore(finalScore);
    setShowResults(true);
    setTestCompleted(true);
    
    const cefrLevel = calculateCEFRLevel(finalScore, testQuestions.length);
    setCefr(cefrLevel);
    
    // Burada API'ye sonuçları gönderebilirsiniz
    // Örnek: saveTestResults(finalScore, cefrLevel);
  };
  
  // Dakika ve saniye formatında süreyi göster
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Yeni bir test başlat
  const handleRestartTest = () => {
    // Yeni test için sayfa yenilenir
    window.location.reload();
  };
  
  return (
    <div className="level-test-page">
      <div className="test-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Seviye testi hazırlanıyor...</p>
          </div>
        ) : showResults ? (
          <div className="results-container">
            <h2>Test Sonuçları</h2>
            <div className="results-box">
              <div className="cefr-level">
                <h3>Seviyeniz:</h3>
                <div className="cefr-badge">{cefr}</div>
              </div>
              
              <p className="score-text">
                <span className="highlighted">{testQuestions.length}</span> soru içinden 
                <span className="highlighted"> {score}</span> doğru cevap
              </p>
              
              <div className="cefr-description">
                <h4>CEFR {cefr} Seviyesi:</h4>
                {cefr === 'A1' && <p>Temel seviye. Basit günlük ifadeleri anlayabilir ve kullanabilirsiniz.</p>}
                {cefr === 'A2' && <p>Temel ihtiyaçlar hakkında iletişim kurabilirsiniz. Basit ve doğrudan bilgi alışverişi yapabilirsiniz.</p>}
                {cefr === 'B1' && <p>Eşik seviye. Seyahatte, okul ve iş hayatında karşılaşılan durumlarla başa çıkabilirsiniz.</p>}
                {cefr === 'B2' && <p>Orta-üstü seviye. Teknik konularda tartışabilir, akıcı ve spontane iletişim kurabilirsiniz.</p>}
                {cefr === 'C1' && <p>İleri seviye. Karmaşık metinleri anlayabilir ve fikirlerinizi akıcı bir şekilde ifade edebilirsiniz.</p>}
                {cefr === 'C2' && <p>Ustalık seviyesi. Neredeyse anadili gibi İngilizce konuşabilirsiniz.</p>}
              </div>
              
              <div className="results-actions">
                <button className="restart-test-btn" onClick={handleRestartTest}>
                  <i className="fas fa-redo"></i> Yeni Test Başlat
                </button>
                <button className="start-learning-btn" onClick={() => navigate('/dashboard')}>
                  <i className="fas fa-graduation-cap"></i> Öğrenmeye Başla
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="test-header">
              <h1>İngilizce Seviye Testi</h1>
              <div className="test-info">
                <div className="question-counter">
                  <span className="current">{currentQuestion + 1}</span>
                  <span className="total">/{testQuestions.length}</span>
                </div>
                <div className="timer">
                  <i className="fas fa-clock"></i> {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            
            <div className="question-container">
              <h3 className="question-text">{testQuestions[currentQuestion]?.question}</h3>
              
              <div className="options-container">
                {testQuestions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelection(option)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>
              
              <div className="test-actions">
                <button
                  className="next-btn"
                  disabled={!selectedAnswer}
                  onClick={handleNextQuestion}
                >
                  {currentQuestion === testQuestions.length - 1 ? 'Testi Bitir' : 'Sonraki Soru'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelTestPage; 