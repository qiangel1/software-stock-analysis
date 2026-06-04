/**
 * Stock Card Component
 * 
 * Displays stock information in card format
 * with price, change, and quick actions.
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Box, Typography, IconButton, Chip } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  MoreVert,
} from '@mui/icons-material';
import type { Stock } from '@types/stock';
import { formatPrice, formatChange, formatChangePercent } from '@utils/formatters';

interface StockCardProps {
  /** Stock data */
  stock: Stock;
  /** Whether stock is in watchlist */
  isWatched?: boolean;
  /** Show watchlist toggle */
  showWatchlist?: boolean;
  /** On watchlist toggle */
  onWatchlistToggle?: (code: string, watched: boolean) => void;
  /** On more options click */
  onMoreClick?: (stock: Stock) => void;
  /** Clickable card */
  clickable?: boolean;
}

/**
 * Stock card component
 */
export function StockCard({
  stock,
  isWatched = false,
  showWatchlist = false,
  onWatchlistToggle,
  onMoreClick,
  clickable = true,
}: StockCardProps) {
  const navigate = useNavigate();
  
  const isPositive = stock.change >= 0;
  const isZero = stock.change === 0;
  
  const handleClick = () => {
    if (clickable) {
      navigate(`/stock/${stock.code}`);
    }
  };
  
  return (
    <Card
      sx={{
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': clickable ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {},
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: Stock info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {stock.name}
              </Typography>
              <Chip 
                label={stock.code} 
                size="small"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  bgcolor: 'grey.100',
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {stock.market === 'SH' ? '上海' : stock.market === 'SZ' ? '深圳' : stock.market}
            </Typography>
          </Box>
          
          {/* Right: Price and change */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              variant="h6" 
              fontWeight={600}
              sx={{ 
                color: isZero ? 'text.primary' : isPositive ? 'success.main' : 'error.main',
              }}
            >
              {formatPrice(stock.price)}
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
              }}
            >
              {isPositive ? (
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
              ) : !isZero && (
                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              
              <Typography
                variant="body2"
                sx={{
                  color: isZero ? 'text.secondary' : isPositive ? 'success.main' : 'error.main',
                  fontWeight: 500,
                }}
              >
                {formatChange(stock.change)} ({formatChangePercent(stock.change_pct)})
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Bottom: Actions */}
        {showWatchlist && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1.5,
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              成交量: {stock.volume.toLocaleString()}
            </Typography>
            
            <Box onClick={(e) => e.stopPropagation()}>
              <IconButton
                size="small"
                onClick={() => onWatchlistToggle?.(stock.code, !isWatched)}
              >
                {isWatched ? (
                  <Star sx={{ color: 'warning.main' }} />
                ) : (
                  <StarBorder />
                )}
              </IconButton>
              
              {onMoreClick && (
                <IconButton
                  size="small"
                  onClick={() => onMoreClick(stock)}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
