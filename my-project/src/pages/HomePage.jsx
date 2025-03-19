import { Link } from 'react-router-dom';
import '../styles/pages/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>İngilizce <span className="accent-text">Yolculuğunuz</span> Büyüsün</h1>
          <p className="hero-subtitle">
            İngilizce öğrenmenin en etkili yolu: Bilginizi dikin, günlük pratiklerle sulayın ve dil becerilerinizin büyümesini izleyin.
          </p>
          
          <div className="hero-features">
            <div className="hero-feature">
              <i className="fas fa-seedling"></i>
              <span>Günlük 5 Dakika</span>
            </div>
            <div className="hero-feature">
              <i className="fas fa-brain"></i>
              <span>Hafıza Teknikleri</span>
            </div>
            <div className="hero-feature">
              <i className="fas fa-route"></i>
              <span>Kişisel Öğrenme Yolu</span>
            </div>
          </div>
          
          <div className="hero-buttons">
            <Link to="/register" className="primary-button">
              <i className="fas fa-rocket"></i>Hemen Başla
            </Link>
            <Link to="/level-test" className="secondary-button">
              <i className="fas fa-leaf"></i>Seviyeni Keşfet
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/plant-growth.svg?v=4" alt="İngilizce öğrenme yolculuğu - bitki büyüme animasyonu" />
        </div>
        
        <div className="floating-elements">
          <div className="floating-element el-1"></div>
          <div className="floating-element el-2"></div>
          <div className="floating-element el-3"></div>
        </div>
      </section>

      {/* Büyüme Evreleri Bölümü */}
      <section className="progress-path-section">
        <div className="path-container">
          <div className="section-title">
            <h2>Büyüme Evreleriniz</h2>
            <p>İngilizce öğrenme yolculuğunuzda her adımda gelişim göstereceksiniz</p>
          </div>
          
          <div className="learning-path">
            <div className="path-item">
              <div className="path-number">1</div>
              <div className="path-icon">
                <i className="fas fa-seedling"></i>
              </div>
              <h3 className="path-title">Filiz Seviyesi</h3>
              <p className="path-description">
                Dil öğrenme yolculuğunuza yeni başladınız. Temel kelimeler ve günlük 
                ifadelerle İngilizce'ye ilk adımlarınızı atıyorsunuz.
              </p>
              <div className="path-buttons">
                <button className="path-btn path-primary-btn">
                  <i className="fas fa-play-circle"></i> Başla
                </button>
                <button className="path-btn path-secondary-btn">
                  <i className="fas fa-info-circle"></i> Detaylar
                </button>
              </div>
            </div>
            
            <div className="path-item">
              <div className="path-number">2</div>
              <div className="path-icon">
                <i className="fas fa-leaf"></i>
              </div>
              <h3 className="path-title">Büyüme Seviyesi</h3>
              <p className="path-description">
                Artık temel bilgileri öğrendiniz ve kelime dağarcığınız gelişmeye başladı.
                Daha karmaşık cümleler kurabilir ve basit konuşmalar yapabilirsiniz.
              </p>
              <div className="path-buttons">
                <button className="path-btn path-primary-btn">
                  <i className="fas fa-play-circle"></i> Başla
                </button>
                <button className="path-btn path-secondary-btn">
                  <i className="fas fa-info-circle"></i> Detaylar
                </button>
              </div>
            </div>
            
            <div className="path-item">
              <div className="path-number">3</div>
              <div className="path-icon">
                <i className="fas fa-tree"></i>
              </div>
              <h3 className="path-title">Olgunluk Seviyesi</h3>
              <p className="path-description">
                İngilizce bilginiz artık tam olgunluğa ulaştı. Karmaşık konularda bile 
                kendinizi ifade edebilir ve yabancılarla akıcı konuşabilirsiniz.
              </p>
              <div className="path-buttons">
                <button className="path-btn path-primary-btn">
                  <i className="fas fa-play-circle"></i> Başla
                </button>
                <button className="path-btn path-secondary-btn">
                  <i className="fas fa-info-circle"></i> Detaylar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Öğrenme <span className="accent-text">Deneyiminiz</span></h2>
          <p>Bilimsel metodlarla desteklenen etkili dil öğrenme tekniklerimiz</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-spa"></i>
            </div>
            <h3>Uzun Süreli Hafıza</h3>
            <p>Aralıklı tekrar sistemiyle öğrendiklerinizi uzun süreli hafızanıza yerleştirin</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-feather-alt"></i>
            </div>
            <h3>Hafif ve Eğlenceli</h3>
            <p>Mikro öğrenme tekniklerimizle öğrenirken zamanın nasıl geçtiğini unutun</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-sitemap"></i>
            </div>
            <h3>Bağlantılı Öğrenme</h3>
            <p>Kelimeleri hikayeler ve görsellerle bağlayarak beyninize daha iyi kodlayın</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Büyüme Takibi</h3>
            <p>Ayrıntılı analitiklerle dil bahçenizin büyümesini izleyin</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-decoration leaf-left"></div>
        <div className="cta-decoration leaf-right"></div>
        
        <div className="cta-content">
          <h2>İngilizcenizi Bugün Büyütmeye Başlayın</h2>
          <p>Günde sadece 5 dakika ayırarak, dil bahçenizin nasıl çiçek açtığını görün. Ücretsiz hesabınızla hemen ilk kelime tohumlarınızı ekin!</p>
          <Link to="/register" className="cta-button">
            <i className="fas fa-seedling"></i>Ücretsiz Başla
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 