/**
 * Login Page
 * 
 * Phone verification login with SMS code.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Phone,
  Message,
  Visibility,
  VisibilityOff,
  TrendingUp,
} from '@mui/icons-material';
import { useAuthStore } from '@stores/authStore';
import * as authApi from '@api/auth';

/**
 * Login page component
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Clear errors on input change
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [phone, code]);
  
  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setLocalError('请输入手机号');
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setLocalError('请输入正确的手机号');
      return false;
    }
    return true;
  };
  
  const handleSendCode = async () => {
    if (!validatePhone(phone)) return;
    
    setSendingCode(true);
    setLocalError(null);
    
    try {
      const response = await authApi.sendVerificationCode(phone);
      
      if (response.code === 0) {
        setCountdown(60);
        setLocalError(null);
      } else {
        setLocalError(response.message || '验证码发送失败');
      }
    } catch (err) {
      setLocalError('验证码发送失败，请稍后重试');
    } finally {
      setSendingCode(false);
    }
  };
  
  const handleLogin = async () => {
    if (!validatePhone(phone)) return;
    
    if (!code || code.length < 4) {
      setLocalError('请输入验证码');
      return;
    }
    
    try {
      await login(phone, code);
      navigate('/', { replace: true });
    } catch {
      // Error handled by store
    }
  };
  
  const displayError = localError || error;
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: 2,
                bgcolor: 'primary.main',
                mb: 2,
              }}
            >
              <TrendingUp sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              StockQuant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              智能股票量化分析系统
            </Typography>
          </Box>
          
          {/* Error Alert */}
          {displayError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {displayError}
            </Alert>
          )}
          
          {/* Phone Input */}
          <TextField
            fullWidth
            label="手机号"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone sx={{ color: 'grey.500' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Code Input */}
          <TextField
            fullWidth
            label="验证码"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            type={showCode ? 'text' : 'password'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Message sx={{ color: 'grey.500' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCode(!showCode)}
                    edge="end"
                    size="small"
                  >
                    {showCode ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Send Code Button */}
          <Button
            fullWidth
            variant="outlined"
            disabled={countdown > 0 || sendingCode}
            onClick={handleSendCode}
            sx={{ mb: 3 }}
          >
            {sendingCode ? (
              <CircularProgress size={20} />
            ) : countdown > 0 ? (
              `${countdown}秒后重新发送`
            ) : (
              '获取验证码'
            )}
          </Button>
          
          {/* Login Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? <CircularProgress size={24} /> : '登录'}
          </Button>
          
          {/* Disclaimer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            登录即表示您同意我们的服务条款和隐私政策
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
