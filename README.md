# Moveo - AI Crypto Advisor Dashboard

A full-stack web application built for the Moveo Web + AI assignment. This personalized crypto investor dashboard allows users to customize their experience through an onboarding quiz and provides daily AI-curated content tailored to their interests.

## 🚀 Live Deployment

- **Frontend**: [https://moveo-task-two.vercel.app/](https://moveo-task-two.vercel.app/)
- **Backend API**: [https://moveotask-46rm.onrender.com/](https://moveotask-46rm.onrender.com/)

## 🛠️ Tech Stack

- **Backend**: Django 5.0 + Django REST Framework
- **Frontend**: React 18 + Vite
- **Database**: PostgreSQL
- **Authentication**: JWT (SimpleJWT)
- **Deployment**: Render (backend) + Vercel (frontend)

## ✨ Features

### Authentication & User Management
- ✅ User signup/login with JWT authentication
- ✅ Protected routes with automatic token refresh
- ✅ Secure password validation

### Onboarding & Preferences
- ✅ Multi-step onboarding quiz
- ✅ Crypto asset selection (BTC, ETH, SOL)
- ✅ Investor type selection (HODLer, Day Trader, NFT Collector)
- ✅ Content preference customization (Market News, Charts, Social, Fun)
- ✅ Preferences update page

### Dashboard Features
- ✅ **Market News**: CryptoPanic API integration with asset-based filtering
- ✅ **Coin Prices**: Real-time prices from CoinGecko API
- ✅ **AI Insights**: OpenRouter API with investor-type aware prompts
- ✅ **Fun Crypto Memes**: meme-api.com integration with content filtering
- ✅ **Price Trends**: Historical price charts (disabled in production due to rate limits)
- ✅ Conditional rendering based on user preferences

### Feedback System
- ✅ Thumbs up/down voting on all sections
- ✅ Vote persistence in database
- ✅ Visual feedback for user votes

### Additional Features
- ✅ Modern dark fintech UI design
- ✅ Skeleton loading states
- ✅ Responsive layout
- ✅ Error handling and fallbacks
- ✅ CORS configuration for production
- ✅ Local and production environment configurations

## 📁 Project Structure

```
Moveo/
├── backend/              # Django REST Framework API
│   ├── config/           # Django project settings
│   ├── users/            # User authentication app
│   ├── onboarding/       # Onboarding preferences app
│   ├── dashboard/        # Dashboard endpoints app
│   └── feedback/         # Voting/feedback app
│
└── frontend/             # React + Vite frontend
    └── src/
        ├── api/          # API client with JWT handling
        ├── pages/        # React pages (Login, Signup, Onboarding, Dashboard, Preferences)
        └── components/   # React components (Card, ChartsCard, Skeletons)
```

## 🏗️ Architecture Overview

### Backend (`backend/`)
Django REST Framework API with modular app structure:
- **users/**: Custom user model with JWT authentication
- **onboarding/**: User preferences storage and management
- **dashboard/**: Data aggregation from external APIs (CryptoPanic, CoinGecko, OpenRouter, meme-api)
- **feedback/**: Vote tracking and storage

### Frontend (`frontend/`)
React SPA with Vite build tool:
- **Pages**: Authentication, onboarding, dashboard, preferences
- **Components**: Reusable UI components with skeleton loaders
- **API Client**: Axios-based client with automatic JWT refresh

## 🚦 Local Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file in `backend/`:
```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/moveo_db
ALLOWED_HOSTS=localhost,127.0.0.1
OPENROUTER_API_KEY=your-openrouter-api-key
```

5. Create PostgreSQL database:
```bash
# Connect to PostgreSQL and run:
CREATE DATABASE moveo_db;
```

6. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

7. Start development server:
```bash
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:8000/api
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or assigned port)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login (returns JWT tokens)
- `GET /api/auth/me/` - Get current user info
- `POST /api/auth/token/refresh/` - Refresh access token

### Onboarding & Preferences
- `POST /api/onboarding/` - Complete onboarding preferences
- `GET /api/preferences/` - Get user preferences
- `PUT /api/preferences/update/` - Update user preferences

### Dashboard
- `GET /api/dashboard/news/` - Get filtered crypto news
- `GET /api/dashboard/prices/` - Get current coin prices
- `GET /api/dashboard/ai-insight/` - Get AI-generated insight
- `GET /api/dashboard/meme/` - Get random crypto meme
- `GET /api/dashboard/price-history/` - Get historical price data (single period)
- `GET /api/dashboard/price-history-all/` - Get historical price data (all periods)

### Feedback
- `GET /api/dashboard/votes/` - Get user votes
- `POST /api/dashboard/vote/` - Submit vote for a section

## 📝 Notes & Limitations

### Production Considerations
- **Price History Charts**: Disabled in production due to CoinGecko/Binance API rate limits. The feature is fully functional in local development but may encounter 429 errors in production.
- **CORS**: Configured for production frontend domain only
- **Environment Variables**: All sensitive keys stored in environment variables
- **Database**: PostgreSQL used in production (Render)

### Known Limitations
- Chart data may be unavailable during high-traffic periods due to external API rate limits
- Meme API may occasionally return non-meme content (filtered on frontend)
- AI insights use free-tier OpenRouter API with rate limits

## 👤 Author

**Roei Nahary**

---

## 📚 Additional Resources

- [Backend README](./backend/README.md) - Detailed backend setup and API documentation
- [Frontend README](./frontend/README.md) - Frontend setup and component structure
