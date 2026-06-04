/**
 * Volume Chart Component
 * 
 * Bar chart showing trading volume with MA line.
 */

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material';
import type { EChartsOption } from 'echarts';
import type { KLine } from '@types/stock';

interface VolumeChartProps {
  /** K-line data (includes volume) */
  data: KLine[];
  /** Loading state */
  isLoading?: boolean;
  /** Height of chart */
  height?: number;
}

/**
 * Volume chart component with MA line
 */
export function VolumeChart({
  data,
  isLoading = false,
  height = 150,
}: VolumeChartProps) {
  // Process data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const dates = data.map((item) => {
      const date = new Date(item.timestamp);
      return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    
    const volumes = data.map((item) => ({
      value: item.volume,
      itemStyle: {
        color: item.close >= item.open 
          ? 'rgba(34, 197, 94, 0.7)' 
          : 'rgba(239, 68, 68, 0.7)',
      },
    }));
    
    // Calculate MA5
    const ma5: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < 4) {
        ma5.push(null);
      } else {
        const sum = data.slice(i - 4, i + 1).reduce((acc, d) => acc + d.volume, 0);
        ma5.push(sum / 5);
      }
    }
    
    return { dates, volumes, ma5 };
  }, [data]);
  
  const option: EChartsOption = useMemo(() => {
    if (!chartData) return {};
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; itemStyle: { color: string } }[];
          if (!p || p.length === 0) return '';
          return `${p[0].name}<br/>成交量: ${p[0].value.toLocaleString()}`;
        },
      },
      grid: {
        left: 50,
        right: 10,
        top: 10,
        bottom: 20,
      },
      xAxis: {
        type: 'category',
        data: chartData.dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          color: '#94a3b8',
          formatter: (value: number) => {
            if (value >= 100000000) return (value / 100000000).toFixed(1) + '亿';
            if (value >= 10000) return (value / 10000).toFixed(0) + '万';
            return value.toString();
          },
        },
        splitLine: {
          lineStyle: { color: '#f1f5f9', type: 'dashed' },
        },
      },
      series: [
        {
          name: '成交量',
          type: 'bar',
          data: chartData.volumes,
          barMaxWidth: 12,
        },
        {
          name: 'MA5',
          type: 'line',
          data: chartData.ma5,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: '#0ea5e9',
            width: 1,
          },
        },
      ],
    };
  }, [chartData]);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 1, display: 'block' }}>
        成交量
      </Typography>
      <Box sx={{ width: '100%', height }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          loading={isLoading}
        />
      </Box>
    </Box>
  );
}
