import { useState } from 'react';
import '../styles/pages/GrammarPracticePage.css';

const GrammarPracticePage = () => {
  const [currentMode, setCurrentMode] = useState('learn'); // 'learn', 'exercise', 'test'
  const [currentLevel, setCurrentLevel] = useState('beginner'); // 'beginner', 'intermediate', 'advanced'
  const [currentTopic, setCurrentTopic] = useState('present-tense');
  const [showAnswer, setShowAnswer] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showScoreSummary, setShowScoreSummary] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Konular - gerçek uygulamada daha fazla olacak
  const topics = [
    { id: 'present-tense', name: 'Geniş Zaman (Present Tense)' },
    { id: 'past-tense', name: 'Geçmiş Zaman (Past Tense)' },
    { id: 'future-tense', name: 'Gelecek Zaman (Future Tense)' },
    { id: 'present-continuous', name: 'Şimdiki Zaman (Present Continuous)' },
    { id: 'prepositions', name: 'Edatlar (Prepositions)' }
  ];

  // Mock gramer açıklamaları
  const grammarExplanations = {
    beginner: {
      'present-tense': {
        title: 'Simple Present Tense (Geniş Zaman)',
        explanation: 
          'Geniş zaman (Simple Present Tense), alışkanlıkları, genel doğruları, bilimsel gerçekleri ve düzenli yapılan eylemleri anlatmak için kullanılır.\n\n' +
          'Olumlu cümlelerde fiil, öznenin birinci tekil ve çoğul şahıslarında (I, we, you, they) yalın halde kullanılır. Üçüncü tekil şahıslarda (he, she, it) fiile -s veya -es takısı eklenir.\n\n' +
          'Örnek: I work (Ben çalışırım), He works (O çalışır)',
        examples: [
          { english: 'I go to school every day.', turkish: 'Her gün okula giderim.' },
          { english: 'She reads books in the evening.', turkish: 'O akşamları kitap okur.' },
          { english: 'Water boils at 100 degrees Celsius.', turkish: 'Su 100 derece Santigrat\'ta kaynar.' },
          { english: 'They play football on Sundays.', turkish: 'Onlar Pazar günleri futbol oynarlar.' }
        ],
        rules: [
          'Üçüncü tekil şahıslar (he, she, it) için fiilin sonuna -s veya -es eklenir.',
          'Olumsuz cümleler için "do not" (don\'t) veya üçüncü tekil şahıslar için "does not" (doesn\'t) kullanılır.',
          'Soru cümleleri için cümlenin başına "do" veya üçüncü tekil şahıslar için "does" getirilir.'
        ]
      },
      'past-tense': {
        title: 'Simple Past Tense (Geçmiş Zaman)',
        explanation: 
          'Geçmiş zaman (Simple Past Tense), geçmişte tamamlanmış eylemleri anlatmak için kullanılır. Genellikle geçmişte belirli bir zamanda gerçekleşen olaylar için kullanılır.\n\n' +
          'Düzenli fiillere -ed takısı eklenir. Düzensiz fiillerin ikinci halleri kullanılır.\n\n' +
          'Örnek: worked (çalıştı), went (gitti)',
        examples: [
          { english: 'I visited my grandmother last weekend.', turkish: 'Geçen hafta sonu büyükannemi ziyaret ettim.' },
          { english: 'She bought a new car last month.', turkish: 'Geçen ay yeni bir araba satın aldı.' },
          { english: 'We watched a movie yesterday.', turkish: 'Dün bir film izledik.' },
          { english: 'They didn\'t come to the party.', turkish: 'Onlar partiye gelmedi.' }
        ],
        rules: [
          'Düzenli fiillerin sonuna -ed eklenir (work -> worked).',
          'Düzensiz fiillerin geçmiş zaman halleri kullanılır (go -> went).',
          'Olumsuz cümleler için "did not" (didn\'t) kullanılır.',
          'Soru cümleleri için cümlenin başına "did" getirilir.'
        ]
      },
      // Diğer konular eklenebilir
    },
    intermediate: {
      'present-continuous': {
        title: 'Present Continuous Tense (Şimdiki Zaman)',
        explanation: 
          'Şimdiki zaman (Present Continuous Tense), şu anda devam eden eylemleri, geçici durumları ve gelecekte planlanmış eylemleri anlatmak için kullanılır.\n\n' +
          'To be (am, is, are) + fiil + -ing yapısı kullanılır.\n\n' +
          'Örnek: I am working (Çalışıyorum), She is reading (O okuyor)',
        examples: [
          { english: 'I am studying English now.', turkish: 'Şu anda İngilizce çalışıyorum.' },
          { english: 'She is cooking dinner.', turkish: 'O akşam yemeği pişiriyor.' },
          { english: 'We are meeting tomorrow.', turkish: 'Yarın buluşuyoruz. (planlanmış)' },
          { english: 'They aren\'t playing football at the moment.', turkish: 'Şu anda futbol oynamıyorlar.' }
        ],
        rules: [
          'To be (am, is, are) yardımcı fiili + ana fiil + -ing yapısı kullanılır.',
          'Olumsuz cümleler için to be fiilinden sonra "not" getirilir.',
          'Soru cümleleri için to be fiili cümle başına alınır.'
        ]
      },
      // Diğer konular
    },
    advanced: {
      'future-tense': {
        title: 'Future Tenses (Gelecek Zamanlar)',
        explanation: 
          'İngilizce\'de geleceği ifade etmek için birkaç farklı yapı kullanılır. En yaygın olanları:\n\n' +
          '1. Will + fiil: Gelecekteki tahminler, anlık kararlar ve vaatler için.\n' +
          '2. Be going to + fiil: Planlanmış niyetler ve güçlü tahminler için.\n' +
          '3. Present Continuous: Kesin olan gelecek planları için.\n' +
          '4. Present Simple: Resmi programlar ve tarifeler için.',
        examples: [
          { english: 'I will help you with your homework.', turkish: 'Ödevinle ilgili sana yardım edeceğim.' },
          { english: 'She\'s going to study medicine next year.', turkish: 'Gelecek yıl tıp okuyacak.' },
          { english: 'We are flying to London tomorrow.', turkish: 'Yarın Londra\'ya uçuyoruz.' },
          { english: 'The train leaves at 6 pm.', turkish: 'Tren akşam 6\'da kalkıyor.' }
        ],
        rules: [
          'Will + yalın fiil yapısı anlık kararlar, tahminler ve vaatler için kullanılır.',
          'Be going to + yalın fiil yapısı önceden planlanmış niyetler için kullanılır.',
          'Present Continuous (am/is/are + fiil-ing) kesin plan ve düzenlemeler için kullanılır.',
          'Present Simple (yalın fiil) programlanmış gelecek olaylar için kullanılır.'
        ]
      },
      // Diğer konular
    }
  };

  // Alıştırma soruları
  const grammarExercises = {
    beginner: {
      'present-tense': [
        {
          question: "She _____ to work every day.",
          options: ["go", "goes", "going", "went"],
          correctAnswer: "goes"
        },
        {
          question: "I _____ coffee in the morning.",
          options: ["drinks", "drinking", "drink", "drank"],
          correctAnswer: "drink"
        },
        {
          question: "They _____ in London.",
          options: ["lives", "living", "lived", "live"],
          correctAnswer: "live"
        }
      ],
      'past-tense': [
        {
          question: "I _____ to the cinema last weekend.",
          options: ["go", "went", "gone", "going"],
          correctAnswer: "went"
        },
        {
          question: "She _____ her homework yesterday.",
          options: ["finish", "finishing", "finishes", "finished"],
          correctAnswer: "finished"
        },
        {
          question: "We _____ dinner at 8 PM last night.",
          options: ["had", "have", "having", "has"],
          correctAnswer: "had"
        }
      ]
      // Diğer konular için alıştırmalar
    },
    intermediate: {
      'present-continuous': [
        {
          question: "Look! He _____ a book.",
          options: ["read", "reading", "is reading", "reads"],
          correctAnswer: "is reading"
        },
        {
          question: "They _____ football right now.",
          options: ["plays", "play", "are playing", "playing"],
          correctAnswer: "are playing"
        },
        {
          question: "I _____ for my exam this week.",
          options: ["study", "studied", "am studying", "studies"],
          correctAnswer: "am studying"
        }
      ]
      // Diğer konular için alıştırmalar
    },
    advanced: {
      'future-tense': [
        {
          question: "I _____ you tomorrow.",
          options: ["will call", "calling", "am calling", "call"],
          correctAnswer: "will call"
        },
        {
          question: "She _____ to Paris next month.",
          options: ["goes", "went", "is going", "will going"],
          correctAnswer: "is going"
        },
        {
          question: "The train _____ at 5 PM according to the schedule.",
          options: ["will leave", "leaves", "is leaving", "leave"],
          correctAnswer: "leaves"
        }
      ]
      // Diğer konular için alıştırmalar
    }
  };

  // Test soruları
  const grammarTest = [
    {
      question: "She _____ breakfast every morning.",
      options: ["eat", "eats", "eating", "to eat"],
      correctAnswer: "eats"
    },
    {
      question: "We _____ to the cinema last weekend.",
      options: ["go", "went", "gone", "going"],
      correctAnswer: "went"
    },
    {
      question: "Look! They _____ basketball right now.",
      options: ["play", "are playing", "plays", "played"],
      correctAnswer: "are playing"
    },
    {
      question: "I _____ you tomorrow evening.",
      options: ["will see", "see", "am seeing", "saw"],
      correctAnswer: "will see"
    },
    {
      question: "She _____ in London for ten years.",
      options: ["live", "lives", "has lived", "is living"],
      correctAnswer: "has lived"
    },
    {
      question: "This book _____ by Mark Twain.",
      options: ["write", "wrote", "written", "was written"],
      correctAnswer: "was written"
    },
    {
      question: "If I _____ rich, I would buy a big house.",
      options: ["am", "was", "were", "be"],
      correctAnswer: "were"
    },
    {
      question: "You should _____ more water every day.",
      options: ["drink", "to drink", "drinking", "drank"],
      correctAnswer: "drink"
    }
  ];

  // Mevcut konuya göre açıklama alma
  const getCurrentExplanation = () => {
    return grammarExplanations[currentLevel][currentTopic] || null;
  };

  // Mevcut konuya göre alıştırma alma
  const getCurrentExercises = () => {
    return grammarExercises[currentLevel][currentTopic] || [];
  };

  // Mod değiştirme
  const changeMode = (mode) => {
    setCurrentMode(mode);
    setExerciseIndex(0);
    setCurrentAnswers({});
    setScore(0);
    setShowAnswer(false);
    setShowScoreSummary(false);
    setTestCompleted(false);
  };

  // Alıştırmada cevap işaretleme
  const handleSelectAnswer = (questionIndex, option) => {
    setCurrentAnswers({
      ...currentAnswers,
      [questionIndex]: option
    });
  };

  // Alıştırma kontrol
  const checkExercise = () => {
    const exercises = getCurrentExercises();
    let correct = 0;
    
    exercises.forEach((exercise, index) => {
      if (currentAnswers[index] === exercise.correctAnswer) {
        correct++;
      }
    });
    
    setScore(correct);
    setShowScoreSummary(true);
  };

  // Test alıştırmalarını kontrol et
  const checkTest = () => {
    let correct = 0;
    
    grammarTest.forEach((question, index) => {
      if (currentAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    setScore(correct);
    setTestCompleted(true);
    setShowScoreSummary(true);
  };

  // Alıştırmayı sıfırla
  const resetExercise = () => {
    setCurrentAnswers({});
    setScore(0);
    setShowScoreSummary(false);
    setTestCompleted(false);
  };

  return (
    <div className="grammar-practice-page">
      <div className="grammar-container">
        <div className="grammar-header">
          <h1>Gramer Pratiği</h1>
          <p className="grammar-description">
            İngilizce dil bilgisi yapılarını öğrenin ve alıştırmalarla pekiştirin.
          </p>
        </div>
        
        <div className="mode-selector">
          <button 
            className={`mode-btn ${currentMode === 'learn' ? 'active' : ''}`}
            onClick={() => changeMode('learn')}
          >
            <i className="fas fa-book-reader"></i>
            Gramer Konuları
          </button>
          <button 
            className={`mode-btn ${currentMode === 'exercise' ? 'active' : ''}`}
            onClick={() => changeMode('exercise')}
          >
            <i className="fas fa-tasks"></i>
            Konu Alıştırmaları
          </button>
          <button 
            className={`mode-btn ${currentMode === 'test' ? 'active' : ''}`}
            onClick={() => changeMode('test')}
          >
            <i className="fas fa-question-circle"></i>
            Genel Test
          </button>
        </div>
        
        {currentMode !== 'test' && (
          <div className="filter-section">
            <div className="level-selector">
              <label>Seviye:</label>
              <select 
                value={currentLevel} 
                onChange={(e) => setCurrentLevel(e.target.value)}
              >
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
              </select>
            </div>
            
            <div className="topic-selector">
              <label>Konu:</label>
              <select 
                value={currentTopic} 
                onChange={(e) => setCurrentTopic(e.target.value)}
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="practice-content">
          {currentMode === 'learn' && (
            <div className="grammar-explanation-section">
              {getCurrentExplanation() ? (
                <>
                  <h2>{getCurrentExplanation().title}</h2>
                  <div className="explanation-text">
                    {getCurrentExplanation().explanation.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  
                  <div className="examples-section">
                    <h3>Örnekler:</h3>
                    <div className="examples-list">
                      {getCurrentExplanation().examples.map((example, index) => (
                        <div key={index} className="example-item">
                          <p className="english-example">{example.english}</p>
                          <p className="turkish-translation">
                            <i className="fas fa-arrow-right"></i> {example.turkish}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="rules-section">
                    <h3>Temel Kurallar:</h3>
                    <ul className="rules-list">
                      {getCurrentExplanation().rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="no-data-message">
                  <p>Bu konu için henüz içerik eklenmemiştir.</p>
                </div>
              )}
            </div>
          )}

          {currentMode === 'exercise' && (
            <div className="grammar-exercise-section">
              <h2>Alıştırmalar: {topics.find(t => t.id === currentTopic)?.name}</h2>
              
              {getCurrentExercises().length > 0 ? (
                <>
                  {!showScoreSummary ? (
                    <div className="exercises-list">
                      {getCurrentExercises().map((exercise, qIndex) => (
                        <div key={qIndex} className="exercise-item">
                          <p className="exercise-question">{exercise.question}</p>
                          <div className="exercise-options">
                            {exercise.options.map((option, oIndex) => (
                              <button 
                                key={oIndex} 
                                className={`exercise-option ${currentAnswers[qIndex] === option ? 'selected' : ''}`}
                                onClick={() => handleSelectAnswer(qIndex, option)}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        className="check-exercise-btn"
                        onClick={checkExercise}
                        disabled={Object.keys(currentAnswers).length < getCurrentExercises().length}
                      >
                        Cevapları Kontrol Et
                      </button>
                    </div>
                  ) : (
                    <div className="exercise-results">
                      <h3>Sonuçlar</h3>
                      <div className="score-display">
                        <div className="score-circle">
                          <span className="score-number">{score}</span>
                          <span className="score-total">/{getCurrentExercises().length}</span>
                        </div>
                        <p className="score-percentage">
                          {Math.round((score / getCurrentExercises().length) * 100)}%
                        </p>
                      </div>
                      
                      <div className="exercise-answers">
                        {getCurrentExercises().map((exercise, qIndex) => (
                          <div key={qIndex} className="exercise-answer-item">
                            <p className="exercise-question">{exercise.question}</p>
                            <div className="answer-comparison">
                              <div className={`user-answer ${currentAnswers[qIndex] === exercise.correctAnswer ? 'correct' : 'incorrect'}`}>
                                <span>Cevabınız:</span> {currentAnswers[qIndex]}
                                {currentAnswers[qIndex] === exercise.correctAnswer 
                                  ? <i className="fas fa-check"></i>
                                  : <i className="fas fa-times"></i>
                                }
                              </div>
                              {currentAnswers[qIndex] !== exercise.correctAnswer && (
                                <div className="correct-answer">
                                  <span>Doğru Cevap:</span> {exercise.correctAnswer}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button className="retry-btn" onClick={resetExercise}>
                        <i className="fas fa-redo"></i> Tekrar Dene
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-data-message">
                  <p>Bu konu için henüz alıştırma eklenmemiştir.</p>
                </div>
              )}
            </div>
          )}

          {currentMode === 'test' && (
            <div className="grammar-test-section">
              <h2>Gramer Bilgi Testi</h2>
              
              {!testCompleted ? (
                <div className="test-questions">
                  <p className="test-description">
                    Bu test, farklı gramer konularıyla ilgili bilginizi ölçmek için tasarlanmıştır.
                    Tüm soruları cevaplayın ve sonuçlarınızı görün.
                  </p>
                  
                  {grammarTest.map((question, qIndex) => (
                    <div key={qIndex} className="test-item">
                      <p className="test-question">
                        <span className="question-number">{qIndex + 1}.</span> {question.question}
                      </p>
                      <div className="test-options">
                        {question.options.map((option, oIndex) => (
                          <button 
                            key={oIndex} 
                            className={`test-option ${currentAnswers[qIndex] === option ? 'selected' : ''}`}
                            onClick={() => handleSelectAnswer(qIndex, option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    className="submit-test-btn"
                    onClick={checkTest}
                    disabled={Object.keys(currentAnswers).length < grammarTest.length}
                  >
                    Testi Tamamla
                  </button>
                </div>
              ) : (
                <div className="test-results">
                  <h3>Test Sonuçları</h3>
                  
                  <div className="score-display">
                    <div className="score-circle">
                      <span className="score-number">{score}</span>
                      <span className="score-total">/{grammarTest.length}</span>
                    </div>
                    <p className="score-percentage">
                      {Math.round((score / grammarTest.length) * 100)}%
                    </p>
                  </div>
                  
                  <p className="score-message">
                    {score === grammarTest.length
                      ? 'Tebrikler! Gramer bilginiz mükemmel.'
                      : score >= grammarTest.length * 0.8
                      ? 'Harika! Yüksek bir puan aldınız.'
                      : score >= grammarTest.length * 0.6
                      ? 'İyi! Temel gramer konularında başarılısınız.'
                      : score >= grammarTest.length * 0.4
                      ? 'Fena değil, ama daha fazla çalışmanız gerekiyor.'
                      : 'Gramer bilginizi geliştirmek için daha fazla çalışmanız gerekiyor.'}
                  </p>
                  
                  <div className="test-review">
                    <h4>Sorular ve Cevaplar:</h4>
                    {grammarTest.map((question, qIndex) => (
                      <div key={qIndex} className="review-item">
                        <p className="test-question">
                          <span className="question-number">{qIndex + 1}.</span> {question.question}
                        </p>
                        
                        <div className="answer-comparison">
                          <div className={`user-answer ${currentAnswers[qIndex] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                            <span>Cevabınız:</span> {currentAnswers[qIndex]}
                            {currentAnswers[qIndex] === question.correctAnswer 
                              ? <i className="fas fa-check"></i>
                              : <i className="fas fa-times"></i>
                            }
                          </div>
                          {currentAnswers[qIndex] !== question.correctAnswer && (
                            <div className="correct-answer">
                              <span>Doğru Cevap:</span> {question.correctAnswer}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="retry-btn" onClick={resetExercise}>
                    <i className="fas fa-redo"></i> Testi Tekrar Dene
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrammarPracticePage; 