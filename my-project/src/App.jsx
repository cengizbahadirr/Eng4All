import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // App.css ekledik
import './styles/index.css'; // Ana CSS dosyası
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LevelTestPage from './pages/LevelTestPage'; // Seviye testi sayfasını ekledik
import DictionaryPage from './pages/DictionaryPage'; // Sözlük sayfasını ekledik
import GrammarCheckPage from './pages/GrammarCheckPage'; // Gramer kontrol sayfasını ekledik
import PracticePage from './pages/PracticePage'; // Pratik ana sayfası
import VocabularyPracticePage from './pages/VocabularyPracticePage'; // Kelime pratiği sayfası
import GrammarPracticePage from './pages/GrammarPracticePage'; // Gramer pratiği sayfası

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/level-test" element={<LevelTestPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/grammar-check" element={<GrammarCheckPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/vocabulary" element={<VocabularyPracticePage />} />
            <Route path="/practice/grammar" element={<GrammarPracticePage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;