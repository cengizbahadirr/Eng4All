"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  Check,
  X,
  CheckCircle // CheckCircle eklendi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Örnek gramer konuları verisi
const grammarTopics = {
  A1: [
    {
      id: "a1-1",
      title: "Present Simple Tense",
      description: "Geniş zaman - günlük rutinler ve genel gerçekler için kullanılır",
      explanation: `<h3>Kullanım</h3><p>Present Simple (Geniş Zaman), günlük rutinleri, alışkanlıkları, genel gerçekleri ve değişmeyen durumları ifade etmek için kullanılır.</p><h3>Yapı</h3><ul><li><strong>Olumlu cümleler:</strong> I/You/We/They + verb, He/She/It + verb + s</li><li><strong>Olumsuz cümleler:</strong> I/You/We/They + don't + verb, He/She/It + doesn't + verb</li><li><strong>Soru cümleleri:</strong> Do + I/you/we/they + verb?, Does + he/she/it + verb?</li></ul><h3>Zaman Belirteçleri</h3><p>Always, usually, often, sometimes, rarely, never, every day, on Mondays, etc.</p>`,
      examples: [
        { text: "I <strong>work</strong> in an office.", translation: "Bir ofiste çalışırım." },
        { text: "She <strong>lives</strong> in Istanbul.", translation: "O, İstanbul'da yaşar." },
      ],
      exercises: [
        { id: "a1-1-ex1", question: "She _____ to work by bus every day.", options: ["go", "goes", "going", "is going"], correctAnswer: "goes", userAnswer: null, },
        { id: "a1-1-ex2", question: "_____ they live in Ankara?", options: ["Do", "Does", "Are", "Is"], correctAnswer: "Do", userAnswer: null, },
      ],
    },
    {
      id: "a1-2",
      title: "Verb 'To Be' (am/is/are)",
      description: "Olmak fiili - durum, kimlik ve özellik bildirme",
      explanation: `<h3>Kullanım</h3><p>'To be' fiili (am/is/are) İngilizcede en temel fiillerdendir. Kim olduğumuzu, ne olduğumuzu, nerede olduğumuzu veya bir şeyin nasıl olduğunu ifade eder.</p><h3>Yapı</h3><ul><li>I + <strong>am</strong> / He/She/It + <strong>is</strong> / You/We/They + <strong>are</strong></li><li><strong>Olumsuz:</strong> am not, is not (isn't), are not (aren't)</li><li><strong>Soru:</strong> Am I...?, Is he/she/it...?, Are you/we/they...?</li></ul>`,
      examples: [
        { text: "I <strong>am</strong> a student.", translation: "Ben bir öğrenciyim." },
        { text: "She <strong>is</strong> happy.", translation: "O mutlu." },
        { text: "They <strong>are not</strong> (aren't) doctors.", translation: "Onlar doktor değiller." },
        { text: "<strong>Is</strong> he your brother?", translation: "O senin erkek kardeşin mi?" },
      ],
      exercises: [
        { id: "a1-2-ex1", question: "My name _____ Ayşe.", options: ["am", "is", "are"], correctAnswer: "is", userAnswer: null, },
        { id: "a1-2-ex2", question: "We _____ from Turkey.", options: ["am", "is", "are"], correctAnswer: "are", userAnswer: null, },
      ],
    },
    {
      id: "a1-3",
      title: "Possessive Adjectives & Pronouns",
      description: "İyelik sıfatları ve zamirleri - sahiplik bildirme",
      explanation: `<h3>Possessive Adjectives</h3><p>Bir ismin önünde kullanılır ve kime ait olduğunu belirtir: my, your, his, her, its, our, their.</p><p><i>Örnek: This is <strong>my</strong> book.</i></p><h3>Possessive Pronouns</h3><p>Bir ismin yerine kullanılır ve kime ait olduğunu belirtir: mine, yours, his, hers, its, ours, theirs.</p><p><i>Örnek: This book is <strong>mine</strong>.</i></p>`,
      examples: [
        { text: "That is <strong>her</strong> car.", translation: "O, onun arabası." },
        { text: "The house is <strong>theirs</strong>.", translation: "Ev onların." },
        { text: "<strong>Our</strong> team won the game.", translation: "Bizim takımımız maçı kazandı." },
      ],
      exercises: [
        { id: "a1-3-ex1", question: "This is not my pen. It is _____.", options: ["you", "your", "yours"], correctAnswer: "yours", userAnswer: null, },
        { id: "a1-3-ex2", question: "They have a dog. _____ dog is very friendly.", options: ["They", "Their", "Theirs"], correctAnswer: "Their", userAnswer: null, },
      ],
    },
    {
      id: "a1-4",
      title: "Question Words (Wh- Questions)",
      description: "Soru kelimeleri - bilgi almak için kullanılır",
      explanation: `<h3>Kullanım</h3><p>Soru kelimeleri (Who, What, Where, When, Why, How, Which) belirli bilgiler almak için cümlenin başına getirilir.</p><h3>Örnekler</h3><ul><li><strong>Who:</strong> Kişi (Kim?) - <i>Who is that man?</i></li><li><strong>What:</strong> Şey/Eylem (Ne?) - <i>What is your name?</i></li><li><strong>Where:</strong> Yer (Nerede/Nereye?) - <i>Where do you live?</i></li><li><strong>When:</strong> Zaman (Ne zaman?) - <i>When is your birthday?</i></li><li><strong>Why:</strong> Sebep (Neden?) - <i>Why are you late?</i></li><li><strong>How:</strong> Yöntem/Durum (Nasıl?) - <i>How are you?</i></li></ul>`,
      examples: [
        { text: "<strong>What</strong> is this?", translation: "Bu ne?" },
        { text: "<strong>Where</strong> are my keys?", translation: "Anahtarlarım nerede?" },
        { text: "<strong>When</strong> do you go to school?", translation: "Okula ne zaman gidersin?" },
      ],
      exercises: [
        { id: "a1-4-ex1", question: "_____ is your favorite color?", options: ["Who", "What", "Where"], correctAnswer: "What", userAnswer: null, },
        { id: "a1-4-ex2", question: "_____ old are you?", options: ["What", "When", "How"], correctAnswer: "How", userAnswer: null, },
      ],
    },
    {
      id: "a1-5",
      title: "Subject & Object Pronouns",
      description: "Özne ve nesne zamirleri",
      explanation: `<h3>Subject Pronouns</h3><p>Cümlede eylemi yapan kişiyi veya şeyi belirtir: I, you, he, she, it, we, they.</p><p><i>Örnek: <strong>She</strong> reads a book.</i></p><h3>Object Pronouns</h3><p>Cümlede eylemden etkilenen kişiyi veya şeyi belirtir: me, you, him, her, it, us, them.</p><p><i>Örnek: John helps <strong>me</strong>.</i></p>`,
      examples: [
        { text: "<strong>He</strong> likes pizza.", translation: "O, pizzayı sever." },
        { text: "Can you help <strong>us</strong>?", translation: "Bize yardım edebilir misin?" },
        { text: "I see <strong>them</strong> every day.", translation: "Onları her gün görürüm." },
      ],
      exercises: [
        { id: "a1-5-ex1", question: "My sister is a teacher. _____ works at a school.", options: ["He", "She", "It"], correctAnswer: "She", userAnswer: null, },
        { id: "a1-5-ex2", question: "This is my book. Can you give it to _____?", options: ["I", "my", "me"], correctAnswer: "me", userAnswer: null, },
      ],
    },
    {
      id: "a1-6",
      title: "There is / There are",
      description: "Bir şeyin varlığını veya yokluğunu belirtme",
      explanation: `<h3>Kullanım</h3><p>'There is' tekil isimlerle, 'There are' çoğul isimlerle kullanılır. Bir şeyin bir yerde var olup olmadığını ifade eder.</p><h3>Yapı</h3><ul><li><strong>Olumlu:</strong> There is a/an + tekil isim. / There are + çoğul isim.</li><li><strong>Olumsuz:</strong> There isn't a/an + tekil isim. / There aren't any + çoğul isim.</li><li><strong>Soru:</strong> Is there a/an + tekil isim? / Are there any + çoğul isim?</li></ul>`,
      examples: [
        { text: "<strong>There is</strong> a cat on the roof.", translation: "Çatıda bir kedi var." },
        { text: "<strong>There are</strong> some books on the table.", translation: "Masanın üzerinde birkaç kitap var." },
        { text: "<strong>Is there</strong> a park near here?", translation: "Yakınlarda bir park var mı?" },
        { text: "<strong>There aren't</strong> any apples in the basket.", translation: "Sepette hiç elma yok." },
      ],
      exercises: [
        { id: "a1-6-ex1", question: "_____ a big tree in our garden.", options: ["There is", "There are", "Is there"], correctAnswer: "There is", userAnswer: null, },
        { id: "a1-6-ex2", question: "_____ many people at the party?", options: ["Is there", "Are there", "There are"], correctAnswer: "Are there", userAnswer: null, },
      ],
    },
    {
      id: "a1-7",
      title: "Imperatives",
      description: "Emir cümleleri - talimat verme, rica etme",
      explanation: `<h3>Kullanım</h3><p>Emir cümleleri, birine bir şey yapmasını veya yapmamasını söylemek için kullanılır. Fiilin yalın hali ile başlar. Olumsuz emirler için 'Don't' kullanılır.</p><h3>Yapı</h3><ul><li><strong>Olumlu:</strong> Verb + ... (örn: Open the door.)</li><li><strong>Olumsuz:</strong> Don't + Verb + ... (örn: Don't talk.)</li><li>Rica eklemek için 'please' kullanılabilir.</li></ul>`,
      examples: [
        { text: "<strong>Sit down</strong>, please.", translation: "Lütfen otur." },
        { text: "<strong>Don't touch</strong> that!", translation: "Ona dokunma!" },
        { text: "<strong>Be</strong> quiet.", translation: "Sessiz ol." },
      ],
      exercises: [
        { id: "a1-7-ex1", question: "_____ your homework now.", options: ["Do", "Does", "Doing"], correctAnswer: "Do", userAnswer: null, },
        { id: "a1-7-ex2", question: "Please _____ so loud.", options: ["don't speak", "not speak", "no speak"], correctAnswer: "don't speak", userAnswer: null, },
      ],
    },
    {
      id: "a1-8",
      title: "Present Continuous (A1 Basics)",
      description: "Şimdiki zaman - şu anda olan eylemler (temel)",
      explanation: `<h3>Kullanım</h3><p>A1 seviyesinde Present Continuous, genellikle tam konuşma anında gerçekleşen eylemleri ifade etmek için kullanılır.</p><h3>Yapı</h3><p>Subject + am/is/are + verb + -ing</p><p><i>Örnek: I <strong>am eating</strong> now. She <strong>is watching</strong> TV.</i></p>`,
      examples: [
        { text: "He <strong>is playing</strong> football at the moment.", translation: "O, şu anda futbol oynuyor." },
        { text: "We <strong>are learning</strong> English.", translation: "İngilizce öğreniyoruz." },
      ],
      exercises: [
        { id: "a1-8-ex1", question: "Look! The cat _____ (sleep) on the sofa.", options: ["sleep", "sleeps", "is sleeping"], correctAnswer: "is sleeping", userAnswer: null, },
      ],
    },
    {
      id: "a1-9",
      title: "Prepositions of Place (Basic)",
      description: "Temel yer edatları: in, on, under",
      explanation: `<h3>Kullanım</h3><p>Bir şeyin veya birinin nerede olduğunu belirtmek için kullanılır.</p><ul><li><strong>in:</strong> içinde (örn: in the box, in the room)</li><li><strong>on:</strong> üzerinde (örn: on the table, on the wall)</li><li><strong>under:</strong> altında (örn: under the chair, under the bed)</li></ul>`,
      examples: [
        { text: "The keys are <strong>in</strong> the bag.", translation: "Anahtarlar çantanın içinde." },
        { text: "The book is <strong>on</strong> the desk.", translation: "Kitap masanın üzerinde." },
        { text: "The cat is <strong>under</strong> the table.", translation: "Kedi masanın altında." },
      ],
      exercises: [
        { id: "a1-9-ex1", question: "My phone is _____ my pocket.", options: ["on", "in", "under"], correctAnswer: "in", userAnswer: null, },
        { id: "a1-9-ex2", question: "The shoes are _____ the bed.", options: ["in", "on", "under"], correctAnswer: "under", userAnswer: null, },
      ],
    },
    {
      id: "a1-10",
      title: "Modals: can / can't",
      description: "Yetenek ve izin bildirme: -ebilir/-ebilirim",
      explanation: `<h3>Kullanım</h3><p>'Can' bir yeteneği, olasılığı veya izni ifade etmek için kullanılır. Olumsuzu 'cannot' veya kısaca 'can't' şeklindedir.</p><h3>Yapı</h3><p>Subject + can/can't + verb (yalın hal)</p><p><i>Örnek: I <strong>can</strong> swim. She <strong>can't</strong> drive. <strong>Can</strong> I use your phone?</i></p>`,
      examples: [
        { text: "Birds <strong>can</strong> fly.", translation: "Kuşlar uçabilir." },
        { text: "I <strong>can't</strong> speak Japanese.", translation: "Japonca konuşamam." },
        { text: "<strong>Can</strong> you help me, please?", translation: "Bana yardım edebilir misin, lütfen?" },
      ],
      exercises: [
        { id: "a1-10-ex1", question: "A fish _____ walk.", options: ["can", "can't", "is"], correctAnswer: "can't", userAnswer: null, },
        { id: "a1-10-ex2", question: "_____ I borrow your pen?", options: ["Do", "Am", "Can"], correctAnswer: "Can", userAnswer: null, },
      ],
    },
    {
      id: "a1-11",
      title: "Simple Adjectives",
      description: "Basit sıfatlar - isimleri niteleme",
      explanation: `<h3>Kullanım</h3><p>Sıfatlar, isimleri veya zamirleri niteler; onların özelliklerini (renk, boyut, durum vb.) anlatır. Genellikle niteledikleri isimden önce veya 'to be' fiilinden sonra gelirler.</p><p><i>Örnek: a <strong>big</strong> house, The house is <strong>big</strong>.</i></p>`,
      examples: [
        { text: "She has a <strong>red</strong> car.", translation: "Kırmızı bir arabası var." },
        { text: "The weather is <strong>cold</strong> today.", translation: "Bugün hava soğuk." },
        { text: "He is a <strong>tall</strong> man.", translation: "O, uzun bir adam." },
      ],
      exercises: [
        { id: "a1-11-ex1", question: "This is an _____ apple. (lezzetli)", options: ["delicious", "big", "green"], correctAnswer: "delicious", userAnswer: null, }, // Kullanıcıya uygun sıfatı seçtirme
      ],
    },
    {
      id: "a1-12",
      title: "Comparatives & Superlatives (Basic)",
      description: "Karşılaştırma ve üstünlük sıfatları (temel)",
      explanation: `<h3>Comparatives</h3><p>İki şeyi karşılaştırmak için kullanılır. Kısa sıfatlara '-er' eklenir (örn: bigger) veya uzun sıfatların önüne 'more' getirilir (örn: more beautiful).</p><p><i>Örnek: John is tall<strong>er</strong> than Mike. This book is <strong>more interesting</strong> than that one.</i></p><h3>Superlatives</h3><p>Bir şeyi bir grup içindeki diğerleriyle karşılaştırıp en üstün olduğunu belirtmek için kullanılır. Kısa sıfatlara 'the ...-est' eklenir (örn: the biggest) veya uzun sıfatların önüne 'the most' getirilir (örn: the most beautiful).</p><p><i>Örnek: Mount Everest is <strong>the highest</strong> mountain. She is <strong>the most intelligent</strong> student in the class.</i></p><p>(A1 seviyesinde genellikle kısa ve yaygın sıfatlarla temel yapılar öğretilir.)</p>`,
      examples: [
        { text: "My car is <strong>faster</strong> than your car.", translation: "Benim arabam senin arabandan daha hızlı." },
        { text: "This is <strong>the biggest</strong> cake I have ever seen.", translation: "Bu şimdiye kadar gördüğüm en büyük pasta." },
      ],
      exercises: [
        { id: "a1-12-ex1", question: "An elephant is _____ than a mouse.", options: ["big", "bigger", "biggest"], correctAnswer: "bigger", userAnswer: null, },
        { id: "a1-12-ex2", question: "Who is _____ (tall) person in your family?", options: ["tall", "taller", "the tallest"], correctAnswer: "the tallest", userAnswer: null, },
      ],
    },
  ],
  A2: [
    {
      id: "a2-1",
      title: "Past Simple Tense",
      description: "Geçmiş zaman - tamamlanmış eylemler için kullanılır",
      explanation: `<h3>Kullanım</h3><p>Past Simple (Geçmiş Zaman), geçmişte belirli bir zamanda başlamış ve bitmiş eylemleri ifade etmek için kullanılır.</p><h3>Yapı (Düzenli Fiiller)</h3><ul><li><strong>Olumlu cümleler:</strong> Subject + verb + -ed</li><li><strong>Olumsuz cümleler:</strong> Subject + didn't + verb (yalın hal)</li><li><strong>Soru cümleleri:</strong> Did + subject + verb (yalın hal)?</li></ul><h3>Yapı (Düzensiz Fiiller)</h3><p>Düzensiz fiillerin 2. halleri kullanılır (V2). Olumsuz ve soru cümlelerinde 'did' yardımcı fiili ile fiilin yalın hali kullanılır.</p><h3>Zaman Belirteçleri</h3><p>Yesterday, last night, last week, ago (two days ago), in 1990, etc.</p>`,
      examples: [
        { text: "I <strong>visited</strong> my grandparents yesterday.", translation: "Dün büyükannem ve büyükbabamı ziyaret ettim." },
        { text: "She <strong>didn't watch</strong> TV last night.", translation: "O, dün gece televizyon izlemedi." },
        { text: "<strong>Did</strong> you <strong>go</strong> to the cinema?", translation: "Sinemaya gittin mi?" },
        { text: "He <strong>ate</strong> pizza for lunch.", translation: "Öğle yemeğinde pizza yedi." },
      ],
      exercises: [
        { id: "a2-1-ex1", question: "They _____ (play) football last Sunday.", options: ["play", "played", "plays", "playing"], correctAnswer: "played", userAnswer: null, },
        { id: "a2-1-ex2", question: "She _____ (not/buy) a new car.", options: ["didn't buy", "not bought", "doesn't buy", "not buyed"], correctAnswer: "didn't buy", userAnswer: null, },
      ],
    },
    {
      id: "a2-2",
      title: "Present Continuous Tense",
      description: "Şimdiki zaman - konuşma anında olan eylemler",
      explanation: `<h3>Kullanım</h3><p>Present Continuous (Şimdiki Zaman), konuşma anında gerçekleşmekte olan eylemleri, geçici durumları veya yakın gelecekteki planlanmış eylemleri ifade etmek için kullanılır.</p><h3>Yapı</h3><ul><li><strong>Olumlu:</strong> Subject + am/is/are + verb + -ing</li><li><strong>Olumsuz:</strong> Subject + am/is/are + not + verb + -ing</li><li><strong>Soru:</strong> Am/Is/Are + subject + verb + -ing?</li></ul><h3>Zaman Belirteçleri</h3><p>Now, right now, at the moment, today, this week, etc.</p>`,
      examples: [
        { text: "I <strong>am reading</strong> a book now.", translation: "Şu anda bir kitap okuyorum." },
        { text: "She <strong>isn't sleeping</strong> at the moment.", translation: "O, şu anda uyumuyor." },
        { text: "What <strong>are</strong> you <strong>doing</strong>?", translation: "Ne yapıyorsun?" },
      ],
      exercises: [
        { id: "a2-2-ex1", question: "Listen! The baby _____ (cry).", options: ["cry", "cries", "is crying", "crying"], correctAnswer: "is crying", userAnswer: null, },
        { id: "a2-2-ex2", question: "They _____ (not watch) TV right now.", options: ["don't watch", "aren't watching", "not watching", "doesn't watch"], correctAnswer: "aren't watching", userAnswer: null, },
      ],
    },
    {
      id: "a2-3",
      title: "Countable & Uncountable Nouns (some, any)",
      description: "Sayılabilen ve sayılamayan isimler; some ve any kullanımı",
      explanation: `<h3>Countable Nouns</h3><p>Sayılabilen isimlerdir (örn: apple, book, car). Tekil ve çoğul formları vardır.</p><h3>Uncountable Nouns</h3><p>Sayılamayan isimlerdir (örn: water, milk, information, money). Genellikle çoğul formları yoktur.</p><h3>Some</h3><p>Olumlu cümlelerde hem sayılabilen çoğul isimlerle hem de sayılamayan isimlerle kullanılır ('biraz', 'birkaç').</p><p><i>Örnek: I have <strong>some</strong> apples. There is <strong>some</strong> milk.</i></p><h3>Any</h3><p>Olumsuz cümlelerde ve sorularda hem sayılabilen çoğul isimlerle hem de sayılamayan isimlerle kullanılır ('hiç', 'herhangi').</p><p><i>Örnek: I don't have <strong>any</strong> apples. Is there <strong>any</strong> milk?</i></p>`,
      examples: [
        { text: "There are <strong>some</strong> students in the classroom.", translation: "Sınıfta birkaç öğrenci var." },
        { text: "I need <strong>some</strong> water.", translation: "Biraz suya ihtiyacım var." },
        { text: "Do you have <strong>any</strong> questions?", translation: "Hiç sorun var mı?" },
        { text: "She doesn't want <strong>any</strong> sugar in her tea.", translation: "Çayına hiç şeker istemiyor." },
      ],
      exercises: [
        { id: "a2-3-ex1", question: "Can I have _____ coffee, please?", options: ["a", "some", "any"], correctAnswer: "some", userAnswer: null, },
        { id: "a2-3-ex2", question: "There aren't _____ chairs in this room.", options: ["some", "any", "much"], correctAnswer: "any", userAnswer: null, },
      ],
    },
    {
      id: "a2-4",
      title: "Adverbs of Frequency",
      description: "Sıklık zarfları - eylemlerin ne sıklıkta yapıldığını belirtir",
      explanation: `<h3>Kullanım</h3><p>Sıklık zarfları (always, usually, often, sometimes, rarely/seldom, never) bir eylemin ne kadar sık yapıldığını ifade eder. Genellikle ana fiilden önce, 'to be' fiilinden sonra veya yardımcı fiil ile ana fiil arasında yer alırlar.</p><h3>Sıralama (En sıktan en seyreğe)</h3><ul><li><strong>Always</strong> (100%)</li><li><strong>Usually</strong> (90%)</li><li><strong>Often</strong> (70%)</li><li><strong>Sometimes</strong> (50%)</li><li><strong>Rarely/Seldom</strong> (10%)</li><li><strong>Never</strong> (0%)</li></ul><p><i>Örnek: I <strong>always</strong> brush my teeth before bed. She is <strong>often</strong> late.</i></p>`,
      examples: [
        { text: "He <strong>never</strong> eats meat.", translation: "O asla et yemez." },
        { text: "They <strong>sometimes</strong> go to the cinema on Fridays.", translation: "Onlar bazen Cuma günleri sinemaya giderler." },
        { text: "Are you <strong>usually</strong> this busy?", translation: "Genellikle bu kadar meşgul müsün?" },
      ],
      exercises: [
        { id: "a2-4-ex1", question: "I _____ get up early, but not on weekends. (genellikle)", options: ["always", "usually", "never"], correctAnswer: "usually", userAnswer: null, },
        { id: "a2-4-ex2", question: "She is _____ happy to see her friends.", options: ["always", "never", "rarely"], correctAnswer: "always", userAnswer: null, },
      ],
    },
    {
      id: "a2-5",
      title: "Present Perfect Simple (A2 Introduction)",
      description: "Yakın geçmiş zaman - geçmiş deneyimler ve etkisi devam eden olaylar (giriş)",
      explanation: `<h3>Kullanım</h3><p>A2 seviyesinde Present Perfect, genellikle geçmişteki belirsiz bir zamanda olmuş ve şu anla bir bağlantısı olan eylemleri veya kişisel deneyimleri ifade etmek için kullanılır.</p><h3>Yapı</h3><p>Subject + have/has + Past Participle (fiilin 3. hali)</p><p><i>Örnek: I <strong>have seen</strong> that film. She <strong>has been</strong> to London.</i></p><h3>Yaygın Kullanımlar</h3><ul><li>'Ever' (sorularda 'hiç') ve 'never' ('asla') ile deneyimler: <i>Have you <strong>ever</strong> tried sushi? I have <strong>never</strong> ridden a horse.</i></li><li>'Been to' (gidip gelmek) vs 'gone to' (gitmek ve hala orada olmak).</li></ul>`,
      examples: [
        { text: "We <strong>have visited</strong> Italy.", translation: "İtalya'yı ziyaret ettik. (Ne zaman olduğu önemli değil, deneyim)" },
        { text: "<strong>Has</strong> he <strong>finished</strong> his homework?", translation: "Ödevini bitirdi mi?" },
        { text: "I <strong>have never seen</strong> a ghost.", translation: "Hiç hayalet görmedim." },
      ],
      exercises: [
        { id: "a2-5-ex1", question: "_____ you ever _____ (be) to Paris?", options: ["Do / be", "Have / been", "Did / was"], correctAnswer: "Have / been", userAnswer: null, },
        { id: "a2-5-ex2", question: "My sister _____ (read) that book many times.", options: ["read", "has read", "reads"], correctAnswer: "has read", userAnswer: null, },
      ],
    },
    {
      id: "a2-6",
      title: "Prepositions of Time & Place (More)",
      description: "Zaman edatları (at, on, in) ve daha fazla yer edatı",
      explanation: `<h3>Prepositions of Time</h3><ul><li><strong>At:</strong> Saatler (at 5 o'clock), belirli zamanlar (at night, at the weekend)</li><li><strong>On:</strong> Günler (on Monday), tarihler (on July 4th)</li><li><strong>In:</strong> Aylar (in April), yıllar (in 2023), mevsimler (in summer), günün bölümleri (in the morning)</li></ul><h3>More Prepositions of Place</h3><ul><li><strong>Next to/Beside:</strong> yanında</li><li><strong>Between:</strong> arasında (iki şey)</li><li><strong>Among:</strong> arasında (ikiden fazla şey)</li><li><strong>Behind:</strong> arkasında</li><li><strong>In front of:</strong> önünde</li><li><strong>Opposite:</strong> karşısında</li></ul>`,
      examples: [
        { text: "The meeting is <strong>at</strong> 3 PM.", translation: "Toplantı saat 3'te." },
        { text: "My birthday is <strong>on</strong> October 10th.", translation: "Doğum günüm 10 Ekim'de." },
        { text: "The bank is <strong>next to</strong> the post office.", translation: "Banka, postanenin yanında." },
        { text: "She sits <strong>between</strong> Tom and Jerry.", translation: "Tom ve Jerry'nin arasında oturuyor." },
      ],
      exercises: [
        { id: "a2-6-ex1", question: "We usually go on holiday _____ August.", options: ["at", "on", "in"], correctAnswer: "in", userAnswer: null, },
        { id: "a2-6-ex2", question: "The cat is sleeping _____ the sofa.", options: ["in", "on", "under"], correctAnswer: "on", userAnswer: null, }, // A1'de de vardı, pekiştirme
      ],
    },
    {
      id: "a2-7",
      title: "Comparatives & Superlatives (More Detail)",
      description: "Karşılaştırma ve üstünlük sıfatları (daha detaylı)",
      explanation: `<h3>Comparatives</h3><p>İki şeyi karşılaştırır. Kısa sıfatlar + '-er' (bigger), uzun sıfatlar 'more ...' (more expensive). 'Than' kullanılır.</p><p><i>Örnek: This car is <strong>more expensive than</strong> that one.</i></p><h3>Superlatives</h3><p>Bir şeyi bir grupla karşılaştırır. Kısa sıfatlar 'the ...-est' (the biggest), uzun sıfatlar 'the most ...' (the most expensive).</p><p><i>Örnek: It's <strong>the tallest</strong> building in the city.</i></p><h3>(Not) as ... as</h3><p>Eşitlik veya eşitsizlik belirtir.</p><p><i>Örnek: She is <strong>as tall as</strong> her brother. He is <strong>not as old as</strong> he looks.</i></p><h3>Irregular Forms</h3><p>good-better-the best, bad-worse-the worst, far-further/farther-the furthest/farthest</p>`,
      examples: [
        { text: "London is <strong>bigger than</strong> Paris.", translation: "Londra, Paris'ten daha büyüktür." },
        { text: "This is <strong>the most difficult</strong> exercise.", translation: "Bu en zor alıştırma." },
        { text: "My bag is <strong>not as heavy as</strong> yours.", translation: "Benim çantam seninki kadar ağır değil." },
      ],
      exercises: [
        { id: "a2-7-ex1", question: "This book is _____ (interesting) than the last one I read.", options: ["interesting", "more interesting", "the most interesting"], correctAnswer: "more interesting", userAnswer: null, },
        { id: "a2-7-ex2", question: "Who is _____ (good) singer in your opinion?", options: ["gooder", "better", "the best"], correctAnswer: "the best", userAnswer: null, },
      ],
    },
    {
      id: "a2-8",
      title: "Like + verb-ing",
      description: "Sevilen veya hoşlanılan aktiviteleri ifade etme",
      explanation: `<h3>Kullanım</h3><p>'Like', 'love', 'enjoy', 'hate', 'don't mind' gibi fiillerden sonra genellikle bir aktiviteyi ifade etmek için fiilin '-ing' hali (gerund) kullanılır.</p><p><i>Örnek: I <strong>like swimming</strong>. She <strong>enjoys reading</strong> books. He <strong>hates waking up</strong> early.</i></p>`,
      examples: [
        { text: "Do you <strong>like dancing</strong>?", translation: "Dans etmeyi sever misin?" },
        { text: "My brother <strong>loves playing</strong> video games.", translation: "Erkek kardeşim video oyunları oynamayı çok sever." },
        { text: "I <strong>don't mind waiting</strong> for a few minutes.", translation: "Birkaç dakika beklemeyi sorun etmem." },
      ],
      exercises: [
        { id: "a2-8-ex1", question: "She enjoys _____ (listen) to music.", options: ["listen", "listens", "listening"], correctAnswer: "listening", userAnswer: null, },
        { id: "a2-8-ex2", question: "What do you like _____ (do) in your free time?", options: ["do", "to do", "doing"], correctAnswer: "doing", userAnswer: null, }, // to do da kabul edilebilir ama -ing daha yaygın
      ],
    },
    {
      id: "a2-9",
      title: "Future Simple (will / won't)",
      description: "Gelecek zaman - anlık kararlar, tahminler, sözler",
      explanation: `<h3>Kullanım</h3><p>'Will' (olumsuzu 'won't' = will not) gelecekle ilgili anlık kararları, tahminleri, sözleri ve teklifleri ifade etmek için kullanılır.</p><h3>Yapı</h3><p>Subject + will/won't + verb (yalın hal)</p><p><i>Örnek: I think it <strong>will rain</strong> tomorrow. (Tahmin) I<strong>'ll help</strong> you with that. (Teklif/Anlık karar)</i></p>`,
      examples: [
        { text: "It's cold. I <strong>will close</strong> the window.", translation: "Hava soğuk. Pencereyi kapatacağım." },
        { text: "She <strong>will probably be</strong> late.", translation: "Muhtemelen geç kalacak." },
        { text: "I promise I <strong>won't tell</strong> anyone.", translation: "Söz veriyorum kimseye söylemeyeceğim." },
      ],
      exercises: [
        { id: "a2-9-ex1", question: "A: The phone is ringing. B: OK, I _____ (answer) it.", options: ["answer", "am answering", "will answer"], correctAnswer: "will answer", userAnswer: null, },
        { id: "a2-9-ex2", question: "Do you think they _____ (win) the match?", options: ["win", "will win", "are winning"], correctAnswer: "will win", userAnswer: null, },
      ],
    },
    {
      id: "a2-10",
      title: "Future with 'be going to'",
      description: "Gelecek zaman - planlar, niyetler, kesin kanıta dayalı tahminler",
      explanation: `<h3>Kullanım</h3><p>'Be going to' gelecekle ilgili önceden yapılmış planları, niyetleri veya şu anki bir duruma/kanıta dayalı güçlü tahminleri ifade etmek için kullanılır.</p><h3>Yapı</h3><p>Subject + am/is/are + going to + verb (yalın hal)</p><p><i>Örnek: I <strong>am going to visit</strong> my aunt next weekend. (Plan) Look at those clouds! It<strong>'s going to rain</strong>. (Kanıta dayalı tahmin)</i></p>`,
      examples: [
        { text: "We <strong>are going to watch</strong> a film tonight.", translation: "Bu gece bir film izleyeceğiz." },
        { text: "He <strong>is not going to come</strong> to the party.", translation: "Partiye gelmeyecek." },
        { text: "Be careful! You <strong>are going to fall</strong>!", translation: "Dikkat et! Düşeceksin!" },
      ],
      exercises: [
        { id: "a2-10-ex1", question: "She has bought a ticket. She _____ (travel) to Spain.", options: ["will travel", "is going to travel", "travels"], correctAnswer: "is going to travel", userAnswer: null, },
        { id: "a2-10-ex2", question: "Look at the sky! It _____ (be) a sunny day.", options: ["will be", "is going to be", "is"], correctAnswer: "is going to be", userAnswer: null, },
      ],
    },
    {
      id: "a2-11",
      title: "Past Continuous Tense (A2 Introduction)",
      description: "Geçmişte belirli bir anda devam eden eylemler (giriş)",
      explanation: `<h3>Kullanım</h3><p>A2 seviyesinde Past Continuous, genellikle geçmişte belirli bir anda devam etmekte olan bir eylemi ifade etmek için kullanılır. Sıklıkla Past Simple ile bir olayın arka planını oluşturur.</p><h3>Yapı</h3><p>Subject + was/were + verb + -ing</p><p><i>Örnek: I <strong>was reading</strong> when you called.</i></p>`,
      examples: [
        { text: "At 7 o'clock yesterday evening, I <strong>was having</strong> dinner.", translation: "Dün akşam saat 7'de akşam yemeği yiyordum." },
        { text: "What <strong>were</strong> you <strong>doing</strong> at this time yesterday?", translation: "Dün bu saatte ne yapıyordun?" },
      ],
      exercises: [
        { id: "a2-11-ex1", question: "She _____ (talk) on the phone when I entered the room.", options: ["talked", "was talking", "talks"], correctAnswer: "was talking", userAnswer: null, },
      ],
    },
  ],
  B1: [
    {
      id: "b1-1",
      title: "Present Perfect Tense",
      description: "Yakın geçmiş zaman - geçmişte başlayıp etkisi devam eden veya belirsiz zamanda olmuş eylemler",
      explanation: `<h3>Kullanım</h3><p>Present Perfect Tense, geçmişte belirsiz bir zamanda meydana gelmiş veya geçmişte başlayıp şu anki durumla bağlantısı olan eylemleri ifade etmek için kullanılır. Deneyimleri anlatırken de sıkça kullanılır.</p><h3>Yapı</h3><ul><li><strong>Olumlu cümleler:</strong> Subject + have/has + past participle (V3)</li><li><strong>Olumsuz cümleler:</strong> Subject + haven't/hasn't + past participle (V3)</li><li><strong>Soru cümleleri:</strong> Have/Has + subject + past participle (V3)?</li></ul><h3>Zaman Belirteçleri</h3><p>Already, yet, just, ever, never, for, since, recently, lately, so far, etc.</p>`,
      examples: [
        { text: "I <strong>have visited</strong> Paris three times.", translation: "Paris'i üç kez ziyaret ettim." },
        { text: "She <strong>hasn't finished</strong> her homework yet.", translation: "Ödevini henüz bitirmedi." },
        { text: "<strong>Have</strong> you <strong>ever eaten</strong> sushi?", translation: "Hiç suşi yedin mi?" },
      ],
      exercises: [
        { id: "b1-1-ex1", question: "He _____ (live) here for ten years.", options: ["lived", "has lived", "lives", "is living"], correctAnswer: "has lived", userAnswer: null, },
        { id: "b1-1-ex2", question: "They _____ (just/arrive) from London.", options: ["just arrived", "have just arrived", "are just arriving", "had just arrived"], correctAnswer: "have just arrived", userAnswer: null, },
      ],
    },
    {
      id: "b1-2",
      title: "Past Continuous Tense",
      description: "Geçmişte belirli bir anda devam eden eylemler",
      explanation: `<h3>Kullanım</h3><p>Past Continuous Tense, geçmişte belirli bir anda devam etmekte olan bir eylemi veya geçmişte bir eylem olurken arka planda devam eden başka bir eylemi ifade etmek için kullanılır.</p><h3>Yapı</h3><ul><li><strong>Olumlu:</strong> Subject + was/were + verb + -ing</li><li><strong>Olumsuz:</strong> Subject + wasn't/weren't + verb + -ing</li><li><strong>Soru:</strong> Was/Were + subject + verb + -ing?</li></ul><h3>Kullanım Alanları</h3><p>Genellikle Past Simple ile birlikte kullanılır: <i>I <strong>was watching</strong> TV when the phone <strong>rang</strong>.</i></p>`,
      examples: [
        { text: "She <strong>was studying</strong> at 8 PM last night.", translation: "Dün gece saat 8'de ders çalışıyordu." },
        { text: "They <strong>weren't playing</strong> outside because it was raining.", translation: "Yağmur yağdığı için dışarıda oynamıyorlardı." },
        { text: "What <strong>were</strong> you <strong>doing</strong> when I called you?", translation: "Seni aradığımda ne yapıyordun?" },
      ],
      exercises: [
        { id: "b1-2-ex1", question: "While I _____ (drive), I saw an accident.", options: ["drove", "was driving", "am driving", "driven"], correctAnswer: "was driving", userAnswer: null, },
        { id: "b1-2-ex2", question: "He _____ (not listen) while the teacher was explaining.", options: ["didn't listen", "wasn't listening", "not listened", "listened not"], correctAnswer: "wasn't listening", userAnswer: null, },
      ],
    },
    {
      id: "b1-3",
      title: "Modals of Obligation (must, have to, should)",
      description: "Zorunluluk ve tavsiye bildiren modal fiiller",
      explanation: `<h3>Must</h3><p>Genellikle konuşmacının kendi içinden gelen güçlü bir zorunluluk veya gereklilik ifade eder. Yazılı kurallarda da kullanılır.</p><p><i>Örnek: I <strong>must</strong> finish this work today. (Kişisel zorunluluk)</i></p><h3>Have to</h3><p>Dışarıdan gelen bir zorunluluk, kural veya gereklilik ifade eder.</p><p><i>Örnek: Students <strong>have to</strong> wear uniforms. (Kural)</i></p><h3>Should/Ought to</h3><p>Tavsiye, öneri veya beklenti ifade eder. 'Must' veya 'have to' kadar güçlü değildir.</p><p><i>Örnek: You <strong>should</strong> see a doctor.</i></p><h3>Olumsuzları</h3><ul><li><strong>Mustn't:</strong> Yasaklama (yapmamalısın)</li><li><strong>Don't have to:</strong> Zorunluluk yok (yapmak zorunda değilsin)</li><li><strong>Shouldn't:</strong> Tavsiye (yapmaman iyi olur)</li></ul>`,
      examples: [
        { text: "You <strong>must</strong> stop when the traffic light is red.", translation: "Trafik ışığı kırmızı olduğunda durmalısın." },
        { text: "I <strong>have to</strong> get up early tomorrow for my flight.", translation: "Uçuşum için yarın erken kalkmak zorundayım." },
        { text: "You <strong>should</strong> eat more vegetables.", translation: "Daha fazla sebze yemelisin." },
        { text: "You <strong>don't have to</strong> come if you don't want to.", translation: "Eğer istemiyorsan gelmek zorunda değilsin." },
      ],
      exercises: [
        { id: "b1-3-ex1", question: "In many countries, you _____ drive on the left.", options: ["must", "should", "have to"], correctAnswer: "have to", userAnswer: null, },
        { id: "b1-3-ex2", question: "It's a great film. You _____ see it!", options: ["mustn't", "don't have to", "should"], correctAnswer: "should", userAnswer: null, },
      ],
    },
    {
      id: "b1-4",
      title: "Adverbs (Time, Degree, Manner)",
      description: "Zarflar - eylemlerin nasıl, ne zaman, ne derecede yapıldığını belirtir",
      explanation: `<h3>Adverbs of Manner</h3><p>Bir eylemin nasıl yapıldığını anlatır (örn: quickly, slowly, happily, carefully). Genellikle fiilden sonra gelir.</p><p><i>Örnek: She sings <strong>beautifully</strong>.</i></p><h3>Adverbs of Time</h3><p>Bir eylemin ne zaman yapıldığını anlatır (örn: now, yesterday, soon, later, then, tomorrow).</p><p><i>Örnek: I will call you <strong>later</strong>.</i></p><h3>Adverbs of Degree</h3><p>Bir sıfatın, zarfın veya fiilin derecesini/yoğunluğunu belirtir (örn: very, too, extremely, quite, rather, enough).</p><p><i>Örnek: It is <strong>very</strong> cold. He runs <strong>too</strong> fast.</i></p>`,
      examples: [
        { text: "He drives his car <strong>carefully</strong>.", translation: "Arabasını dikkatlice sürer." },
        { text: "We will go on holiday <strong>soon</strong>.", translation: "Yakında tatile gideceğiz." },
        { text: "The coffee is <strong>extremely</strong> hot.", translation: "Kahve aşırı sıcak." },
      ],
      exercises: [
        { id: "b1-4-ex1", question: "She speaks English _____. (akıcı bir şekilde)", options: ["fluent", "fluently", "fluentness"], correctAnswer: "fluently", userAnswer: null, },
        { id: "b1-4-ex2", question: "I am _____ tired to go out tonight. (çok)", options: ["very", "too", "enough"], correctAnswer: "too", userAnswer: null, },
      ],
    },
    {
      id: "b1-5",
      title: "Used to (Past Habits & States)",
      description: "Geçmişteki alışkanlıklar ve artık geçerli olmayan durumlar",
      explanation: `<h3>Kullanım</h3><p>'Used to + verb (yalın hal)' yapısı, geçmişte düzenli olarak yapılan ama artık yapılmayan alışkanlıkları veya geçmişte doğru olan ama artık olmayan durumları ifade etmek için kullanılır.</p><h3>Yapı</h3><ul><li><strong>Olumlu:</strong> Subject + used to + verb</li><li><strong>Olumsuz:</strong> Subject + didn't use to + verb (dikkat: 'use' to, 'used' to değil)</li><li><strong>Soru:</strong> Did + subject + use to + verb?</li></ul><p><i>Örnek: I <strong>used to play</strong> football when I was young. (Artık oynamıyorum)</i></p><p><i>Örnek: She <strong>didn't use to like</strong> coffee, but now she loves it.</i></p>`,
      examples: [
        { text: "He <strong>used to live</strong> in London, but now he lives in Paris.", translation: "Eskiden Londra'da yaşardı ama şimdi Paris'te yaşıyor." },
        { text: "We <strong>used to go</strong> to the beach every summer.", translation: "Her yaz sahile giderdik." },
        { text: "<strong>Did</strong> you <strong>use to have</strong> long hair?", translation: "Eskiden uzun saçların mı vardı?" },
      ],
      exercises: [
        { id: "b1-5-ex1", question: "I _____ (smoke), but I quit last year.", options: ["used to smoke", "use to smoke", "smoked"], correctAnswer: "used to smoke", userAnswer: null, },
        { id: "b1-5-ex2", question: "They _____ (not/be) so busy in the past.", options: ["didn't used to be", "didn't use to be", "weren't used to be"], correctAnswer: "didn't use to be", userAnswer: null, },
      ],
    },
    {
      id: "b1-6",
      title: "Modals of Past (should have, might have, etc.)",
      description: "Geçmişe yönelik modal'lar - pişmanlık, eleştiri, olasılık",
      explanation: `<h3>Should have + V3</h3><p>Geçmişte yapılması doğru olan ama yapılmamış bir eylem için pişmanlık veya eleştiri ifade eder.</p><p><i>Örnek: You <strong>should have studied</strong> harder for the exam. (Daha çok çalışmalıydın - ama çalışmadın)</i></p><h3>Might have / May have / Could have + V3</h3><p>Geçmişteki bir eylem hakkında olasılık veya tahmin belirtir.</p><p><i>Örnek: He <strong>might have missed</strong> the train. (Treni kaçırmış olabilir - emin değiliz)</i></p><h3>Must have + V3</h3><p>Geçmişteki bir eylem hakkında güçlü bir çıkarım veya mantıksal sonuç belirtir.</p><p><i>Örnek: The ground is wet. It <strong>must have rained</strong> last night. (Yağmur yağmış olmalı)</i></p>`,
      examples: [
        { text: "I <strong>shouldn't have eaten</strong> so much cake.", translation: "O kadar çok pasta yememeliydim." },
        { text: "She's not here. She <strong>could have gone</strong> home.", translation: "Burada değil. Eve gitmiş olabilir." },
        { text: "He looks very tired. He <strong>must have worked</strong> late.", translation: "Çok yorgun görünüyor. Geç saate kadar çalışmış olmalı." },
      ],
      exercises: [
        { id: "b1-6-ex1", question: "I failed the test. I _____ (study) more.", options: ["should study", "should have studied", "must have studied"], correctAnswer: "should have studied", userAnswer: null, },
        { id: "b1-6-ex2", question: "His phone is off. He _____ (forget) to charge it.", options: ["must forget", "should have forgotten", "might have forgotten"], correctAnswer: "might have forgotten", userAnswer: null, },
      ],
    },
    {
      id: "b1-7",
      title: "Present Continuous for Future Arrangements",
      description: "Yakın gelecek için kesinleşmiş planlar ve randevular",
      explanation: `<h3>Kullanım</h3><p>Present Continuous Tense, sadece şu anda olan eylemler için değil, aynı zamanda yakın gelecekte yapılması kesinleşmiş, ayarlanmış planlar ve randevular için de kullanılır. Genellikle bir zaman ifadesiyle birlikte kullanılır.</p><p><i>Örnek: I <strong>am meeting</strong> John at the cinema tonight. (Bu gece John ile sinemada buluşuyorum - planlanmış)</i></p><p><i>Örnek: We <strong>are flying</strong> to Rome next Monday.</i></p>`,
      examples: [
        { text: "What <strong>are</strong> you <strong>doing</strong> this evening?", translation: "Bu akşam ne yapıyorsun?" },
        { text: "She <strong>is starting</strong> her new job next week.", translation: "Gelecek hafta yeni işine başlıyor." },
      ],
      exercises: [
        { id: "b1-7-ex1", question: "We _____ (have) a party on Saturday. Would you like to come?", options: ["have", "will have", "are having"], correctAnswer: "are having", userAnswer: null, },
        { id: "b1-7-ex2", question: "I _____ (see) the dentist tomorrow morning at 10.", options: ["see", "will see", "am seeing"], correctAnswer: "am seeing", userAnswer: null, },
      ],
    },
    {
      id: "b1-8",
      title: "Present Perfect Continuous Tense",
      description: "Geçmişte başlayıp hala devam eden veya yeni bitmiş eylemler (süreç vurgusu)",
      explanation: `<h3>Kullanım</h3><p>Present Perfect Continuous Tense, geçmişte bir noktada başlayıp konuşma anına kadar devam etmiş (ve muhtemelen hala devam eden) veya çok kısa bir süre önce bitmiş ve etkisi görülen eylemleri ifade eder. Eylemin süresi ve devamlılığı vurgulanır.</p><h3>Yapı</h3><p>Subject + have/has + been + verb + -ing</p><p><i>Örnek: I <strong>have been waiting</strong> for you for an hour! (Bir saattir seni bekliyorum!)</i></p><p><i>Örnek: She <strong>has been working</strong> here since 2010.</i></p>`,
      examples: [
        { text: "It <strong>has been raining</strong> all day.", translation: "Bütün gün yağmur yağıyor." },
        { text: "How long <strong>have</strong> you <strong>been learning</strong> English?", translation: "Ne kadar zamandır İngilizce öğreniyorsun?" },
        { text: "He is tired because he <strong>has been running</strong>.", translation: "Yorgun çünkü koşuyordu." },
      ],
      exercises: [
        { id: "b1-8-ex1", question: "They _____ (play) tennis for two hours.", options: ["played", "have played", "have been playing"], correctAnswer: "have been playing", userAnswer: null, },
        { id: "b1-8-ex2", question: "She looks upset. _____ she _____ (cry)?", options: ["Has / cried", "Has / been crying", "Did / cry"], correctAnswer: "Has / been crying", userAnswer: null, },
      ],
    },
    {
      id: "b1-9",
      title: "Past Perfect Simple Tense",
      description: "Geçmişin geçmişi - geçmişteki bir eylemden daha önce olmuş eylemler",
      explanation: `<h3>Kullanım</h3><p>Past Perfect Simple Tense, geçmişte belirli bir zamandan veya eylemden önce tamamlanmış olan başka bir eylemi ifade etmek için kullanılır. Genellikle iki geçmiş eylemin sıralamasını belirtmek için kullanılır.</p><h3>Yapı</h3><p>Subject + had + past participle (V3)</p><p><i>Örnek: When I arrived at the station, the train <strong>had already left</strong>. (Ben vardığımda tren çoktan gitmişti.)</i></p>`,
      examples: [
        { text: "She <strong>had finished</strong> her work before she went out.", translation: "Dışarı çıkmadan önce işini bitirmişti." },
        { text: "By the time he was 10, he <strong>had learned</strong> to play the piano.", translation: "10 yaşına geldiğinde piyano çalmayı öğrenmişti." },
        { text: "I didn't go to the cinema because I <strong>had seen</strong> the film before.", translation: "Sinemaya gitmedim çünkü filmi daha önce görmüştüm." },
      ],
      exercises: [
        { id: "b1-9-ex1", question: "After they _____ (eat) dinner, they watched TV.", options: ["ate", "had eaten", "were eating"], correctAnswer: "had eaten", userAnswer: null, },
        { id: "b1-9-ex2", question: "He realized he _____ (lose) his keys.", options: ["lost", "had lost", "was losing"], correctAnswer: "had lost", userAnswer: null, },
      ],
    },
    {
      id: "b1-10",
      title: "Conditional Sentences (Type 1 & 2)",
      description: "Koşul cümleleri - gerçek/olası (Tip 1) ve hayali/gerçek dışı (Tip 2) durumlar",
      explanation: `<h3>Type 1 Conditional (Real Present/Future)</h3><p>Gelecekte olması muhtemel, gerçekçi bir koşulu ve sonucunu ifade eder.</p><p><strong>Yapı:</strong> If + Present Simple, ... will + base verb</p><p><i>Örnek: If it <strong>rains</strong> tomorrow, I <strong>will stay</strong> home.</i></p><h3>Type 2 Conditional (Unreal Present/Future)</h3><p>Şu anki veya gelecekteki gerçek olmayan, hayali durumları ve olası sonuçlarını ifade eder.</p><p><strong>Yapı:</strong> If + Past Simple, ... would + base verb</p><p><i>Örnek: If I <strong>had</strong> a lot of money, I <strong>would travel</strong> the world. (Ama çok param yok)</i></p>`,
      examples: [
        { text: "If you <strong>study</strong> hard, you <strong>will pass</strong> the exam. (Type 1)", translation: "Eğer sıkı çalışırsan, sınavı geçeceksin." },
        { text: "If I <strong>were</strong> a bird, I <strong>would fly</strong> everywhere. (Type 2)", translation: "Eğer bir kuş olsaydım, her yere uçardım." },
      ],
      exercises: [
        { id: "b1-10-ex1", question: "If we _____ (hurry), we _____ (catch) the train. (Type 1)", options: ["hurry / will catch", "hurried / would catch", "hurry / catch"], correctAnswer: "hurry / will catch", userAnswer: null, },
        { id: "b1-10-ex2", question: "What _____ (you/do) if you _____ (win) a million dollars? (Type 2)", options: ["will you do / win", "would you do / won", "do you do / would win"], correctAnswer: "would you do / won", userAnswer: null, },
      ],
    },
    {
      id: "b1-11",
      title: "Future Continuous (B1 Introduction)",
      description: "Gelecekte belirli bir anda devam ediyor olacak eylemler (giriş)",
      explanation: `<h3>Kullanım</h3><p>Future Continuous, gelecekte belirli bir zamanda devam etmekte olacak bir eylemi ifade eder.</p><h3>Yapı</h3><p>Subject + will be + verb + -ing</p><p><i>Örnek: This time next week, I <strong>will be relaxing</strong> on the beach.</i></p>`,
      examples: [
        { text: "Don't call me between 7 and 8 PM. I <strong>will be having</strong> dinner.", translation: "Beni akşam 7 ile 8 arasında arama. Akşam yemeği yiyor olacağım." },
        { text: "In an hour, we <strong>will be flying</strong> over the mountains.", translation: "Bir saat içinde dağların üzerinden uçuyor olacağız." },
      ],
      exercises: [
        { id: "b1-11-ex1", question: "At 9 AM tomorrow, she _____ (work) in her office.", options: ["will work", "will be working", "works"], correctAnswer: "will be working", userAnswer: null, },
      ],
    },
    {
      id: "b1-12",
      title: "Passive Voice (Simple Tenses)",
      description: "Edilgen çatı - Present Simple, Past Simple, Future Simple",
      explanation: `<h3>Kullanım</h3><p>Eylemi yapan kişi/şey önemli olmadığında veya bilinmediğinde, ya da eylemin kendisine odaklanılmak istendiğinde kullanılır.</p><h3>Yapı</h3><p>Subject (nesne) + to be (uygun zamanda) + Past Participle (V3)</p><ul><li><strong>Present Simple Passive:</strong> The office <strong>is cleaned</strong> every day.</li><li><strong>Past Simple Passive:</strong> The window <strong>was broken</strong> yesterday.</li><li><strong>Future Simple Passive:</strong> The report <strong>will be finished</strong> tomorrow.</li></ul>`,
      examples: [
        { text: "English <strong>is spoken</strong> all over the world.", translation: "İngilizce tüm dünyada konuşulur." },
        { text: "This bridge <strong>was built</strong> in 1950.", translation: "Bu köprü 1950'de inşa edildi." },
        { text: "The results <strong>will be announced</strong> next week.", translation: "Sonuçlar gelecek hafta duyurulacak." },
      ],
      exercises: [
        { id: "b1-12-ex1", question: "Many accidents _____ (cause) by careless driving.", options: ["cause", "are caused", "were caused"], correctAnswer: "are caused", userAnswer: null, },
        { id: "b1-12-ex2", question: "The new road _____ (open) next month.", options: ["will open", "opens", "will be opened"], correctAnswer: "will be opened", userAnswer: null, },
      ],
    },
     {
      id: "b1-13",
      title: "Future (will & be going to - Review)",
      description: "Gelecek zaman yapıları - will ve be going to'nun farklı kullanımları",
      explanation: `<h3>'will' Kullanımı</h3><ul><li>Anlık kararlar: <i>I'm thirsty. I think I <strong>will buy</strong> a drink.</i></li><li>Tahminler (genellikle 'think', 'probably' ile): <i>It <strong>will probably rain</strong> tomorrow.</i></li><li>Sözler, teklifler: <i>I <strong>will help</strong> you.</i></li></ul><h3>'be going to' Kullanımı</h3><ul><li>Önceden yapılmış planlar, niyetler: <i>We <strong>are going to get</strong> married next year.</i></li><li>Şu anki bir duruma/kanıta dayalı güçlü tahminler: <i>Look at those dark clouds! It<strong>'s going to rain</strong>.</i></li></ul>`,
      examples: [
        { text: "A: We don't have any milk. B: Oh, really? I <strong>will go</strong> and get some.", translation: "A: Hiç sütümüz yok. B: Öyle mi? Gidip biraz alacağım." },
        { text: "My sister <strong>is going to have</strong> a baby in June.", translation: "Kız kardeşim Haziran'da bebek sahibi olacak." },
      ],
      exercises: [
        { id: "b1-13-ex1", question: "I've decided. I _____ (learn) a new language next year.", options: ["will learn", "am going to learn", "learn"], correctAnswer: "am going to learn", userAnswer: null, },
        { id: "b1-13-ex2", question: "Perhaps we _____ (visit) them later.", options: ["visit", "are going to visit", "will visit"], correctAnswer: "will visit", userAnswer: null, },
      ],
    },
  ],
  B2: [
    {
      id: "b2-1",
      title: "Conditional Sentences (Type 2 & 3)",
      description: "Koşul cümleleri - gerçek olmayan veya geçmişteki varsayımsal durumlar",
      explanation: `<h3>Type 2 Conditional (Unreal Present/Future)</h3><p>Şu anki veya gelecekteki gerçek olmayan, hayali durumları ve sonuçlarını ifade eder.</p><p><strong>Yapı:</strong> If + Past Simple, ... would + base verb</p><p><i>Örnek: If I <strong>won</strong> the lottery, I <strong>would buy</strong> a big house.</i></p><h3>Type 3 Conditional (Unreal Past)</h3><p>Geçmişteki gerçekleşmemiş, hayali durumları ve onların gerçekleşmemiş sonuçlarını ifade eder. Genellikle pişmanlık belirtir.</p><p><strong>Yapı:</strong> If + Past Perfect, ... would have + past participle (V3)</p><p><i>Örnek: If I <strong>had studied</strong> harder, I <strong>would have passed</strong> the exam.</i></p>`,
      examples: [
        { text: "If I <strong>knew</strong> her number, I <strong>would call</strong> her. (Type 2)", translation: "Onun numarasını bilseydim, onu arardım." },
        { text: "If she <strong>hadn't missed</strong> the bus, she <strong>wouldn't have been</strong> late. (Type 3)", translation: "Otobüsü kaçırmasaydı, geç kalmazdı." },
      ],
      exercises: [
        { id: "b2-1-ex1", question: "If I _____ (be) you, I _____ (apologize). (Type 2)", options: ["am / will apologize", "were / would apologize", "was / would have apologized", "had been / would apologize"], correctAnswer: "were / would apologize", userAnswer: null, },
        { id: "b2-1-ex2", question: "He _____ (come) to the party if he _____ (be) invited. (Type 3)", options: ["would come / was", "came / had been", "would have come / had been", "had come / would be"], correctAnswer: "would have come / had been", userAnswer: null, },
      ],
    },
    {
      id: "b2-2",
      title: "Future Perfect & Future Continuous",
      description: "Gelecekte belirli bir zamandan önce tamamlanmış veya o anda devam ediyor olacak eylemler",
      explanation: `<h3>Future Continuous</h3><p>Gelecekte belirli bir anda devam ediyor olacak eylemleri ifade eder.</p><p><strong>Yapı:</strong> Subject + will be + verb + -ing</p><p><i>Örnek: This time tomorrow, I <strong>will be flying</strong> to New York.</i></p><h3>Future Perfect</h3><p>Gelecekte belirli bir zamandan önce tamamlanmış olacak eylemleri ifade eder.</p><p><strong>Yapı:</strong> Subject + will have + past participle (V3)</p><p><i>Örnek: By 2030, they <strong>will have built</strong> the new airport.</i></p>`,
      examples: [
        { text: "At 10 AM tomorrow, I <strong>will be having</strong> a meeting.", translation: "Yarın sabah 10'da bir toplantıda olacağım." },
        { text: "By the time you arrive, I <strong>will have finished</strong> cooking.", translation: "Sen gelene kadar yemeği bitirmiş olacağım." },
      ],
      exercises: [
        { id: "b2-2-ex1", question: "Don't call me at 7 PM. I _____ (have) dinner then.", options: ["will have", "will be having", "will have had"], correctAnswer: "will be having", userAnswer: null, },
        { id: "b2-2-ex2", question: "By next year, she _____ (graduate) from university.", options: ["will graduate", "will be graduating", "will have graduated"], correctAnswer: "will have graduated", userAnswer: null, },
      ],
    },
    {
      id: "b2-3",
      title: "Relative Clauses (Defining & Non-defining)",
      description: "İsimleri niteleyen yan cümlecikler",
      explanation: `<h3>Defining Relative Clauses</h3><p>Nitelediği ismi tanımlar ve cümlenin anlamı için gereklidir. Virgül kullanılmaz. 'Who, whom, which, that, whose' kullanılabilir. 'That' genellikle 'which' ve 'who/whom' yerine geçebilir.</p><p><i>Örnek: The man <strong>who lives next door</strong> is a doctor.</i></p><h3>Non-defining Relative Clauses</h3><p>Nitelediği isim hakkında ekstra bilgi verir ve cümlenin temel anlamı için gerekli değildir. İki virgül arasında veya bir virgül ve nokta arasında yer alır. 'That' kullanılamaz.</p><p><i>Örnek: My brother, <strong>who lives in London</strong>, is visiting us next week.</i></p>`,
      examples: [
        { text: "The book <strong>that I'm reading</strong> is very interesting. (Defining)", translation: "Okuduğum kitap çok ilginç." },
        { text: "Mr. Smith, <strong>whose car was stolen</strong>, called the police. (Non-defining)", translation: "Arabası çalınan Bay Smith, polisi aradı." },
      ],
      exercises: [
        { id: "b2-3-ex1", question: "This is the house _____ Jack built.", options: ["who", "which", "whose"], correctAnswer: "which", userAnswer: null, }, // 'that' de doğru olabilir ama seçeneklerde yok
        { id: "b2-3-ex2", question: "My sister, _____ is a lawyer, lives in New York.", options: ["that", "who", "which"], correctAnswer: "who", userAnswer: null, },
      ],
    },
    {
      id: "b2-4",
      title: "Compound Adjectives",
      description: "Birden fazla kelimeden oluşan sıfatlar",
      explanation: `<h3>Kullanım</h3><p>Bileşik sıfatlar, genellikle bir ismi nitelemek için bir araya gelen iki veya daha fazla kelimeden oluşur ve çoğunlukla aralarında tire (-) kullanılır (özellikle isimden önce geldiklerinde).</p><h3>Yaygın Yapılar</h3><ul><li><strong>Sayı + İsim (tekil):</strong> a <i>ten-minute</i> break, a <i>five-year-old</i> child</li><li><strong>Sıfat + İsim-ed:</strong> a <i>blue-eyed</i> girl, a <i>kind-hearted</i> person</li><li><strong>Zarf + Past Participle:</strong> a <i>well-known</i> author, a <i>brightly-lit</i> room</li><li><strong>İsim + Present Participle:</strong> an <i>English-speaking</i> country, a <i>mouth-watering</i> cake</li></ul>`,
      examples: [
        { text: "She bought a <strong>second-hand</strong> car.", translation: "İkinci el bir araba aldı." },
        { text: "He is a <strong>world-famous</strong> singer.", translation: "O, dünyaca ünlü bir şarkıcı." },
        { text: "This is a <strong>state-of-the-art</strong> computer.", translation: "Bu, son teknoloji bir bilgisayar." },
      ],
      exercises: [
        { id: "b2-4-ex1", question: "It was a _____ (uzun süren) journey.", options: ["long-lasted", "long-lasting", "lasting-long"], correctAnswer: "long-lasting", userAnswer: null, },
        { id: "b2-4-ex2", question: "He gave me a _____ (yürekten) smile.", options: ["heart-felt", "felt-heart", "heartful"], correctAnswer: "heart-felt", userAnswer: null, },
      ],
    },
    {
      id: "b2-5",
      title: "Adverbs (Advanced Usage & Positioning)",
      description: "Zarfların ileri düzey kullanımı ve cümledeki yerleri",
      explanation: `<h3>Kullanım</h3><p>B2 seviyesinde zarfların (tarz, zaman, yer, derece, sıklık) cümle içindeki esnek yerleşimi ve anlamı nasıl etkiledikleri önemlidir. Vurgu için cümlenin başına getirilebilirler (bazen devrik yapıyla).</p><h3>Örnekler</h3><ul><li><strong>Focusing Adverbs (Sadece, bile, ayrıca):</strong> <i>She <strong>only</strong> eats vegetables. / <strong>Even</strong> he didn't know.</i></li><li><strong>Viewpoint Adverbs (Bakış açısı):</strong> <i><strong>Personally</strong>, I think it's a great idea.</i></li><li><strong>Comment Adverbs (Yorum):</strong> <i><strong>Fortunately</strong>, no one was injured.</i></li></ul>`,
      examples: [
        { text: "<strong>Slowly and carefully</strong>, he opened the box.", translation: "Yavaşça ve dikkatlice kutuyu açtı." },
        { text: "I <strong>hardly ever</strong> see him these days.", translation: "Bu günlerde onu neredeyse hiç görmüyorum." },
        { text: "<strong>Frankly</strong>, I don't think it's a good idea.", translation: "Açıkçası, bunun iyi bir fikir olduğunu sanmıyorum." },
      ],
      exercises: [
        { id: "b2-5-ex1", question: "_____ , I managed to finish the project on time. (neyse ki)", options: ["Clearly", "Unfortunately", "Luckily"], correctAnswer: "Luckily", userAnswer: null, },
        { id: "b2-5-ex2", question: "She _____ speaks about her personal life. (nadiren)", options: ["often", "seldom", "always"], correctAnswer: "seldom", userAnswer: null, },
      ],
    },
    {
      id: "b2-6",
      title: "Past Perfect Continuous Tense",
      description: "Geçmişin geçmişinde başlayıp bir süre devam etmiş eylemler",
      explanation: `<h3>Kullanım</h3><p>Past Perfect Continuous, geçmişteki bir olaydan veya zamandan önce başlamış ve o ana kadar bir süre devam etmiş olan eylemleri ifade eder. Eylemin süresi ve devamlılığı vurgulanır.</p><h3>Yapı</h3><p>Subject + had been + verb + -ing</p><p><i>Örnek: He <strong>had been working</strong> for hours when he finally took a break. (Mola verdiğinde saatlerdir çalışıyordu.)</i></p>`,
      examples: [
        { text: "They <strong>had been waiting</strong> for an hour before the bus arrived.", translation: "Otobüs gelmeden önce bir saattir bekliyorlardı." },
        { text: "She was tired because she <strong>had been studying</strong> all night.", translation: "Bütün gece ders çalıştığı için yorgundu." },
      ],
      exercises: [
        { id: "b2-6-ex1", question: "By the time I got home, my family _____ (watch) TV for two hours.", options: ["watched", "had watched", "had been watching"], correctAnswer: "had been watching", userAnswer: null, },
        { id: "b2-6-ex2", question: "He _____ (drive) for a long time, so he needed a rest.", options: ["had driven", "drove", "had been driving"], correctAnswer: "had been driving", userAnswer: null, },
      ],
    },
    {
      id: "b2-7",
      title: "Passive Voice (Continuous, Perfect, Modals)",
      description: "Edilgen çatı - Devam eden, bitmiş zamanlar ve modal fiillerle kullanımı",
      explanation: `<h3>Kullanım</h3><p>B2 seviyesinde edilgen çatı, Present/Past Continuous, Present/Past Perfect ve modal fiillerle birlikte daha karmaşık cümlelerde kullanılır.</p><h3>Yapılar</h3><ul><li><strong>Present Continuous Passive:</strong> The road <strong>is being repaired</strong>.</li><li><strong>Past Continuous Passive:</strong> The car <strong>was being washed</strong>.</li><li><strong>Present Perfect Passive:</strong> The letter <strong>has been sent</strong>.</li><li><strong>Past Perfect Passive:</strong> The work <strong>had been finished</strong> before 5 PM.</li><li><strong>Modal Passive:</strong> The project <strong>must be completed</strong>. / The problem <strong>can be solved</strong>.</li></ul>`,
      examples: [
        { text: "My computer <strong>is being fixed</strong> at the moment.", translation: "Bilgisayarım şu anda tamir ediliyor." },
        { text: "All the tickets <strong>had been sold</strong> before the concert started.", translation: "Konser başlamadan önce tüm biletler satılmıştı." },
        { text: "This task <strong>should be done</strong> by tomorrow.", translation: "Bu görev yarına kadar yapılmalı." },
      ],
      exercises: [
        { id: "b2-7-ex1", question: "The new museum _____ (build) when I last visited the city.", options: ["was built", "was being built", "had been built"], correctAnswer: "was being built", userAnswer: null, },
        { id: "b2-7-ex2", question: "Your application _____ (must/submit) before the deadline.", options: ["must submit", "must be submitted", "must have submitted"], correctAnswer: "must be submitted", userAnswer: null, },
      ],
    },
    {
      id: "b2-8",
      title: "Modals of Speculation & Deduction (Present & Past)",
      description: "Tahmin ve çıkarım modal'ları (şimdiki zaman ve geçmiş zaman)",
      explanation: `<h3>Present Speculation/Deduction</h3><ul><li><strong>Must be:</strong> Güçlü olasılık/çıkarım (neredeyse emin) - <i>She isn't answering. She <strong>must be</strong> busy.</i></li><li><strong>Might be / May be / Could be:</strong> Olasılık (emin değil) - <i>He <strong>might be</strong> at home.</i></li><li><strong>Can't be:</strong> Güçlü olumsuz çıkarım (imkansız gibi) - <i>That <strong>can't be</strong> true!</i></li></ul><h3>Past Speculation/Deduction</h3><ul><li><strong>Must have + V3:</strong> Güçlü geçmiş çıkarım - <i>The lights are off. They <strong>must have gone</strong> out.</i></li><li><strong>Might have / May have / Could have + V3:</strong> Geçmiş olasılık - <i>I don't know where she is. She <strong>could have missed</strong> the bus.</i></li><li><strong>Can't have + V3 / Couldn't have + V3:</strong> Güçlü olumsuz geçmiş çıkarım - <i>He <strong>can't have finished</strong> all that work already!</i></li></ul>`,
      examples: [
        { text: "He's not in his room. He <strong>might be</strong> in the garden.", translation: "Odasında değil. Bahçede olabilir." },
        { text: "She looks very happy. She <strong>must have received</strong> good news.", translation: "Çok mutlu görünüyor. İyi haber almış olmalı." },
        { text: "I can't find my keys. I <strong>could have left</strong> them in the car.", translation: "Anahtarlarımı bulamıyorum. Arabada bırakmış olabilirim." },
      ],
      exercises: [
        { id: "b2-8-ex1", question: "John didn't come to the party. He _____ (be) ill.", options: ["must be", "might have been", "can't be"], correctAnswer: "might have been", userAnswer: null, },
        { id: "b2-8-ex2", question: "The window is broken. Someone _____ (break) it.", options: ["must break", "can't have broken", "must have broken"], correctAnswer: "must have broken", userAnswer: null, },
      ],
    },
    {
      id: "b2-9",
      title: "Mixed Conditionals",
      description: "Karma koşul cümleleri - farklı zaman dilimlerindeki koşul ve sonuçlar",
      explanation: `<h3>Kullanım</h3><p>Karma koşul cümleleri, if-cümleciği ve ana cümleciğin farklı zaman dilimlerine (genellikle geçmiş ve şimdiki/gelecek zaman) atıfta bulunduğu durumlarda kullanılır.</p><h3>Yaygın Yapılar</h3><ul><li><strong>Geçmişteki koşul, şimdiki sonuç:</strong> If + Past Perfect, ... would + base verb.<br/><i>Örnek: If I <strong>had taken</strong> your advice (past), I <strong>would be</strong> rich now (present).</i></li><li><strong>Şimdiki koşul, geçmişteki sonuç:</strong> If + Past Simple, ... would have + V3.<br/><i>Örnek: If I <strong>weren't</strong> so busy (present), I <strong>would have gone</strong> to the party last night (past).</i></li></ul>`,
      examples: [
        { text: "If he <strong>hadn't missed</strong> the flight, he <strong>would be</strong> here with us now.", translation: "Eğer uçağı kaçırmasaydı, şimdi bizimle burada olurdu." },
        { text: "If I <strong>spoke</strong> French, I <strong>could have helped</strong> those tourists yesterday.", translation: "Eğer Fransızca konuşuyor olsaydım, dün o turistlere yardım edebilirdim." },
      ],
      exercises: [
        { id: "b2-9-ex1", question: "If she _____ (study) harder in the past, she _____ (have) a better job now.", options: ["studied / would have", "had studied / would have", "studied / will have"], correctAnswer: "had studied / would have", userAnswer: null, },
        { id: "b2-9-ex2", question: "If I _____ (not be) afraid of heights, I _____ (try) bungee jumping last year.", options: ["weren't / would have tried", "hadn't been / would try", "am not / will try"], correctAnswer: "weren't / would have tried", userAnswer: null, },
      ],
    },
    {
      id: "b2-10",
      title: "Reported Speech (B2 Level)",
      description: "Dolaylı anlatım - ifadeler, sorular ve emirler",
      explanation: `<h3>Kullanım</h3><p>Bir başkasının sözlerini aktarırken zamanlar, zamirler ve zaman/yer belirteçleri genellikle değişir (backshift).</p><h3>Reported Statements</h3><p><i>'I am tired,' she said. -> She said (that) she <strong>was</strong> tired.</i></p><h3>Reported Questions</h3><p>Yes/No soruları 'if' veya 'whether' ile aktarılır. Wh- soruları soru kelimesiyle başlar. Soru yapısı düz cümleye dönüşür.</p><p><i>'Are you okay?' he asked. -> He asked <strong>if/whether I was</strong> okay.</i></p><p><i>'Where do you live?' she asked. -> She asked <strong>where I lived</strong>.</i></p><h3>Reported Commands/Requests</h3><p>'tell/ask/order + someone + to + infinitive' yapısı kullanılır.</p><p><i>'Open the window,' he said. -> He told me <strong>to open</strong> the window.</i></p>`,
      examples: [
        { text: "Direct: 'I will call you later.' Tom said. <br/>Reported: Tom said he <strong>would call</strong> me later.", translation: "Direkt: 'Seni sonra arayacağım.' dedi Tom. <br/>Dolaylı: Tom beni sonra arayacağını söyledi." },
        { text: "Direct: 'What time is it?' she asked. <br/>Reported: She asked what time it <strong>was</strong>.", translation: "Direkt: 'Saat kaç?' diye sordu. <br/>Dolaylı: Saatin kaç olduğunu sordu." },
        { text: "Direct: 'Please don't be late,' my mom told me. <br/>Reported: My mom told me <strong>not to be</strong> late.", translation: "Direkt: 'Lütfen geç kalma,' dedi annem. <br/>Dolaylı: Annem geç kalmamamı söyledi." },
      ],
      exercises: [
        { id: "b2-10-ex1", question: "He said, 'I am studying now.' -> He said that he _____ studying _____ .", options: ["is / now", "was / then", "was / now"], correctAnswer: "was / then", userAnswer: null, },
        { id: "b2-10-ex2", question: "'Can you help me?' she asked. -> She asked _____ her.", options: ["if I can help", "whether I could help", "can I help"], correctAnswer: "whether I could help", userAnswer: null, },
      ],
    },
    {
      id: "b2-11", // Future Perfect Continuous için yeni ID
      title: "Future Perfect Continuous",
      description: "Gelecekte belirli bir ana kadar devam etmiş olacak eylemlerin süresi",
      explanation: `<h3>Kullanım</h3><p>Future Perfect Continuous, gelecekte belirli bir zamana kadar bir eylemin ne kadar süredir devam ediyor olacağını vurgulamak için kullanılır.</p><h3>Yapı</h3><p>Subject + will have been + verb + -ing</p><p><i>Örnek: By next year, I <strong>will have been working</strong> here for five years. (Gelecek yıl, burada beş yıldır çalışıyor olacağım.)</i></p>`,
      examples: [
        { text: "When he retires, he <strong>will have been teaching</strong> for 30 years.", translation: "Emekli olduğunda, 30 yıldır öğretmenlik yapıyor olacak." },
        { text: "By 6 PM, we <strong>will have been driving</strong> for eight hours.", translation: "Akşam 6'ya kadar sekiz saattir araba kullanıyor olacağız." },
      ],
      exercises: [
        { id: "b2-11-ex1", question: "By the end of this month, they _____ (live) in this city for a decade.", options: ["will live", "will be living", "will have been living"], correctAnswer: "will have been living", userAnswer: null, },
      ],
    },
  ],
  C1: [
    {
      id: "c1-1",
      title: "Passive Voice (Advanced Usage)",
      description: "Edilgen çatı - eylemi yapanın değil, eylemin kendisinin önemli olduğu durumlar",
      explanation: `<h3>Kullanım</h3><p>Passive Voice (Edilgen Çatı), eylemi yapan kişi veya şey bilinmediğinde, önemli olmadığında veya eylemin kendisine odaklanılmak istendiğinde kullanılır. C1 seviyesinde daha karmaşık zamanlar ve yapılarla (örn: modal'larla, 'have something done' yapısı) kullanımı önemlidir.</p><h3>Temel Yapı</h3><p>Subject (nesne) + to be (uygun zamanda çekimlenmiş) + past participle (V3) (+ by agent)</p><h3>Örnekler (Karmaşık Yapılar)</h3><ul><li>Modal Passive: The work <strong>must be finished</strong> by tomorrow.</li><li>Present Perfect Passive: The house <strong>has been sold</strong>.</li><li>Causative (Have sth done): I <strong>had my car repaired</strong>. (Arabamı tamir ettirdim - başkasına)</li></ul>`,
      examples: [
        { text: "The new bridge <strong>is being built</strong> currently.", translation: "Yeni köprü şu anda inşa ediliyor." },
        { text: "This masterpiece <strong>must have been painted</strong> by a famous artist.", translation: "Bu başyapıt ünlü bir sanatçı tarafından boyanmış olmalı." },
        { text: "She <strong>is said to be</strong> very talented.", translation: "Onun çok yetenekli olduğu söyleniyor." },
      ],
      exercises: [
        { id: "c1-1-ex1", question: "The documents _____ (send) to the client last week.", options: ["were sent", "have been sent", "are sent", "had sent"], correctAnswer: "were sent", userAnswer: null, },
        { id: "c1-1-ex2", question: "The problem _____ (should/solve) as soon as possible.", options: ["should solve", "should be solving", "should be solved", "should have solved"], correctAnswer: "should be solved", userAnswer: null, },
      ],
    },
    {
      id: "c1-2",
      title: "Inversion with Negative Adverbials",
      description: "Olumsuz zarf ifadeleriyle devrik cümle yapısı",
      explanation: `<h3>Kullanım</h3><p>Cümleye olumsuz veya kısıtlayıcı bir zarf ifadesiyle (örn: Never, Rarely, Seldom, Not only...but also, No sooner...than, Hardly...when, Little, Under no circumstances) başlandığında, vurgu katmak için özne ve yardımcı fiil yer değiştirir (devrik yapı kullanılır).</p><h3>Yapı</h3><p>Negative Adverbial + Auxiliary Verb + Subject + Main Verb ...</p><p><i>Örnek: <strong>Never have I seen</strong> such a beautiful sunset. (Normal: I have never seen...)</i></p><p><i>Örnek: <strong>Not only did she pass</strong> the exam, but she also got the highest score.</i></p>`,
      examples: [
        { text: "<strong>Seldom do we</strong> see such an amazing performance.", translation: "Nadiren böyle harika bir performans görürüz." },
        { text: "<strong>No sooner had he arrived</strong> than the phone rang.", translation: "O varır varmaz telefon çaldı." },
        { text: "<strong>Under no circumstances should you</strong> open that door.", translation: "Hiçbir koşul altında o kapıyı açmamalısın." },
      ],
      exercises: [
        { id: "c1-2-ex1", question: "Little _____ about the surprise party.", options: ["he knew", "did he know", "knew he", "he did know"], correctAnswer: "did he know", userAnswer: null, },
        { id: "c1-2-ex2", question: "Not only _____ talented, but she is also very hardworking.", options: ["she is", "is she", "she was", "was she"], correctAnswer: "is she", userAnswer: null, },
      ],
    },
    {
      id: "c1-3",
      title: "Phrasal Verbs (Advanced & Idiomatic)",
      description: "Deyimsel anlamlar taşıyan gelişmiş öbek fiiller",
      explanation: `<h3>Kullanım</h3><p>Phrasal verb'ler (öbek fiiller), bir fiil ve bir veya daha fazla edat/zarf parçacığından oluşur ve genellikle temel fiilin anlamından farklı, deyimsel bir anlam taşır. C1 seviyesinde, daha az yaygın ve daha soyut anlamlı phrasal verb'lerin anlaşılması ve kullanılması beklenir.</p><h3>Önemli Noktalar</h3><ul><li>Ayrılabilir (separable) ve ayrılamaz (inseparable) olmaları.</li><li>Birden fazla anlam taşıyabilmeleri.</li><li>Resmi ve gayriresmi kullanımları.</li></ul>`,
      examples: [
        { text: "The company had to <strong>lay off</strong> several employees. (işten çıkarmak)", translation: "Şirket birkaç çalışanı işten çıkarmak zorunda kaldı." },
        { text: "I can't <strong>put up with</strong> his attitude anymore. (tahammül etmek, katlanmak)", translation: "Onun tavrına daha fazla katlanamıyorum." },
        { text: "She <strong>came across</strong> an old friend at the supermarket. (tesadüfen karşılaşmak)", translation: "Süpermarkette eski bir arkadaşıyla karşılaştı." },
      ],
      exercises: [
        { id: "c1-3-ex1", question: "The negotiations _____ due to a disagreement on terms. (başarısız olmak, sonuçsuz kalmak)", options: ["broke down", "broke up", "broke in", "broke out"], correctAnswer: "broke down", userAnswer: null, },
        { id: "c1-3-ex2", question: "He needs to _____ his smoking if he wants to be healthier. (azaltmak, kesmek)", options: ["cut up", "cut off", "cut down on", "cut in"], correctAnswer: "cut down on", userAnswer: null, },
      ],
    },
    {
      id: "c1-4",
      title: "Futures (Revision & Advanced Nuances)",
      description: "Gelecek zaman yapılarının tekrarı ve ileri düzey incelikleri",
      explanation: `<h3>Revision of Future Forms</h3><p>Will, be going to, Present Continuous, Present Simple for future.</p><h3>Advanced Nuances</h3><ul><li><strong>Future Continuous vs. Future Perfect:</strong> Gelecekte belirli bir anda devam eden eylem vs. o andan önce bitmiş eylem.</li><li><strong>Future Perfect Continuous:</strong> Gelecekte bir noktaya kadar ne kadar süredir bir eylemin yapılıyor olacağı. (B2'de de değinildi)</li><li><strong>'Be to + infinitive':</strong> Resmi planlar, talimatlar (örn: The President <strong>is to visit</strong> France next month.)</li><li><strong>'Be about to + infinitive':</strong> Çok yakın gelecek (örn: Hurry up! The train <strong>is about to leave</strong>.)</li><li><strong>'Be due to + infinitive':</strong> Planlanmış, beklenen zaman (örn: The plane <strong>is due to arrive</strong> at 6 PM.)</li></ul>`,
      examples: [
        { text: "By this time next year, I <strong>will have graduated</strong>. (Future Perfect)", translation: "Gelecek yıl bu zamanlar mezun olmuş olacağım." },
        { text: "The conference participants <strong>are to register</strong> by 9 AM. (Formal Plan)", translation: "Konferans katılımcıları sabah 9'a kadar kayıt yaptıracaklar." },
        { text: "Don't go out now, the storm <strong>is about to start</strong>. (Immediate Future)", translation: "Şimdi dışarı çıkma, fırtına başlamak üzere." },
      ],
      exercises: [
        { id: "c1-4-ex1", question: "The Prime Minister _____ make an announcement later today. (resmi plan)", options: ["will", "is going to", "is to"], correctAnswer: "is to", userAnswer: null, },
        { id: "c1-4-ex2", question: "By the time she's 30, she _____ (travel) to over 20 countries.", options: ["will travel", "will have been travelling", "will have travelled"], correctAnswer: "will have travelled", userAnswer: null, },
      ],
    },
    {
      id: "c1-5",
      title: "Modifying Adjectives (Gradable/Ungradable)",
      description: "Derecelendirilebilir ve derecelendirilemeyen sıfatların zarflarla nitelenmesi",
      explanation: `<h3>Gradable Adjectives</h3><p>Farklı dereceleri olabilen sıfatlardır (örn: hot, cold, big, interesting). 'Very, extremely, quite, rather, a bit, slightly' gibi derece zarflarıyla nitelenebilirler.</p><p><i>Örnek: It's <strong>very cold</strong>. The film was <strong>quite interesting</strong>.</i></p><h3>Ungradable (Extreme/Absolute) Adjectives</h3><p>Zaten en üst veya mutlak bir anlam taşıyan sıfatlardır (örn: freezing, boiling, enormous, fascinating, perfect, unique, dead). Genellikle 'very' ile kullanılmazlar. 'Absolutely, completely, totally, utterly' gibi zarflarla veya anlamı güçlendirmek için 'really' ile nitelenebilirler.</p><p><i>Örnek: It's <strong>absolutely freezing</strong>. The view was <strong>totally unique</strong>.</i></p><h3>Compound Adjectives (Review)</h3><p>B2'de işlenen bileşik sıfatların (örn: well-behaved, hard-working) kullanımı pekiştirilir.</p>`,
      examples: [
        { text: "The weather was <strong>extremely hot</strong> yesterday. (Gradable)", translation: "Dün hava aşırı sıcaktı." },
        { text: "His performance was <strong>absolutely brilliant</strong>. (Ungradable)", translation: "Performansı kesinlikle harikaydı." },
        { text: "She's a <strong>highly-respected</strong> scientist. (Compound)", translation: "O, son derece saygın bir bilim insanı." },
      ],
      exercises: [
        { id: "c1-5-ex1", question: "I was _____ exhausted after the marathon. (tamamen)", options: ["very", "slightly", "completely"], correctAnswer: "completely", userAnswer: null, },
        { id: "c1-5-ex2", question: "The idea is good, but it's _____ impractical. (oldukça)", options: ["absolutely", "rather", "utterly"], correctAnswer: "rather", userAnswer: null, },
      ],
    },
    {
      id: "c1-6",
      title: "Ellipsis and Substitution",
      description: "Gereksiz tekrarları önlemek için kelime/yapı atlama veya yerine başka kelime kullanma",
      explanation: `<h3>Ellipsis</h3><p>Cümlenin anlamı bağlamdan anlaşılabiliyorsa, bazı kelimelerin (özellikle yardımcı fiiller, tekrarlanan isimler veya fiiller) atılmasıdır.</p><p><i>Örnek: A: Will you be there? B: Yes, I will (be there). -> Yes, I will.</i></p><p><i>Örnek: She likes coffee, and I (like coffee) too. -> She likes coffee, and I do too.</i></p><h3>Substitution</h3><p>Bir kelime veya ifadenin yerine genellikle daha kısa bir zamir veya yardımcı fiil kullanılmasıdır.</p><ul><li><strong>one/ones:</strong> Sayılabilir isimlerin yerine. <i>I prefer the red <strong>one</strong>.</i></li><li><strong>so/not (after verbs of thinking):</strong> <i>A: Is it going to rain? B: I think <strong>so</strong>. / I hope <strong>not</strong>.</i></li><li><strong>do/does/did (for verb phrases):</strong> <i>He runs faster than I <strong>do</strong>.</i></li></ul>`,
      examples: [
        { text: "A: Are you coming? B: I might (come).", translation: "A: Geliyor musun? B: Gelebilirim." },
        { text: "I wanted to buy the blue shirt, but they only had the green <strong>one</strong>.", translation: "Mavi gömleği almak istedim ama onlarda sadece yeşil olanı vardı." },
        { text: "She works harder than he <strong>does</strong>.", translation: "O, ondan (erkeğin çalıştığından) daha çok çalışır." },
      ],
      exercises: [
        { id: "c1-6-ex1", question: "A: Did you enjoy the film? B: Yes, I _____ very much.", options: ["enjoyed", "did", "was"], correctAnswer: "did", userAnswer: null, },
        { id: "c1-6-ex2", question: "I need a new phone. The _____ I have is too old.", options: ["phone", "it", "one"], correctAnswer: "one", userAnswer: null, },
      ],
    },
    {
      id: "c1-7",
      title: "Emphasis: Cleft Sentences",
      description: "Vurgu: Yarık cümleler ('It is...that', 'What...is...')",
      explanation: `<h3>Kullanım</h3><p>Cleft sentences (yarık cümleler), cümlenin belirli bir bölümünü vurgulamak için kullanılır. İki ana türü vardır:</p><ul><li><strong>It-cleft:</strong> It + be + Vurgulanan Kısım + that/who + Cümlenin Kalanı<br/><i>Örnek: <strong>It was John who</strong> broke the window. (Vurgu: John)</i></li><li><strong>Wh-cleft (Pseudo-cleft):</strong> What/Where/When/Why/How/The thing that + Subject + Verb + be + Vurgulanan Kısım<br/><i>Örnek: <strong>What I need is</strong> a cup of coffee. (Vurgu: a cup of coffee)</i></li></ul>`,
      examples: [
        { text: "<strong>It was</strong> last night <strong>that</strong> I saw him.", translation: "Onu dün gece gördüm. (Vurgu: dün gece)" },
        { text: "<strong>What surprised me was</strong> his sudden anger.", translation: "Beni şaşırtan şey onun ani öfkesiydi." },
        { text: "The reason <strong>why I called is</strong> to invite you to the party.", translation: "Aramamın nedeni seni partiye davet etmek." },
      ],
      exercises: [
        { id: "c1-7-ex1", question: "_____ the red car that she wants to buy. (Vurgu: kırmızı araba)", options: ["It is", "What is", "That is"], correctAnswer: "It is", userAnswer: null, },
        { id: "c1-7-ex2", question: "_____ we need to do now is to stay calm. (Vurgu: sakin kalmak)", options: ["It is what", "The thing what", "What"], correctAnswer: "What", userAnswer: null, },
      ],
    },
  ],
  C2: [
    {
      id: "c2-1",
      title: "Reported Speech (Advanced Nuances)",
      description: "Dolaylı anlatım - söylenenleri aktarırken zaman ve zamir değişiklikleri, karmaşık yapılar",
      explanation: `<h3>Kullanım</h3><p>Reported Speech (Dolaylı Anlatım), bir başkasının söylediklerini aktarmak için kullanılır. C2 seviyesinde, zaman kaydırmalarının (backshift) istisnaları, modal fiillerin dolaylı anlatımı, soru ve emir cümlelerinin karmaşık aktarımları gibi incelikler önemlidir.</p><h3>Temel Kurallar</h3><ul><li>Zamanlar genellikle bir derece geçmişe kaydırılır (örn: Present Simple -> Past Simple).</li><li>Zamirler ve yer/zaman belirteçleri konuşmacının perspektifine göre değişir.</li></ul><h3>İleri Düzey Noktalar</h3><ul><li>Genel geçer doğrular veya hala geçerli durumlar aktarılırken zaman kaydırması yapılmayabilir.</li><li>'Must' zorunluluk için Past Simple'da 'had to' olurken, çıkarım anlamındaki 'must' değişmeyebilir.</li><li>Karmaşık soru yapıları ve 'if/whether' kullanımı.</li></ul>`,
      examples: [
        { text: "Direct: 'I <strong>will go</strong> tomorrow,' she said. <br/>Reported: She said she <strong>would go</strong> the next day.", translation: "Direkt: 'Yarın gideceğim,' dedi. <br/>Dolaylı: Ertesi gün gideceğini söyledi." },
        { text: "Direct: 'Where <strong>are you</strong>?' he asked. <br/>Reported: He asked where I <strong>was</strong>.", translation: "Direkt: 'Neredesin?' diye sordu. <br/>Dolaylı: Nerede olduğumu sordu." },
        { text: "Direct: 'The Earth <strong>is</strong> round,' the teacher said. <br/>Reported: The teacher said that the Earth <strong>is</strong> round.", translation: "Direkt: 'Dünya yuvarlaktır,' dedi öğretmen. <br/>Dolaylı: Öğretmen Dünya'nın yuvarlak olduğunu söyledi." },
      ],
      exercises: [
        { id: "c2-1-ex1", question: "She said, 'I must finish this report today.' -> She said that she _____ finish that report that day.", options: ["must", "had to", "would have to", "should"], correctAnswer: "had to", userAnswer: null, },
        { id: "c2-1-ex2", question: "He asked me, 'Did you see the new film?' -> He asked me _____ the new film.", options: ["if I saw", "whether I had seen", "did I see", "if I have seen"], correctAnswer: "whether I had seen", userAnswer: null, },
      ],
    },
    {
      id: "c2-2",
      title: "Subjunctive Mood",
      description: "Dilek, istek, gereklilik veya varsayım bildiren kip",
      explanation: `<h3>Kullanım</h3><p>Subjunctive (istek/dilek kipi), genellikle resmi dilde veya belirli fiillerden (suggest, recommend, demand, insist, require) ve ifadelerden (It is important/vital/essential that...) sonra 'that' ile başlayan yan cümleciklerde kullanılır. Genellikle fiilin yalın hali (base form) tüm özneler için kullanılır.</p><h3>Yapı</h3><p>Verb (suggest, demand, etc.) + that + Subject + Base Form of Verb</p><p><i>Örnek: The doctor suggested that he <strong>take</strong> a break.</i></p><p><i>Örnek: It is essential that everyone <strong>be</strong> on time.</i></p><h3>'Were' Subjunctive</h3><p>Gerçek olmayan durumları ifade etmek için 'if', 'as if', 'as though', 'wish' gibi yapılarla 'to be' fiilinin yerine tüm özneler için 'were' kullanılır.</p><p><i>Örnek: If I <strong>were</strong> you, I wouldn't do that. I wish I <strong>were</strong> taller.</i></p>`,
      examples: [
        { text: "The committee recommended that the proposal <strong>be</strong> accepted.", translation: "Komite, teklifin kabul edilmesini tavsiye etti." },
        { text: "It is vital that she <strong>understand</strong> the consequences.", translation: "Sonuçları anlaması hayati önem taşıyor." },
        { text: "He speaks as if he <strong>were</strong> the boss.", translation: "Patronmuş gibi konuşuyor." },
      ],
      exercises: [
        { id: "c2-2-ex1", question: "The manager insisted that all employees _____ present at the meeting.", options: ["are", "were", "be", "to be"], correctAnswer: "be", userAnswer: null, },
        { id: "c2-2-ex2", question: "I wish it _____ summer now.", options: ["is", "was", "were", "be"], correctAnswer: "were", userAnswer: null, },
      ],
    },
    {
      id: "c2-3",
      title: "Emphasis (Cleft Sentences, Fronting)",
      description: "Cümlenin belirli kısımlarını vurgulama teknikleri",
      explanation: `<h3>Cleft Sentences</h3><p>Cümlenin bir bölümünü vurgulamak için 'It is/was ... that/who ...' veya 'What ... is/was ...' gibi yapılar kullanılır.</p><p><i>Örnek: <strong>It was John who</strong> broke the window. (Vurgu: John)</i></p><p><i>Örnek: <strong>What I need is</strong> a long holiday. (Vurgu: a long holiday)</i></p><h3>Fronting</h3><p>Cümlenin normalde sonda veya ortada yer alan bir bölümünü (zarf, nesne, vb.) başa alarak vurgu yapılır. Bazen devrik yapı (inversion) da eşlik edebilir.</p><p><i>Örnek: <strong>Quietly, he</strong> entered the room. (Normal: He entered the room quietly.)</i></p><p><i>Örnek: <strong>Such a brilliant performance I have</strong> seldom seen. (Devrik yapıya yakın)</i></p>`,
      examples: [
        { text: "<strong>It is</strong> his arrogance <strong>that</strong> I can't stand.", translation: "Dayanamadığım şey onun kibridir." },
        { text: "<strong>What she did was</strong> apologize immediately.", translation: "Yaptığı şey hemen özür dilemekti." },
        { text: "<strong>Into the dark forest went</strong> the brave knight. (Fronting with inversion)", translation: "Karanlık ormana girdi cesur şövalye." },
      ],
      exercises: [
        { id: "c2-3-ex1", question: "_____ a cup of tea that I would like now. (Vurgu: a cup of tea)", options: ["It is", "What is", "There is", "That is"], correctAnswer: "It is", userAnswer: null, },
        { id: "c2-3-ex2", question: "Never before _____ such a difficult decision. (Vurgu ve devrik yapı)", options: ["I had faced", "had I faced", "I faced", "did I face"], correctAnswer: "had I faced", userAnswer: null, },
      ],
    },
    {
      id: "c2-4",
      title: "Conditionals (Advanced Nuances)",
      description: "Koşul cümleleri: Dolaylı, devrik yapılar ve diğer incelikler",
      explanation: `<h3>Implied Conditionals</h3><p>Koşulun açıkça 'if' ile belirtilmediği, ancak bağlamdan anlaşıldığı durumlar.</p><p><i>Örnek: I wouldn't do that. (Implied: If I were you)</i></p><p><i>Örnek: But for his help, we would have failed. (If it hadn't been for his help...)</i></p><h3>Inverted Conditionals</h3><p>Resmi dilde 'if' atılarak yardımcı fiil ve öznenin yer değiştirdiği yapılar.</p><p><i>Örnek: <strong>Were I</strong> rich, I would travel. (If I were rich...)</i></p><p><i>Örnek: <strong>Had I known</strong>, I would have told you. (If I had known...)</i></p><p><i>Örnek: <strong>Should you need</strong> further assistance, please contact us. (If you should need...)</i></p><h3>Other Nuances</h3><p>'Unless', 'as long as', 'provided that', 'supposing' gibi bağlaçlarla kurulan koşul cümleleri.</p>`,
      examples: [
        { text: "<strong>Were it not for</strong> the bad weather, we would be on the beach now.", translation: "Kötü hava olmasaydı, şimdi sahilde olurduk." },
        { text: "You can borrow my car <strong>as long as</strong> you drive carefully.", translation: "Dikkatli sürdüğün sürece arabamı ödünç alabilirsin." },
        { text: "<strong>Supposing</strong> you won the lottery, what would you do first?", translation: "Piyangoyu kazandığını varsayalım, ilk ne yapardın?" },
      ],
      exercises: [
        { id: "c2-4-ex1", question: "_____ he more careful, he wouldn't have made that mistake. (Devrik yapı)", options: ["If he were", "Were he", "Had he been"], correctAnswer: "Had he been", userAnswer: null, },
        { id: "c2-4-ex2", question: "I'll lend you the money _____ you pay me back next week.", options: ["unless", "provided that", "supposing"], correctAnswer: "provided that", userAnswer: null, },
      ],
    },
    {
      id: "c2-5",
      title: "Participle Clauses",
      description: "Ortaç cümlecikleri - yan cümlecikleri kısaltma",
      explanation: `<h3>Kullanım</h3><p>Participle clause'lar (Present Participle -ing, Past Participle -ed/V3, Perfect Participle having V3) ana cümlenin öznesiyle aynı özneye sahip yan cümlecikleri kısaltmak için kullanılır. Daha akıcı ve kısa cümleler oluştururlar.</p><h3>Türleri ve Kullanımları</h3><ul><li><strong>Present Participle (-ing):</strong> Eş zamanlı eylemler, sebep-sonuç, bir eylemin hemen ardından gelen başka bir eylem.<br/><i>Örnek: <strong>Feeling</strong> tired, she went to bed early. (Because she felt tired...)</i><br/><i>Örnek: <strong>Opening</strong> the door, he saw a stranger. (When he opened the door...)</i></li><li><strong>Past Participle (-ed/V3):</strong> Genellikle edilgen anlam taşır.<br/><i>Örnek: <strong>Shocked</strong> by the news, he couldn't speak. (Because he was shocked...)</i><br/><i>Örnek: The book, <strong>written</strong> by a famous author, became a bestseller. (which was written...)</i></li><li><strong>Perfect Participle (Having + V3):</strong> Ana cümledekinden daha önce tamamlanmış bir eylemi belirtir.<br/><i>Örnek: <strong>Having finished</strong> her work, she went home. (After she had finished...)</i></li></ul><h3>Dangling Modifiers</h3><p>Participle clause'un öznesi ana cümlenin öznesiyle aynı olmadığında ortaya çıkan hatadır. Bundan kaçınılmalıdır.</p>`,
      examples: [
        { text: "<strong>Not knowing</strong> what to do, I asked for help.", translation: "Ne yapacağımı bilmediğim için yardım istedim." },
        { text: "The car, <strong>parked</strong> illegally, was towed away.", translation: "Yasadışı park edilmiş araba çekildi." },
        { text: "<strong>Having lost</strong> his keys, he couldn't enter the house.", translation: "Anahtarlarını kaybettiği için eve giremedi." },
      ],
      exercises: [
        { id: "c2-5-ex1", question: "_____ (see) the warning sign, he slowed down.", options: ["Seeing", "Seen", "Having seen"], correctAnswer: "Seeing", userAnswer: null, }, // veya Having seen
        { id: "c2-5-ex2", question: "The report, _____ (complete) yesterday, is now on your desk.", options: ["completing", "completed", "having completed"], correctAnswer: "completed", userAnswer: null, },
      ],
    },
    {
      id: "c2-6",
      title: "Advanced Use of Articles",
      description: "Artikellerin (a/an, the, zero article) karmaşık ve soyut isimlerle kullanımı",
      explanation: `<h3>Zero Article</h3><ul><li>Genel anlamda çoğul ve sayılamayan isimlerle: <i><strong>Cats</strong> are independent. <strong>Information</strong> is power.</i></li><li>Belirli kurum adları (school, prison, hospital, university, church) genel amaçla kullanıldığında: <i>He goes to <strong>school</strong>. (öğrenci olarak) vs. His mother went to <strong>the school</strong> to talk to the teacher. (belirli bir amaçla)</i></li><li>Yemek adları (breakfast, lunch, dinner) genel anlamda: <i>What time do you have <strong>dinner</strong>?</i></li></ul><h3>'The' with Unique Nouns/Abstract Concepts</h3><ul><li>Benzersiz şeyler: <i><strong>the sun, the moon, the internet, the environment</strong></i></li><li>Soyut kavramlar (belirli bir duruma atıfta bulunulduğunda): <i><strong>The happiness</strong> she felt was immense. vs. <strong>Happiness</strong> is important.</i></li></ul><h3>'A/An' with Professions/Descriptions</h3><p>Bir kişinin ne olduğunu veya ne iş yaptığını belirtirken: <i>She is <strong>an engineer</strong>. He is <strong>a kind person</strong>.</i></p>`,
      examples: [
        { text: "<strong>Life</strong> can be challenging sometimes. (Zero article - genel anlamda hayat)", translation: "Hayat bazen zorlayıcı olabilir." },
        { text: "<strong>The life</strong> of a soldier is not easy. (Belirli bir hayat)", translation: "Bir askerin hayatı kolay değildir." },
        { text: "She was sent to <strong>prison</strong> for theft. (Genel amaç)", translation: "Hırsızlıktan hapse gönderildi." },
        { text: "I went to <strong>the prison</strong> to visit my cousin. (Belirli bir ziyaret)", translation: "Kuzenimi ziyaret etmek için hapishaneye gittim." },
      ],
      exercises: [
        { id: "c2-6-ex1", question: "_____ love is a beautiful thing.", options: ["A", "The", "No article"], correctAnswer: "No article", userAnswer: null, },
        { id: "c2-6-ex2", question: "She is studying _____ history of ancient Rome.", options: ["a", "the", "no article"], correctAnswer: "the", userAnswer: null, },
      ],
    },
  ]
};

