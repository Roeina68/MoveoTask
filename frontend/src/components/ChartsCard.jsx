import { useEffect, useRef, useState } from 'react';
import Card from './Card';
import ChartsSkeleton from './ChartsSkeleton';
import client from '../api/client';

function ChartsCard({ prices, onUpvote, onDownvote, userVote }) {
  const chartContainerRef = useRef(null);
  const [timePeriod, setTimePeriod] = useState('7d'); // 1d, 7d, 30d, 1y
  const [priceHistory, setPriceHistory] = useState({});
  const [allHistoryData, setAllHistoryData] = useState({}); // Store all periods: { '1d': {...}, '7d': {...}, etc }
  const [loading, setLoading] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState(() => {
    // Initialize with all available assets from prices
    return Object.keys(prices || {});
  });

  // Fetch all time periods at once when component mounts or prices change
  useEffect(() => {
    const fetchAllHistory = async () => {
      if (!prices || Object.keys(prices).length === 0) {
        setLoading(false);
        setPriceHistory({});
        setAllHistoryData({});
        return;
      }

      try {
        setLoading(true);
        setAllHistoryData({});
        setPriceHistory({});
        
        // Fetch all periods in one request - backend handles rate limiting
        const periods = ['7d', '1y']        ;
        const fetchResults = [];
        
        try {
          const response = await client.get('/dashboard/price-history-all/');
          const responseData = response.data || {};
          
          // Convert to our expected format
          periods.forEach(period => {
            const data = responseData[period] || {};
            const hasValidData = data && typeof data === 'object' && 
              Object.keys(data).length > 0 &&
              Object.values(data).some(arr => Array.isArray(arr) && arr.length > 0);
            
            if (hasValidData) {
              fetchResults.push({ period, data, success: true });
            } else {
              console.warn(`No valid data for ${period} period`);
              fetchResults.push({ period, data: {}, success: false });
            }
          });
        } catch (err) {
          console.error('Error fetching all price history:', err);
          // If the all endpoint fails, mark all as failed
          periods.forEach(period => {
            fetchResults.push({ period, data: {}, success: false });
          });
        }
        
        const results = fetchResults;
        
        // Store all data - only store if it has valid price arrays
        const allData = {};
        results.forEach(({ period, data, success }) => {
          if (success && data && typeof data === 'object' && Object.keys(data).length > 0) {
            // Verify data has actual price arrays
            const hasValidArrays = Object.values(data).some(arr => 
              Array.isArray(arr) && arr.length > 0 && Array.isArray(arr[0])
            );
            if (hasValidArrays) {
              allData[period] = data;
            }
          }
        });
        
        // Only set data if we have at least one valid period
        if (Object.keys(allData).length > 0) {
          setAllHistoryData(allData);
          
          // Set initial period data - prefer requested period, fallback to any available
          if (allData[timePeriod] && Object.keys(allData[timePeriod]).length > 0) {
            setPriceHistory(allData[timePeriod]);
          } else {
            // Try to use any available data as fallback
            const firstAvailablePeriod = Object.keys(allData)[0];
            if (firstAvailablePeriod && allData[firstAvailablePeriod]) {
              setPriceHistory(allData[firstAvailablePeriod]);
              // Only update timePeriod if we have to fallback
              if (firstAvailablePeriod !== timePeriod) {
                setTimePeriod(firstAvailablePeriod);
              }
            } else {
              setPriceHistory({});
            }
          }
        } else {
          // No valid data received - don't cache empty data
          console.warn('No valid price history data received for any period');
          setAllHistoryData({});
          setPriceHistory({});
        }
      } catch (err) {
        console.error('Error fetching price history:', err);
        setAllHistoryData({});
        setPriceHistory({});
      } finally {
        setLoading(false);
      }
    };

    fetchAllHistory();
  }, [prices]); // Only depend on prices, not timePeriod

  // Update selected assets when prices change
  useEffect(() => {
    if (prices && Object.keys(prices).length > 0) {
      const availableAssets = Object.keys(prices);
      // Keep only assets that are still available, add new ones
      setSelectedAssets(prev => {
        const filtered = prev.filter(asset => availableAssets.includes(asset));
        const newAssets = availableAssets.filter(asset => !prev.includes(asset));
        return [...filtered, ...newAssets];
      });
    }
  }, [prices]);

  // Update displayed data when time period changes (using cached data)
  useEffect(() => {
    if (!loading && allHistoryData[timePeriod] && Object.keys(allHistoryData[timePeriod]).length > 0) {
      setPriceHistory(allHistoryData[timePeriod]);
    } else if (!loading && Object.keys(allHistoryData).length > 0) {
      // If current period not available, use first available
      const firstAvailable = Object.keys(allHistoryData)[0];
      if (firstAvailable) {
        setPriceHistory(allHistoryData[firstAvailable]);
      }
    }
  }, [timePeriod, allHistoryData, loading]);

  useEffect(() => {
    if (!chartContainerRef.current || Object.keys(priceHistory).length === 0 || loading) {
      return;
    }

    // Small delay to ensure canvas is ready and DOM is updated
    const timeoutId = setTimeout(() => {
      if (!chartContainerRef.current) return;
      
      const canvas = chartContainerRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get actual canvas dimensions
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || canvas.offsetWidth || 400;
      const height = 180;
      
      // Set canvas size (this clears the canvas)
      canvas.width = width;
      canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);

    // Filter assets based on selectedAssets
    const availableAssets = Object.keys(priceHistory).filter(asset => selectedAssets.includes(asset));
    const colors = ['#3B82F6', '#6366F1', '#10B981'];
    const padding = { top: 25, right: 20, bottom: 35, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Process price history data - format: [[timestamp, price], ...]
    const processedData = {};
    const allPrices = [];
    const allTimestamps = [];
    
    availableAssets.forEach(asset => {
      const rawData = priceHistory[asset];
      if (rawData && Array.isArray(rawData) && rawData.length > 0) {
        // Extract prices and timestamps
        const prices = rawData.map(item => item[1]); // item is [timestamp, price]
        const timestamps = rawData.map(item => item[0]);
        processedData[asset] = { prices, timestamps };
        allPrices.push(...prices);
        allTimestamps.push(...timestamps);
      }
    });

    if (allPrices.length === 0) return;

    // Find min/max across all assets
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw price lines for each asset
    availableAssets.forEach((asset, assetIndex) => {
      if (!processedData[asset]) return;
      
      const { prices, timestamps } = processedData[asset];
      const color = colors[assetIndex % colors.length];
      
      // Draw line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      prices.forEach((price, pointIndex) => {
        const x = padding.left + (chartWidth / (prices.length - 1)) * pointIndex;
        const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
        if (pointIndex === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw points (only on key points to avoid clutter)
      ctx.fillStyle = color;
      const pointInterval = Math.max(1, Math.floor(prices.length / 10)); // Show ~10 points max
      prices.forEach((price, pointIndex) => {
        if (pointIndex % pointInterval === 0 || pointIndex === prices.length - 1) {
          const x = padding.left + (chartWidth / (prices.length - 1)) * pointIndex;
          const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw asset label
      const lastX = padding.left + chartWidth;
      const lastPrice = prices[prices.length - 1];
      const lastY = padding.top + chartHeight - ((lastPrice - minPrice) / priceRange) * chartHeight;
      ctx.fillStyle = color;
      ctx.font = '11px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(asset, lastX + 8, lastY);
    });

    // Draw Y-axis labels
    ctx.fillStyle = 'var(--textMuted)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (priceRange / 4) * (4 - i);
      const y = padding.top + (chartHeight / 4) * i;
      const label = price >= 1000 ? `$${(price / 1000).toFixed(1)}k` : `$${price.toFixed(0)}`;
      ctx.fillText(label, padding.left - 8, y + 3);
    }

    // Draw X-axis labels with actual dates
    ctx.fillStyle = 'var(--textMuted)';
    ctx.font = '9px Inter';
    ctx.textAlign = 'center';
    
    // Get timestamps from first asset (all should have same timestamps)
    const firstAsset = availableAssets.find(a => processedData[a]);
    if (firstAsset && processedData[firstAsset]) {
      const timestamps = processedData[firstAsset].timestamps;
      const numLabels = timePeriod === '1d' ? 6 : timePeriod === '7d' ? 7 : timePeriod === '30d' ? 5 : 6;
      const labelInterval = Math.max(1, Math.floor(timestamps.length / numLabels));
      
      for (let i = 0; i < timestamps.length; i += labelInterval) {
        if (i >= timestamps.length) break;
        const timestamp = timestamps[i];
        const date = new Date(timestamp);
        
        let label;
        if (timePeriod === '1d') {
          label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (timePeriod === '7d') {
          label = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (timePeriod === '30d') {
          label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else { // 1y
          label = date.toLocaleDateString('en-US', { month: 'short' });
        }
        
        const x = padding.left + (chartWidth / (timestamps.length - 1)) * i;
        ctx.fillText(label, x, height - 10);
      }
      
      // Always show last date
      if (timestamps.length > 0) {
        const lastTimestamp = timestamps[timestamps.length - 1];
        const lastDate = new Date(lastTimestamp);
        let lastLabel;
        if (timePeriod === '1d') {
          lastLabel = lastDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (timePeriod === '7d') {
          lastLabel = lastDate.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (timePeriod === '30d') {
          lastLabel = lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          lastLabel = lastDate.toLocaleDateString('en-US', { month: 'short' });
        }
        const lastX = padding.left + chartWidth;
        ctx.fillText(lastLabel, lastX, height - 10);
      }
    }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [priceHistory, timePeriod, loading, selectedAssets]);

  return (
    <Card
      title="Price Trends"
      content={
        <div style={{ width: '100%', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {loading && Object.keys(allHistoryData).length === 0 ? (
            <ChartsSkeleton />
          ) : Object.keys(priceHistory).length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px', flexShrink: 0 }}>
                {/* Asset Filter */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--textMuted)', marginRight: '4px' }}>Show:</span>
                  {Object.keys(priceHistory).map((asset) => (
                    <label
                      key={asset}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: selectedAssets.includes(asset) ? 'var(--text)' : 'var(--textMuted)',
                        userSelect: 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssets(prev => [...prev, asset]);
                          } else {
                            // Don't allow unchecking if it's the last one
                            if (selectedAssets.length > 1) {
                              setSelectedAssets(prev => prev.filter(a => a !== asset));
                            }
                          }
                        }}
                        style={{
                          cursor: 'pointer',
                          accentColor: 'var(--primary)'
                        }}
                      />
                      <span style={{ fontWeight: selectedAssets.includes(asset) ? '600' : '400' }}>{asset}</span>
                    </label>
                  ))}
                </div>
                
                {/* Time Period Selector */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {['7d', '1y'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        if (allHistoryData[period] && Object.keys(allHistoryData[period]).length > 0) {
                          setTimePeriod(period);
                        }
                      }}
                      disabled={!allHistoryData[period] || Object.keys(allHistoryData[period] || {}).length === 0}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        background: timePeriod === period ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                        color: timePeriod === period ? 'white' : 'var(--textSecondary)',
                        border: `1px solid ${timePeriod === period ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '6px',
                        cursor: (!allHistoryData[period] || Object.keys(allHistoryData[period] || {}).length === 0) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: timePeriod === period ? '600' : '400',
                        opacity: (!allHistoryData[period] || Object.keys(allHistoryData[period] || {}).length === 0) ? 0.5 : 1
                      }}
                    >
                      {period === '1d' ? '1D' : period === '7d' ? '7D' : period === '30d' ? '30D' : '1Y'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ width: '100%', height: '180px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <canvas
                  ref={chartContainerRef}
                  style={{ width: '100%', height: '180px', borderRadius: '8px', display: 'block' }}
                />
              </div>
            </>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--textMuted)' }}>
              {loading ? 'Loading chart data...' : 'No chart data available'}
            </div>
          )}
        </div>
      }
      onUpvote={onUpvote}
      onDownvote={onDownvote}
      userVote={userVote}
    />
  );
}

export default ChartsCard;
