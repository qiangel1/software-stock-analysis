/**
 * Stock List Component
 * 
 * Displays a list of stocks with virtualization
 * for performance with large datasets.
 */

import { useMemo } from 'react';
import { Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { StockCard } from './StockCard';
import type { Stock } from '@types/stock';

interface StockListProps {
  /** List of stocks */
  stocks: Stock[];
  /** Loading state */
  isLoading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Show watchlist toggle */
  showWatchlist?: boolean;
  /** Watched stock codes */
  watchedCodes?: Set<string>;
  /** On watchlist toggle */
  onWatchlistToggle?: (code: string, watched: boolean) => void;
  /** On stock click */
  onStockClick?: (stock: Stock) => void;
}

/**
 * Stock list component with grouping by market
 */
export function StockList({
  stocks,
  isLoading = false,
  emptyMessage = '暂无数据',
  showWatchlist = false,
  watchedCodes = new Set(),
  onWatchlistToggle,
  onStockClick,
}: StockListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Group stocks by market
  const groupedStocks = useMemo(() => {
    const groups: Record<string, Stock[]> = {
      'SH': [],
      'SZ': [],
      'HK': [],
      'US': [],
      'Other': [],
    };
    
    stocks.forEach((stock) => {
      const market = stock.market || 'Other';
      if (groups[market]) {
        groups[market].push(stock);
      } else {
        groups['Other'].push(stock);
      }
    });
    
    return groups;
  }, [stocks]);
  
  const marketNames: Record<string, string> = {
    'SH': '上海证券交易所',
    'SZ': '深圳证券交易所',
    'HK': '港交所',
    'US': '美股',
    'Other': '其他',
  };
  
  if (isLoading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">加载中...</Typography>
      </Box>
    );
  }
  
  if (stocks.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Object.entries(groupedStocks).map(([market, marketStocks]) => {
        if (marketStocks.length === 0) return null;
        
        return (
          <Box key={market}>
            {/* Market header */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                mb: 1,
                px: isMobile ? 1 : 0,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {marketNames[market]}
              </Typography>
              <Chip 
                label={marketStocks.length} 
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
            
            {/* Stock cards */}
            {isMobile ? (
              // Mobile: Stack cards
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {marketStocks.map((stock) => (
                  <StockCard
                    key={stock.code}
                    stock={stock}
                    isWatched={watchedCodes.has(stock.code)}
                    showWatchlist={showWatchlist}
                    onWatchlistToggle={onWatchlistToggle}
                    clickable={!onStockClick}
                  />
                ))}
              </Box>
            ) : (
              // Desktop: Grid
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 2,
                }}
              >
                {marketStocks.map((stock) => (
                  <StockCard
                    key={stock.code}
                    stock={stock}
                    isWatched={watchedCodes.has(stock.code)}
                    showWatchlist={showWatchlist}
                    onWatchlistToggle={onWatchlistToggle}
                    clickable={!onStockClick}
                  />
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
