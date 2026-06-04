/**
 * Price Change Component
 * 
 * Displays price change with appropriate styling.
 */

import { Box, Typography } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { formatPrice, formatChange, formatChangePercent } from '@utils/formatters';

interface PriceChangeProps {
  /** Current price */
  price: number;
  /** Price change amount */
  change: number;
  /** Price change percentage */
  changePercent: number;
  /** Show absolute change */
  showAbsolute?: boolean;
  /** Show percentage */
  showPercent?: boolean;
  /** Variant: 'text' | 'chip' | 'badge' */
  variant?: 'text' | 'chip' | 'badge';
  /** Size: 'small' | 'medium' | 'large' */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Price change display component
 */
export function PriceChange({
  price,
  change,
  changePercent,
  showAbsolute = true,
  showPercent = true,
  variant = 'text',
  size = 'medium',
}: PriceChangeProps) {
  const isPositive = change > 0;
  const isZero = change === 0;
  
  const getColor = () => {
    if (isZero) return 'text.secondary';
    return isPositive ? 'success.main' : 'error.main';
  };
  
  const getIcon = () => {
    if (isZero) return <TrendingFlat sx={{ fontSize: iconSize }} />;
    return isPositive ? (
      <TrendingUp sx={{ fontSize: iconSize }} />
    ) : (
      <TrendingDown sx={{ fontSize: iconSize }} />
    );
  };
  
  const iconSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const fontSize = size === 'small' ? '0.75rem' : size === 'large' ? '1.25rem' : '0.875rem';
  
  const content = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        color: getColor(),
      }}
    >
      {getIcon()}
      <Typography
        component="span"
        sx={{
          fontSize,
          fontWeight: 500,
        }}
      >
        {formatChange(change)}
      </Typography>
      {showPercent && (
        <Typography
          component="span"
          sx={{
            fontSize,
            fontWeight: 500,
          }}
        >
          ({isPositive ? '+' : ''}{formatChangePercent(changePercent)}%)
        </Typography>
      )}
    </Box>
  );
  
  if (variant === 'chip') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: isZero ? 'grey.100' : isPositive ? 'success.50' : 'error.50',
          color: getColor(),
        }}
      >
        {content}
      </Box>
    );
  }
  
  if (variant === 'badge') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: isZero ? 'grey.100' : isPositive ? 'success.main' : 'error.main',
          color: 'white',
        }}
      >
        <Typography sx={{ fontSize, fontWeight: 600 }}>
          {isPositive ? '+' : ''}{formatChangePercent(changePercent)}%
        </Typography>
      </Box>
    );
  }
  
  return content;
}
