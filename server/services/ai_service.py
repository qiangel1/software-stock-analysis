"""
AI Service

Handles AI-powered stock analysis using OpenAI.
"""

import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from openai import AsyncOpenAI

from config import settings
from database import redis_client


class AIService:
    """
    Service for AI-powered stock analysis.
    
    Uses OpenAI GPT-4 for comprehensive stock analysis
    including fundamental, technical, and sentiment analysis.
    """
    
    def __init__(self):
        self.client: Optional[AsyncOpenAI] = None
        if settings.is_openai_configured:
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def analyze_stock(
        self,
        code: str,
        stock_name: str,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate comprehensive AI analysis for stock.
        
        Args:
            code: Stock code
            stock_name: Stock name
            force_refresh: Force refresh cached analysis
            
        Returns:
            Analysis dictionary
        """
        # Check cache first
        cache_key = f'ai_analysis:{code}'
        if not force_refresh:
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        
        # Generate new analysis
        if self.client:
            analysis = await self._generate_analysis(code, stock_name)
        else:
            analysis = self._generate_mock_analysis(code, stock_name)
        
        # Cache result (1 hour TTL)
        await redis_client.set(cache_key, json.dumps(analysis, ensure_ascii=False), ex=3600)
        
        return analysis
    
    async def _generate_analysis(
        self,
        code: str,
        stock_name: str,
    ) -> Dict[str, Any]:
        """Generate analysis using OpenAI."""
        prompt = f'''请对股票{stock_name}(代码:{code})进行全面的AI分析。

请从以下几个方面进行分析：
1. 基本面分析（业绩、行业地位、竞争优势等）
2. 技术面分析（K线形态、均线、技术指标等）
3. 市场情绪分析（资金流向、机构持仓等）
4. 投资建议（买入/持有/卖出，目标价，止损价）

请以JSON格式返回分析结果，包含以下字段：
- rating: 评级(strongly_buy/buy/neutral/cautious)
- rating_text: 评级说明
- fundamental: {{
    score: 0-100分数,
    summary: 分析摘要,
    pros: 优势列表,
    cons: 风险列表
}}
- technical: {{
    score: 0-100分数,
    summary: 分析摘要,
    indicators: 技术指标信号列表
}}
- sentiment: {{
    score: 0-100分数,
    summary: 分析摘要,
    news_count: 相关新闻数量,
    positive_ratio: 正面新闻比例
}}
- recommendation: {{
    action: buy/hold/sell,
    target_price: 目标价,
    stop_loss: 止损价,
    risk_level: low/medium/high,
    holding_period: 建议持仓周期
}}

只返回JSON，不要包含其他文字。'''
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {'role': 'system', 'content': '你是一个专业的股票分析师。'},
                    {'role': 'user', 'content': prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )
            
            content = response.choices[0].message.content
            if content:
                return json.loads(content)
        except Exception as e:
            print(f'[AI] Analysis failed: {e}')
        
        return self._generate_mock_analysis(code, stock_name)
    
    def _generate_mock_analysis(
        self,
        code: str,
        stock_name: str,
    ) -> Dict[str, Any]:
        """Generate mock analysis for demo."""
        import random
        
        ratings = ['strongly_buy', 'buy', 'neutral', 'cautious']
        rating = random.choice(ratings)
        
        return {
            'code': code,
            'name': stock_name,
            'rating': rating,
            'rating_text': f'基于基本面、技术面和情绪面的综合分析，{stock_name}当前走势{'良好' if rating in ['strongly_buy', 'buy'] else '震荡'}，建议{'适度关注' if rating in ['strongly_buy', 'buy'] else '谨慎观望'}。',
            'fundamental': {
                'score': random.randint(60, 90),
                'summary': '公司基本面稳健，营收和利润保持稳定增长。行业地位稳固，竞争优势明显。',
                'pros': [
                    '行业龙头地位稳固',
                    '营收保持稳定增长',
                    '现金流充裕',
                ],
                'cons': [
                    '估值相对较高',
                    '行业竞争加剧',
                ],
            },
            'technical': {
                'score': random.randint(50, 85),
                'summary': '技术面呈现多头排列，短期内有上涨动能。',
                'indicators': [
                    '均线多头排列',
                    'MACD金叉',
                    'KDJ金叉',
                ],
            },
            'sentiment': {
                'score': random.randint(50, 80),
                'summary': '市场情绪偏多，资金关注度较高。',
                'news_count': random.randint(10, 50),
                'positive_ratio': round(random.uniform(0.5, 0.8), 2),
            },
            'recommendation': {
                'action': random.choice(['buy', 'hold', 'sell']),
                'target_price': round(random.uniform(100, 200), 2),
                'stop_loss': round(random.uniform(80, 95), 2),
                'risk_level': random.choice(['low', 'medium', 'high']),
                'holding_period': random.choice(['短期', '中期', '长期']),
            },
            'generated_at': datetime.now().isoformat(),
        }
    
    async def summarize_news(
        self,
        code: str,
        news_list: List[Dict[str, Any]],
    ) -> str:
        """
        Generate AI summary of news articles.
        
        Args:
            code: Stock code
            news_list: List of news items
            
        Returns:
            Summary string
        """
        if not self.client or not news_list:
            return '近期新闻要点：\n1. 公司业绩稳定\n2. 行业前景良好\n3. 建议保持关注'
        
        # Generate summary using OpenAI
        news_text = '\n'.join([f"- {n.get('title', '')}" for n in news_list[:10]])
        
        prompt = f'''请总结以下{code}相关新闻的要点，用简洁的语言概括（200字以内）：

{news_text}

请用中文回答。'''
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {'role': 'system', 'content': '你是一个专业的股票分析师，擅长总结新闻要点。'},
                    {'role': 'user', 'content': prompt},
                ],
                temperature=0.5,
                max_tokens=500,
            )
            
            return response.choices[0].message.content or '总结生成失败'
        except Exception as e:
            print(f'[AI] News summary failed: {e}')
            return '近期新闻要点：\n1. 公司业绩稳定\n2. 行业前景良好\n3. 建议保持关注'


# Global instance
ai_service = AIService()
