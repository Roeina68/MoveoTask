import requests
import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from onboarding.models import UserPreferences


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def news(request):
    """Fetch news from CryptoPanic API or return static fallback"""
    try:
        # CryptoPanic API (free tier, no API key required for public feed)
        response = requests.get(
            'https://cryptopanic.com/api/v1/posts/',
            params={
                'auth_token': '',  # Optional, can be left empty for public feed
                'public': 'true',
                'currencies': 'BTC,ETH,SOL',  # Filter by major cryptos
                'filter': 'hot',  # Get trending/hot news
            },
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])[:4]  # Get top 4 news items
            news_items = []
            for item in results:
                # CryptoPanic API returns 'url' which is the original article URL
                # If that's not available, use the source URL or construct CryptoPanic link
                article_url = item.get('url', '')
                source_info = item.get('source', {})
                source_url = source_info.get('url', '') if isinstance(source_info, dict) else ''
                
                # If no direct URL, try to construct a CryptoPanic search link using title keywords
                if not article_url and not source_url:
                    title = item.get('title', '')
                    # Use first few words as search keywords
                    keywords = ' '.join(title.split()[:3]) if title else 'crypto'
                    article_url = f"https://cryptopanic.com/news/?q={keywords.replace(' ', '+')}"
                elif not article_url:
                    article_url = source_url
                
                news_items.append({
                    "title": item.get('title', 'Crypto News'),
                    "source": source_info.get('title', 'CryptoPanic') if isinstance(source_info, dict) else 'CryptoPanic',
                    "url": article_url or '#',
                    "published_at": item.get('published_at', '')
                })
            if news_items:
                return Response(news_items)
    except Exception as e:
        pass  # Fall through to static fallback
    
    # Static fallback with proper CryptoPanic search links
    news_items = [
        {
            "title": "Bitcoin Reaches New All-Time High",
            "source": "CryptoNews",
            "url": "https://cryptopanic.com/news/?q=Bitcoin+Reaches+New"
        },
        {
            "title": "Ethereum 2.0 Staking Reaches Milestone",
            "source": "BlockchainDaily",
            "url": "https://cryptopanic.com/news/?q=Ethereum+Staking+Milestone"
        },
        {
            "title": "Solana Network Sees Record Transaction Volume",
            "source": "CryptoInsider",
            "url": "https://cryptopanic.com/news/?q=Solana+Network+Record"
        },
        {
            "title": "Regulatory Clarity Improves Market Sentiment",
            "source": "CryptoRegulation",
            "url": "https://cryptopanic.com/news/?q=Regulatory+Clarity+Market"
        }
    ]
    return Response(news_items)


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
            # Default to BTC and ETH if no preferences
            crypto_assets = ['BTC', 'ETH']
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_insight(request):
    """Get AI insight of the day using Hugging Face Inference API (free) or personalized fallback"""
    # Get user preferences for personalized insights
    try:
        preferences = UserPreferences.objects.get(user=request.user)
        crypto_assets = preferences.crypto_assets if preferences.crypto_assets else ['BTC', 'ETH']
        investor_type = preferences.investor_type or 'investor'
    except UserPreferences.DoesNotExist:
        crypto_assets = ['BTC', 'ETH']
        investor_type = 'investor'
    
    # Try Hugging Face Inference API (free, no API key required)
    # Note: This may be slow or unavailable sometimes, so we have a good fallback
    try:
        # Use a text generation model that's publicly available
        prompt = f"Daily crypto market insight for {investor_type} interested in {', '.join(crypto_assets)}:"
        
        response = requests.post(
            'https://api-inference.huggingface.co/models/gpt2',
            headers={
                'Content-Type': 'application/json',
            },
            json={
                'inputs': prompt,
                'parameters': {
                    'max_length': 100,
                    'temperature': 0.8,
                    'return_full_text': False,
                }
            },
            timeout=8
        )
        
        if response.status_code == 200:
            data = response.json()
            # Hugging Face returns different formats depending on the model
            generated_text = None
            
            if isinstance(data, list) and len(data) > 0:
                # Format: [{"generated_text": "..."}]
                generated_text = data[0].get('generated_text', '').strip()
            elif isinstance(data, dict):
                # Format: {"generated_text": "..."}
                generated_text = data.get('generated_text', '').strip()
            
            # Clean up the text - remove the prompt if it's included
            if generated_text:
                # Remove the prompt from the beginning if present
                if prompt.lower() in generated_text.lower():
                    generated_text = generated_text.replace(prompt, '').strip()
                
                # Ensure we got meaningful text (not just whitespace or very short)
                if generated_text and len(generated_text) > 20:
                    return Response({
                        'insight': generated_text,
                        'source': 'ai'  # Flag to indicate it's from AI
                    })
    except Exception as e:
        # Log error for debugging but continue to fallback
        import logging
        logging.getLogger(__name__).debug(f"Hugging Face API error: {str(e)}")
        pass  # Fall through to personalized static fallback
    
    # Personalized static fallback based on user preferences
    assets_str = ', '.join(crypto_assets[:2]) if len(crypto_assets) >= 2 else crypto_assets[0] if crypto_assets else 'cryptocurrency'
    
    insights = [
        f"As a {investor_type}, today's crypto market shows strong momentum with {assets_str} leading the charge. Market sentiment remains positive as institutional adoption continues to grow.",
        f"For {investor_type}s focused on {assets_str}, the current market suggests a consolidation phase. Trading volumes are stabilizing, indicating potential accumulation opportunities.",
        f"Today's crypto landscape presents interesting opportunities for {investor_type}s. {assets_str} are showing resilience amid broader market movements, with technical indicators pointing to continued strength.",
        f"Market analysis for {investor_type}s: {assets_str} are demonstrating strong fundamentals. The current trend suggests careful monitoring of key support levels could reveal entry points.",
        f"Daily insight for {investor_type}s: {assets_str} continue to show promising technical patterns. Market participants are watching for potential breakout scenarios in the coming sessions."
    ]
    return Response({
        'insight': random.choice(insights),
        'source': 'fallback'  # Flag to indicate it's from fallback
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meme(request):
    """Return a random crypto meme URL from static list"""
    # Popular crypto meme sources (using placeholder URLs - replace with actual meme URLs)
    meme_urls = [
        "https://i.redd.it/crypto-meme-1.jpg",
        "https://i.redd.it/crypto-meme-2.jpg",
        "https://i.redd.it/crypto-meme-3.jpg",
        "https://i.imgur.com/crypto-meme-1.jpg",
        "https://i.imgur.com/crypto-meme-2.jpg",
        "https://i.imgur.com/crypto-meme-3.jpg",
        "https://i.imgur.com/crypto-meme-4.jpg",
        "https://i.imgur.com/crypto-meme-5.jpg"
    ]
    return Response({
        'url': random.choice(meme_urls)
    })