export default function GrammarPracticePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, mutate: mutateAuth } = useAuth(); // mutateAuth eklendi

  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const topicsForLevel = grammarTopics[selectedLevel as keyof typeof grammarTopics];
    if (topicsForLevel?.length > 0) {
      setSelectedTopic(topicsForLevel[0].id);
    } else {
      setSelectedTopic(null);
    }
  }, [selectedLevel]);

  useEffect(() => {
    setExerciseAnswers({});
    setShowResults(false);
  }, [selectedTopic]);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleAnswerSelect = (exerciseId: string, answer: string) => {
    setExerciseAnswers((prev) => ({
      ...prev,
      [exerciseId]: answer,
    }));
  };

  const handleCheckAnswers = async () => { // async yapıldı
    setShowResults(true);
    const currentTopicData = getSelectedTopic();
    if (currentTopicData && user) { // user kontrolü eklendi
      const totalExercises = currentTopicData.exercises.length;
      const correctAnswers = currentTopicData.exercises.filter(
        (exercise) => exerciseAnswers[exercise.id] === exercise.correctAnswer
      ).length;

      toast({
        title: "Sonuçlar",
        description: `${totalExercises} sorudan ${correctAnswers} tanesini doğru cevapladınız.`,
      });

      try {
        const response = await fetch('/api/user/grammar-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicId: currentTopicData.id,
            score: correctAnswers,
            totalQuestions: totalExercises,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          toast({
            title: "Kaydetme Hatası",
            description: result.error || "Sonuçlar kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
            variant: "destructive",
          });
        } else {
          console.log("Gramer sonuçları başarıyla kaydedildi:", result);
          // Kullanıcı verisini (ve dolayısıyla grammarScores'u) SWR ile yenile
          mutateAuth(); 
        }
      } catch (error) {
        console.error("Gramer sonucu kaydetme API hatası:", error);
        toast({
          title: "Ağ Hatası",
          description: "Sonuçlar kaydedilirken bir ağ hatası oluştu.",
          variant: "destructive",
        });
      }
    } else if (!user) {
        toast({
            title: "Hata",
            description: "Sonuçları kaydetmek için giriş yapmalısınız.",
            variant: "destructive",
        });
    }
  };

  const getSelectedTopic = () => {
    if (!selectedTopic) return null;
    const topicsForLevel = grammarTopics[selectedLevel as keyof typeof grammarTopics];
    return topicsForLevel?.find((t) => t.id === selectedTopic) || null;
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  const currentTopic = getSelectedTopic();
  const userScoreDataForCurrentTopic = user?.grammarScores?.find(gs => gs.topicId === currentTopic?.id);
  const isCurrentTopicCompleted = userScoreDataForCurrentTopic?.isCompleted || false;

  console.log("Current Topic ID:", currentTopic?.id, "Is Completed:", isCurrentTopicCompleted, "User Scores:", user?.grammarScores);

  return (
    <div className="max-w-7xl mx-auto w-full"> {/* Geniş bir container */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Gramer Çalışma Alanı</h1>
        <p className="text-muted-foreground mt-2 text-lg">İngilizce gramer kurallarını öğrenin ve pratik yapın</p>
      </div>
      <div className="mb-6">
        <Tabs defaultValue={selectedLevel} onValueChange={setSelectedLevel} className="w-full">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 bg-muted/50 p-1">
            {Object.keys(grammarTopics).map(level => (
              <TabsTrigger key={level} value={level} className="data-[state=active]:bg-lilac data-[state=active]:text-white">
                {level}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="border-input sticky top-4"> {/* border-lilac/20 kaldırıldı, daha genel bir stil */}
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gramer Konuları</CardTitle>
              <CardDescription>Seviye: {selectedLevel}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 p-2 max-h-[calc(100vh-240px)] overflow-y-auto"> {/* Yükseklik ayarlandı */}
                {(grammarTopics[selectedLevel as keyof typeof grammarTopics] || []).map((topic) => {
                  const userScoreData = user?.grammarScores?.find(gs => gs.topicId === topic.id);
                  const isCompleted = userScoreData?.isCompleted || false;
                  return (
                    <Button
                      key={topic.id}
                      variant="ghost"
                      className={`w-full justify-start text-left h-auto py-2 pr-8 relative ${selectedTopic === topic.id ? "bg-lilac/10 text-lilac font-medium" : "hover:bg-muted/50"} ${isCompleted ? "pl-3" : "pl-3"}`}
                      onClick={() => handleTopicSelect(topic.id)}
                    >
                      <div className="flex items-center w-full">
                        <BookIcon className={`h-4 w-4 mr-2 shrink-0 ${selectedTopic === topic.id ? "text-lilac" : "text-muted-foreground"}`} />
                        <div className="flex flex-col items-start overflow-hidden flex-1">
                          <span className={`text-sm truncate w-full ${isCompleted ? "text-green-600 dark:text-green-500" : ""}`}>{topic.title}</span>
                          <span className="text-xs text-muted-foreground truncate w-full">{topic.description}</span>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </Button>
                  );
                })}
                {!(grammarTopics[selectedLevel as keyof typeof grammarTopics] || []).length && (
                    <p className="p-4 text-sm text-muted-foreground text-center">Bu seviye için konu bulunamadı.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          {currentTopic ? (
            <div className="space-y-6">
              <Card className="border-input">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle className="text-xl">{currentTopic.title}</CardTitle><CardDescription>{currentTopic.description}</CardDescription></div>
                    <Badge variant="outline" className="text-xs">{selectedLevel}</Badge>
                  </div>
                </CardHeader>
              </Card>
              <Card className="border-input">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Kural Açıklaması</CardTitle></CardHeader>
                <CardContent><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentTopic.explanation }} /></CardContent>
              </Card>
              <Card className="border-input">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Örnek Cümleler</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentTopic.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-md">
                        <p className="mb-1 text-foreground" dangerouslySetInnerHTML={{ __html: example.text }} />
                        <p className="text-sm text-muted-foreground">{example.translation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {isCurrentTopicCompleted && !showResults ? ( // Eğer konu tamamlanmışsa ve sonuçlar gösterilmiyorsa (yani yeni seçilmişse)
                <Card className="border-input">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">
                      Tebrikler!
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Bu konuyu daha önce başarıyla tamamladınız.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => { 
                        // Kullanıcının yine de çözmesine izin vermek için sonuçları ve cevapları sıfırla
                        setShowResults(false); 
                        setExerciseAnswers({});
                        // Bu, alıştırmaların tekrar görünmesini sağlayacak
                      }}
                    >
                      Yine de Tekrar Çöz
                    </Button>
                  </CardContent>
                </Card>
              ) : ( // Konu tamamlanmamışsa VEYA tamamlanmış ama "Tekrar Dene"ye basılmışsa (showResults false ise) alıştırmaları göster
                <Card className="border-input">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Alıştırmalar</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {currentTopic.exercises.map((exercise) => (
                        <div key={exercise.id} className="space-y-3">
                          <p className="font-medium">{exercise.question}</p>
                          <RadioGroup value={exerciseAnswers[exercise.id] || ""} onValueChange={(value) => handleAnswerSelect(exercise.id, value)} disabled={showResults && !isCurrentTopicCompleted}> 
                            {/* Eğer konu tamamlanmışsa ve sonuçlar gösteriliyorsa, tekrar seçim yapamasın. Ama tekrar denemek isterse showResults false olur. */}
                            <div className="space-y-2">
                              {exercise.options.map((option) => (
                                <div key={option} className={`flex items-center space-x-2 p-3 rounded-md border ${showResults ? (exerciseAnswers[exercise.id] === option ? (option === exercise.correctAnswer ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10") : (option === exercise.correctAnswer ? "border-green-500 bg-green-500/10" : "border-input")) : "border-input hover:bg-muted/50"}`}>
                                  <RadioGroupItem value={option} id={`${exercise.id}-${option}`} />
                                  <Label htmlFor={`${exercise.id}-${option}`} className="flex-1 cursor-pointer">{option}</Label>
                                  {showResults && (<>
                                    {exerciseAnswers[exercise.id] === option && option === exercise.correctAnswer && (<Check className="h-5 w-5 text-green-500 ml-auto" />)}
                                    {exerciseAnswers[exercise.id] === option && option !== exercise.correctAnswer && (<X className="h-5 w-5 text-red-500 ml-auto" />)}
                                    {exerciseAnswers[exercise.id] !== option && option === exercise.correctAnswer && (<Check className="h-5 w-5 text-green-500 ml-auto opacity-50" />)}
                                  </>)}
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4">
                    {/* Eğer konu tamamlanmışsa ve sonuçlar gösterilmiyorsa (yani "Yine de Tekrar Çöz"e basılmışsa) "Cevapları Kontrol Et" gösterilir. */}
                    {/* Eğer konu tamamlanmamışsa ve sonuçlar gösterilmiyorsa "Cevapları Kontrol Et" gösterilir. */}
                    {/* Eğer sonuçlar gösteriliyorsa (showResults true ise) "Tekrar Dene" gösterilir. */}
                    {!showResults ? (
                      <Button className="bg-lilac hover:bg-lilac/90 text-white" onClick={handleCheckAnswers} disabled={Object.keys(exerciseAnswers).length < currentTopic.exercises.length}>Cevapları Kontrol Et</Button>
                    ) : (
                      <Button className="bg-lilac hover:bg-lilac/90 text-white" onClick={() => { setExerciseAnswers({}); setShowResults(false); }}>Tekrar Dene</Button>
                    )}
                  </CardFooter>
                </Card>
              )}
              {/* <Button className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 text-lg">Bu Konu İçin Quiz Başlat</Button> */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg border border-dashed border-input">
              <BookIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">Lütfen sol menüden bir gramer konusu seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
