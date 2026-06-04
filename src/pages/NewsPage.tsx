/**
 * News Page
 * 
 * Market news and stock-specific news.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Skeleton,
} from '@mui/material';
import { Newspaper, Business, TrendingUp } from '@mui/icons-material';
import { Loading } from '@components/common/Loading';
import { RiskDisclaimer } from '@components/common/RiskDisclaimer';
import * as newsApi from '@api/news';
import type { NewsItem } from '@api/news';

/**
 * News page component
 */
export function NewsPage() {
  const { code } = useParams<{ code?: string }>();
  const [tab, setTab] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    setIsLoading(true);
    
    const fetchNews = async () => {
      try {
        let response;
        if (code) {
          response = await newsApi.getStockNews(code, page);
        } else {
          response = await newsApi.getMarketNews(page);
        }
        
        if (response.code === 0 && response.data) {
          if (page === 1) {
            setNews(response.data);
          } else {
            setNews((prev) => [...prev, ...response.data!]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [code, page]);
  
  const getNewsIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Business fontSize="small" />;
      case 'research':
        return <TrendingUp fontSize="small" />;
      default:
        return <Newspaper fontSize="small" />;
    }
  };
  
  const getNewsTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'warning';
      case 'research':
        return 'info';
      case 'notice':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {code ? `${code} 资讯` : '市场资讯'}
      </Typography>
      
      {/* Tabs */}
      {!code && (
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="全部" />
          <Tab label="快讯" />
          <Tab label="公告" />
          <Tab label="研报" />
        </Tabs>
      )}
      
      {/* News List */}
      {isLoading && news.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : news.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            暂无资讯
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {news.map((item) => (
            <Card 
              key={item.id}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                      {item.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.summary}
                    </Typography>
                  </Box>
                  
                  <Chip
                    icon={getNewsIcon(item.type)}
                    label={
                      item.type === 'news' ? '新闻' :
                      item.type === 'announcement' ? '公告' :
                      item.type === 'research' ? '研报' : '资讯'
                    }
                    size="small"
                    color={getNewsTypeColor(item.type) as 'warning' | 'info' | 'error' | 'default'}
                    sx={{ ml: 2 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.source}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.pub_time}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      
      {/* Load More */}
      {news.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Chip
            label="加载更多"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          />
        </Box>
      )}
      
      {/* Risk Disclaimer */}
      <Box sx={{ mt: 4 }}>
        <RiskDisclaimer compact />
      </Box>
    </Box>
  );
}
