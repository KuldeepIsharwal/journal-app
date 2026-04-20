import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://arvyax-api.onrender.com/api/journal';
const USER_ID = '123'; // Hardcoded for this demo

function App() {
  const [text, setText] = useState('');
  const [ambience, setAmbience] = useState('forest');
  const [entries, setEntries] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const res = await axios.get(`${API_URL}/${USER_ID}`);
    setEntries(res.data);
  };

  const fetchInsights = async () => {
    const res = await axios.get(`${API_URL}/insights/${USER_ID}`);
    setInsights(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, { userId: USER_ID, ambience, text });
    setText('');
    fetchEntries();
  };

  const handleAnalyze = async (entryText) => {
    setAnalysis({ summary: 'Analyzing...' }); // Loading state
    const res = await axios.post(`${API_URL}/analyze`, { text: entryText });
    setAnalysis(res.data);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ArvyaX Journal</h1>
      
      <form onSubmit={handleSubmit}>
        <select value={ambience} onChange={(e) => setAmbience(e.target.value)}>
          <option value="forest">Forest</option>
          <option value="ocean">Ocean</option>
          <option value="mountain">Mountain</option>
        </select><br/><br/>
        <textarea 
          rows="4" cols="50" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="How did you feel?" required 
        /><br/><br/>
        <button type="submit">Save Entry</button>
      </form>

      <hr />

      <button onClick={fetchInsights}>View Overall Insights</button>
      {insights && (
        <div style={{ background: '#eee', padding: '10px', marginTop: '10px' }}>
          <p>Total Entries: {insights.totalEntries}</p>
          <p>Top Ambience: {insights.mostUsedAmbience}</p>
        </div>
      )}

      <h2>Past Entries</h2>
      {entries.map(entry => (
        <div key={entry.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
          <p><strong>{entry.ambience}</strong>: {entry.text}</p>
          <button onClick={() => handleAnalyze(entry.text)}>Analyze Emotion</button>
        </div>
      ))}

      {analysis && (
        <div style={{ border: '2px solid green', padding: '10px', marginTop: '20px' }}>
          <h3>LLM Analysis</h3>
          <p><strong>Emotion:</strong> {analysis.emotion}</p>
          <p><strong>Summary:</strong> {analysis.summary}</p>
          <p><strong>Keywords:</strong> {analysis.keywords?.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default App;