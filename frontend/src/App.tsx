import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PasswordListPage from './pages/PasswordListPage'
import PasswordDetailPage from './pages/PasswordDetailPage'
import PasswordNewPage from './pages/PasswordNewPage'
import PasswordEditPage from './pages/PasswordEditPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/passwords" element={<PasswordListPage />} />
        <Route path="/passwords/new" element={<PasswordNewPage />} />
        <Route path="/passwords/:id" element={<PasswordDetailPage />} />
        <Route path="/passwords/:id/edit" element={<PasswordEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App