/**
 * Indicator Panel Component
 * 
 * Displays technical indicators in a compact panel.
 */

import { Box, Typography, Chip, Divider, useTheme } from '@mui/material';
import type { TechnicalIndicators } from '@types/stock';
import { formatNumber } from '@utils/formatters';

interface IndicatorPanelProps {
  /** Technical indicators data */
  indicators: TechnicalIndicators | null;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Technical indicators panel component
 */
export function IndicatorPanel({ indicators, isLoading = false }: IndicatorPanelProps) {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">加载中...</Typography>
      </Box>
    );
  }
  
  if (!indicators) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">暂无指标数据</Typography>
      </Box>
    );
  }
  
  const sections = [
    {
      title: '均线 (MA)',
      items: [
        { label: 'MA5', value: indicators.ma.ma5 },
        { label: 'MA10', value: indicators.ma.ma10 },
        { label: 'MA20', value: indicators.ma.ma20 },
        { label: 'MA30', value: indicators.ma.ma30 },
        { label: 'MA60', value: indicators.ma.ma60 },
      ],
    },
    {
      title: 'MACD',
      items: [
        { label: 'DIF', value: indicators.macd.diff },
        { label: 'DEA', value: indicators.macd.dea },
        { label: 'BAR', value: indicators.macd.bar },
      ],
    },
    {
      title: 'RSI',
      items: [
        { label: 'RSI6', value: indicators.rsi.rsi6 },
        { label: 'RSI12', value: indicators.rsi.rsi12 },
        { label: 'RSI24', value: indicators.rsi.rsi24 },
      ],
    },
    {
      title: 'KDJ',
      items: [
        { label: 'K', value: indicators.kdj.k },
        { label: 'D', value: indicators.kdj.d },
        { label: 'J', value: indicators.kdj.j },
      ],
    },
    {
      title: '布林带 (BOLL)',
      items: [
        { label: '上轨', value: indicators.boll.upper },
        { label: '中轨', value: indicators.boll.middle },
        { label: '下轨', value: indicators.boll.lower },
      ],
    },
  ];
  
  const getRSIColor = (value: number | null) => {
    if (value === null) return 'text.secondary';
    if (value >= 70) return 'error.main';
    if (value <= 30) return 'success.main';
    return 'text.primary';
  };
  
  const getKDJSignal = (k: number, d: number, j: number) => {
    if (k > d && j > k) return { text: '金叉', color: 'success' };
    if (k < d && j < k) return { text: '死叉', color: 'error' };
    return { text: '震荡', color: 'default' };
  };
  
  const kdjSignal = getKDJSignal(indicators.kdj.k, indicators.kdj.d, indicators.kdj.j);
  
  return (
    <Box>
      {sections.map((section, index) => (
        <Box key={section.title}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {section.title}
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: 1,
                mt: 1,
              }}
            >
              {section.items.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    minWidth: 70,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={500}
                    sx={{
                      color: section.title === 'RSI' 
                        ? getRSIColor(item.value) 
                        : 'text.primary',
                    }}
                  >
                    {item.value !== null ? formatNumber(item.value, 2) : '-'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          
          {index < sections.length - 1 && <Divider />}
        </Box>
      ))}
      
      {/* KDJ Signal Summary */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            KDJ信号:
          </Typography>
          <Chip
            label={kdjSignal.text}
            size="small"
            color={kdjSignal.color as 'success' | 'error' | 'default'}
            sx={{ height: 24 }}
          />
        </Box>
      </Box>
    </Box>
  );
}
