/**
 * K-Line Chart Component
 * 
 * Candlestick chart with technical indicators
 * using ECharts.
 */

import { useEffect, useRef, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, ToggleButtonGroup, ToggleButton, useTheme, useMediaQuery } from '@mui/material';
import type { EChartsOption } from 'echarts';
import type { KLine, KLinePeriod } from '@types/stock';

interface KLineChartProps {
  /** K-line data */
  data: KLine[];
  /** Stock name for title */
  stockName?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Selected period */
  period: KLinePeriod;
  /** On period change */
  onPeriodChange: (period: KLinePeriod) => void;
  /** Height of chart */
  height?: number | string;
}

const PERIODS: { value: KLinePeriod; label: string }[] = [
  { value: '1m', label: '1分钟' },
  { value: '5m', label: '5分钟' },
  { value: '15m', label: '15分钟' },
  { value: '30m', label: '30分钟' },
  { value: '1h', label: '1小时' },
  { value: '1d', label: '日K' },
  { value: '1w', label: '周K' },
  { value: '1M', label: '月K' },
];

/**
 * K-line chart component with candlestick and volume
 */
export function KLineChart({
  data,
  stockName,
  isLoading = false,
  period,
  onPeriodChange,
  height = 400,
}: KLineChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartRef = useRef<ReactECharts>(null);
  
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Convert timestamps to dates
    const dates = data.map((item) => {
      const date = new Date(item.timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    
    // OHLC data
    const ohlc = data.map((item) => [item.open, item.close, item.low, item.high]);
    
    // Volume data with color
    const volumes = data.map((item) => ({
      value: item.volume,
      itemStyle: {
        color: item.close >= item.open 
          ? theme.palette.success.main 
          : theme.palette.error.main,
      },
    }));
    
    return { dates, ohlc, volumes };
  }, [data, theme]);
  
  // Chart options
  const option: EChartsOption = useMemo(() => {
    if (!chartData) return {};
    
    return {
      backgroundColor: 'transparent',
      title: {
        text: stockName || '',
        left: 0,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: theme.palette.divider,
        textStyle: {
          color: theme.palette.text.primary,
        },
      },
      legend: {
        show: false,
      },
      grid: [
        {
          left: isMobile ? 40 : 60,
          right: isMobile ? 10 : 20,
          top: isMobile ? 40 : 60,
          height: '60%',
        },
        {
          left: isMobile ? 40 : 60,
          right: isMobile ? 10 : 20,
          top: '75%',
          height: '15%',
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: chartData.dates,
          boundaryGap: true,
          axisLine: { lineStyle: { color: theme.palette.divider } },
          axisTick: { show: false },
          axisLabel: {
            color: theme.palette.text.secondary,
            fontSize: 10,
          },
          gridIndex: 0,
        },
        {
          type: 'category',
          data: chartData.dates,
          boundaryGap: true,
          axisLine: { lineStyle: { color: theme.palette.divider } },
          axisTick: { show: false },
          axisLabel: { show: false },
          gridIndex: 1,
        },
      ],
      yAxis: [
        {
          scale: true,
          splitArea: { show: false },
          axisLine: { lineStyle: { color: theme.palette.divider } },
          axisTick: { show: false },
          axisLabel: {
            color: theme.palette.text.secondary,
            fontSize: 10,
          },
          splitLine: {
            lineStyle: { color: theme.palette.divider, type: 'dashed' },
          },
          gridIndex: 0,
        },
        {
          scale: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          gridIndex: 1,
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 70,
          end: 100,
        },
        {
          type: 'slider',
          xAxisIndex: [0, 1],
          bottom: '2%',
          height: 20,
          borderColor: theme.palette.divider,
          fillerColor: 'rgba(14, 165, 233, 0.1)',
          handleStyle: {
            color: theme.palette.primary.main,
          },
          textStyle: {
            color: theme.palette.text.secondary,
            fontSize: 10,
          },
        },
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: chartData.ohlc,
          itemStyle: {
            color: theme.palette.success.light,
            color0: theme.palette.error.light,
            borderColor: theme.palette.success.main,
            borderColor0: theme.palette.error.main,
          },
          gridIndex: 0,
        },
        {
          name: '成交量',
          type: 'bar',
          data: chartData.volumes,
          xAxisIndex: 1,
          yAxisIndex: 1,
          gridIndex: 1,
        },
      ],
    };
  }, [chartData, stockName, theme, isMobile]);
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Period selector */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, value) => value && onPeriodChange(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
            },
          }}
        >
          {PERIODS.map((p) => (
            <ToggleButton key={p.value} value={p.value}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      
      {/* Chart */}
      <Box sx={{ width: '100%', height }}>
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          loading={isLoading}
          loadingOption={{
            text: '加载中...',
            color: theme.palette.primary.main,
          }}
        />
      </Box>
    </Box>
  );
}
