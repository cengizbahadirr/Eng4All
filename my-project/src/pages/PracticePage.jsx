import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/PracticePage.css';

const PracticePage = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const practiceOptions = [
    {
      id: 'vocabulary',
      title: 'Kelime Pratiği',
      description: 'Farklı düzeylerde kelime bilginizi geliştirin, çeşitli aktivitelerle kelime haznenizi zenginleştirin.',
      icon: 'fas fa-book',
      color: '#4d8af0',
      path: '/practice/vocabulary'
    },
    {
      id: 'grammar',
      title: 'Gramer Pratiği',
      description: 'İngilizce dilbilgisi yapılarını öğrenin ve alıştırmalarla pekiştirin.',
      icon: 'fas fa-spell-check',
      color: '#6b48ff',
      path: '/practice/grammar'
    }
  ];

  return (
    <div className="practice-page">
      <div className="practice-container">
        <div className="practice-header">
          <h1>Pratik Yapın</h1>
          <p className="practice-description">
            İngilizce kelime ve gramer becerilerinizi geliştirmek için uygun pratik alanını seçin.
          </p>
        </div>
        
        <div className="practice-options">
          {practiceOptions.map((option) => (
            <div 
              key={option.id}
              className={`practice-option-card ${selectedOption === option.id ? 'selected' : ''}`}
              onClick={() => setSelectedOption(option.id)}
              style={{ '--card-highlight-color': option.color }}
            >
              <div className="option-icon">
                <i className={option.icon}></i>
              </div>
              <div className="option-content">
                <h2>{option.title}</h2>
                <p>{option.description}</p>
              </div>
              <Link to={option.path} className="start-practice-btn">
                Başla
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="practice-info-section">
          <div className="practice-info-card">
            <div className="info-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <div className="info-content">
              <h3>Düzenli Pratik Önemlidir</h3>
              <p>
                Yabancı bir dili öğrenmek için en etkili yöntem, düzenli ve sürekli alıştırma yapmaktır. 
                Her gün 15-20 dakika pratik yaparak dil becerilerinizi hızla geliştirebilirsiniz.
              </p>
            </div>
          </div>
          
          <div className="practice-info-card">
            <div className="info-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="info-content">
              <h3>İlerleyişinizi Takip Edin</h3>
              <p>
                Sitemizde yaptığınız alıştırmaların istatistiklerini kaydediyor ve gelişiminizi
                gösteriyoruz. Böylece hangi alanlarda daha fazla çalışmanız gerektiğini görebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage; 