import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CodingPage } from './components/CodingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to={`/room/${Math.random().toString(36).substring(7)}`} replace />} />
          <Route path="/room/:roomId" element={<CodingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
