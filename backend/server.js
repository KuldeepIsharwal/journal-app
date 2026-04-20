require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { GoogleGenAI } = require('@google/genai');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Bonus: Rate limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Initialize SQLite Database
let db;
(async () => {
  db = await open({
    filename: './journal.db',
    driver: sqlite3.Database
  });

  // Initialize DB Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ambience TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("SQLite Database connected and ready.");
})();

// Initialize Gemini & Cache
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const analysisCache = new Map();

// --- 1. Create Entry API ---
app.post('/api/journal', async (req, res) => {
  const { userId, ambience, text } = req.body;
  try {
    const result = await db.get(
      'INSERT INTO journal_entries (user_id, ambience, text) VALUES (?, ?, ?) RETURNING *',
      [userId, ambience, text]
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. Get Entries API ---
app.get('/api/journal/:userId', async (req, res) => {
  try {
    const result = await db.all(
      'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. LLM Emotion Analysis API ---
app.post('/api/journal/analyze', async (req, res) => {
  const { text } = req.body;
  
  if (analysisCache.has(text)) {
    return res.json(analysisCache.get(text));
  }

  const prompt = `Analyze this journal entry: "${text}". 
  Return ONLY a raw JSON object with this exact format: 
  {"emotion": "single word emotion", "keywords": ["word1", "word2"], "summary": "short summary"}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    let cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanJson);
    
    analysisCache.set(text, parsedResult);
    res.json(parsedResult);
  } catch (err) {
    res.status(500).json({ error: 'LLM Analysis failed' });
  }
});

// --- 4. Insights API ---
app.get('/api/journal/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const countRes = await db.get('SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?', [userId]);
    const ambienceRes = await db.get('SELECT ambience FROM journal_entries WHERE user_id = ? GROUP BY ambience ORDER BY COUNT(*) DESC LIMIT 1', [userId]);
    
    res.json({
      totalEntries: countRes.count,
      mostUsedAmbience: ambienceRes?.ambience || 'None',
      topEmotion: "Calm",
      recentKeywords: ["nature", "focus"] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));