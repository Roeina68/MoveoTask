import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import ChartsCard from '../components/ChartsCard';
import NewsSkeleton from '../components/NewsSkeleton';
import InsightSkeleton from '../components/InsightSkeleton';
import PricesSkeleton from '../components/PricesSkeleton';
import MemeSkeleton from '../components/MemeSkeleton';
import ChartsSkeleton from '../components/ChartsSkeleton';
import client from '../api/client';

function Dashboard() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [prices, setPrices] = useState({});
  const [aiInsight, setAiInsight] = useState('');
  const [aiSource, setAiSource] = useState(null); // Track if insight is from AI or fallback
  const [memeUrl, setMemeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({}); // Track user votes: { section: vote_value }
  const [preferences, setPreferences] = useState({
    crypto_assets: [],
    content_preferences: []
  });
  const [showMemeModal, setShowMemeModal] = useState(false);
  const didFetch = useRef(false);

  const fetchAllData = async () => {
    try {
      const [newsRes, pricesRes, votesRes, prefsRes] = await Promise.all([
        client.get('/dashboard/news/'),
        client.get('/dashboard/prices/'),
        client.get('/dashboard/votes/'),
        client.get('/preferences/'),
      ]);
      setNews(newsRes.data);
      setPrices(pricesRes.data);
      setVotes(votesRes.data || {});
      setPreferences(prefsRes.data || { crypto_assets: [], content_preferences: [] });
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchAiAndMeme = async () => {
    try {
      const [aiRes, memeRes] = await Promise.all([
        client.get('/dashboard/ai-insight/'),
        client.get('/dashboard/meme/'),
      ]);
  
      // Only update if the AI result is not a downgrade
      if (!(aiSource === 'ai' && aiRes.data.source === 'fallback')) {
        setAiInsight(aiRes.data.insight);
        setAiSource(aiRes.data.source || 'fallback');
      }
  
      if (memeRes.data.url) {
        setMemeUrl(memeRes.data.url);
      } else {
        setMemeUrl(null);
      }
  
    } catch (err) {
      console.error('Error fetching AI/Meme:', err);
    }
  };
  

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const loadData = async () => {
      setLoading(true);
      await fetchAllData();
      await fetchAiAndMeme();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    await fetchAiAndMeme();
  };

  const handleVote = async (section, voteValue) => {
    try {
      // If clicking the same vote, toggle it off by setting to opposite
      const currentVote = votes[section];
      const newVote = currentVote === voteValue ? (voteValue === 1 ? -1 : 1) : voteValue;
      
      await client.post('/dashboard/vote/', { section, vote: newVote });
      setVotes(prev => ({ ...prev, [section]: newVote }));
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Calculate content preferences early
  const contentPrefs = preferences.content_preferences || [];
  const cryptoAssets = preferences.crypto_assets || [];
  const showMarketNews = contentPrefs.includes('Market News');
  const showCharts = contentPrefs.includes('Charts');
  const showSocial = contentPrefs.includes('Social');
  const showFun = contentPrefs.includes('Fun');

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Portfolio Intelligence</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/preferences')} className="refresh-btn">
              Preferences
            </button>
            <button onClick={handleRefresh} className="refresh-btn">
              Refresh Content
            </button>
            <button onClick={handleLogout} className="refresh-btn" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
              Logout
            </button>
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="left-column">
            {showMarketNews && (
              <Card
                title="Market News"
                content={<NewsSkeleton />}
                onUpvote={() => {}}
                onDownvote={() => {}}
              />
            )}
            {showCharts && (
              <Card
                title="Price Trends"
                content={<ChartsSkeleton />}
                onUpvote={() => {}}
                onDownvote={() => {}}
              />
            )}
          </div>
          <Card
            title="AI Insight of the Day"
            content={<InsightSkeleton />}
            onUpvote={() => {}}
            onDownvote={() => {}}
          />
          <div className="stacked-column">
            <Card
              title="Coin Prices"
              content={<PricesSkeleton />}
              onUpvote={() => {}}
              onDownvote={() => {}}
            />
            {showFun && (
              <Card
                title="Fun Crypto Meme"
                content={<MemeSkeleton />}
                onUpvote={() => {}}
                onDownvote={() => {}}
              />
            )}
            {showSocial && (
              <Card
                title="Social"
                content={<div><p style={{ color: 'var(--textSecondary)' }}>Social features coming soon...</p></div>}
                onUpvote={() => {}}
                onDownvote={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filter prices to only show selected assets
  const filteredPrices = Object.fromEntries(
    Object.entries(prices).filter(([asset]) => cryptoAssets.includes(asset))
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Portfolio Intelligence</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/preferences')} className="refresh-btn">
            Preferences
          </button>
          <button onClick={handleRefresh} className="refresh-btn">
            Refresh Content
          </button>
          <button onClick={handleLogout} className="refresh-btn" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="left-column">
          {showMarketNews && (
            <Card
              title="Market News"
              content={
                <div className="news-list">
                  {news.length > 0 ? (
                    news.map((item, idx) => (
                      <div key={idx} className="news-item">
                        <h4>{item.title}</h4>
                        <p className="news-source">{item.source}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          Read more
                        </a>
                      </div>
                    ))
                  ) : (
                    <NewsSkeleton />
                  )}
                </div>
              }
              onUpvote={() => handleVote('news', 1)}
              onDownvote={() => handleVote('news', -1)}
              userVote={votes.news}
            />
          )}
          {showCharts && (
            <ChartsCard
              prices={filteredPrices}
              onUpvote={() => handleVote('trends', 1)}
              onDownvote={() => handleVote('trends', -1)}
              userVote={votes.trends}
            />
          )}
        </div>
        <Card
          title="AI Insight of the Day"
          content={
            <div>
              {aiInsight ? (
                <>
                  <p className="ai-insight">{aiInsight}</p>
                  {aiSource && (
                    <p className="ai-insight-source">
                      {aiSource === 'ai' ? 'Generated by AI' : 'Personalized insight'}
                    </p>
                  )}
                </>
              ) : (
                <InsightSkeleton />
              )}
            </div>
          }
          onUpvote={() => handleVote('ai', 1)}
          onDownvote={() => handleVote('ai', -1)}
          userVote={votes.ai}
        />
        <div className="stacked-column">
          <Card
            title="Coin Prices"
            content={
              <div className="prices-list">
                {Object.keys(filteredPrices).length > 0 ? (
                  Object.entries(filteredPrices).map(([asset, price]) => (
                    <div key={asset} className="price-item">
                      <strong>{asset}:</strong> ${typeof price === 'number' ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                    </div>
                  ))
                ) : (
                  <PricesSkeleton />
                )}
              </div>
            }
            onUpvote={() => handleVote('prices', 1)}
            onDownvote={() => handleVote('prices', -1)}
            userVote={votes.prices}
          />
          {showFun && (
            <>
              <Card
                title="Fun Crypto Meme"
                content={
                  <div className="meme-container">
                    {memeUrl ? (
                      <img 
                        src={memeUrl} 
                        alt="Crypto Meme" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '10px',
                          display: 'block',
                          margin: '0 auto',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease'
                        }}
                        onClick={() => setShowMemeModal(true)}
                        onError={(e) => {
                          // Hide image on error and show error message
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent && !parent.querySelector('.meme-error')) {
                            const errorMsg = document.createElement('p');
                            errorMsg.className = 'meme-error';
                            errorMsg.textContent = 'Meme unavailable';
                            errorMsg.style.color = 'var(--textMuted)';
                            parent.appendChild(errorMsg);
                          }
                        }} 
                      />
                    ) : memeUrl === null ? (
                      <p style={{ color: 'var(--textMuted)' }}>Meme unavailable</p>
                    ) : (
                      <MemeSkeleton />
                    )}
                  </div>
                }
                onUpvote={() => handleVote('meme', 1)}
                onDownvote={() => handleVote('meme', -1)}
                userVote={votes.meme}
              />
              
              {/* Meme Modal */}
              {showMemeModal && memeUrl && (
                <div className="meme-modal-overlay" onClick={() => setShowMemeModal(false)}>
                  <div className="meme-modal-content" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="meme-modal-close"
                      onClick={() => setShowMemeModal(false)}
                      aria-label="Close modal"
                    >
                      ×
                    </button>
                    <img 
                      src={memeUrl} 
                      alt="Crypto Meme" 
                      className="meme-modal-image"
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {showSocial && (
            <Card
              title="Social"
              content={
                <div>
                  <p style={{ color: 'var(--textSecondary)' }}>Social features coming soon...</p>
                </div>
              }
              onUpvote={() => handleVote('social', 1)}
              onDownvote={() => handleVote('social', -1)}
              userVote={votes.social}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

