import { Link } from 'react-router-dom';
import '../../styles/layout/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <h2>Eng4All</h2>
            <p className="tagline">Kelimeleri hafızanızda yeşertin</p>
            <div className="newsletter">
              <h3>Bültenimize katılın</h3>
              <p>İngilizce ipuçları ve öğrenme stratejileri için abone olun.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="E-posta adresiniz" />
                <button type="submit">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h3>Platformumuz</h3>
              <ul>
                <li><Link to="/">Ana Sayfa</Link></li>
                <li><Link to="/courses">Kurslar</Link></li>
                <li><Link to="/practice">Pratik</Link></li>
                <li><Link to="/about">Hakkımızda</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Öğrenme Araçları</h3>
              <ul>
                <li><Link to="/blog">İngilizce Blog</Link></li>
                <li><Link to="/dictionary">Kelime Sözlüğü</Link></li>
                <li><Link to="/grammar-check">Gramer Kontrolü</Link></li>
                <li><Link to="/faq">Sık Sorulanlar</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Yasal & Destek</h3>
              <ul>
                <li><Link to="/terms">Kullanım Şartları</Link></li>
                <li><Link to="/privacy">Gizlilik Politikası</Link></li>
                <li><Link to="/contact">İletişim</Link></li>
                <li><Link to="/help">Yardım Merkezi</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-info">
            <p>&copy; {currentYear} Eng4All - Tüm hakları saklıdır</p>
            <p className="footer-slogan">İngilizceyi hayatınıza entegre edin 🌱</p>
          </div>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-decoration">
        <div className="leaf leaf-1"></div>
        <div className="leaf leaf-2"></div>
        <div className="leaf leaf-3"></div>
      </div>
    </footer>
  );
};

export default Footer; 