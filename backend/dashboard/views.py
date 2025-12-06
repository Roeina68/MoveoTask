import requests
import random
import time
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from onboarding.models import UserPreferences
from django.conf import settings
from django.core.cache import cache


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def news(request):
    """
    Filter CryptoPanic news based on user's selected crypto assets.
    Only include articles that reference at least one selected asset.
    """
    # Get user preferences
    try:
        preferences = UserPreferences.objects.get(user=request.user)
        crypto_assets = preferences.crypto_assets if preferences.crypto_assets else ['BTC', 'ETH']
    except UserPreferences.DoesNotExist:
        crypto_assets = ['BTC', 'ETH']
    
    # Build currencies param for CryptoPanic
    currencies_str = ','.join(crypto_assets)
    
    try:
        response = requests.get(
            'https://cryptopanic.com/api/v1/posts/',
            params={
                'public': 'true',
                'filter': 'hot',
                'currencies': currencies_str
            },
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])

            cleaned = []
            asset_keywords = {
                'BTC': ['bitcoin', 'btc'],
                'ETH': ['ethereum', 'eth'],
                'SOL': ['solana', 'sol']
            }
            
            for item in results:
                title = item.get("title", "").strip().lower()
                if not title or len(title) < 20:
                    continue
                
                # Check if article mentions at least one selected asset
                mentions_asset = False
                for asset in crypto_assets:
                    keywords = asset_keywords.get(asset, [asset.lower()])
                    if any(keyword in title for keyword in keywords):
                        mentions_asset = True
                        break
                
                # Remove SOL items if SOL is not selected
                if not mentions_asset:
                    continue
                
                if 'sol' in title and 'SOL' not in crypto_assets:
                    continue

                source_obj = item.get("source") or {}
                source_name = source_obj.get("title", "CryptoPanic")

                # Prefer item["url"], then source["url"], last resort is CryptoPanic search
                url = item.get("url")
                if not url:
                    url = source_obj.get("url")
                if not url:
                    url = f"https://cryptopanic.com/search?q={'+'.join(item.get('title', '').split()[:4])}"

                cleaned.append({
                    "title": item.get("title", "").strip(),
                    "source": source_name,
                    "url": url,
                    "published_at": item.get("published_at", "")
                })

                if len(cleaned) == 4:
                    break

            if cleaned:
                return Response(cleaned)

    except Exception:
        pass

    # Realistic fallback with proper URLs
    fallback = []
    
    # Only include fallback items for selected assets
    if 'BTC' in crypto_assets:
        fallback.append({
            "title": "Bitcoin ETF Inflows Remain Strong as Market Volatility Eases",
            "source": "Blockworks",
            "url": "https://blockworks.co/news/bitcoin-etf-inflows",
            "published_at": ""
        })
    
    if 'ETH' in crypto_assets:
        fallback.append({
            "title": "Ethereum Layer-2 Activity Hits New High as Gas Fees Decline",
            "source": "The Block",
            "url": "https://www.theblock.co/post/ethereum-layer-2-activity",
            "published_at": ""
        })
    
    if 'SOL' in crypto_assets:
        fallback.append({
            "title": "Solana Validators Approve Upgrade Aimed at Reducing Network Congestion",
            "source": "CoinDesk",
            "url": "https://www.coindesk.com/tech/solana-network-upgrade",
            "published_at": ""
        })
    
    if not fallback:
        fallback.append({
            "title": "Regulatory Update: US Treasury Signals More Clarity for Crypto Exchanges",
            "source": "CoinDesk",
            "url": "https://www.coindesk.com/policy/crypto-regulatory-update",
            "published_at": ""
        })

    return Response(fallback)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def prices(request):
    """Fetch prices from CoinGecko based on user's crypto asset preferences"""
    try:
        # Get user preferences to determine which coins to fetch
        try:
            preferences = UserPreferences.objects.get(user=request.user)
            crypto_assets = preferences.crypto_assets
        except UserPreferences.DoesNotExist:
            # Default to BTC if no preferences
            crypto_assets = ['BTC']
        
        # Map user's asset codes to CoinGecko IDs
        coin_mapping = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'SOL': 'solana'
        }
        
        # Build list of coin IDs for CoinGecko
        coin_ids = [coin_mapping.get(asset, 'bitcoin') for asset in crypto_assets if asset in coin_mapping]
        if not coin_ids:
            coin_ids = ['bitcoin', 'ethereum']  # Default fallback
        
        coin_ids_str = ','.join(coin_ids)
        
        # Fetch prices from CoinGecko
        response = requests.get(
            'https://api.coingecko.com/api/v3/simple/price',
            params={
                'ids': coin_ids_str,
                'vs_currencies': 'usd'
            },
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            # Format response with user's preferred assets
            prices_dict = {}
            for asset in crypto_assets:
                coin_id = coin_mapping.get(asset)
                if coin_id and coin_id in data:
                    prices_dict[asset] = data[coin_id].get('usd', 0)
            
            # If no prices found, return empty dict
            if prices_dict:
                return Response(prices_dict)
    except Exception as e:
        pass  # Fall through to fallback
    
    # Fallback prices
    return Response({
        'BTC': 45000,
        'ETH': 2500,
        'SOL': 100
    })

BINANCE_INTERVALS = {
    '1d': ('1h', 24),
    '7d': ('4h', 42),
    '30d': ('12h', 62),
    '1y': ('1d', 365)
}

BINANCE_SYMBOL_MAP = {
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT',
    'SOL': 'SOLUSDT'
}


def fetch_binance_history(crypto_assets, time_period):
    """Helper function to fetch Binance OHLC data for given assets and period"""
    import logging
    logger = logging.getLogger(__name__)
    
    interval, limit = BINANCE_INTERVALS.get(time_period, ('4h', 42))
    history = {}
    
    for asset in crypto_assets:
        symbol = BINANCE_SYMBOL_MAP.get(asset)
        if not symbol:
            continue
            
        try:
            url = "https://api.binance.com/api/v3/klines"
            params = {
                "symbol": symbol,
                "interval": interval,
                "limit": limit
            }
            
            resp = requests.get(url, params=params, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                # Format as CoinGecko-style [timestamp, price]
                # Binance klines: [open_time, open, high, low, close, volume, ...]
                formatted = [
                    [int(item[0]), float(item[4])]  # open_time (ms), close price
                    for item in data
                ]
                history[asset] = formatted
            else:
                logger.warning(f"Binance returned status {resp.status_code} for {asset} ({time_period})")
        except Exception as e:
            logger.warning(f"Failed fetching Binance data for {asset} ({time_period}): {e}")
            continue
    
    return history


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def price_history(request):
    """Fetch historical price data for a single period using Binance OHLC API"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Get user assets
        try:
            prefs = UserPreferences.objects.get(user=request.user)
            crypto_assets = prefs.crypto_assets
        except UserPreferences.DoesNotExist:
            crypto_assets = ['BTC', 'ETH']
        
        # Get period
        time_period = request.GET.get('period', '7d')
        
        # Check cache
        cache_key = f"binance_history_{'_'.join(sorted(crypto_assets))}_{time_period}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)
        
        # Fetch from Binance
        history = fetch_binance_history(crypto_assets, time_period)
        
        if history:
            # Cache for 1 hour
            cache.set(cache_key, history, 3600)
            return Response(history)
        else:
            return Response({}, status=503)
            
    except Exception as e:
        logger.error(f"Error in price_history: {e}")
        return Response({"error": "Failed to load chart data"}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def price_history_all(request):
    """Fetch historical price data for ALL periods at once using Binance OHLC API"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Get user assets
        try:
            prefs = UserPreferences.objects.get(user=request.user)
            crypto_assets = prefs.crypto_assets
        except UserPreferences.DoesNotExist:
            crypto_assets = ['BTC', 'ETH']
        
        # Check cache for all periods
        cache_key = f"binance_history_all_{'_'.join(sorted(crypto_assets))}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)
        
        # Fetch all periods
        periods = ['1d', '7d', '30d', '1y']
        all_periods_data = {}
        
        for time_period in periods:
            history = fetch_binance_history(crypto_assets, time_period)
            if history:
                all_periods_data[time_period] = history
        
        if all_periods_data:
            # Cache for 1 hour
            cache.set(cache_key, all_periods_data, 3600)
            return Response(all_periods_data)
        else:
            return Response({}, status=503)
            
    except Exception as e:
        logger.error(f"Error in price_history_all: {e}")
        return Response({"error": "Failed to load chart data"}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_insight(request):
    """Get AI insight using OpenRouter with investor-type aware prompts."""
    from django.conf import settings
    import re

    # Get preferences
    try:
        preferences = UserPreferences.objects.get(user=request.user)
        crypto_assets = preferences.crypto_assets if preferences.crypto_assets else ['BTC', 'ETH']
        investor_type = preferences.investor_type or 'investor'
    except UserPreferences.DoesNotExist:
        crypto_assets = ['BTC', 'ETH']
        investor_type = 'investor'

    # Build investor-type aware prompt
    assets_str = ', '.join(crypto_assets)
    
    if investor_type == 'HODLer':
        prompt = (
            f"Write a concise long-term macro and fundamental analysis insight (2-3 sentences) "
            f"for a HODLer investor focused on {assets_str}. "
            f"Focus on adoption trends, network fundamentals, institutional interest, or regulatory developments. "
            f"Use a professional, Bloomberg-style tone. "
            f"Output only natural English text with no tags, no brackets, no <s>, no BOT markers, no markdown, no emojis."
        )
    elif investor_type == 'Day Trader':
        prompt = (
            f"Write a concise short-term trading insight (2-3 sentences) "
            f"for a Day Trader focused on {assets_str}. "
            f"Reference key support/resistance levels, trend direction, volume patterns, or short-term catalysts. "
            f"Use a professional, Blockworks-style tone. "
            f"Output only natural English text with no tags, no brackets, no <s>, no BOT markers, no markdown, no emojis."
        )
    else:
        prompt = (
            f"Write a concise crypto market insight (2-3 sentences) "
            f"for a {investor_type} investor focused on {assets_str}. "
            f"Use a professional, Bloomberg-style tone. "
            f"Output only natural English text with no tags, no brackets, no <s>, no BOT markers, no markdown, no emojis."
        )

    # Try OpenRouter API
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            },
            json={
                "model": "mistralai/mistral-7b-instruct",
                "messages": [
                    {"role": "system", "content": "You are a professional crypto market analyst. Always respond with clean, natural English text only."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 150,
                "temperature": 0.7
            },
            timeout=8
        )

        if response.status_code == 200:
            data = response.json()
            msg = data["choices"][0]["message"]["content"].strip()
            
            # Sanitize: remove tags, brackets, BOT markers, markdown
            msg = re.sub(r'<[^>]+>', '', msg)  # Remove HTML/XML tags
            msg = re.sub(r'\[.*?\]', '', msg)  # Remove brackets
            msg = re.sub(r'\{.*?\}', '', msg)  # Remove curly braces
            msg = re.sub(r'<s>|</s>', '', msg)  # Remove <s> tags
            msg = re.sub(r'BOT[:]?\s*', '', msg, flags=re.IGNORECASE)  # Remove BOT markers
            msg = re.sub(r'#+\s*', '', msg)  # Remove markdown headers
            msg = re.sub(r'\*\*([^*]+)\*\*', r'\1', msg)  # Remove bold markdown
            msg = re.sub(r'\*([^*]+)\*', r'\1', msg)  # Remove italic markdown
            msg = msg.strip()

            if msg and len(msg) > 10:
                return Response({
                    "insight": msg,
                    "source": "ai"
                })

    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"OpenRouter error: {e}")

    # Fallback if OpenRouter fails
    assets_str = ', '.join(crypto_assets[:2])
    if investor_type == 'HODLer':
        fallback_insights = [
            f"Long-term fundamentals for {assets_str} remain strong, with growing institutional adoption and network development continuing to drive value.",
            f"{assets_str} show promising macro trends with increasing on-chain activity and expanding ecosystem growth supporting long-term holders.",
        ]
    elif investor_type == 'Day Trader':
        fallback_insights = [
            f"Short-term price action for {assets_str} shows consolidation near key levels, with traders watching for breakout signals above resistance.",
            f"Trading volume for {assets_str} suggests active participation, with support levels holding and potential for short-term momentum shifts.",
        ]
    else:
        fallback_insights = [
            f"Market activity around {assets_str} shows steady sentiment with moderate volatility, offering opportunities for strategic positioning.",
        ]

    return Response({
        "insight": random.choice(fallback_insights),
        "source": "fallback"
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meme(request):
    """Fetch a random crypto meme from meme-api.com, ensuring it's an actual meme image"""
    import random
    
    # Expanded list of meme-focused subreddits (not general crypto news)
    meme_subreddits = [
        'cryptocurrencymemes',
        'bitcoinmemes',
        'ethereummemes',
        'solana',
        'CryptoCurrencyMemes',
        'cryptomemes',
        'dankmemes',  # Sometimes has crypto memes
        'memes'  # General memes, sometimes crypto-related
    ]
    
    # Shuffle to get more diversity
    random.shuffle(meme_subreddits)
    
    # Try each subreddit until we get a valid meme
    for subreddit in meme_subreddits:
        try:
            response = requests.get(
                f'https://meme-api.com/gimme/{subreddit}',
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                meme_url = data.get('url')
                title = data.get('title', '').lower()
                
                # Filter out non-meme content (charts, data tables, news screenshots)
                exclude_keywords = [
                    'chart', 'graph', 'data', 'table', 'dashboard', 'screenshot',
                    'news', 'article', 'price', 'market', 'trading', 'analysis',
                    'whitepaper', 'report', 'statistics', 'metrics', 'volume'
                ]
                
                # Check if title suggests it's not a meme
                is_not_meme = any(keyword in title for keyword in exclude_keywords)
                
                # Check if URL suggests it's an image (meme should be image)
                is_image = meme_url and any(ext in meme_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', 'i.redd.it', 'i.imgur.com'])
                
                if meme_url and is_image and not is_not_meme:
                    return Response({'url': meme_url})
        except Exception:
            continue  # Try next subreddit
    
    # If all subreddits fail, try one more time with random selection
    try:
        random_sub = random.choice(meme_subreddits[:3])  # Focus on top meme subreddits
        response = requests.get(
            f'https://meme-api.com/gimme/{random_sub}',
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            meme_url = data.get('url')
            if meme_url:
                return Response({'url': meme_url})
    except Exception:
        pass
    
    # If all attempts fail, return None so frontend can show error message
    return Response({'url': None})

