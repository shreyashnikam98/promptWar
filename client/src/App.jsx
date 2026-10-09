import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { MapExplorer } from './pages/MapExplorer';
import { PlaceDetails } from './pages/PlaceDetails';
import { HistoryCulture } from './pages/HistoryCulture';
import { FoodHotels } from './pages/FoodHotels';
import { ComparePlaces } from './pages/ComparePlaces';
import { SafetyDashboard } from './pages/SafetyDashboard';
import { CityInsights } from './pages/CityInsights';
import { Weather } from './pages/Weather';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { MyReports } from './pages/MyReports';
import { Favorites } from './pages/Favorites';
import { Notifications } from './pages/Notifications';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const StaffRoute = ({ children, requiredRole = 'moderator' }) => {
  const { isAuthenticated, user, isModerator, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  if (requiredRole === 'moderator' && !isModerator) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0a0f1d] dark:text-slate-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/map" element={<MapExplorer />} />
                <Route path="/place/:id" element={<PlaceDetails />} />
                <Route path="/history" element={<HistoryCulture />} />
                <Route path="/hospitality" element={<FoodHotels />} />
                <Route path="/compare" element={<ComparePlaces />} />
                <Route path="/safety" element={<SafetyDashboard />} />
                <Route path="/insights" element={<CityInsights />} />
                <Route path="/weather" element={<Weather />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* Moderator & Admin Protected Routes */}
                <Route path="/moderator" element={<StaffRoute requiredRole="moderator"><ModeratorDashboard /></StaffRoute>} />
                <Route path="/admin" element={<StaffRoute requiredRole="admin"><AdminDashboard /></StaffRoute>} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
