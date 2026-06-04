/**
 * Portfolio Page
 * 
 * User's stock portfolio with profit/loss tracking.
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add,
  TrendingUp,
  TrendingDown,
  Edit,
  Delete,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { Loading } from '@components/common/Loading';
import { RiskDisclaimer } from '@components/common/RiskDisclaimer';
import { usePortfolioStore } from '@stores/portfolioStore';
import { formatPrice, formatNumber, formatChangePercent } from '@utils/formatters';

export function PortfolioPage() {
  const {
    holdings,
    summary,
    isLoading,
    error,
    fetchPortfolio,
    fetchSummary,
    addHolding,
    updateHolding,
    deleteHolding,
  } = usePortfolioStore();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [stockCode, setStockCode] = useState('');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPortfolio();
    fetchSummary();
  }, []);
  
  const handleAddHolding = async () => {
    if (!stockCode || !shares || !avgCost) {
      setLocalError('请填写完整信息');
      return;
    }
    
    try {
      await addHolding({
        stock_code: stockCode,
        shares: parseInt(shares),
        avg_cost: parseFloat(avgCost),
      });
      
      setAddDialogOpen(false);
      setStockCode('');
      setShares('');
      setAvgCost('');
      setLocalError(null);
    } catch {
      setLocalError('添加失败，请重试');
    }
  };
  
  const handleDeleteHolding = async (id: number) => {
    if (confirm('确定要删除这条持仓记录吗？')) {
      await deleteHolding(id);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        我的持仓
      </Typography>
      
      {/* Summary Card */}
      {summary && (
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  总市值
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatPrice(summary.total_market_value)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  盈亏
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {summary.total_profit_loss >= 0 ? (
                    <TrendingUp />
                  ) : (
                    <TrendingDown />
                  )}
                  <Typography variant="h5" fontWeight={700}>
                    {summary.total_profit_loss >= 0 ? '+' : ''}
                    {formatPrice(summary.total_profit_loss)}
                  </Typography>
                </Box>
                <Chip
                  label={`${summary.profit_loss_pct >= 0 ? '+' : ''}${summary.profit_loss_pct.toFixed(2)}%`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                  }}
                />
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  持仓数量
                </Typography>
                <Typography variant="h6">
                  {summary.holdings_count}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  今日盈亏
                </Typography>
                <Typography variant="h6">
                  {summary.today_profit_loss >= 0 ? '+' : ''}
                  {formatPrice(summary.today_profit_loss)}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  总成本
                </Typography>
                <Typography variant="h6">
                  {formatPrice(summary.total_cost)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}
      
      {/* Holdings List */}
      {isLoading && holdings.length === 0 ? (
        <Loading message="加载持仓..." />
      ) : holdings.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <AccountBalanceWallet sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography color="text.secondary" gutterBottom>
            暂无持仓记录
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
          >
            添加持仓
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {holdings.map((holding) => (
            <Card key={holding.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {holding.stock_name || holding.stock_code}
                      </Typography>
                      <Chip label={holding.stock_code} size="small" />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {holding.shares}股 · 成本 {formatPrice(holding.avg_cost)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatPrice(holding.market_value || 0)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: (holding.profit_loss || 0) >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {(holding.profit_loss || 0) >= 0 ? '+' : ''}
                      {formatPrice(holding.profit_loss || 0)}
                      ({formatChangePercent(holding.profit_loss_pct || 0)})
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <IconButton size="small" onClick={() => handleDeleteHolding(holding.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
            fullWidth
          >
            添加持仓
          </Button>
        </Box>
      )}
      
      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加持仓</DialogTitle>
        <DialogContent>
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="股票代码"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            placeholder="如: 600519"
          />
          
          <TextField
            fullWidth
            label="持股数量"
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="平均成本 (元)"
            type="number"
            value={avgCost}
            onChange={(e) => setAvgCost(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleAddHolding}>添加</Button>
        </DialogActions>
      </Dialog>
      
      {/* Risk Disclaimer */}
      <Box sx={{ mt: 4 }}>
        <RiskDisclaimer compact />
      </Box>
    </Box>
  );
}
