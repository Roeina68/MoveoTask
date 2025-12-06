import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

function Preferences() {
  const navigate = useNavigate();
  const [cryptoAssets, setCryptoAssets] = useState([]);
  const [investorType, setInvestorType] = useState('');
  const [contentPreferences, setContentPreferences] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const availableAssets = ['BTC', 'ETH', 'SOL'];
  const availablePreferences = ['Market News', 'Charts', 'Social', 'Fun'];

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await client.get('/preferences/');
        setCryptoAssets(response.data.crypto_assets || []);
        setInvestorType(response.data.investor_type || '');
        setContentPreferences(response.data.content_preferences || []);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleAssetToggle = (asset) => {
    setCryptoAssets((prev) =>
      prev.includes(asset)
        ? prev.filter((a) => a !== asset)
        : [...prev, asset]
    );
  };

  const handlePreferenceToggle = (pref) => {
    setContentPreferences((prev) =>
      prev.includes(pref)
        ? prev.filter((p) => p !== pref)
        : [...prev, pref]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!investorType) {
      setError('Please select an investor type');
      return;
    }

    try {
      await client.put('/preferences/update/', {
        crypto_assets: cryptoAssets,
        investor_type: investorType,
        content_preferences: contentPreferences,
      });
      setSuccess('Preferences updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        Object.values(err.response?.data || {}).flat().join(', ') ||
        'Failed to update preferences'
      );
    }
  };

  if (loading) {
    return <div className="onboarding-container">Loading...</div>;
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2>Update Preferences</h2>
        <p style={{ marginBottom: '24px', color: 'var(--textSecondary)' }}>Update your preferences to personalize your experience.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>What crypto assets are you interested in? (check all that apply)</label>
            <div className="checkbox-group">
              {availableAssets.map((asset) => (
                <label key={asset} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cryptoAssets.includes(asset)}
                    onChange={() => handleAssetToggle(asset)}
                  />
                  {asset}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>What type of investor are you?</label>
            <select
              value={investorType}
              onChange={(e) => setInvestorType(e.target.value)}
              required
            >
              <option value="">Select...</option>
              <option value="HODLer">HODLer</option>
              <option value="Day Trader">Day Trader</option>
              <option value="NFT Collector">NFT Collector</option>
            </select>
          </div>

          <div className="form-group">
            <label>What kind of content would you like to see? (check all that apply)</label>
            <div className="checkbox-group">
              {availablePreferences.map((pref) => (
                <label key={pref} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={contentPreferences.includes(pref)}
                    onChange={() => handlePreferenceToggle(pref)}
                  />
                  {pref}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div style={{ color: 'var(--success)', marginBottom: '16px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>{success}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => navigate('/dashboard')} style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button type="submit">Update Preferences</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Preferences;

