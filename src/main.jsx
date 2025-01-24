import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LeaguePerformanceTracker from './components/LeaguePerformanceTracker';

createRoot(document.getElementById('root')).render(
    <LeaguePerformanceTracker />
)
