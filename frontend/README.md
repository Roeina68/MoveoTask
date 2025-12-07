# Frontend - React + Vite

React frontend application for the Moveo AI Crypto Advisor dashboard, built with Vite for fast development and optimized production builds.

## 📋 Prerequisites

- Node.js 16+ and npm
- Backend API running (see [backend README](../backend/README.md))

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=https://moveotask-46rm.onrender.com/api
```

**For local development:**
```env
VITE_API_URL=http://localhost:8000/api
```

**For production:**
```env
VITE_API_URL=https://moveotask-46rm.onrender.com/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns)

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder, ready for deployment to Vercel or any static hosting service.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js          # Axios client with JWT auto-refresh
│   ├── components/
│   │   ├── Card.jsx           # Reusable card component
│   │   ├── ChartsCard.jsx     # Price trends chart component
│   │   ├── NewsSkeleton.jsx  # Loading skeleton for news
│   │   ├── InsightSkeleton.jsx
│   │   ├── PricesSkeleton.jsx
│   │   ├── MemeSkeleton.jsx
│   │   └── ChartsSkeleton.jsx
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Signup.jsx        # Registration page
│   │   ├── Onboarding.jsx    # Onboarding quiz
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   └── Preferences.jsx   # Preferences update page
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles (dark fintech theme)
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies and scripts
```

## 🎨 Features

### Authentication
- **Login/Signup**: JWT-based authentication
- **Protected Routes**: Automatic redirects based on auth state
- **Token Refresh**: Automatic token refresh on expiry
- **Logout**: Clean session termination

### Onboarding
- Multi-step preference collection
- Crypto asset selection (BTC, ETH, SOL)
- Investor type selection (HODLer, Day Trader, NFT Collector)
- Content preferences (Market News, Charts, Social, Fun)

### Dashboard
- **Market News**: Filtered crypto news cards
- **Coin Prices**: Real-time price display
- **AI Insights**: Investor-type aware insights
- **Fun Crypto Memes**: Random meme display with modal view
- **Price Trends**: Historical price charts (with fallback handling)
- **Conditional Rendering**: Shows only selected content types
- **Voting System**: Thumbs up/down on all sections

### UI/UX
- **Dark Fintech Theme**: Modern, professional design
- **Skeleton Loaders**: Smooth loading states
- **Responsive Layout**: Works on all screen sizes
- **Error Handling**: Graceful error messages and retry options
- **Modal Views**: Full-screen meme viewing

## 🔧 API Client

The API client (`src/api/client.js`) handles:

- **JWT Token Management**: Automatic token injection in headers
- **Token Refresh**: Automatic refresh on 401 responses
- **Error Handling**: Centralized error handling
- **Request Interceptors**: Adds Authorization header
- **Response Interceptors**: Handles token refresh

### Usage Example

```javascript
import client from './api/client';

// GET request
const response = await client.get('/dashboard/news/');

// POST request
const response = await client.post('/auth/login/', {
  username: 'user',
  password: 'pass'
});
```

## 🎯 Components

### Card Component
Reusable card wrapper with:
- Title and content
- Vote buttons (thumbs up/down)
- User vote state display
- Consistent styling

### ChartsCard Component
Price trends visualization with:
- Time period selection (7D, 1Y)
- Cryptocurrency filtering
- Canvas-based chart rendering
- Fallback handling for rate limits
- Automatic retry with exponential backoff

### Skeleton Components
Loading placeholders that match content structure:
- NewsSkeleton: 4 news item rows
- InsightSkeleton: Large text block
- PricesSkeleton: 3 price rows
- MemeSkeleton: Image placeholder
- ChartsSkeleton: Chart area placeholder

## 🛣️ Routing

Routes defined in `App.jsx`:

- `/` - Redirects based on auth state
- `/login` - Login page
- `/signup` - Registration page
- `/onboarding` - Onboarding quiz (protected)
- `/dashboard` - Main dashboard (protected)
- `/preferences` - Preferences update (protected)

All routes are protected except login/signup. Users are redirected to onboarding if not completed.

## 🎨 Styling

Global styles in `index.css`:
- CSS variables for theming
- Dark fintech color palette
- Consistent spacing scale
- Glassmorphism effects
- Smooth animations
- Responsive breakpoints

### Color Palette
```css
--primary: #3B82F6
--background: #0F172A
--card: #1E293B
--text: #F1F5F9
--success: #10B981
--danger: #EF4444
```

## 🚢 Production Deployment (Vercel)

### Build Command
```bash
npm run build
```

### Output Directory
```
dist
```

### Environment Variables
Set in Vercel dashboard:
- `VITE_API_URL`: Backend API URL

### Vercel Configuration
The project includes `vercel.json` for optimal deployment settings.

## 📦 Dependencies

**Production:**
- `react` - UI library
- `react-dom` - React DOM bindings
- `react-router-dom` - Routing
- `axios` - HTTP client

**Development:**
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linting

See `package.json` for complete list.

## 🐛 Development Tips

1. **Hot Module Replacement**: Vite provides instant HMR during development
2. **Environment Variables**: Must be prefixed with `VITE_` to be accessible
3. **API Client**: Automatically handles token refresh - no manual intervention needed
4. **Error Boundaries**: Consider adding React error boundaries for production
5. **Console Logs**: Remove or wrap in development checks for production

## 🔍 Troubleshooting

### CORS Errors
- Ensure backend CORS is configured for your frontend URL
- Check `VITE_API_URL` matches backend URL

### Token Refresh Issues
- Check localStorage for `access_token` and `refresh_token`
- Verify backend token refresh endpoint is working
- Check browser console for error messages

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (16+ required)
- Verify all environment variables are set
