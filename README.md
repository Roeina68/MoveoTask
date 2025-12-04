# Moveo Project

A full-stack application with Django REST Framework backend and React frontend.

## Project Structure

```
Moveo/
├── backend/          # Django + DRF backend
│   ├── config/       # Django project settings
│   ├── users/        # User authentication app
│   ├── onboarding/   # Onboarding preferences app
│   ├── dashboard/    # Dashboard endpoints app
│   └── feedback/     # Voting/feedback app
│
└── frontend/         # React + Vite frontend
    └── src/
        ├── api/      # API client with JWT handling
        ├── pages/    # React pages (Login, Signup, Onboarding, Dashboard)
        └── components/ # React components (Card)
```

## Quick Start

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up PostgreSQL database:
```bash
# Create database named 'moveo_db'
# Update config/settings.py with your database credentials if needed
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Start development server:
```bash
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Update VITE_API_URL if needed
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or assigned port)

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login (returns JWT tokens)
- `GET /api/auth/me/` - Get current user info

### Onboarding
- `POST /api/onboarding/` - Complete onboarding preferences

### Dashboard
- `GET /api/dashboard/news/` - Get news items
- `GET /api/dashboard/prices/` - Get BTC/ETH prices from CoinGecko
- `GET /api/dashboard/ai-insight/` - Get AI insight
- `GET /api/dashboard/meme/` - Get random meme URL

### Feedback
- `POST /api/dashboard/vote/` - Submit vote for a section

## Technologies

**Backend:**
- Django 5.0
- Django REST Framework
- SimpleJWT for authentication
- PostgreSQL
- django-cors-headers

**Frontend:**
- React 18
- Vite
- React Router DOM
- Axios

## Notes

- CORS is enabled for all origins (should be restricted in production)
- JWT tokens are stored in localStorage
- Token refresh is handled automatically by the API client
- All dashboard endpoints require authentication

