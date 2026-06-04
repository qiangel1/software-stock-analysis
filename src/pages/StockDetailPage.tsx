/**
 * Stock Detail Page
 * 
 * Detailed view of a single stock with quote,
 * K-line chart, and AI analysis.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Star,
  StarBorder,
  Refresh,
  Share,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { KLineChart, IndicatorPanel, VolumeChart } from '@components/chart';
import { Loading } from '@components/common/Loading';
import { RiskDisclaimer } from '@components/common/RiskDisclaimer';
import { AIAnalysisCard } from '@components/ai/AIAnalysisCard';
import { useQuoteStore } from '@stores/quoteStore';
import { useWatchlistStore } from '@stores/watchlistStore';
import { formatPrice, formatChange, formatChangePercent, formatNumber } from '@utils/formatters';
import type { Stock, KLine, KLinePeriod, TechnicalIndicators } from '@types/stock';
import * as aiApi from '@api/ai';
import type { AIAnalysis } from '@api/ai';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab panel wrapper
 */
function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 2 }}>
      {value === index && children}
    </Box>
  );
}

/**
 * Stock detail page component
 */
export function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const { quotes, fetchQuote, fetchKLine, fetchIndicators } = useQuoteStore();
  const { items: watchlist, addStock, removeStock, fetchWatchlist } = useWatchlistStore();
  
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState<KLinePeriod>('1d');
  const [klineData, setKlineData] = useState<KLine[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  const stock = code ? quotes[code] : null;
  const isWatched = watchlist.some((w) => w.stock_code === code);
  
  // Fetch stock data
  useEffect(() => {
    if (!code) return;
    
    setIsLoading(true);
    
    Promise.all([
      fetchQuote(code),
      fetchKLine(code, period),
      fetchIndicators(code),
    ]).then(([quote, kline, ind]) => {
      if (kline) setKlineData(kline);
      if (ind) setIndicators(ind);
      setIsLoading(false);
    });
  }, [code]);
  
  // Fetch AI analysis
  useEffect(() => {
    if (!code) return;
    
    setAiLoading(true);
    aiApi.getAIAnalysis(code)
      .then((response) => {
        if (response.code === 0 && response.data) {
          setAiAnalysis(response.data);
        }
      })
      .catch(console.error)
      .finally(() => setAiLoading(false));
  }, [code]);
  
  const handlePeriodChange = async (newPeriod: KLinePeriod) => {
    setPeriod(newPeriod);
    if (code) {
      const kline = await fetchKLine(code, newPeriod);
      if (kline) setKlineData(kline);
    }
  };
  
  const handleWatchlistToggle = async () => {
    if (!code) return;
    
    if (isWatched) {
      const item = watchlist.find((w) => w.stock_code === code);
      if (item) {
        await removeStock(item.id);
      }
    } else {
      await addStock(code);
    }
    await fetchWatchlist();
  };
  
  const isPositive = (stock?.change || 0) >= 0;
  
  return (
    <Box>
      {/* Back button and header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button
          variant="text"
          size="small"
          onClick={() => navigate(-1)}
        >
          返回
        </Button>
      </Box>
      
      {isLoading && !stock ? (
        <Loading fullScreen />
      ) : (
        <>
          {/* Stock Header */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h5" fontWeight={700}>
                      {stock?.name || code}
                    </Typography>
                    <Chip label={code} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stock?.market === 'SH' ? '上海' : stock?.market === 'SZ' ? '深圳' : ''} · {code}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={handleWatchlistToggle}>
                    {isWatched ? (
                      <Star sx={{ color: 'warning.main' }} />
                    ) : (
                      <StarBorder />
                    )}
                  </IconButton>
                  <IconButton>
                    <Share />
                  </IconButton>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{ 
                    color: isPositive ? 'success.main' : 'error.main',
                  }}
                >
                  {formatPrice(stock?.price || 0)}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  {isPositive ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                  <Typography
                    sx={{
                      color: isPositive ? 'success.main' : 'error.main',
                      fontWeight: 500,
                    }}
                  >
                    {formatChange(stock?.change || 0)} ({isPositive ? '+' : ''}{formatChangePercent(stock?.change_pct || 0)})
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Quick stats */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    开盘
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatPrice(stock?.open || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    最高
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatPrice(stock?.high || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    最低
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatPrice(stock?.low || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    成交量
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatNumber(stock?.volume || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    成交额
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatNumber(stock?.turnover || 0, 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    昨收
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatPrice(stock?.prev_close || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="技术分析" />
            <Tab label="AI分析" />
            <Tab label="资讯" />
            <Tab label="财务" />
          </Tabs>
          
          {/* Tab Content */}
          <TabPanel value={tab} index={0}>
            {/* K-Line Chart */}
            <KLineChart
              data={klineData}
              stockName={stock?.name}
              period={period}
              onPeriodChange={handlePeriodChange}
              isLoading={isLoading}
              height={isMobile ? 300 : 400}
            />
            
            {/* Volume */}
            <Box sx={{ mt: 2 }}>
              <VolumeChart data={klineData} height={120} />
            </Box>
            
            {/* Indicators */}
            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <IndicatorPanel 
                  indicators={indicators}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabPanel>
          
          <TabPanel value={tab} index={1}>
            <AIAnalysisCard
              code={code!}
              analysis={aiAnalysis}
              isLoading={aiLoading}
              onRefresh={() => {
                setAiLoading(true);
                aiApi.getAIAnalysis(code!, true)
                  .then((response) => {
                    if (response.code === 0 && response.data) {
                      setAiAnalysis(response.data);
                    }
                  })
                  .finally(() => setAiLoading(false));
              }}
            />
          </TabPanel>
          
          <TabPanel value={tab} index={2}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                资讯功能开发中...
              </Typography>
            </Card>
          </TabPanel>
          
          <TabPanel value={tab} index={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                财务数据开发中...
              </Typography>
            </Card>
          </TabPanel>
          
          {/* Risk Disclaimer */}
          <Box sx={{ mt: 3 }}>
            <RiskDisclaimer compact />
          </Box>
        </>
      )}
    </Box>
  );
}
