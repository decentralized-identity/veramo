import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './global.js'
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<React.StrictMode>
  <App />
</React.StrictMode>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
