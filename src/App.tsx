import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/pages/AppShell'
import ViewPage from '@/pages/ViewPage'

// === APP ROUTES | inicio ===
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route path="/viewpage" element={<ViewPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
// === APP ROUTES | fim ===
