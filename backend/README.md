# Backend Setup Instructions

## Prerequisites
- Python 3.8+
- PostgreSQL database

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create PostgreSQL database:
```bash
# Connect to PostgreSQL and run:
CREATE DATABASE moveo_db;
```

4. Update database settings in `config/settings.py` if needed (default: localhost, postgres/postgres)

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser (optional):
```bash
python manage.py createsuperuser
```

7. Run development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login (returns JWT tokens)
- `GET /api/auth/me/` - Get current user info
- `POST /api/onboarding/` - Complete onboarding
- `GET /api/dashboard/news/` - Get news items
- `GET /api/dashboard/prices/` - Get BTC/ETH prices
- `GET /api/dashboard/ai-insight/` - Get AI insight
- `GET /api/dashboard/meme/` - Get random meme URL
- `POST /api/dashboard/vote/` - Submit vote for a section

