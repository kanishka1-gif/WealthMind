import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import StockDetail from './pages/StockDetail'
import Portfolio from './pages/Portfolio'
import Profile from './pages/Profile'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

function App() {
  const { user } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } />
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/market" element={
            <ProtectedRoute>
              <Market />
            </ProtectedRoute>
          } />
          
          <Route path="/stock/:symbol" element={
            <ProtectedRoute>
              <StockDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App