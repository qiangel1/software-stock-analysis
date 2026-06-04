/**
 * Risk Disclaimer Component
 * 
 * Displays investment risk disclaimer as required
 * by regulatory compliance.
 */

import { Box, Typography, Paper, Alert, AlertTitle } from '@mui/material';
import { Warning } from '@mui/icons-material';

interface RiskDisclaimerProps {
  /** Custom title */
  title?: string;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Show as alert instead of paper */
  alert?: boolean;
}

/**
 * Risk disclaimer component with compliance warning
 */
export function RiskDisclaimer({
  title = '风险提示',
  compact = false,
  alert: showAlert = false,
}: RiskDisclaimerProps) {
  const content = (
    <Box sx={{ py: compact ? 1 : 2 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          color: 'warning.main', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 1,
        }}
      >
        <Warning fontSize="small" />
        {title}
      </Typography>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontSize: compact ? '0.75rem' : '0.8125rem',
          lineHeight: 1.6,
        }}
      >
        <strong>免责声明</strong>：StockQuant 仅供用户进行市场信息查询和分析，
        不构成任何投资建议。用户应自行承担投资风险，我们不对因使用本工具而产生的
        任何损失负责。股市有风险，投资需谨慎。请在做出任何投资决策前，进行充分的
        研究和风险评估。本平台所展示的数据仅供参考，实际交易请以交易所官方数据为准。
      </Typography>
    </Box>
  );
  
  if (showAlert) {
    return (
      <Alert 
        severity="warning" 
        sx={{ mb: 2 }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>
        <Typography variant="body2">
          StockQuant 仅供用户进行市场信息查询和分析，不构成任何投资建议。
          用户应自行承担投资风险，股市有风险，投资需谨慎。
        </Typography>
      </Alert>
    );
  }
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 1.5 : 2,
        bgcolor: 'warning.50',
        border: '1px solid',
        borderColor: 'warning.200',
        borderRadius: 2,
      }}
    >
      {content}
    </Paper>
  );
}

/**
 * Inline disclaimer for embedding in other components
 */
export function InlineDisclaimer() {
  return (
    <Typography 
      variant="caption" 
      color="text.secondary"
      sx={{ 
        display: 'block',
        mt: 1,
        fontSize: '0.7rem',
      }}
    >
      * 仅供参考，不构成投资建议
    </Typography>
  );
}
