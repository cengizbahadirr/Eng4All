import { useState, useEffect } from 'react';
import '../styles/pages/VocabularyPracticePage.css';

const VocabularyPracticePage = () => {
  const [currentMode, setCurrentMode] = useState('learn'); // 'learn', 'flashcard', 'quiz'
  const [currentLevel, setCurrentLevel] = useState('beginner'); // 'beginner', 'intermediate', 'advanced'
  const [currentCategory, setCurrentCategory] = useState('general');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showScoreSummary, setShowScoreSummary] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const categories = [
    { id: 'general', name: 'Genel' },
    { id: 'business', name: 'İş İngilizcesi' },
    { id: 'travel', name: 'Seyahat' },
    { id: 'academic', name: 'Akademik' },
    { id: 'daily', name: 'Günlük Yaşam' }
  ];

  // Mock veri - gerçek uygulamada API'den alınacak
  const vocabularyData = {
    beginner: {
      general: [
        { word: 'hello', translation: 'merhaba', example: 'Hello, how are you today?' },
        { word: 'book', translation: 'kitap', example: 'I am reading a book.' },
        { word: 'house', translation: 'ev', example: 'This is my house.' },
        { word: 'day', translation: 'gün', example: 'Today is a beautiful day.' },
        { word: 'food', translation: 'yemek', example: 'The food is delicious.' },
        { word: 'water', translation: 'su', example: 'I need some water, please.' },
        { word: 'friend', translation: 'arkadaş', example: 'She is my best friend.' },
        { word: 'time', translation: 'zaman', example: 'What time is it?' },
        { word: 'school', translation: 'okul', example: 'My school is very big.' },
        { word: 'family', translation: 'aile', example: 'My family lives in Istanbul.' }
      ],
      // Diğer kategoriler...
    },
    intermediate: {
      general: [
        { word: 'opportunity', translation: 'fırsat', example: 'This is a great opportunity for you.' },
        { word: 'decision', translation: 'karar', example: 'It was a difficult decision to make.' },
        { word: 'achievement', translation: 'başarı', example: 'Getting this job is a significant achievement.' },
        { word: 'relationship', translation: 'ilişki', example: 'We have a good working relationship.' },
        { word: 'environment', translation: 'çevre', example: 'We need to protect our environment.' },
        { word: 'necessary', translation: 'gerekli', example: 'Is it necessary to finish today?' },
        { word: 'consider', translation: 'düşünmek', example: 'Please consider my suggestion.' },
        { word: 'improve', translation: 'geliştirmek', example: 'I need to improve my English.' },
        { word: 'advantage', translation: 'avantaj', example: 'The main advantage is the price.' },
        { word: 'various', translation: 'çeşitli', example: 'They offer various services.' }
      ],
      // Diğer kategoriler...
    },
    advanced: {
      general: [
        { word: 'unprecedented', translation: 'eşi benzeri olmayan', example: 'The growth was unprecedented in our history.' },
        { word: 'eloquent', translation: 'belagatli', example: 'She gave an eloquent speech.' },
        { word: 'pragmatic', translation: 'pragmatik', example: 'We need a pragmatic approach to this problem.' },
        { word: 'ambiguous', translation: 'belirsiz', example: 'The instructions were ambiguous.' },
        { word: 'resilience', translation: 'dayanıklılık', example: 'Her resilience in difficult times is admirable.' },
        { word: 'meticulous', translation: 'titiz', example: 'He is meticulous about details.' },
        { word: 'profound', translation: 'derin', example: 'The book had a profound effect on me.' },
        { word: 'intricate', translation: 'karmaşık', example: 'The design has intricate patterns.' },
        { word: 'versatile', translation: 'çok yönlü', example: "It's a versatile tool for many purposes." },
        { word: 'innovative', translation: 'yenilikçi', example: 'Their innovative approach solved the problem.' }
      ],
      // Diğer kategoriler...
    }
  };

  // Quiz soruları - gerçek uygulamada API'den alınacak
  const quizQuestions = [
    {
      question: "What is the English word for 'kitap'?",
      options: ["Book", "Pen", "Table", "Car"],
      correctAnswer: "Book"
    },
    {
      question: "The word 'resilience' means:",
      options: ["Dayanıklılık", "Kibarlık", "Tembellik", "Korku"],
      correctAnswer: "Dayanıklılık"
    },
    {
      question: "Which is the correct translation of 'improve'?",
      options: ["Geliştirmek", "Azaltmak", "Engellemek", "Unutmak"],
      correctAnswer: "Geliştirmek"
    },
    {
      question: "The word 'merhaba' in English is:",
      options: ["Goodbye", "Hello", "Thank you", "Please"],
      correctAnswer: "Hello"
    },
    {
      question: "Which sentence uses the word 'opportunity' correctly?",
      options: [
        "I opportunity my keys at home.",
        "This is a great opportunity for your career.",
        "She opportunity to the store yesterday.",
        "The opportunity is very spicy."
      ],
      correctAnswer: "This is a great opportunity for your career."
    }
  ];

  // Mevcut modun verilerini al
  const getCurrentData = () => {
    return vocabularyData[currentLevel][currentCategory] || [];
  };

  // Mod değiştirme
  const changeMode = (mode) => {
    setCurrentMode(mode);
    setFlashcardIndex(0);
    setCurrentQuestionIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    setUserAnswer('');
    setScore(0);
    setShowScoreSummary(false);
    setQuizCompleted(false);
    setSelectedAnswer(null);
  };

  // Flashcard fonksiyonları
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextFlashcard = () => {
    const currentData = getCurrentData();
    if (flashcardIndex < currentData.length - 1) {
      setFlashcardIndex(flashcardIndex + 1);
      setIsFlipped(false);
    } else {
      // Son flashcard'da ise başa dön
      setFlashcardIndex(0);
      setIsFlipped(false);
    }
  };

  const prevFlashcard = () => {
    if (flashcardIndex > 0) {
      setFlashcardIndex(flashcardIndex - 1);
      setIsFlipped(false);
    } else {
      // İlk flashcard'da ise sona git
      const currentData = getCurrentData();
      setFlashcardIndex(currentData.length - 1);
      setIsFlipped(false);
    }
  };

  // Quiz fonksiyonları
  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    const correct = selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer;
    if (correct) {
      setScore(score + 1);
    }
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      setShowScoreSummary(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setShowScoreSummary(false);
  };

  return (
    <div className="vocabulary-practice-page">
      <div className="vocabulary-container">
        <div className="vocabulary-header">
          <h1>Kelime Pratiği</h1>
          <p className="vocabulary-description">
            Alıştırmalar yaparak kelime bilginizi geliştirin ve test edin.
          </p>
        </div>
        
        <div className="mode-selector">
          <button 
            className={`mode-btn ${currentMode === 'learn' ? 'active' : ''}`}
            onClick={() => changeMode('learn')}
          >
            <i className="fas fa-book-reader"></i>
            Kelime Listesi
          </button>
          <button 
            className={`mode-btn ${currentMode === 'flashcard' ? 'active' : ''}`}
            onClick={() => changeMode('flashcard')}
          >
            <i className="fas fa-id-card"></i>
            Hafıza Kartları
          </button>
          <button 
            className={`mode-btn ${currentMode === 'quiz' ? 'active' : ''}`}
            onClick={() => changeMode('quiz')}
          >
            <i className="fas fa-question-circle"></i>
            Kelime Testi
          </button>
        </div>
        
        <div className="filter-section">
          <div className="level-selector">
            <label>Seviye:</label>
            <select 
              value={currentLevel} 
              onChange={(e) => setCurrentLevel(e.target.value)}
              disabled={currentMode === 'quiz'}
            >
              <option value="beginner">Başlangıç</option>
              <option value="intermediate">Orta</option>
              <option value="advanced">İleri</option>
            </select>
          </div>
          
          <div className="category-selector">
            <label>Kategori:</label>
            <select 
              value={currentCategory} 
              onChange={(e) => setCurrentCategory(e.target.value)}
              disabled={currentMode === 'quiz'}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="practice-content">
          {currentMode === 'learn' && (
            <div className="vocabulary-list-section">
              <h2>Kelime Listesi - {categories.find(c => c.id === currentCategory)?.name}</h2>
              <div className="vocabulary-list">
                {getCurrentData().map((item, index) => (
                  <div key={index} className="vocabulary-item">
                    <div className="word-section">
                      <h3>{item.word}</h3>
                      <button className="pronunciation-btn">
                        <i className="fas fa-volume-up"></i>
                      </button>
                    </div>
                    <div className="translation-section">
                      <p>{item.translation}</p>
                    </div>
                    <div className="example-section">
                      <p><em>"{item.example}"</em></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentMode === 'flashcard' && (
            <div className="flashcard-section">
              <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={flipCard}>
                <div className="flashcard-front">
                  <h3>{getCurrentData()[flashcardIndex]?.word}</h3>
                  <p className="flip-prompt">Çevirmek için tıklayın</p>
                </div>
                <div className="flashcard-back">
                  <h3>{getCurrentData()[flashcardIndex]?.translation}</h3>
                  <p className="example-text">{getCurrentData()[flashcardIndex]?.example}</p>
                </div>
              </div>
              
              <div className="flashcard-controls">
                <button className="flashcard-btn prev" onClick={prevFlashcard}>
                  <i className="fas fa-arrow-left"></i> Önceki
                </button>
                <div className="flashcard-counter">
                  {flashcardIndex + 1} / {getCurrentData().length}
                </div>
                <button className="flashcard-btn next" onClick={nextFlashcard}>
                  Sonraki <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {currentMode === 'quiz' && !quizCompleted && (
            <div className="quiz-section">
              <div className="quiz-progress">
                Soru {currentQuestionIndex + 1}/{quizQuestions.length}
              </div>
              
              <div className="quiz-question">
                <h3>{quizQuestions[currentQuestionIndex].question}</h3>
              </div>
              
              <div className="quiz-options">
                {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <button 
                    key={index} 
                    className={`quiz-option ${selectedAnswer === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelection(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <button 
                className="check-answer-btn"
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
              >
                Cevabı Kontrol Et
              </button>
            </div>
          )}

          {currentMode === 'quiz' && quizCompleted && (
            <div className="quiz-results">
              <h2>Test Sonucu</h2>
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-number">{score}</span>
                  <span className="score-total">/{quizQuestions.length}</span>
                </div>
                <p className="score-percentage">
                  {Math.round((score / quizQuestions.length) * 100)}%
                </p>
              </div>
              
              <p className="score-message">
                {score === quizQuestions.length
                  ? 'Tebrikler! Mükemmel bir skor elde ettiniz.'
                  : score >= quizQuestions.length / 2
                  ? 'İyi iş! Biraz daha pratik yaparak daha da iyileşebilirsiniz.'
                  : 'Daha fazla pratik yaparak gelişebilirsiniz. Tekrar deneyin!'}
              </p>
              
              <button className="restart-quiz-btn" onClick={restartQuiz}>
                <i className="fas fa-redo"></i> Testi Tekrarla
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyPracticePage; 