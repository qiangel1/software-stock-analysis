"""
Technical Indicator Service

Calculates various technical indicators for stocks.
"""

import numpy as np
from typing import List, Dict, Any, Tuple


class IndicatorService:
    """
    Service for calculating technical indicators.
    
    Supports:
    - Moving Averages (MA)
    - MACD
    - RSI
    - KDJ
    - Bollinger Bands
    - Volume MA
    """
    
    @staticmethod
    def calculate_ma(prices: List[float], period: int) -> List[float]:
        """
        Calculate Simple Moving Average.
        
        Args:
            prices: List of closing prices
            period: MA period
            
        Returns:
            List of MA values
        """
        if len(prices) < period:
            return [None] * len(prices)
        
        result = []
        for i in range(len(prices)):
            if i < period - 1:
                result.append(None)
            else:
                ma = sum(prices[i - period + 1:i + 1]) / period
                result.append(round(ma, 2))
        
        return result
    
    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> List[float]:
        """
        Calculate Exponential Moving Average.
        
        Args:
            prices: List of closing prices
            period: EMA period
            
        Returns:
            List of EMA values
        """
        if len(prices) < period:
            return [None] * len(prices)
        
        multiplier = 2 / (period + 1)
        result = [None] * (period - 1)
        
        # First EMA is SMA
        first_ema = sum(prices[:period]) / period
        result.append(round(first_ema, 2))
        
        for i in range(period, len(prices)):
            ema = (prices[i] - result[-1]) * multiplier + result[-1]
            result.append(round(ema, 2))
        
        return result
    
    @staticmethod
    def calculate_macd(
        prices: List[float],
        fast: int = 12,
        slow: int = 26,
        signal: int = 9,
    ) -> Dict[str, List[float]]:
        """
        Calculate MACD indicator.
        
        Args:
            prices: List of closing prices
            fast: Fast EMA period
            slow: Slow EMA period
            signal: Signal line period
            
        Returns:
            Dictionary with diff, dea, and bar values
        """
        ema_fast = IndicatorService.calculate_ema(prices, fast)
        ema_slow = IndicatorService.calculate_ema(prices, slow)
        
        # DIF = EMA_fast - EMA_slow
        diff = []
        for i in range(len(prices)):
            if ema_fast[i] is None or ema_slow[i] is None:
                diff.append(None)
            else:
                diff.append(round(ema_fast[i] - ema_slow[i], 4))
        
        # DEA = EMA(diff, signal)
        dea = IndicatorService.calculate_ema([d if d else 0 for d in diff], signal)
        
        # BAR = 2 * (DIF - DEA)
        bar = []
        for i in range(len(prices)):
            if diff[i] is None or dea[i] is None:
                bar.append(None)
            else:
                bar.append(round(2 * (diff[i] - dea[i]), 4))
        
        return {
            'diff': diff,
            'dea': dea,
            'bar': bar,
        }
    
    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> List[float]:
        """
        Calculate RSI indicator.
        
        Args:
            prices: List of closing prices
            period: RSI period
            
        Returns:
            List of RSI values
        """
        if len(prices) < period + 1:
            return [None] * len(prices)
        
        result = [None] * period
        
        # Calculate price changes
        changes = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
        
        # First average gain/loss
        gains = [c if c > 0 else 0 for c in changes[:period]]
        losses = [-c if c < 0 else 0 for c in changes[:period]]
        
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        
        if avg_loss == 0:
            result.append(100)
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            result.append(round(rsi, 2))
        
        # Subsequent RSI values using smoothed averages
        for i in range(period, len(changes)):
            gain = changes[i] if changes[i] > 0 else 0
            loss = -changes[i] if changes[i] < 0 else 0
            
            avg_gain = (avg_gain * (period - 1) + gain) / period
            avg_loss = (avg_loss * (period - 1) + loss) / period
            
            if avg_loss == 0:
                result.append(100)
            else:
                rs = avg_gain / avg_loss
                rsi = 100 - (100 / (1 + rs))
                result.append(round(rsi, 2))
        
        return result
    
    @staticmethod
    def calculate_kdj(
        high_prices: List[float],
        low_prices: List[float],
        close_prices: List[float],
        n: int = 9,
        m1: int = 3,
        m2: int = 3,
    ) -> Dict[str, List[float]]:
        """
        Calculate KDJ indicator.
        
        Args:
            high_prices: List of high prices
            low_prices: List of low prices
            close_prices: List of closing prices
            n: RSV period
            m1: K period
            m2: D period
            
        Returns:
            Dictionary with K, D, J values
        """
        if len(high_prices) < n:
            return {'k': [None] * len(high_prices), 'd': [None] * len(high_prices), 'j': [None] * len(high_prices)}
        
        k = [50.0]  # Initialize K
        d = [50.0]  # Initialize D
        
        for i in range(len(close_prices)):
            if i < n - 1:
                k.append(None)
                d.append(None)
                continue
            
            # Calculate RSV
            high_max = max(high_prices[i - n + 1:i + 1])
            low_min = min(low_prices[i - n + 1:i + 1])
            
            if high_max == low_min:
                rsv = 50
            else:
                rsv = (close_prices[i] - low_min) / (high_max - low_min) * 100
            
            # Calculate K, D
            k_value = (2 * k[-1] + rsv) / 3 if k[-1] is not None else rsv
            d_value = (2 * d[-1] + k_value) / 3 if d[-1] is not None else k_value
            j_value = 3 * k_value - 2 * d_value
            
            k.append(round(k_value, 2))
            d.append(round(d_value, 2))
        
        # J = 3K - 2D
        j = [3 * k[i] - 2 * d[i] if k[i] and d[i] else None for i in range(len(k))]
        
        return {
            'k': k,
            'd': d,
            'j': [round(v, 2) if v else None for v in j],
        }
    
    @staticmethod
    def calculate_boll(
        prices: List[float],
        period: int = 20,
        std_dev: float = 2.0,
    ) -> Dict[str, List[float]]:
        """
        Calculate Bollinger Bands.
        
        Args:
            prices: List of closing prices
            period: MA period
            std_dev: Standard deviation multiplier
            
        Returns:
            Dictionary with upper, middle, lower bands
        """
        middle = IndicatorService.calculate_ma(prices, period)
        
        upper = []
        lower = []
        
        for i in range(len(prices)):
            if i < period - 1 or middle[i] is None:
                upper.append(None)
                lower.append(None)
            else:
                recent_prices = prices[i - period + 1:i + 1]
                std = np.std(recent_prices)
                upper.append(round(middle[i] + std_dev * std, 2))
                lower.append(round(middle[i] - std_dev * std, 2))
        
        return {
            'upper': upper,
            'middle': middle,
            'lower': lower,
        }
    
    @staticmethod
    def calculate_all(kline_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate all indicators for K-line data.
        
        Args:
            kline_data: List of K-line dictionaries with open, high, low, close, volume
            
        Returns:
            Dictionary with all indicators
        """
        if not kline_data:
            return {}
        
        closes = [k['close'] for k in kline_data]
        highs = [k['high'] for k in kline_data]
        lows = [k['low'] for k in kline_data]
        volumes = [k['volume'] for k in kline_data]
        
        # Calculate MACD
        macd = IndicatorService.calculate_macd(closes)
        
        # Calculate RSI
        rsi = IndicatorService.calculate_rsi(closes, 6)
        rsi12 = IndicatorService.calculate_rsi(closes, 12)
        rsi24 = IndicatorService.calculate_rsi(closes, 24)
        
        # Calculate KDJ
        kdj = IndicatorService.calculate_kdj(highs, lows, closes)
        
        # Calculate Bollinger Bands
        boll = IndicatorService.calculate_boll(closes)
        
        return {
            'ma': {
                'ma5': IndicatorService.calculate_ma(closes, 5),
                'ma10': IndicatorService.calculate_ma(closes, 10),
                'ma20': IndicatorService.calculate_ma(closes, 20),
                'ma30': IndicatorService.calculate_ma(closes, 30),
                'ma60': IndicatorService.calculate_ma(closes, 60),
            },
            'macd': {
                'diff': macd['diff'][-1] if macd['diff'] else None,
                'dea': macd['dea'][-1] if macd['dea'] else None,
                'bar': macd['bar'][-1] if macd['bar'] else None,
            },
            'rsi': {
                'rsi6': rsi[-1] if rsi else None,
                'rsi12': rsi12[-1] if rsi12 else None,
                'rsi24': rsi24[-1] if rsi24 else None,
            },
            'kdj': {
                'k': kdj['k'][-1] if kdj['k'] else None,
                'd': kdj['d'][-1] if kdj['d'] else None,
                'j': kdj['j'][-1] if kdj['j'] else None,
            },
            'boll': {
                'upper': boll['upper'][-1] if boll['upper'] else None,
                'middle': boll['middle'][-1] if boll['middle'] else None,
                'lower': boll['lower'][-1] if boll['lower'] else None,
            },
            'volume': {
                'ma5': IndicatorService.calculate_ma(volumes, 5),
                'ma10': IndicatorService.calculate_ma(volumes, 10),
            },
        }


# Global instance
indicator_service = IndicatorService()
