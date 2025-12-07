# Backend - Django REST Framework API

Django REST Framework backend for the Moveo AI Crypto Advisor dashboard.

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL database
- Virtual environment (venv)

## 🚀 Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/moveo_db
ALLOWED_HOSTS=localhost,127.0.0.1
OPENROUTER_API_KEY=your-openrouter-api-key
```

**Required Variables:**
- `DJANGO_SECRET_KEY`: Django secret key for cryptographic signing
- `DEBUG`: Set to `True` for development, `False` for production
- `DATABASE_URL`: PostgreSQL connection string
- `ALLOWED_HOSTS`: Comma-separated list of allowed hostnames
- `OPENROUTER_API_KEY`: API key for OpenRouter (AI insights)

### 4. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE moveo_db;
```

Update the `DATABASE_URL` in your `.env` file with your database credentials.

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Start Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
  - Body: `{ "username", "email", "password", "first_name", "last_name" }`
- `POST /api/auth/login/` - User login (returns JWT tokens)
  - Body: `{ "username", "password" }`
  - Returns: `{ "access", "refresh" }`
- `GET /api/auth/me/` - Get current user info
  - Requires: Authentication header
- `POST /api/auth/token/refresh/` - Refresh access token
  - Body: `{ "refresh": "..." }`

### Onboarding & Preferences
- `POST /api/onboarding/` - Complete onboarding
  - Body: `{ "crypto_assets": [], "investor_type": "", "content_preferences": [] }`
- `GET /api/preferences/` - Get user preferences
  - Requires: Authentication
- `PUT /api/preferences/update/` - Update user preferences
  - Body: `{ "crypto_assets": [], "investor_type": "", "content_preferences": [] }`

### Dashboard
- `GET /api/dashboard/news/` - Get filtered crypto news (CryptoPanic API)
  - Returns: Array of news items filtered by user's crypto assets
- `GET /api/dashboard/prices/` - Get current coin prices (CoinGecko API)
  - Returns: `{ "BTC": price, "ETH": price, "SOL": price }`
- `GET /api/dashboard/ai-insight/` - Get AI-generated insight (OpenRouter API)
  - Returns: `{ "insight": "...", "source": "ai" | "fallback" }`
- `GET /api/dashboard/meme/` - Get random crypto meme (meme-api.com)
  - Returns: `{ "url": "..." }`
- `GET /api/dashboard/price-history/` - Get historical price data (single period)
  - Query params: `?period=7d` (1d, 7d, 30d, 1y)
  - Returns: `{ "BTC": [[timestamp, price], ...], "ETH": [...] }`
- `GET /api/dashboard/price-history-all/` - Get historical price data (all periods)
  - Returns: `{ "7d": {...}, "1y": {...} }`

### Feedback
- `GET /api/dashboard/votes/` - Get all user votes
  - Returns: `{ "news": 1, "prices": -1, ... }`
- `POST /api/dashboard/vote/` - Submit vote for a section
  - Body: `{ "section": "news" | "prices" | "ai" | "meme" | "trends", "vote": 1 | -1 }`

## 🏗️ Project Structure

```
backend/
├── config/              # Django project settings
│   ├── settings.py      # Main configuration
│   ├── urls.py          # Root URL configuration
│   └── wsgi.py          # WSGI config
├── users/               # User authentication app
│   ├── models.py       # Custom User model
│   ├── views.py        # Signup, login endpoints
│   └── serializers.py  # User serializers
├── onboarding/         # Onboarding preferences app
│   ├── models.py       # UserPreferences model
│   ├── views.py        # Onboarding endpoints
│   └── serializers.py  # Preferences serializers
├── dashboard/          # Dashboard data endpoints
│   ├── views.py        # News, prices, AI, meme endpoints
│   └── urls.py         # Dashboard URL patterns
├── feedback/           # Voting/feedback app
│   ├── models.py       # Vote model
│   ├── views.py        # Vote endpoints
│   └── serializers.py  # Vote serializers
├── manage.py           # Django management script
└── requirements.txt    # Python dependencies
```

## 🔧 Configuration

### Database
PostgreSQL is configured via `DATABASE_URL` environment variable. The connection is parsed in `config/settings.py`.

### CORS
CORS is configured for production frontend domain:
- Allowed origins: `https://moveo-task-two.vercel.app`
- Configured in `config/settings.py`

### Caching
Django cache framework is used for:
- API response caching (1 hour TTL)
- Price history data caching
- Reduces external API calls

### External APIs
- **CryptoPanic**: News aggregation
- **CoinGecko**: Current prices and historical data
- **OpenRouter**: AI insights (Mistral 7B)
- **meme-api.com**: Random crypto memes

## 🚢 Production Deployment (Render)

### Environment Variables for Production

```env
DJANGO_SECRET_KEY=your-production-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ALLOWED_HOSTS=moveotask-46rm.onrender.com
OPENROUTER_API_KEY=your-api-key
```

### Production Notes

1. **WhiteNoise**: Static files served via WhiteNoise middleware
2. **Gunicorn**: Use Gunicorn as WSGI server:
   ```bash
   gunicorn config.wsgi:application
   ```
3. **Database**: PostgreSQL addon on Render
4. **CORS**: Configured for Vercel frontend domain
5. **Rate Limiting**: CoinGecko API has strict rate limits - charts may be unavailable during high traffic

### Render-Specific Considerations

- Render automatically provides `DATABASE_URL` if using PostgreSQL addon
- Set `ALLOWED_HOSTS` to your Render service URL
- Ensure `DEBUG=False` in production
- Static files are handled by WhiteNoise (no need for separate static file service)

## 🧪 Testing

Run Django tests:

```bash
python manage.py test
```

## 📦 Dependencies

Key packages:
- `Django==5.0`
- `djangorestframework`
- `djangorestframework-simplejwt`
- `psycopg2-binary` (PostgreSQL adapter)
- `django-cors-headers`
- `python-dotenv`
- `requests`
- `whitenoise` (production static files)

See `requirements.txt` for complete list.

## 🔒 Security Notes

- JWT tokens stored in localStorage (frontend)
- Token refresh handled automatically
- CORS restricted to production frontend domain
- `SECRET_KEY` must be kept secure
- `DEBUG=False` in production
- Password validation enforced
