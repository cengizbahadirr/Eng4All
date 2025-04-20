"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Settings,
  LogOut,
  Home,
  BookOpen,
  PenTool,
  CheckSquare,
  ListChecks,
  Heart,
  MessageSquare,
  BarChart2,
  Trophy,
  User,
  Sun,
  Moon,
  Check,
  X,
  BookIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Eng4AllLogo from "@/components/eng4all-logo"
import { useTheme } from "next-themes"
import { signOut } from "@/actions/auth-actions"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Dummy data for demonstration
const badges = [
  { id: 1, name: "7 Gün Streak", icon: "🔥" },
  { id: 2, name: "100 Kelime", icon: "📚" },
  { id: 3, name: "Gramer Ustası", icon: "🏆" },
]

const leaderboard = [
  { rank: 1, name: "Ahmet Y.", points: 2450, avatar: "" },
  { rank: 2, name: "Zeynep K.", points: 2320, avatar: "" },
  { rank: 3, name: "Mehmet A.", points: 2180, avatar: "" },
]

// Sample grammar topics data
const grammarTopics = {
  A1: [
    {
      id: "a1-1",
      title: "Present Simple Tense",
      description: "Geniş zaman - günlük rutinler ve genel gerçekler için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Present Simple (Geniş Zaman), günlük rutinleri, alışkanlıkları, genel gerçekleri ve değişmeyen durumları ifade etmek için kullanılır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Olumlu cümleler:</strong> I/You/We/They + verb, He/She/It + verb + s</li>
          <li><strong>Olumsuz cümleler:</strong> I/You/We/They + don't + verb, He/She/It + doesn't + verb</li>
          <li><strong>Soru cümleleri:</strong> Do + I/you/we/they + verb?, Does + he/she/it + verb?</li>
        </ul>
        
        <h3>Zaman Belirteçleri</h3>
        <p>Always, usually, often, sometimes, rarely, never, every day, on Mondays, etc.</p>
      `,
      examples: [
        { text: "I <strong>work</strong> in an office.", translation: "Bir ofiste çalışırım." },
        { text: "She <strong>lives</strong> in Istanbul.", translation: "O, İstanbul'da yaşar." },
        { text: "They <strong>don't speak</strong> French.", translation: "Onlar Fransızca konuşmazlar." },
        { text: "<strong>Does</strong> he <strong>play</strong> football?", translation: "O futbol oynar mı?" },
        { text: "The sun <strong>rises</strong> in the east.", translation: "Güneş doğudan doğar." },
      ],
      exercises: [
        {
          id: "a1-1-ex1",
          question: "She _____ to work by bus every day.",
          options: ["go", "goes", "going", "is going"],
          correctAnswer: "goes",
          userAnswer: null,
        },
        {
          id: "a1-1-ex2",
          question: "_____ they live in Ankara?",
          options: ["Do", "Does", "Are", "Is"],
          correctAnswer: "Do",
          userAnswer: null,
        },
        {
          id: "a1-1-ex3",
          question: "We _____ TV in the evening.",
          options: ["watch", "watches", "watching", "are watch"],
          correctAnswer: "watch",
          userAnswer: null,
        },
      ],
    },
    {
      id: "a1-2",
      title: "Present Continuous Tense",
      description: "Şimdiki zaman - şu anda gerçekleşen eylemler için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Present Continuous (Şimdiki Zaman), şu anda gerçekleşen eylemleri, geçici durumları ve gelecek için planlanmış eylemleri ifade etmek için kullanılır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Olumlu cümleler:</strong> I + am + verb-ing, You/We/They + are + verb-ing, He/She/It + is + verb-ing</li>
          <li><strong>Olumsuz cümleler:</strong> I + am not + verb-ing, You/We/They + are not + verb-ing, He/She/It + is not + verb-ing</li>
          <li><strong>Soru cümleleri:</strong> Am + I + verb-ing?, Are + you/we/they + verb-ing?, Is + he/she/it + verb-ing?</li>
        </ul>
        
        <h3>Zaman Belirteçleri</h3>
        <p>Now, at the moment, currently, these days, etc.</p>
      `,
      examples: [
        { text: "I <strong>am studying</strong> English now.", translation: "Şu anda İngilizce çalışıyorum." },
        { text: "She <strong>is cooking</strong> dinner.", translation: "O, akşam yemeği pişiriyor." },
        { text: "They <strong>are not working</strong> today.", translation: "Onlar bugün çalışmıyorlar." },
        { text: "<strong>Are</strong> you <strong>listening</strong> to me?", translation: "Beni dinliyor musun?" },
        { text: "We <strong>are meeting</strong> at 6 PM tomorrow.", translation: "Yarın saat 6'da buluşuyoruz." },
      ],
      exercises: [
        {
          id: "a1-2-ex1",
          question: "Look! It _____ (rain).",
          options: ["rain", "rains", "is raining", "are raining"],
          correctAnswer: "is raining",
          userAnswer: null,
        },
        {
          id: "a1-2-ex2",
          question: "They _____ (not/watch) TV right now.",
          options: ["not watching", "don't watch", "aren't watching", "doesn't watch"],
          correctAnswer: "aren't watching",
          userAnswer: null,
        },
        {
          id: "a1-2-ex3",
          question: "_____ you _____ (study) for the exam?",
          options: ["Are / studying", "Do / study", "Is / studying", "Does / study"],
          correctAnswer: "Are / studying",
          userAnswer: null,
        },
      ],
    },
  ],
  A2: [
    {
      id: "a2-1",
      title: "Past Simple Tense",
      description: "Geçmiş zaman - tamamlanmış geçmiş eylemler için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Past Simple (Geçmiş Zaman), geçmişte tamamlanmış eylemleri, geçmişteki alışkanlıkları ve ardışık eylemleri ifade etmek için kullanılır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Olumlu cümleler:</strong> Subject + verb (past form)</li>
          <li><strong>Olumsuz cümleler:</strong> Subject + did not (didn't) + verb (base form)</li>
          <li><strong>Soru cümleleri:</strong> Did + subject + verb (base form)?</li>
        </ul>
        
        <h3>Düzenli ve Düzensiz Fiiller</h3>
        <p>Düzenli fiiller -ed eki alır (work → worked), düzensiz fiillerin geçmiş halleri farklıdır (go → went).</p>
        
        <h3>Zaman Belirteçleri</h3>
        <p>Yesterday, last week, last month, in 2010, two days ago, etc.</p>
      `,
      examples: [
        { text: "I <strong>visited</strong> my grandmother yesterday.", translation: "Dün büyükannemi ziyaret ettim." },
        { text: "She <strong>didn't go</strong> to school last week.", translation: "Geçen hafta okula gitmedi." },
        { text: "<strong>Did</strong> they <strong>watch</strong> the movie?", translation: "Filmi izlediler mi?" },
        { text: "We <strong>were</strong> at home last night.", translation: "Dün gece evdeydik." },
        { text: "He <strong>bought</strong> a new car last month.", translation: "Geçen ay yeni bir araba aldı." },
      ],
      exercises: [
        {
          id: "a2-1-ex1",
          question: "I _____ (see) a good movie yesterday.",
          options: ["see", "saw", "seen", "seeing"],
          correctAnswer: "saw",
          userAnswer: null,
        },
        {
          id: "a2-1-ex2",
          question: "She _____ (not/go) to the party last night.",
          options: ["not went", "didn't go", "doesn't go", "isn't going"],
          correctAnswer: "didn't go",
          userAnswer: null,
        },
        {
          id: "a2-1-ex3",
          question: "_____ they _____ (finish) their homework?",
          options: ["Did / finish", "Do / finish", "Were / finishing", "Are / finishing"],
          correctAnswer: "Did / finish",
          userAnswer: null,
        },
      ],
    },
    {
      id: "a2-2",
      title: "Comparative and Superlative Adjectives",
      description: "Karşılaştırma ve en üstünlük sıfatları",
      explanation: `
        <h3>Karşılaştırma Sıfatları (Comparative Adjectives)</h3>
        <p>İki şeyi karşılaştırmak için kullanılır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Kısa sıfatlar (1-2 hece):</strong> Adjective + -er (tall → taller)</li>
          <li><strong>Uzun sıfatlar (2+ hece):</strong> more + adjective (beautiful → more beautiful)</li>
          <li><strong>Düzensiz sıfatlar:</strong> good → better, bad → worse, etc.</li>
        </ul>
        
        <h3>En Üstünlük Sıfatları (Superlative Adjectives)</h3>
        <p>Üç veya daha fazla şey arasında en üstün olanı belirtmek için kullanılır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Kısa sıfatlar (1-2 hece):</strong> the + adjective + -est (tall → the tallest)</li>
          <li><strong>Uzun sıfatlar (2+ hece):</strong> the most + adjective (beautiful → the most beautiful)</li>
          <li><strong>Düzensiz sıfatlar:</strong> good → the best, bad → the worst, etc.</li>
        </ul>
      `,
      examples: [
        { text: "She is <strong>taller than</strong> her sister.", translation: "O, kız kardeşinden daha uzundur." },
        {
          text: "This book is <strong>more interesting than</strong> that one.",
          translation: "Bu kitap diğerinden daha ilginçtir.",
        },
        {
          text: "He is <strong>the tallest</strong> student in the class.",
          translation: "O, sınıftaki en uzun öğrencidir.",
        },
        {
          text: "This is <strong>the most expensive</strong> restaurant in town.",
          translation: "Bu, şehirdeki en pahalı restoran.",
        },
        {
          text: "My dog is <strong>better</strong> than your dog.",
          translation: "Benim köpeğim seninkinden daha iyi.",
        },
      ],
      exercises: [
        {
          id: "a2-2-ex1",
          question: "This building is _____ (tall) than that one.",
          options: ["tall", "taller", "tallest", "more tall"],
          correctAnswer: "taller",
          userAnswer: null,
        },
        {
          id: "a2-2-ex2",
          question: "She is _____ (good) student in the class.",
          options: ["good", "better", "the good", "the best"],
          correctAnswer: "the best",
          userAnswer: null,
        },
        {
          id: "a2-2-ex3",
          question: "This exercise is _____ (difficult) than the previous one.",
          options: ["difficult", "difficulter", "more difficult", "most difficult"],
          correctAnswer: "more difficult",
          userAnswer: null,
        },
      ],
    },
  ],
  B1: [
    {
      id: "b1-1",
      title: "Present Perfect Tense",
      description: "Yakın geçmiş zaman - geçmişte başlayıp şimdiye kadar devam eden eylemler için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Present Perfect (Yakın Geçmiş Zaman), geçmişte başlayıp şimdiye kadar devam eden eylemleri, henüz tamamlanmış eylemleri ve zamanı belirtilmemiş geçmiş deneyimleri ifade etmek için kullanılır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Olumlu cümleler:</strong> Subject + have/has + past participle</li>
          <li><strong>Olumsuz cümleler:</strong> Subject + have/has + not + past participle</li>
          <li><strong>Soru cümleleri:</strong> Have/Has + subject + past participle?</li>
        </ul>
        
        <h3>Zaman Belirteçleri</h3>
        <p>For, since, already, yet, ever, never, just, recently, etc.</p>
      `,
      examples: [
        {
          text: "I <strong>have lived</strong> in Istanbul for five years.",
          translation: "Beş yıldır İstanbul'da yaşıyorum.",
        },
        { text: "She <strong>has worked</strong> here since 2018.", translation: "2018'den beri burada çalışıyor." },
        {
          text: "They <strong>haven't finished</strong> their project yet.",
          translation: "Henüz projelerini bitirmediler.",
        },
        {
          text: "<strong>Have</strong> you <strong>ever visited</strong> Paris?",
          translation: "Hiç Paris'i ziyaret ettin mi?",
        },
        { text: "He <strong>has just arrived</strong> home.", translation: "O, eve yeni geldi." },
      ],
      exercises: [
        {
          id: "b1-1-ex1",
          question: "I _____ (live) in this city for ten years.",
          options: ["live", "lived", "have lived", "am living"],
          correctAnswer: "have lived",
          userAnswer: null,
        },
        {
          id: "b1-1-ex2",
          question: "She _____ (not/see) that movie yet.",
          options: ["not seen", "didn't see", "hasn't seen", "don't see"],
          correctAnswer: "hasn't seen",
          userAnswer: null,
        },
        {
          id: "b1-1-ex3",
          question: "_____ you ever _____ (be) to London?",
          options: ["Have / been", "Did / be", "Are / being", "Do / be"],
          correctAnswer: "Have / been",
          userAnswer: null,
        },
      ],
    },
    {
      id: "b1-2",
      title: "Conditionals (Type 1 and 2)",
      description: "Koşul cümleleri - gerçek ve gerçek olmayan koşullar için kullanılır",
      explanation: `
    <h3>Type 1 Conditionals (Gerçek Koşullar)</h3>
    <p>Gerçekleşme olasılığı yüksek olan koşulları ifade etmek için kullanılır.</p>
    
    <h3>Yapı</h3>
    <p>If + present simple, will/can/may/must + infinitive</p>
    
    <h3>Type 2 Conditionals (Gerçek Olmayan Koşullar)</h3>
    <p>Gerçekleşme olasılığı düşük olan veya hayali koşulları ifade etmek için kullanılır.</p>
    
    <h3>Yapı</h3>
    <p>If + past simple, would/could/might + infinitive</p>
  `,
      examples: [
        {
          text: "<strong>If it rains</strong>, I <strong>will stay</strong> at home.",
          translation: "Eğer yağmur yağarsa, evde kalacağım.",
        },
        {
          text: "<strong>If you study</strong> hard, you <strong>will pass</strong> the exam.",
          translation: "Eğer sıkı çalışırsan, sınavı geçeceksin.",
        },
        {
          text: "<strong>If I had</strong> more money, I <strong>would buy</strong> a new car.",
          translation: "Daha fazla param olsaydı, yeni bir araba alırdım.",
        },
        {
          text: "<strong>If she spoke</strong> English, she <strong>could get</strong> a better job.",
          translation: "İngilizce konuşabilseydi, daha iyi bir iş bulabilirdi.",
        },
        {
          text: "<strong>If I were</strong> you, I <strong>would talk</strong> to him.",
          translation: "Senin yerinde olsaydım, onunla konuşurdum.",
        },
      ],
      exercises: [
        {
          id: "b1-2-ex1",
          question: "If it _____ (rain) tomorrow, we _____ (cancel) the picnic.",
          options: ["rains / will cancel", "rains / would cancel", "rained / will cancel", "rained / would cancel"],
          correctAnswer: "rains / will cancel",
          userAnswer: null,
        },
        {
          id: "b1-2-ex2",
          question: "If I _____ (have) enough money, I _____ (travel) around the world.",
          options: ["have / will travel", "had / will travel", "have / would travel", "had / would travel"],
          correctAnswer: "had / would travel",
          userAnswer: null,
        },
        {
          id: "b1-2-ex3",
          question: "If she _____ (study) harder, she _____ (pass) the exam.",
          options: ["studies / will pass", "studied / will pass", "studies / would pass", "studied / would pass"],
          correctAnswer: "studies / will pass",
          userAnswer: null,
        },
      ],
    },
  ],
  B2: [
    {
      id: "b2-1",
      title: "Passive Voice",
      description: "Edilgen yapı - eylemi yapan değil, eylemin kendisi önemli olduğunda kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Passive Voice (Edilgen Yapı), eylemi yapan kişiden ziyade eylemin kendisine odaklanmak istediğimizde kullanılır. Eylemi yapan kişi bilinmediğinde, önemli olmadığında veya vurgulanmak istenmediğinde tercih edilir.</p>
        
        <h3>Yapı</h3>
        <p>Be (am/is/are/was/were/been) + past participle</p>
        
        <h3>Farklı Zamanlarda Passive Voice</h3>
        <ul>
          <li><strong>Present Simple:</strong> Active: They build houses. → Passive: Houses are built (by them).</li>
          <li><strong>Past Simple:</strong> Active: They built this house. → Passive: This house was built (by them).</li>
          <li><strong>Present Perfect:</strong> Active: They have built many houses. → Passive: Many houses have been built (by them).</li>
          <li><strong>Future Simple:</strong> Active: They will build a new house. → Passive: A new house will be built (by them).</li>
        </ul>
      `,
      examples: [
        {
          text: "This book <strong>was written</strong> by Mark Twain.",
          translation: "Bu kitap Mark Twain tarafından yazıldı.",
        },
        {
          text: "English <strong>is spoken</strong> in many countries.",
          translation: "İngilizce birçok ülkede konuşulur.",
        },
        { text: "The window <strong>has been broken</strong>.", translation: "Pencere kırılmış." },
        {
          text: "The letter <strong>will be delivered</strong> tomorrow.",
          translation: "Mektup yarın teslim edilecek.",
        },
        {
          text: "The thief <strong>was caught</strong> by the police.",
          translation: "Hırsız polis tarafından yakalandı.",
        },
      ],
      exercises: [
        {
          id: "b2-1-ex1",
          question: "This house _____ (build) in 1980.",
          options: ["built", "was built", "is built", "has built"],
          correctAnswer: "was built",
          userAnswer: null,
        },
        {
          id: "b2-1-ex2",
          question: "The letter _____ (write) by John.",
          options: ["wrote", "was written", "is writing", "has written"],
          correctAnswer: "was written",
          userAnswer: null,
        },
        {
          id: "b2-1-ex3",
          question: "English _____ (speak) in many countries.",
          options: ["speaks", "spoke", "is spoken", "has spoken"],
          correctAnswer: "is spoken",
          userAnswer: null,
        },
      ],
    },
    {
      id: "b2-2",
      title: "Reported Speech",
      description: "Dolaylı anlatım - başkasının söylediklerini aktarmak için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Reported Speech (Dolaylı Anlatım), başka birinin söylediklerini aktarmak için kullanılır.</p>
        
        <h3>Yapı</h3>
        <p>Direct speech: "I am happy," she said. → Reported speech: She said (that) she was happy.</p>
        
        <h3>Zaman Değişimleri</h3>
        <ul>
          <li><strong>Present Simple → Past Simple:</strong> "I work here." → He said he worked there.</li>
          <li><strong>Present Continuous → Past Continuous:</strong> "I am studying." → She said she was studying.</li>
          <li><strong>Present Perfect → Past Perfect:</strong> "I have finished." → He said he had finished.</li>
          <li><strong>Past Simple → Past Perfect:</strong> "I bought a car." → She said she had bought a car.</li>
          <li><strong>Will → Would:</strong> "I will help." → He said he would help.</li>
        </ul>
        
        <h3>Diğer Değişimler</h3>
        <ul>
          <li><strong>Zamir değişimleri:</strong> I → he/she, we → they, etc.</li>
          <li><strong>Zaman belirteçleri değişimleri:</strong> now → then, today → that day, yesterday → the day before, etc.</li>
          <li><strong>Yer belirteçleri değişimleri:</strong> here → there, this → that, etc.</li>
        </ul>
      `,
      examples: [
        {
          text: 'Direct: "I am tired." → Reported: He said (that) <strong>he was tired</strong>.',
          translation: 'Direkt: "Yorgunum." → Dolaylı: Yorgun olduğunu söyledi.',
        },
        {
          text: 'Direct: "I will call you tomorrow." → Reported: She said (that) <strong>she would call me the next day</strong>.',
          translation: 'Direkt: "Yarın seni arayacağım." → Dolaylı: Ertesi gün beni arayacağını söyledi.',
        },
        {
          text: 'Direct: "I have finished my homework." → Reported: He said (that) <strong>he had finished his homework</strong>.',
          translation: 'Direkt: "Ödevimi bitirdim." → Dolaylı: Ödevini bitirdiğini söyledi.',
        },
        {
          text: 'Direct: "We are living here." → Reported: They said (that) <strong>they were living there</strong>.',
          translation: 'Direkt: "Burada yaşıyoruz." → Dolaylı: Orada yaşadıklarını söylediler.',
        },
        {
          text: 'Direct: "I can swim." → Reported: She said (that) <strong>she could swim</strong>.',
          translation: 'Direkt: "Yüzebilirim." → Dolaylı: Yüzebildiğini söyledi.',
        },
      ],
      exercises: [
        {
          id: "b2-2-ex1",
          question: '"I am studying English," she said. → She said (that) she _____ English.',
          options: ["is studying", "studies", "was studying", "studied"],
          correctAnswer: "was studying",
          userAnswer: null,
        },
        {
          id: "b2-2-ex2",
          question: '"I will visit you tomorrow," he said. → He said (that) he _____ me the next day.',
          options: ["will visit", "would visit", "visits", "visited"],
          correctAnswer: "would visit",
          userAnswer: null,
        },
        {
          id: "b2-2-ex3",
          question: '"I have never been to Paris," she said. → She said (that) she _____ to Paris.',
          options: ["has never been", "had never been", "never was", "is never"],
          correctAnswer: "had never been",
          userAnswer: null,
        },
      ],
    },
  ],
  C1: [
    {
      id: "c1-1",
      title: "Mixed Conditionals",
      description: "Karışık koşul cümleleri - farklı zaman dilimlerini birleştiren koşullar",
      explanation: `
        <h3>Kullanım</h3>
        <p>Mixed Conditionals (Karışık Koşul Cümleleri), farklı zaman dilimlerini birleştiren koşul cümleleridir. Genellikle geçmişteki bir koşulun şimdiki sonucu veya şimdiki bir koşulun geçmişteki sonucu şeklinde olabilir.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Past condition → Present result:</strong> If + past perfect, would/could/might + infinitive</li>
          <li><strong>Present condition → Past result:</strong> If + past simple, would/could/might + have + past participle</li>
        </ul>
      `,
      examples: [
        {
          text: "<strong>If I had studied</strong> harder at school, I <strong>would have a</strong> better job now.",
          translation: "Okulda daha çok çalışsaydım, şimdi daha iyi bir işim olurdu.",
        },
        {
          text: "<strong>If I were</strong> rich, I <strong>would have bought</strong> that car yesterday.",
          translation: "Zengin olsaydım, dün o arabayı alırdım.",
        },
        {
          text: "<strong>If I spoke</strong> better English, I <strong>would have applied</strong> for that job.",
          translation: "Daha iyi İngilizce konuşabilseydim, o işe başvururdum.",
        },
        {
          text: "<strong>If she had taken</strong> the medicine, she <strong>would feel</strong> better now.",
          translation: "İlacı alsaydı, şimdi kendini daha iyi hissederdi.",
        },
        {
          text: "<strong>If I lived</strong> in Istanbul, I <strong>would have visited</strong> the Hagia Sophia many times.",
          translation: "İstanbul'da yaşasaydım, Ayasofya'yı birçok kez ziyaret etmiş olurdum.",
        },
      ],
      exercises: [
        {
          id: "c1-1-ex1",
          question: "If I _____ (know) the answer, I _____ (tell) you yesterday.",
          options: [
            "knew / would tell",
            "knew / would have told",
            "had known / would tell",
            "had known / would have told",
          ],
          correctAnswer: "knew / would have told",
          userAnswer: null,
        },
        {
          id: "c1-1-ex2",
          question: "If I _____ (study) medicine, I _____ (be) a doctor now.",
          options: [
            "studied / would be",
            "had studied / would be",
            "studied / would have been",
            "had studied / would have been",
          ],
          correctAnswer: "had studied / would be",
          userAnswer: null,
        },
        {
          id: "c1-1-ex3",
          question: "If she _____ (not/miss) the train, she _____ (arrive) on time for the meeting.",
          options: [
            "didn't miss / would arrive",
            "hadn't missed / would arrive",
            "didn't miss / would have arrived",
            "hadn't missed / would have arrived",
          ],
          correctAnswer: "hadn't missed / would have arrived",
          userAnswer: null,
        },
      ],
    },
    {
      id: "c1-2",
      title: "Inversion",
      description: "Devrik cümle yapısı - vurgu ve resmiyet için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Inversion (Devrik Cümle Yapısı), vurgu yapmak, resmiyet kazandırmak veya edebi bir etki yaratmak için kullanılır. Normal cümle yapısının (özne + fiil) tersine çevrilmesiyle oluşur.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Olumsuz ifadelerden sonra:</strong> Never have I seen such a beautiful sunset.</li>
          <li><strong>Only + zarf/sıfat/isim + yardımcı fiil + özne:</strong> Only then did I realize the truth.</li>
          <li><strong>So/Such + that yapısı:</strong> So tired was she that she fell asleep immediately.</li>
          <li><strong>Koşul cümlelerinde if olmadan:</strong> Had I known, I would have told you. (= If I had known...)</li>
          <li><strong>Yer belirteçlerinden sonra:</strong> Here comes the bus. There goes our last chance.</li>
        </ul>
      `,
      examples: [
        {
          text: "<strong>Never have I seen</strong> such a beautiful sunset.",
          translation: "Böyle güzel bir gün batımını hiç görmemiştim.",
        },
        {
          text: "<strong>Had I known</strong> about the problem, I would have fixed it. (= If I had known...)",
          translation: "Sorun hakkında bilgim olsaydı, onu düzeltirdim.",
        },
        {
          text: "<strong>Not only did she win</strong> the race, but she also broke the record.",
          translation: "Sadece yarışı kazanmakla kalmadı, aynı zamanda rekoru da kırdı.",
        },
        {
          text: "<strong>Rarely have I met</strong> someone so intelligent.",
          translation: "Nadiren bu kadar zeki biriyle tanıştım.",
        },
        {
          text: "<strong>So beautiful was the view</strong> that we stood there for hours.",
          translation: "Manzara o kadar güzeldi ki saatlerce orada durduk.",
        },
      ],
      exercises: [
        {
          id: "c1-2-ex1",
          question: "_____ I realized the mistake. (Only then)",
          options: [
            "Only then I realized",
            "Only then did I realize",
            "Only then I did realize",
            "Only did then I realize",
          ],
          correctAnswer: "Only then did I realize",
          userAnswer: null,
        },
        {
          id: "c1-2-ex2",
          question: "_____ such a beautiful place. (Never before)",
          options: [
            "Never before I have seen",
            "Never before have I seen",
            "Never I have before seen",
            "Never have before I seen",
          ],
          correctAnswer: "Never before have I seen",
          userAnswer: null,
        },
        {
          id: "c1-2-ex3",
          question: "_____, I would have helped you. (Had I known)",
          options: ["Had I known", "If I had known", "I had known", "Known I had"],
          correctAnswer: "Had I known",
          userAnswer: null,
        },
      ],
    },
  ],
  C2: [
    {
      id: "c2-1",
      title: "Cleft Sentences",
      description: "Yarık cümleler - vurgu yapmak için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Cleft Sentences (Yarık Cümleler), cümlenin belirli bir kısmına vurgu yapmak için kullanılır. Cümle iki parçaya bölünür ve vurgulanmak istenen kısım öne çıkarılır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>It-cleft:</strong> It + be + vurgulanan öğe + that/who + cümlenin geri kalanı</li>
          <li><strong>What-cleft:</strong> What + cümlenin bir kısmı + be + cümlenin geri kalanı</li>
          <li><strong>All-cleft:</strong> All + cümlenin bir kısmı + be + cümlenin geri kalanı</li>
        </ul>
      `,
      examples: [
        {
          text: "Normal: She likes chocolate. → Cleft: <strong>It is chocolate that she likes.</strong>",
          translation: "Normal: O çikolatayı sever. → Yarık: Onun sevdiği çikolatadır.",
        },
        {
          text: "Normal: I need some help. → Cleft: <strong>What I need is some help.</strong>",
          translation: "Normal: Biraz yardıma ihtiyacım var. → Yarık: İhtiyacım olan şey biraz yardımdır.",
        },
        {
          text: "Normal: He arrived at 6 PM. → Cleft: <strong>It was at 6 PM that he arrived.</strong>",
          translation: "Normal: Saat 6'da geldi. → Yarık: Onun geldiği saat 6'ydı.",
        },
        {
          text: "Normal: She wants to see you. → Cleft: <strong>All she wants is to see you.</strong>",
          translation: "Normal: Seni görmek istiyor. → Yarık: Tek istediği şey seni görmektir.",
        },
        {
          text: "Normal: I met John in Paris. → Cleft: <strong>It was John who I met in Paris.</strong>",
          translation: "Normal: John'la Paris'te tanıştım. → Yarık: Paris'te tanıştığım kişi John'du.",
        },
      ],
      exercises: [
        {
          id: "c2-1-ex1",
          question: "Normal: She bought a new car. → Cleft: It was _____ that she bought.",
          options: ["a car new", "new a car", "a new car", "the car new"],
          correctAnswer: "a new car",
          userAnswer: null,
        },
        {
          id: "c2-1-ex2",
          question: "Normal: We need more time. → Cleft: _____ is more time.",
          options: ["That we need", "What we need", "Which we need", "It we need"],
          correctAnswer: "What we need",
          userAnswer: null,
        },
        {
          id: "c2-1-ex3",
          question: "Normal: I saw him yesterday. → Cleft: It was _____ that I saw him.",
          options: ["yesterday", "him", "I", "saw"],
          correctAnswer: "yesterday",
          userAnswer: null,
        },
      ],
    },
    {
      id: "c2-2",
      title: "Subjunctive Mood",
      description: "Dilek kipi - istek, öneri, gereklilik gibi durumlar için kullanılır",
      explanation: `
        <h3>Kullanım</h3>
        <p>Subjunctive Mood (Dilek Kipi), istek, öneri, gereklilik, varsayım gibi durumları ifade etmek için kullanılır. Gerçek olmayan veya henüz gerçekleşmemiş durumları anlatır.</p>
        
        <h3>Yapı</h3>
        <ul>
          <li><strong>Formal Subjunctive:</strong> Özne + base form of verb (be → be, not is/am/are)</li>
          <li><strong>Formulaic Subjunctive:</strong> Sabit ifadeler: God save the Queen, Long live the King, etc.</li>
          <li><strong>Were Subjunctive:</strong> If I were you... (not "If I was you...")</li>
          <li><strong>Should Subjunctive:</strong> It is important that he should be here.</li>
        </ul>
        
        <h3>Kullanım Alanları</h3>
        <ul>
          <li><strong>Belirli fiillerden sonra:</strong> suggest, recommend, insist, demand, etc.</li>
          <li><strong>Belirli sıfatlardan sonra:</strong> essential, important, necessary, etc.</li>
          <li><strong>Belirli isimlerden sonra:</strong> suggestion, recommendation, insistence, etc.</li>
        </ul>
      `,
      examples: [
        {
          text: "I suggest that he <strong>be</strong> more careful.",
          translation: "Daha dikkatli olmasını öneririm.",
        },
        {
          text: "It is essential that everyone <strong>arrive</strong> on time.",
          translation: "Herkesin zamanında gelmesi çok önemlidir.",
        },
        {
          text: "The teacher demanded that all students <strong>submit</strong> their assignments.",
          translation: "Öğretmen tüm öğrencilerin ödevlerini teslim etmelerini istedi.",
        },
        {
          text: "<strong>If I were</strong> you, I would accept the offer.",
          translation: "Senin yerinde olsaydım, teklifi kabul ederdim.",
        },
        {
          text: "The doctor recommended that she <strong>take</strong> the medicine twice a day.",
          translation: "Doktor ilacı günde iki kez almasını önerdi.",
        },
      ],
      exercises: [
        {
          id: "c2-2-ex1",
          question: "The teacher insisted that the student _____ (leave) the classroom.",
          options: ["leaves", "left", "leave", "leaving"],
          correctAnswer: "leave",
          userAnswer: null,
        },
        {
          id: "c2-2-ex2",
          question: "It is important that he _____ (be) present at the meeting.",
          options: ["is", "was", "be", "being"],
          correctAnswer: "be",
          userAnswer: null,
        },
        {
          id: "c2-2-ex3",
          question: "If I _____ (be) in your position, I would make a different decision.",
          options: ["am", "was", "were", "be"],
          correctAnswer: "were",
          userAnswer: null,
        },
      ],
    },
  ],
}

export default function GrammarPracticePage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState("grammar")
  const [userRank, setUserRank] = useState(15)
  const [totalUsers, setTotalUsers] = useState(150)
  const [streak, setStreak] = useState(15)
  const [points, setPoints] = useState(1250)
  const [selectedLevel, setSelectedLevel] = useState("B1")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseBrowser()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          window.location.href = "/login"
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    // Set the active navigation item to "grammar"
    setActiveNav("grammar")

    // Set default selected topic based on level
    if (grammarTopics[selectedLevel as keyof typeof grammarTopics]?.length > 0) {
      setSelectedTopic(grammarTopics[selectedLevel as keyof typeof grammarTopics][0].id)
    } else {
      setSelectedTopic(null)
    }
  }, [])

  useEffect(() => {
    // Reset selected topic when level changes
    if (grammarTopics[selectedLevel as keyof typeof grammarTopics]?.length > 0) {
      setSelectedTopic(grammarTopics[selectedLevel as keyof typeof grammarTopics][0].id)
    } else {
      setSelectedTopic(null)
    }

    // Reset exercise answers and results
    setExerciseAnswers({})
    setShowResults(false)
  }, [selectedLevel])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Çıkış başarılı",
        description: "Güvenli bir şekilde çıkış yaptınız.",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        variant: "destructive",
        title: "Çıkış başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
      })
    }
  }

  // handleNavClick fonksiyonunu güncelleyelim
  const handleNavClick = (nav: string) => {
    setActiveNav(nav)

    // Navigate to the appropriate page
    switch (nav) {
      case "home":
        router.push("/dashboard")
        break
      case "vocabulary":
        router.push("/vocabulary")
        break
      case "grammar":
        router.push("/grammar")
        break
      case "quizzes":
        router.push("/quizzes")
        break
      case "review":
        router.push("/review")
        break
      case "favorites":
        router.push("/favorites")
        break
      case "chatbot":
        router.push("/chatbot")
        break
      case "progress":
        router.push("/progress")
        break
      case "leaderboard":
        router.push("/leaderboard")
        break
      case "profile":
        router.push("/profile")
        break
      default:
        toast({
          title: "Bilgi",
          description: `${nav} sayfasına yönlendiriliyorsunuz...`,
        })
    }
  }

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId)
    setExerciseAnswers({})
    setShowResults(false)
  }

  const handleAnswerSelect = (exerciseId: string, answer: string) => {
    setExerciseAnswers((prev) => ({
      ...prev,
      [exerciseId]: answer,
    }))
  }

  const handleCheckAnswers = () => {
    setShowResults(true)

    // Calculate score
    const currentTopic = grammarTopics[selectedLevel as keyof typeof grammarTopics]?.find(
      (topic) => topic.id === selectedTopic,
    )

    if (currentTopic) {
      const totalExercises = currentTopic.exercises.length
      const correctAnswers = currentTopic.exercises.filter(
        (exercise) => exerciseAnswers[exercise.id] === exercise.correctAnswer,
      ).length

      toast({
        title: "Sonuçlar",
        description: `${totalExercises} sorudan ${correctAnswers} tanesini doğru cevapladınız.`,
      })
    }
  }

  const getSelectedTopic = () => {
    for (const level in grammarTopics) {
      const topic = grammarTopics[level as keyof typeof grammarTopics].find((t) => t.id === selectedTopic)
      if (topic) return topic
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const firstName = user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Kullanıcı"
  const currentTopic = getSelectedTopic()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="w-full py-3 px-4 border-b border-input flex items-center justify-between sticky top-0 z-10 bg-background">
        <div className="flex items-center">
          <Eng4AllLogo />
          <span className="text-lilac text-2xl font-bold ml-2 hidden sm:inline-block">eng4all</span>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Konu veya kural ara..." className="pl-8 bg-muted focus:border-lilac focus:ring-lilac" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center text-sm font-medium">
            <span className="hidden md:inline-block mr-2">Merhaba, {firstName}!</span>
            <Avatar className="h-8 w-8 border-2 border-lilac">
              <AvatarImage src="/placeholder.svg" alt={firstName} />
              <AvatarFallback className="bg-lilac/20 text-lilac">{firstName[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">🔥</span>
              <span>{streak}</span>
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1 py-1">
              <span className="text-base">💎</span>
              <span>{points}</span>
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-lilac" /> : <Moon className="h-5 w-5 text-lilac" />}
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full" aria-label="Logout">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-16 md:w-56 border-r border-input flex flex-col py-4 overflow-y-auto shrink-0">
          <nav className="space-y-1 px-2">
            {[
              { id: "home", icon: Home, label: "Ana Sayfa" },
              { id: "vocabulary", icon: BookOpen, label: "Kelime Çalışma" },
              { id: "grammar", icon: PenTool, label: "Gramer Çalışma" },
              { id: "quizzes", icon: CheckSquare, label: "Quizler" },
              { id: "review", icon: ListChecks, label: "Tekrar Listesi" },
              { id: "favorites", icon: Heart, label: "Favorilerim" },
              { id: "chatbot", icon: MessageSquare, label: "AI Chatbot" },
              { id: "progress", icon: BarChart2, label: "İlerlemem" },
              { id: "leaderboard", icon: Trophy, label: "Puan Tabloları" },
              { id: "profile", icon: User, label: "Profilim" },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeNav === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeNav === item.id ? "bg-lilac/10 text-lilac" : ""
                } ${activeNav === item.id ? "border-l-4 border-lilac" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon
                  className={`h-5 w-5 ${activeNav === item.id ? "text-lilac" : "text-muted-foreground"} mr-2`}
                />
                <span className="hidden md:inline-block">{item.label}</span>
              </Button>
            ))}
          </nav>
        </aside>

        {/* Center Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Gramer Çalışma Alanı</h1>
              <p className="text-muted-foreground mt-2 text-lg">İngilizce gramer kurallarını öğrenin ve pratik yapın</p>
            </div>

            {/* Level Tabs */}
            <div className="mb-6">
              <Tabs defaultValue={selectedLevel} onValueChange={setSelectedLevel} className="w-full">
                <TabsList className="w-full grid grid-cols-6 bg-muted/50 p-1">
                  <TabsTrigger value="A1" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                    A1
                  </TabsTrigger>
                  <TabsTrigger value="A2" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                    A2
                  </TabsTrigger>
                  <TabsTrigger value="B1" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                    B1
                  </TabsTrigger>
                  <TabsTrigger value="B2" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                    B2
                  </TabsTrigger>
                  <TabsTrigger value="C1" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                    C1
                  </TabsTrigger>
                  <TabsTrigger value="C2" className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                    C2
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Grammar Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Topic List */}
              <div className="md:col-span-1">
                <Card className="border-lilac/20 sticky top-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Gramer Konuları</CardTitle>
                    <CardDescription>Seviye: {selectedLevel}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 p-2 max-h-[400px] overflow-y-auto">
                      {grammarTopics[selectedLevel as keyof typeof grammarTopics]?.map((topic) => (
                        <Button
                          key={topic.id}
                          variant="ghost"
                          className={`w-full justify-start text-left ${
                            selectedTopic === topic.id ? "bg-lilac/10 text-lilac font-medium" : ""
                          }`}
                          onClick={() => handleTopicSelect(topic.id)}
                        >
                          <BookIcon
                            className={`h-4 w-4 mr-2 ${selectedTopic === topic.id ? "text-lilac" : "text-muted-foreground"}`}
                          />
                          <div className="flex flex-col items-start">
                            <span className="text-sm">{topic.title}</span>
                            <span className="text-xs text-muted-foreground truncate w-full">{topic.description}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Topic Content */}
              <div className="md:col-span-2">
                {currentTopic ? (
                  <div className="space-y-6">
                    {/* Topic Header */}
                    <Card className="border-lilac/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{currentTopic.title}</CardTitle>
                            <CardDescription>{currentTopic.description}</CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {selectedLevel}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Explanation */}
                    <Card className="border-lilac/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Kural Açıklaması</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: currentTopic.explanation }}
                        />
                      </CardContent>
                    </Card>

                    {/* Examples */}
                    <Card className="border-lilac/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Örnek Cümleler</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentTopic.examples.map((example, index) => (
                            <div key={index} className="p-3 bg-muted/30 rounded-md">
                              <p className="mb-1 text-foreground" dangerouslySetInnerHTML={{ __html: example.text }} />
                              <p className="text-sm text-muted-foreground">{example.translation}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Exercises */}
                    <Card className="border-lilac/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Alıştırmalar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {currentTopic.exercises.map((exercise) => (
                            <div key={exercise.id} className="space-y-3">
                              <p className="font-medium">{exercise.question}</p>
                              <RadioGroup
                                value={exerciseAnswers[exercise.id] || ""}
                                onValueChange={(value) => handleAnswerSelect(exercise.id, value)}
                              >
                                <div className="space-y-2">
                                  {exercise.options.map((option) => (
                                    <div
                                      key={option}
                                      className={`flex items-center space-x-2 p-2 rounded-md ${
                                        showResults
                                          ? exerciseAnswers[exercise.id] === option
                                            ? option === exercise.correctAnswer
                                              ? "bg-green-100 dark:bg-green-900/20"
                                              : "bg-red-100 dark:bg-red-900/20"
                                            : option === exercise.correctAnswer
                                              ? "bg-green-100 dark:bg-green-900/20"
                                              : ""
                                          : ""
                                      }`}
                                    >
                                      <RadioGroupItem value={option} id={`${exercise.id}-${option}`} />
                                      <Label htmlFor={`${exercise.id}-${option}`}>{option}</Label>
                                      {showResults && (
                                        <>
                                          {exerciseAnswers[exercise.id] === option &&
                                            option === exercise.correctAnswer && (
                                              <Check className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
                                            )}
                                          {exerciseAnswers[exercise.id] === option &&
                                            option !== exercise.correctAnswer && (
                                              <X className="h-4 w-4 text-red-600 dark:text-red-400 ml-auto" />
                                            )}
                                          {exerciseAnswers[exercise.id] !== option &&
                                            option === exercise.correctAnswer && (
                                              <Check className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
                                            )}
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        {!showResults ? (
                          <Button
                            className="bg-lilac hover:bg-lilac/90 text-white"
                            onClick={handleCheckAnswers}
                            disabled={Object.keys(exerciseAnswers).length < currentTopic.exercises.length}
                          >
                            Cevapları Kontrol Et
                          </Button>
                        ) : (
                          <Button
                            className="bg-lilac hover:bg-lilac/90 text-white"
                            onClick={() => {
                              setExerciseAnswers({})
                              setShowResults(false)
                            }}
                          >
                            Tekrar Dene
                          </Button>
                        )}
                      </CardFooter>
                    </Card>

                    {/* Practice Button */}
                    <Button className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 text-lg">
                      Bu Konu İçin Quiz Başlat
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg border border-input">
                    <p className="text-muted-foreground">Lütfen sol menüden bir gramer konusu seçin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 border-l border-input p-4 overflow-y-auto shrink-0">
          {/* Progress Summary */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">İlerleme Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tamamlanan gramer konuları</span>
                    <span className="font-medium">8/20</span>
                  </div>
                  <Progress value={40} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gramer doğruluğu</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-muted" indicatorClassName="bg-lilac" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Tracking */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Günlük Streak Takibi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-2">
                <div className="text-center">
                  <div className="text-4xl font-bold text-lilac flex items-center justify-center">
                    <span className="mr-2">🔥</span>
                    {streak}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Gün üst üste çalışma</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kazanılan Rozetler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-lilac/10 flex items-center justify-center text-xl">
                      {badge.icon}
                    </div>
                    <span className="text-xs mt-1 text-center">{badge.name}</span>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-lilac p-0 h-auto w-full text-center">
                Tüm Rozetleri Gör
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="mb-4 border-lilac/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Haftalık Liderlik Tablosu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span
                        className={`w-5 text-sm ${user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-gray-400" : user.rank === 3 ? "text-amber-600" : ""}`}
                      >
                        {user.rank}.
                      </span>
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs bg-lilac/20 text-lilac">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <span className="text-sm font-medium">{user.points}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center">
                  <span className="w-5">{userRank}.</span>
                  <span>Sen</span>
                </div>
                <span className="text-muted-foreground">
                  Sıralaman: {userRank}/{totalUsers}
                </span>
              </div>
              <Button variant="link" className="text-lilac p-0 h-auto w-full text-center mt-1">
                Tam Tabloyu Gör
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
