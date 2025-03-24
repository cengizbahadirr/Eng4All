import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthForms.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Kullanıcı adı doğrulama
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }
    
    // E-posta doğrulama
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    // Şifre doğrulama
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    // Şifre onay doğrulama
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Burada backend API'ye kayıt isteği gönderilecek
        console.log('Kayıt olma başarılı!', formData);
        alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
        // Giriş sayfasına yönlendirme işlemleri burada olacak
      } catch (error) {
        console.error('Kayıt hatası:', error);
        setErrors({ submit: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Eng4All'a Kayıt Ol</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Kullanıcı Adı</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Kullanıcı adınızı girin"
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>
        
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Şifre Tekrar</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Şifrenizi tekrar girin"
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </button>
      </form>
      
      <div className="auth-footer">
        Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
      </div>
    </div>
  );
};

export default RegisterForm;