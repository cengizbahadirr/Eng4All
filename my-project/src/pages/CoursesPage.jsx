import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/CoursesPage.css';
import { FaGraduationCap, FaClock, FaStar, FaUsers, FaLock, FaUnlock, FaBookOpen, FaPuzzlePiece, FaMicrophone, FaPen } from 'react-icons/fa';
import PageTransition from '../components/animations/PageTransition';
import LoadingScreen from '../components/common/LoadingScreen';

const CoursesPage = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Sayfa yüklenme simülasyonu
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const courses = [
    {
      id: 1,
      title: "İngilizce Temel Seviye (A1)",
      description: "İngilizce öğrenmeye sıfırdan başlamak isteyenler için temel kavramlar, yaygın ifadeler ve basit günlük konuşmalar",
      level: "Başlangıç",
      levelValue: "A1",
      duration: "10 hafta",
      students: 1243,
      rating: 4.8,
      image: "/images/courses/beginner.jpg",
      modules: 8,
      isPopular: true,
      isLocked: false,
      progress: 0,
      tags: ["grammar", "vocabulary", "beginner"],
      skills: ["listening", "speaking", "reading", "writing"]
    },
    {
      id: 2,
      title: "İngilizce Alt-Orta Seviye (A2)",
      description: "Temel İngilizce bilgisi olan öğrenciler için günlük konuşmalar, sık kullanılan deyimler ve pratik alıştırmalar",
      level: "Alt-Orta",
      levelValue: "A2",
      duration: "12 hafta",
      students: 956,
      rating: 4.7,
      image: "/images/courses/elementary.jpg",
      modules: 10,
      isPopular: false,
      isLocked: false,
      progress: 0,
      tags: ["grammar", "vocabulary", "elementary"],
      skills: ["listening", "speaking", "reading", "writing"]
    },
    {
      id: 3,
      title: "İngilizce Orta Seviye (B1)",
      description: "Daha karmaşık dilbilgisi yapıları, zengin kelime hazinesi ve akıcı konuşma becerileri geliştirme",
      level: "Orta",
      levelValue: "B1",
      duration: "14 hafta",
      students: 782,
      rating: 4.9,
      image: "/images/courses/intermediate.jpg",
      modules: 12,
      isPopular: true,
      isLocked: true,
      progress: 0,
      tags: ["grammar", "vocabulary", "intermediate"],
      skills: ["listening", "speaking", "reading", "writing"]
    },
    {
      id: 4,
      title: "İngilizce Üst-Orta Seviye (B2)",
      description: "Akademik metinler, profesyonel yazışmalar ve güncel konular hakkında tartışma yeteneği kazandırma",
      level: "Üst-Orta",
      levelValue: "B2",
      duration: "16 hafta",
      students: 645,
      rating: 4.6,
      image: "/images/courses/upper-intermediate.jpg",
      modules: 15,
      isPopular: false,
      isLocked: true,
      progress: 0,
      tags: ["grammar", "vocabulary", "upper-intermediate"],
      skills: ["listening", "speaking", "reading", "writing"]
    },
    {
      id: 5,
      title: "İngilizce İleri Seviye (C1)",
      description: "Akıcı ve doğal konuşma, akademik yazma, detaylı dinleme ve kapsamlı okuma becerileri",
      level: "İleri",
      levelValue: "C1",
      duration: "18 hafta",
      students: 421,
      rating: 4.9,
      image: "/images/courses/advanced.jpg",
      modules: 18,
      isPopular: false,
      isLocked: true,
      progress: 0,
      tags: ["grammar", "vocabulary", "advanced"],
      skills: ["listening", "speaking", "reading", "writing"]
    },
    {
      id: 6,
      title: "İş İngilizcesi",
      description: "Profesyonel iletişim, toplantı yönetimi, sunum teknikleri ve iş yazışmaları",
      level: "Orta-İleri",
      levelValue: "B1-C1",
      duration: "8 hafta",
      students: 576,
      rating: 4.8,
      image: "/images/courses/business.jpg",
      modules: 6,
      isPopular: true,
      isLocked: true,
      progress: 0,
      tags: ["business", "professional"],
      skills: ["speaking", "writing"]
    },
    {
      id: 7,
      title: "İngilizce Konuşma Pratiği",
      description: "Gerçek hayat senaryoları üzerinden konuşma pratiği, telaffuz çalışmaları ve akıcılık geliştirme",
      level: "Tüm Seviyeler",
      levelValue: "A1-C1",
      duration: "6 hafta",
      students: 892,
      rating: 4.9,
      image: "/images/courses/speaking.jpg",
      modules: 12,
      isPopular: true,
      isLocked: false,
      progress: 0,
      tags: ["speaking", "pronunciation"],
      skills: ["speaking", "listening"]
    },
    {
      id: 8,
      title: "TOEFL Sınav Hazırlık",
      description: "TOEFL sınavının tüm bölümleri için kapsamlı hazırlık, strateji geliştirme ve pratik sınavlar",
      level: "Orta-İleri",
      levelValue: "B1-C1",
      duration: "12 hafta",
      students: 512,
      rating: 4.7,
      image: "/images/courses/toefl.jpg",
      modules: 10,
      isPopular: false,
      isLocked: true,
      progress: 0,
      tags: ["exam", "toefl"],
      skills: ["reading", "listening", "speaking", "writing"]
    }
  ];

  // Filtreleme ve arama fonksiyonu
  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || 
                          (filter === 'popular' && course.isPopular) || 
                          (filter === 'unlocked' && !course.isLocked) ||
                          (filter === 'beginner' && (course.levelValue === 'A1' || course.levelValue === 'A2')) ||
                          (filter === 'intermediate' && (course.levelValue === 'B1' || course.levelValue === 'B2')) ||
                          (filter === 'advanced' && (course.levelValue === 'C1'));
    
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  const getSkillIcon = (skill) => {
    switch(skill) {
      case 'listening': return <FaMicrophone />;
      case 'speaking': return <FaUsers />;
      case 'reading': return <FaBookOpen />;
      case 'writing': return <FaPen />;
      default: return <FaPuzzlePiece />;
    }
  };

  return (
    <PageTransition>
      <div className="courses-page">
        <div className="courses-hero">
          <div className="courses-hero-content">
            <h1>İngilizce Eğitim Kursları</h1>
            <p>Seviyenize ve hedeflerinize uygun kurslarla İngilizce öğrenme yolculuğunuza başlayın</p>
          </div>
        </div>

        <div className="courses-container">
          <div className="courses-sidebar">
            <div className="sidebar-section search-section">
              <h3>Kurs Ara</h3>
              <div className="search-input-container">
                <input 
                  type="text" 
                  placeholder="Kurs adı veya içerik..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="sidebar-section filter-section">
              <h3>Filtrele</h3>
              <ul className="filter-options">
                <li 
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => handleFilterChange('all')}
                >
                  Tüm Kurslar
                </li>
                <li 
                  className={filter === 'popular' ? 'active' : ''}
                  onClick={() => handleFilterChange('popular')}
                >
                  Popüler Kurslar
                </li>
                <li 
                  className={filter === 'unlocked' ? 'active' : ''}
                  onClick={() => handleFilterChange('unlocked')}
                >
                  Açık Kurslar
                </li>
              </ul>
            </div>

            <div className="sidebar-section level-section">
              <h3>Seviye</h3>
              <ul className="filter-options">
                <li 
                  className={filter === 'beginner' ? 'active' : ''}
                  onClick={() => handleFilterChange('beginner')}
                >
                  Başlangıç (A1-A2)
                </li>
                <li 
                  className={filter === 'intermediate' ? 'active' : ''}
                  onClick={() => handleFilterChange('intermediate')}
                >
                  Orta Seviye (B1-B2)
                </li>
                <li 
                  className={filter === 'advanced' ? 'active' : ''}
                  onClick={() => handleFilterChange('advanced')}
                >
                  İleri Seviye (C1)
                </li>
              </ul>
            </div>

            <div className="sidebar-section learning-path">
              <h3>Öğrenme Yolu</h3>
              <div className="learning-path-visual">
                <div className="path-step done">
                  <div className="path-circle">A1</div>
                  <div className="path-label">Başlangıç</div>
                </div>
                <div className="path-line"></div>
                <div className="path-step recommended">
                  <div className="path-circle">A2</div>
                  <div className="path-label">Alt-Orta</div>
                </div>
                <div className="path-line"></div>
                <div className="path-step">
                  <div className="path-circle">B1</div>
                  <div className="path-label">Orta</div>
                </div>
                <div className="path-line"></div>
                <div className="path-step">
                  <div className="path-circle">B2</div>
                  <div className="path-label">Üst-Orta</div>
                </div>
                <div className="path-line"></div>
                <div className="path-step">
                  <div className="path-circle">C1</div>
                  <div className="path-label">İleri</div>
                </div>
              </div>
            </div>
          </div>

          <div className="courses-content">
            <div className="courses-header">
              <h2>Mevcut Kurslar <span>({filteredCourses.length})</span></h2>
              <p>Seviyenize ve ilgi alanlarınıza göre kurslara göz atın</p>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="no-courses">
                <img src="/images/empty-state.svg" alt="Kurs bulunamadı" />
                <h3>Aramanıza uygun kurs bulunamadı</h3>
                <p>Farklı anahtar kelimeler deneyebilir veya tüm kursları görüntülemek için filtreleri temizleyebilirsiniz.</p>
                <button className="primary-button" onClick={() => {setFilter('all'); setSearchTerm('');}}>
                  Tüm Kursları Göster
                </button>
              </div>
            ) : (
              <div className="courses-grid">
                {filteredCourses.map(course => (
                  <div className="course-card" key={course.id}>
                    <div className="course-image">
                      <img src={course.image} alt={course.title} />
                      <div className="course-level">{course.levelValue}</div>
                      {course.isPopular && <div className="course-badge">Popüler</div>}
                    </div>
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p className="course-description">{course.description}</p>
                      
                      <div className="course-meta">
                        <div className="meta-item">
                          <FaGraduationCap />
                          <span>{course.level}</span>
                        </div>
                        <div className="meta-item">
                          <FaClock />
                          <span>{course.duration}</span>
                        </div>
                        <div className="meta-item">
                          <FaUsers />
                          <span>{course.students} öğrenci</span>
                        </div>
                      </div>
                      
                      <div className="course-skills">
                        {course.skills.map(skill => (
                          <div key={skill} className={`skill-badge ${skill}`} title={skill}>
                            {getSkillIcon(skill)}
                          </div>
                        ))}
                      </div>
                      
                      <div className="course-footer">
                        <div className="course-rating">
                          <FaStar /> <span>{course.rating}</span>
                        </div>
                        <Link to={course.isLocked ? '/login' : `/courses/${course.id}`} className={`course-button ${course.isLocked ? 'locked' : ''}`}>
                          {course.isLocked ? <><FaLock /> Kilidi Aç</> : <><FaUnlock /> Kursa Başla</>}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CoursesPage; 