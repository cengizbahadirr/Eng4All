export interface BadgeCriteria {
  type: 'points' | 'streak' | 'quiz_completed' | 'words_learned' | 'level_achieved' | 'grammar_topics_completed';
  value?: number | string; // Puan miktarı, seri gün sayısı, kelime sayısı, seviye adı, tamamlanan konu sayısı
  count?: number; // quiz_completed için tamamlanma sayısı
}

export interface BadgeDefinition {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string; // Gerçek .svg yolu (manuel taşıma sonrası)
  criteria: BadgeCriteria[]; // Bir rozet birden fazla kriterle kazanılabilir (örn: 1000 puan VE A2 seviyesi)
                           // Şimdilik tek kriterli yapalım, gerekirse genişletilir.
}

export const badgeDefinitions: BadgeDefinition[] = [
  {
    badgeId: 'points-100',
    name: 'Acemi Puan Toplayıcı',
    description: 'Tebrikler! Toplam 100 puana ulaştınız.',
    iconUrl: '/images/badges/points-bronze.svg', // Manuel taşıma sonrası bu yol geçerli olacak
    criteria: [{ type: 'points', value: 100 }],
  },
  {
    badgeId: 'points-1000',
    name: 'Puan Canavarı',
    description: 'Harika! Toplam 1000 puana ulaştınız.',
    iconUrl: '/images/badges/points-silver.svg',
    criteria: [{ type: 'points', value: 1000 }],
  },
  {
    badgeId: 'streak-3',
    name: 'Alev Aldı!',
    description: '3 günlük giriş serisini tamamladınız. Devam edin!',
    iconUrl: '/images/badges/streak-3.svg',
    criteria: [{ type: 'streak', value: 3 }],
  },
  {
    badgeId: 'streak-7',
    name: 'Haftanın Yıldızı',
    description: 'Muhteşem! Tam 7 günlük bir giriş serisi yakaladınız.',
    iconUrl: '/images/badges/streak-7.svg',
    criteria: [{ type: 'streak', value: 7 }],
  },
  {
    badgeId: 'first-quiz',
    name: 'Quiz Kaşifi',
    description: 'İlk quizinizi başarıyla tamamladınız. Öğrenmeye devam!',
    iconUrl: '/images/badges/quiz-first.svg',
    criteria: [{ type: 'quiz_completed', count: 1 }], // İlk quiz için count: 1
  },
  {
    badgeId: 'vocab-10',
    name: 'Kelime Avcısı (10)',
    description: '10 yeni kelime öğrendiniz. Kelime dağarcığınız genişliyor!',
    iconUrl: '/images/badges/vocab-10.svg',
    criteria: [{ type: 'words_learned', count: 10 }], // Bu, user.points veya özel bir sayaçla takip edilebilir
  },
  {
    badgeId: 'level-a2',
    name: 'A2 Seviyesine Ulaştı',
    description: 'Tebrikler! İngilizce seviyenizi A2\'ye yükselttiniz.',
    iconUrl: '/images/badges/level-a2.svg',
    criteria: [{ type: 'level_achieved', value: 'A2' }],
  },
  // Gelecekte eklenebilecek diğer rozetler:
  // {
  //   badgeId: 'grammar-pro-5',
  //   name: 'Gramer Uzmanı (5)',
  //   description: '5 farklı gramer konusunu başarıyla tamamladınız.',
  //   iconUrl: '/images/badges/grammar-5.svg',
  //   criteria: [{ type: 'grammar_topics_completed', count: 5 }],
  // },
  // {
  //   badgeId: 'study-time-10h',
  //   name: 'Çalışkan Arı (10 Saat)',
  //   description: 'Toplam 10 saat çalışma süresine ulaştınız.',
  //   iconUrl: '/images/badges/study-time-10.svg',
  //   criteria: [{ type: 'total_study_time_hours', value: 10 }],
  // },
];

// Rozetleri ID'ye göre kolayca bulmak için bir yardımcı fonksiyon
export const getBadgeDefinitionById = (badgeId: string): BadgeDefinition | undefined => {
  return badgeDefinitions.find(badge => badge.badgeId === badgeId);
};
