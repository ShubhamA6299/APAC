import React, { useState } from 'react';
import './index.css';
import ChatInterface from './components/ChatInterface';
import ProgressDashboard from './components/ProgressDashboard';

function App() {
  const [progress, setProgress] = useState({
    'Basics': 'Mastered',
    'Intermediate': 'Learning',
    'Advanced': 'Not Started'
  });

  return (
    <div className="app-container">
      <ProgressDashboard progress={progress} />
      <main className="main-content">
        <header className="chat-header">
          <h1>Learning Companion</h1>
          <p>Your personalized, AI-powered tutor using Google Cloud Agents.</p>
        </header>
        <ChatInterface setProgress={setProgress} />
      </main>
    </div>
  );
}

export default App;
