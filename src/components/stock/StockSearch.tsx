/**
 * Stock Search Component
 * 
 * Search input with autocomplete for stocks.
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Typography, 
  CircularProgress,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as quotesApi from '@api/quotes';
import type { StockSearchResult } from '@types/stock';

interface StockSearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Callback when stock is selected */
  onSelect?: (stock: StockSearchResult) => void;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Stock search component with autocomplete
 */
export function StockSearch({
  placeholder = '搜索股票代码或名称...',
  autoFocus = false,
  onSelect,
  fullWidth = true,
}: StockSearchProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Debounced search
  useEffect(() => {
    if (inputValue.length < 1) {
      setOptions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await quotesApi.searchStocks(inputValue, 10);
        if (response.code === 0 && response.data) {
          setOptions(response.data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue]);
  
  const handleChange = (event: React.SyntheticEvent, value: string) => {
    setInputValue(value);
  };
  
  const handleSelect = (event: React.SyntheticEvent, value: StockSearchResult | null) => {
    if (value) {
      setInputValue('');
      if (onSelect) {
        onSelect(value);
      } else {
        navigate(`/stock/${value.code}`);
      }
    }
  };
  
  const getMarketLabel = (market: string) => {
    const labels: Record<string, string> = {
      'SH': '沪',
      'SZ': '深',
      'HK': '港',
      'US': '美',
    };
    return labels[market] || market;
  };
  
  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={handleChange}
      onChange={handleSelect}
      options={options}
      loading={loading}
      fullWidth={fullWidth}
      size="small"
      noOptionsText={inputValue.length < 1 ? '输入股票代码或名称搜索' : '未找到相关股票'}
      getOptionLabel={(option) => `${option.name} (${option.code})`}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          autoFocus={autoFocus}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <SearchIcon sx={{ color: 'grey.500', fontSize: 20 }} />
              </Box>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <ListItem {...props} key={option.code}>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">{option.name}</Typography>
                <Chip 
                  label={option.code} 
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {option.full_code} · {option.type}
              </Typography>
            }
          />
        </ListItem>
      )}
    />
  );
}
