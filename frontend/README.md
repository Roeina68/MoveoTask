# Frontend Setup Instructions

## Prerequisites
- Node.js 16+ and npm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL:
```
VITE_API_URL=http://localhost:8000/api
```

4. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Features

- **Login/Signup**: User authentication with JWT tokens
- **Onboarding**: Collect user preferences (crypto assets, investor type, content preferences)
- **Dashboard**: 2x2 grid showing:
  - News items
  - BTC/ETH prices from CoinGecko
  - AI insights
  - Random memes
- **Voting**: Thumbs up/down buttons on each card to vote on content

