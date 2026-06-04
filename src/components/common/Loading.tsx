/**
 * Loading Component
 * 
 * Loading spinner with full-screen option.
 */

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  /** Show as full screen overlay */
  fullScreen?: boolean;
  /** Custom message */
  message?: string;
  /** Custom size */
  size?: number;
}

/**
 * Loading spinner component
 */
export function Loading({ 
  fullScreen = false, 
  message = '加载中...',
  size = 40,
}: LoadingProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
  
  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      {content}
    </Box>
  );
}
