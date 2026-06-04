/**
 * AI Analysis Card Component
 * 
 * Displays AI-generated stock analysis.
 */

import { Box, Typography, Card, CardContent, Chip, Button, Skeleton, Divider } from '@mui/material';
import { Refresh, TrendingUp, TrendingDown, Lightbulb } from '@mui/icons-material';
import { Loading } from '@components/common/Loading';
import type { AIAnalysis } from '@api/ai';

interface AIAnalysisCardProps {
  /** Stock code */
  code: string;
  /** Analysis data */
  analysis: AIAnalysis | null;
  /** Loading state */
  isLoading?: boolean;
  /** On refresh */
  onRefresh?: () => void;
}

/**
 * Get rating color
 */
function getRatingColor(rating: string): 'success' | 'warning' | 'error' | 'default' {
  switch (rating) {
    case 'strongly_buy':
      return 'success';
    case 'buy':
      return 'success';
    case 'neutral':
      return 'warning';
    case 'cautious':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get rating text
 */
function getRatingText(rating: string): string {
  switch (rating) {
    case 'strongly_buy':
      return '强烈推荐';
    case 'buy':
      return '推荐';
    case 'neutral':
      return '中性';
    case 'cautious':
      return '谨慎';
    default:
      return rating;
  }
}

/**
 * Get action color
 */
function getActionColor(action: string): 'success' | 'warning' | 'error' {
  switch (action) {
    case 'buy':
      return 'success';
    case 'hold':
      return 'warning';
    case 'sell':
      return 'error';
    default:
      return 'warning';
  }
}

/**
 * AI Analysis Card component
 */
export function AIAnalysisCard({ code, analysis, isLoading, onRefresh }: AIAnalysisCardProps) {
  if (isLoading && !analysis) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
          
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </CardContent>
      </Card>
    );
  }
  
  if (!analysis) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Lightbulb sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
          <Typography color="text.secondary">
            暂无AI分析数据
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            sx={{ mt: 2 }}
          >
            获取分析
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              AI综合分析
            </Typography>
            <Chip
              label={getRatingText(analysis.rating)}
              color={getRatingColor(analysis.rating)}
              size="small"
            />
          </Box>
          
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={onRefresh}
          >
            刷新
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {analysis.rating_text}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Scores */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              基本面
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {analysis.fundamental.score}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              技术面
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {analysis.technical.score}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              情绪面
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {analysis.sentiment.score}
            </Typography>
          </Box>
        </Box>
        
        {/* Recommendation */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            操作建议
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label={analysis.recommendation.action === 'buy' ? '买入' : analysis.recommendation.action === 'hold' ? '持有' : '卖出'}
              color={getActionColor(analysis.recommendation.action)}
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary">
              建议持仓 {analysis.recommendation.holding_period}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                目标价
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                ¥{analysis.recommendation.target_price.toFixed(2)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary">
                止损价
              </Typography>
              <Typography variant="body2" fontWeight={500} color="error.main">
                ¥{analysis.recommendation.stop_loss.toFixed(2)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary">
                风险等级
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{
                  color: analysis.recommendation.risk_level === 'low' ? 'success.main' :
                         analysis.recommendation.risk_level === 'medium' ? 'warning.main' : 'error.main',
                }}
              >
                {analysis.recommendation.risk_level === 'low' ? '低' :
                 analysis.recommendation.risk_level === 'medium' ? '中' : '高'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Analysis Details */}
        <Divider sx={{ my: 2 }} />
        
        {/* Fundamental */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            基本面分析
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {analysis.fundamental.summary}
          </Typography>
          
          {analysis.fundamental.pros.length > 0 && (
            <Box sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="success.main" fontWeight={600}>
                ✓ 优势:
              </Typography>
              <Typography variant="caption" component="ul" sx={{ pl: 2, m: 0 }}>
                {analysis.fundamental.pros.slice(0, 2).map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </Typography>
            </Box>
          )}
          
          {analysis.fundamental.cons.length > 0 && (
            <Box>
              <Typography variant="caption" color="error.main" fontWeight={600}>
                ✗ 风险:
              </Typography>
              <Typography variant="caption" component="ul" sx={{ pl: 2, m: 0 }}>
                {analysis.fundamental.cons.slice(0, 2).map((con, i) => (
                  <li key={i}>{con}</li>
                ))}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Technical */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            技术分析
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {analysis.technical.summary}
          </Typography>
        </Box>
        
        {/* Sentiment */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            市场情绪
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {analysis.sentiment.summary}
          </Typography>
        </Box>
        
        {/* Footer */}
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
          分析时间: {new Date(analysis.generated_at).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
