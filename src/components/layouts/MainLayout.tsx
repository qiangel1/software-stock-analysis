/**
 * Layout Components
 * 
 * Main application layout with header and bottom navigation.
 */

import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Header } from '@components/common/Header';
import { BottomNav } from '@components/common/BottomNav';
import { RiskDisclaimer } from '@components/common/RiskDisclaimer';

/**
 * Main layout component
 */
export function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Box
        component="main"
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          pb: isMobile ? 10 : 3,
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        <Outlet />
        
        {/* Footer disclaimer */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <RiskDisclaimer compact />
        </Box>
      </Box>
      
      <BottomNav />
    </Box>
  );
}
