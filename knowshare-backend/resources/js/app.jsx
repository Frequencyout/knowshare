import '../css/app.css';
import './bootstrap';

import { createRoot } from 'react-dom/client';
import React from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function App() {
  React.useEffect(() => {
    // Redirect to the frontend application
    window.location.href = process.env.MIX_FRONTEND_URL || 'http://localhost:5173';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          KnowShare Backend
        </h1>
        <p className="text-gray-600">
          Redirecting to frontend application...
        </p>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
