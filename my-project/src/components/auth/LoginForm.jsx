import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthForms.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Burada backend API'ye giriş isteği gönderilecek
        console.log('Giriş başarılı!', formData);
        alert('Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz.');
        // Ana sayfaya yönlendirme işlemleri burada olacak
      } catch (error) {
        console.error('Giriş hatası:', error);
        setErrors({ submit: 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Eng4All'a Hoş Geldiniz</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">E-posta</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-posta adresinizi girin"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Şifre</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Şifrenizi girin"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        
        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe">Beni hatırla</label>
          </div>
          
          <Link to="/forgot-password" className="forgot-password">
            Şifremi unuttum
          </Link>
        </div>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      
      <div className="auth-footer">
        Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
      </div>
    </div>
  );
};

export default LoginForm;