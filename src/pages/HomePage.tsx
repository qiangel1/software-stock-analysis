/**
 * Home Page
 * 
 * Dashboard with market overview, watchlist, and quick actions.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Add,
  ShowChart,
  Newspaper,
  Star,
} from '@mui/icons-material';
import { StockCard, StockSearch } from '@components/stock';
import { Loading } from '@components/common/Loading';
import { RiskDisclaimer } from '@components/common/RiskDisclaimer';
import { useQuoteStore } from '@stores/quoteStore';
import { useWatchlistStore } from '@stores/watchlistStore';
import { useAuthStore } from '@stores/authStore';
import type { Stock, MarketIndex } from '@types/stock';

/**
 * Home page component
 */
export function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { quotes, fetchQuotes, isLoading: quoteLoading } = useQuoteStore();
  const { items: watchlist, fetchWatchlist } = useWatchlistStore();
  
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [tab, setTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Default stocks to show
  const defaultCodes = ['000001', '399001', '600519', '000858', '600036'];
  
  useEffect(() => {
    // Fetch initial quotes
    fetchQuotes(defaultCodes);
    
    // Fetch watchlist if authenticated
    if (isAuthenticated) {
      fetchWatchlist();
    }
  }, [isAuthenticated]);
  
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchQuotes(defaultCodes);
    setIsRefreshing(false);
  }, [fetchQuotes]);
  
  const handleSearchSelect = (stock: { code: string }) => {
    navigate(`/stock/${stock.code}`);
  };
  
  const stocks = Object.values(quotes);
  
  return (
    <Box>
      {/* Market Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              市场概览
            </Typography>
            <IconButton onClick={handleRefresh} disabled={isRefreshing} size="small">
              <Refresh className={isRefreshing ? 'animate-spin' : ''} />
            </IconButton>
          </Box>
          
          {quoteLoading && stocks.length === 0 ? (
            <Loading size={24} message="" />
          ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {stocks.slice(0, 5).map((stock) => (
                <Box
                  key={stock.code}
                  sx={{
                    minWidth: 140,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  onClick={() => navigate(`/stock/${stock.code}`)}
                >
                  <Typography variant="body2" color="text.secondary">
                    {stock.name}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {stock.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stock.change >= 0 ? (
                      <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: stock.change >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 500,
                      }}
                    >
                      {stock.change >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <StockSearch
          placeholder="搜索股票..."
          onSelect={handleSearchSelect}
        />
      </Box>
      
      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab 
          icon={<Star sx={{ fontSize: 18 }} />} 
          iconPosition="start"
          label="自选"
          sx={{ minHeight: 48 }}
        />
        <Tab 
          icon={<ShowChart sx={{ fontSize: 18 }} />} 
          iconPosition="start"
          label="热门"
          sx={{ minHeight: 48 }}
        />
        <Tab 
          icon={<Newspaper sx={{ fontSize: 18 }} />} 
          iconPosition="start"
          label="快讯"
          sx={{ minHeight: 48 }}
        />
      </Tabs>
      
      {/* Content */}
      {tab === 0 && (
        <Box>
          {!isAuthenticated ? (
            <Card sx={{ mb: 3, textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                登录后查看您的自选股
              </Typography>
              <Chip
                label="登录"
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ cursor: 'pointer' }}
              />
            </Card>
          ) : watchlist.length === 0 ? (
            <Card sx={{ mb: 3, textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                暂无自选股
              </Typography>
              <Chip
                label="添加自选"
                onClick={() => navigate('/market')}
                sx={{ cursor: 'pointer' }}
              />
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {watchlist.map((item) => (
                <StockCard
                  key={item.id}
                  stock={{
                    code: item.stock_code,
                    name: item.stock_name || item.stock_code,
                    market: 'SH',
                    price: item.price || 0,
                    prev_close: 0,
                    open: 0,
                    high: 0,
                    low: 0,
                    volume: 0,
                    turnover: 0,
                    change: item.change || 0,
                    change_pct: item.change_pct || 0,
                    bid1: 0,
                    ask1: 0,
                    bid_vol1: 0,
                    ask_vol1: 0,
                    updated_at: '',
                  }}
                  isWatched
                  showWatchlist
                />
              ))}
            </Box>
          )}
        </Box>
      )}
      
      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {stocks.map((stock) => (
            <StockCard
              key={stock.code}
              stock={stock}
              showWatchlist={isAuthenticated}
              isWatched={watchlist.some(w => w.stock_code === stock.code)}
            />
          ))}
        </Box>
      )}
      
      {tab === 2 && (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            市场快讯功能开发中...
          </Typography>
        </Card>
      )}
      
      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 72, right: 16 }}
          onClick={() => navigate('/filter')}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
}
