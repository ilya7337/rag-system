import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import AuthPage from './pages/Auth';
import { TopicPage } from './pages/TopicPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminPanel } from './pages/AdminPanel';
import { ChatPanel } from './components/ChatPanel';
import { FeedbackButton } from './components/FeedbackButton';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/topic/:id" element={<TopicPage />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          </Routes>
          <ChatPanel />
          <FeedbackButton />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
