import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-blue-600">Welcome to Dine N Dash</h1>
      <p>This is the frontend setup using React + Tailwind CSS.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
