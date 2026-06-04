# StockQuant - 智能股票量化分析系统

基于 React + FastAPI 的智能股票量化分析系统，提供实时行情、K线图表、AI分析、风险预警等专业功能。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI组件库**: MUI v5 (Material Design)
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand
- **图表库**: ECharts
- **路由**: React Router v6

### 后端
- **框架**: FastAPI (Python 3.10+)
- **数据库**: PostgreSQL + Redis
- **实时数据**: WebSocket
- **AI服务**: OpenAI GPT-4
- **数据源**: 富途OpenD + Mootdx

## 快速开始

### 前端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端

```bash
# 进入后端目录
cd server

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 环境变量

复制 `.env.example` 为 `.env` 并配置相关参数。

## 项目结构

```
stockquant/
├── src/
│   ├── api/          # API客户端
│   ├── components/   # React组件
│   ├── hooks/        # 自定义Hooks
│   ├── pages/        # 页面组件
│   ├── stores/       # 状态管理
│   ├── types/        # TypeScript类型
│   └── utils/        # 工具函数
├── server/
│   ├── models/       # 数据模型
│   ├── routers/      # API路由
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # 业务服务
│   └── utils/        # 工具函数
└── ...
```

## 功能特性

- 📊 **实时行情**: 股票实时价格、涨跌幅、成交量
- 📈 **K线图表**: 日K、周K、月K，支持多种技术指标
- 🤖 **AI分析**: 基于GPT-4的智能股票分析
- 🔔 **风险预警**: 价格预警、涨跌幅预警、新闻预警
- 💼 **持仓管理**: 记录持仓、计算盈亏
- ⭐ **自选股**: 关注股票、分类管理
- 🔍 **智能筛选**: 多条件筛选优质股票

## API文档

启动后端服务后，访问:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 风险提示

> **免责声明**: StockQuant 仅供用户进行市场信息查询和分析，不构成任何投资建议。用户应自行承担投资风险，我们不对因使用本工具而产生的任何损失负责。
>
> 股市有风险，投资需谨慎。

## License

MIT License
