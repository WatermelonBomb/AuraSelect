# 🌟 AuraSelect - Beauty Salon Product Recommendation System
> 美容室向け商品推薦・試用管理システム

[English](#english) | [日本語](#japanese)

---

## English

**AuraSelect** is a comprehensive product recommendation and trial management system designed specifically for beauty salons. It enables customers to discover, try, and purchase beauty products while providing salon staff with powerful management tools.

## ✨ Features

### For Customers
- 🔍 **Product Discovery**: Browse and search through curated beauty products
- 🧪 **Trial System**: Request product trials before purchasing  
- ⭐ **Reviews & Ratings**: Rate and review tried products
- 👤 **Personal Profile**: Manage hair type, skin type, and preferences
- 📱 **Responsive Design**: Optimized for mobile and desktop

### For Salon Staff
- 📊 **Trial Management**: Approve, track, and manage trial requests
- 👥 **Customer Management**: View customer profiles and trial history
- 📈 **Analytics Dashboard**: Track trial success rates and popular products
- 🔔 **Notifications**: Real-time updates on trial status

### For Administrators
- 🛍️ **Product Management**: Full CRUD operations on products
- 👨‍💼 **User Management**: Manage staff and customer accounts
- 📊 **Business Analytics**: Comprehensive insights and reporting
- ⚙️ **System Configuration**: Manage application settings

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Authentication**: JWT-based auth with role-based access control

### Backend  
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis for session management and caching
- **Authentication**: FastAPI-Users with JWT tokens
- **API Documentation**: Automatic OpenAPI/Swagger generation

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx with rate limiting and SSL termination
- **Database Migrations**: Alembic
- **Development**: Hot reload and development tools

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Docker & Docker Compose (recommended)
- PostgreSQL (if not using Docker)
- Redis (if not using Docker)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/auraselect.git
   cd auraselect
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start with Docker (Recommended)**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Run database migrations
   docker-compose exec backend alembic upgrade head
   ```

4. **Or start manually**
   ```bash
   # Backend setup
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   python main.py
   
   # Frontend setup (in new terminal)
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/v1/docs

### Quick Login (Development)
- **Admin**: admin@auraselect.com / admin123
- **Staff**: staff@auraselect.com / staff123  
- **Customer**: customer@auraselect.com / customer123

## 📁 Project Structure

```
auraselect/
├── app/                      # Next.js pages and app router
├── components/               # React components
│   ├── auth/                # Authentication components
│   ├── forms/               # Form components
│   ├── ui/                  # Base UI components (shadcn/ui)
│   └── views/               # Page view components
├── lib/                      # Utility libraries
│   ├── api/                 # API client functions
│   ├── hooks/               # Custom React hooks
│   ├── providers/           # React providers (Query, etc.)
│   ├── schemas/             # Zod validation schemas
│   └── utils/               # Utility functions
├── backend/                  # FastAPI backend
│   ├── app/                 # Application code
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication
│   │   ├── core/            # Core configuration
│   │   ├── crud/            # Database CRUD operations
│   │   ├── db/              # Database configuration
│   │   └── models/          # SQLAlchemy models
│   ├── migrations/          # Alembic migrations
│   └── tests/               # Backend tests
├── scripts/                  # Deployment and utility scripts
├── nginx/                   # Nginx configuration
└── docs/                    # Documentation
```

## 🧪 Testing

### Frontend Tests
```bash
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Backend Tests
```bash
cd backend
pytest                    # Run tests
pytest --cov             # Coverage report
pytest -v                # Verbose output
```

### End-to-End Tests
```bash
npm run test:e2e          # Playwright E2E tests
```

## 🚀 Deployment

### Production Deployment

1. **Prepare environment**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy with script**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh production
   ```

3. **Manual deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | http://localhost:8000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `POSTGRES_PASSWORD` | PostgreSQL password | - |

## 📊 API Documentation

The API is automatically documented with OpenAPI/Swagger:
- **Development**: http://localhost:8000/api/v1/docs
- **Production**: https://your-domain.com/api/v1/docs

### Key Endpoints

- `GET /api/v1/products` - List products with filtering
- `POST /api/v1/trial-requests` - Create trial request
- `GET /api/v1/trial-requests/my` - User's trial requests
- `POST /auth/jwt/login` - Login
- `GET /auth/users/me` - Current user profile

## 🔧 Development

### Code Style
- **Frontend**: ESLint + Prettier with TypeScript strict mode
- **Backend**: Black + isort + flake8 for Python

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Submit PR with description and tests
4. Code review and merge

### Database Changes
```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Roadmap

- [ ] Mobile application (React Native)
- [ ] AI-powered product recommendations
- [ ] Inventory management integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Third-party beauty brand integrations

---

## Japanese

**AuraSelect**は美容室専用の包括的な商品推薦・試用管理システムです。お客様が美容商品を発見・試用・購入できる環境を提供し、美容室スタッフには強力な管理ツールを提供します。

## ✨ 主な機能

### お客様向け機能
- 🔍 **商品検索・発見**: 厳選された美容商品の閲覧・検索
- 🧪 **試用システム**: 購入前の商品試用リクエスト
- ⭐ **レビュー・評価**: 試用した商品への評価・レビュー投稿
- 👤 **個人プロフィール**: 髪質、肌質、好みの管理
- 📱 **レスポンシブデザイン**: モバイル・デスクトップ最適化

### スタッフ向け機能
- 📊 **試用管理**: 試用リクエストの承認・追跡・管理
- 👥 **顧客管理**: 顧客プロフィールと試用履歴の確認
- 📈 **分析ダッシュボード**: 試用成功率と人気商品の分析
- 🔔 **通知機能**: 試用ステータスのリアルタイム更新

### 管理者向け機能
- 🛍️ **商品管理**: 商品のCRUD操作（作成・読み取り・更新・削除）
- 👨‍💼 **ユーザー管理**: スタッフ・顧客アカウントの管理
- 📊 **ビジネス分析**: 包括的なインサイトとレポート機能
- ⚙️ **システム設定**: アプリケーション設定の管理

## 🎯 最新の開発状況

### ✅ 実装済み機能
- **認証システム**: JWT ベース認証、ロールベースアクセス制御
- **ユーザー登録・ログイン**: 完全な新規ユーザー登録フロー
- **商品管理**: 商品のCRUD操作、カテゴリ分類、評価システム
- **試用システム**: トライアルリクエスト・承認・管理機能
- **レスポンシブUI**: shadcn/ui + Tailwind CSS での美しいデザイン
- **API統合**: FastAPI との完全統合、自動API文書生成
- **データベース**: PostgreSQL/SQLite対応、マイグレーション管理

### 📊 プロジェクト詳細
- **総コード行数**: 6,737行 (TypeScript/TSX)
- **コンポーネント数**: 30+ React コンポーネント
- **API エンドポイント**: 15+ REST API
- **テストカバレッジ**: バックエンドテスト実装済み

### 🚀 デプロイ対応
- ✅ Docker化完了
- ✅ 本番環境設定
- ✅ Nginx設定
- ✅ デプロイスクリプト

## 開発用ログイン情報
- **管理者**: admin@auraselect.com / admin123
- **スタッフ**: staff@auraselect.com / staff123
- **顧客**: customer@auraselect.com / customer123

## 📱 対応デバイス
- デスクトップ（Chrome、Firefox、Safari、Edge）
- モバイル（iOS Safari、Android Chrome）
- タブレット（iPad、Android タブレット）

---

**AuraSelect** - Empowering beauty salons with intelligent product management and customer engagement tools.

Built with ❤️ using Next.js, FastAPI, and modern web technologies.