import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from '@stores/authStore';

// Layouts
import { MainLayout } from '@components/layouts/MainLayout';

// Pages
import { HomePage } from '@pages/HomePage';
import { StockDetailPage } from '@pages/StockDetailPage';
import { FilterPage } from '@pages/FilterPage';
import { NewsPage } from '@pages/NewsPage';
import { ProfilePage } from '@pages/ProfilePage';
import { LoginPage } from '@pages/LoginPage';
import { PortfolioPage } from '@pages/PortfolioPage';

// Components
import { Loading } from '@components/common/Loading';

/**
 * Root Application Component
 * 
 * Defines application routes and protected route logic.
 * Uses React Router v6 for navigation.
 */
function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading spinner during initial auth check
  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <Box className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="stock/:code" element={<StockDetailPage />} />
          <Route path="filter" element={<FilterPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:code" element={<NewsPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
