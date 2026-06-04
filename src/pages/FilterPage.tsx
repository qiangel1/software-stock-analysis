/**
 * Filter Page
 * 
 * Stock screening with multiple technical indicators.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Slider,
  FormControlLabel,
  Switch,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  FilterList,
  ExpandMore,
  Search,
  TrendingUp,
  ShowChart,
} from '@mui/icons-material';
import { StockList } from '@components/stock';
import { Loading } from '@components/common/Loading';
import { RiskDisclaimer } from '@components/common/RiskDisclaimer';
import type { Stock, StockFilterConditions } from '@types/stock';
import * as aiApi from '@api/ai';

/**
 * Filter options
 */
interface FilterOptions {
  // Price range (yuan)
  priceRange: [number, number];
  // Volume range
  volumeRange: [number, number];
  // Change percent range (%)
  changePctRange: [number, number];
  // PE range
  peRange: [number, number];
  // MACD golden cross
  macdGoldenCross: boolean;
  // KDJ status
  kdjStatus: 'any' | 'overbought' | 'oversold';
  // RSI status
  rsiStatus: 'any' | 'overbought' | 'oversold';
}

/**
 * Filter page component
 */
export function FilterPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    volumeRange: [0, 100000000],
    changePctRange: [-10, 10],
    peRange: [0, 100],
    macdGoldenCross: false,
    kdjStatus: 'any',
    rsiStatus: 'any',
  });
  
  const [results, setResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState('change_pct');
  
  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    
    const conditions: StockFilterConditions = {
      price_range: filters.priceRange,
      volume_range: filters.volumeRange,
      change_pct_range: filters.changePctRange,
      pe_range: filters.peRange,
      macd_golden_cross: filters.macdGoldenCross || undefined,
      kdj_status: filters.kdjStatus !== 'any' ? filters.kdjStatus : undefined,
      rsi_status: filters.rsiStatus !== 'any' ? filters.rsiStatus : undefined,
    };
    
    try {
      const response = await aiApi.filterStocks(conditions);
      
      if (response.code === 0 && response.data) {
        setResults(response.data.stocks);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Filter failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      volumeRange: [0, 100000000],
      changePctRange: [-10, 10],
      peRange: [0, 100],
      macdGoldenCross: false,
      kdjStatus: 'any',
      rsiStatus: 'any',
    });
    setResults([]);
    setHasSearched(false);
  };
  
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        智能选股
      </Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            筛选条件
          </Typography>
          
          {/* Price Range */}
          <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChart />
                <Typography>价格区间</Typography>
                <Chip 
                  label={`${filters.priceRange[0]}-${filters.priceRange[1]}元`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Slider
                value={filters.priceRange}
                onChange={(_, value) => handleFilterChange('priceRange', value)}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                step={1}
                valueLabelFormat={(v) => `${v}元`}
              />
            </AccordionDetails>
          </Accordion>
          
          {/* Change Percent Range */}
          <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                <Typography>涨跌幅区间</Typography>
                <Chip 
                  label={`${filters.changePctRange[0]}%~${filters.changePctRange[1]}%`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Slider
                value={filters.changePctRange}
                onChange={(_, value) => handleFilterChange('changePctRange', value)}
                valueLabelDisplay="auto"
                min={-20}
                max={20}
                valueLabelFormat={(v) => `${v}%`}
              />
            </AccordionDetails>
          </Accordion>
          
          {/* PE Range */}
          <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList />
                <Typography>市盈率 (PE)</Typography>
                <Chip 
                  label={`${filters.peRange[0]}-${filters.peRange[1]}`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Slider
                value={filters.peRange}
                onChange={(_, value) => handleFilterChange('peRange', value)}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
            </AccordionDetails>
          </Accordion>
          
          {/* Technical Indicators */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              技术指标
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>KDJ状态</InputLabel>
                  <Select
                    value={filters.kdjStatus}
                    label="KDJ状态"
                    onChange={(e) => handleFilterChange('kdjStatus', e.target.value)}
                  >
                    <MenuItem value="any">不限</MenuItem>
                    <MenuItem value="overbought">超买</MenuItem>
                    <MenuItem value="oversold">超卖</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>RSI状态</InputLabel>
                  <Select
                    value={filters.rsiStatus}
                    label="RSI状态"
                    onChange={(e) => handleFilterChange('rsiStatus', e.target.value)}
                  >
                    <MenuItem value="any">不限</MenuItem>
                    <MenuItem value="overbought">超买</MenuItem>
                    <MenuItem value="oversold">超卖</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.macdGoldenCross}
                      onChange={(e) => handleFilterChange('macdGoldenCross', e.target.checked)}
                    />
                  }
                  label="MACD金叉"
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Search />}
          onClick={handleSearch}
          disabled={isLoading}
        >
          开始筛选
        </Button>
        
        <Button
          variant="outlined"
          onClick={resetFilters}
        >
          重置
        </Button>
      </Box>
      
      {/* Sort Options */}
      {hasSearched && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            找到 {results.length} 只股票
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>排序</InputLabel>
            <Select
              value={sortBy}
              label="排序"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="change_pct">涨跌幅</MenuItem>
              <MenuItem value="volume">成交量</MenuItem>
              <MenuItem value="pe">市盈率</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* Results */}
      {isLoading ? (
        <Loading message="正在筛选股票..." />
      ) : hasSearched ? (
        <StockList
          stocks={results}
          emptyMessage="未找到符合条件的股票"
        />
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <FilterList sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
          <Typography color="text.secondary">
            设置筛选条件，开始智能选股
          </Typography>
        </Card>
      )}
      
      {/* Risk Disclaimer */}
      <Box sx={{ mt: 4 }}>
        <RiskDisclaimer compact />
      </Box>
    </Box>
  );
}
