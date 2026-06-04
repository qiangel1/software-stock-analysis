/**
 * Bottom Navigation Component
 * 
 * Mobile bottom navigation bar with
 * quick access to main sections.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery } from '@mui/material';
import {
  Home,
  Star,
  ShowChart,
  Newspaper,
  Person,
} from '@mui/icons-material';

/**
 * Bottom navigation items configuration
 */
const NAV_ITEMS = [
  { label: '首页', icon: <Home />, path: '/' },
  { label: '自选', icon: <Star />, path: '/watchlist' },
  { label: '行情', icon: <ShowChart />, path: '/market' },
  { label: '资讯', icon: <Newspaper />, path: '/news' },
  { label: '我的', icon: <Person />, path: '/profile' },
];

/**
 * Bottom navigation component for mobile
 */
export function BottomNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on desktop
  if (!isMobile) return null;
  
  // Get current value from pathname
  const currentPath = location.pathname;
  const currentIndex = NAV_ITEMS.findIndex(
    (item) => item.path === currentPath || currentPath.startsWith(item.path + '/')
  );
  
  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        showLabels
        sx={{ height: 56 }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            onClick={() => navigate(item.path)}
            sx={{
              minWidth: 'auto',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
