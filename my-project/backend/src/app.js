const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const huggingfaceRoutes = require('./routes/huggingfaceRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test rotası
app.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

// Route'ları kullan
app.use('/api/huggingface', huggingfaceRoutes);

// Port ayarları
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});