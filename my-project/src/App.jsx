import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css'; // Ana CSS dosyası
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Geçici sayfa bileşeni
const Home = () => <div>Ana Sayfa</div>;

function App() {
  return (
    <Router>
      <div className="app">
        <header>
          <h1>Eng4All</h1>
          <nav>
            <a href="/">Ana Sayfa</a>
            <a href="/login">Giriş</a>
            <a href="/register">Kayıt</a>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        
        <footer>
          <p>© 2025 Eng4All - İngilizce Öğrenme Platformu</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;