import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/layout/Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Sayfa kaydırıldığında header'ı değiştir
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Mobil menüyü aç/kapat
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <span>E</span>
              <div className="logo-icon-leaf"></div>
            </div>
            <div className="logo-text-container">
              <span className="logo-text">Eng<span className="logo-text-highlight">4</span>All</span>
              <span className="logo-tagline">İngilizce Öğrenme Platformu</span>
            </div>
          </Link>
        </div>
        
        <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                <i className="fas fa-home nav-icon"></i>
                Ana Sayfa
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/courses" className={location.pathname === '/courses' ? 'active' : ''}>
                <i className="fas fa-book-open nav-icon"></i>
                Kurslar
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/practice" className={location.pathname === '/practice' ? 'active' : ''}>
                <i className="fas fa-brain nav-icon"></i>
                Pratik
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/dictionary" className={location.pathname === '/dictionary' ? 'active' : ''}>
                <i className="fas fa-book nav-icon"></i>
                Sözlük
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/grammar-check" className={location.pathname === '/grammar-check' ? 'active' : ''}>
                <i className="fas fa-spell-check nav-icon"></i>
                Gramer Kontrolü
              </Link>
            </li>
          </ul>
          
          <div className="auth-buttons">
            <Link to="/login" className="login-button">
              <i className="fas fa-sign-in-alt button-icon"></i>
              Giriş Yap
            </Link>
            <Link to="/register" className="register-button">
              <i className="fas fa-user-plus button-icon"></i>
              Üye Ol
            </Link>
          </div>
        </nav>
        
        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'mobile-open' : ''}`} 
          onClick={toggleMobileMenu} 
          aria-label="Menü"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </header>
  );
};

export default Header; 