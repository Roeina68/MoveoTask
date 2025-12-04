import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

function Onboarding() {
  const [cryptoAssets, setCryptoAssets] = useState([]);
  const [investorType, setInvestorType] = useState('');
  const [contentPreferences, setContentPreferences] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const availableAssets = ['BTC', 'ETH', 'SOL'];
  const availablePreferences = ['Market News', 'Charts', 'Social', 'Fun'];

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

    if (!investorType) {
      setError('Please select an investor type');
      return;
    }

    try {
      await client.post('/onboarding/', {
        crypto_assets: cryptoAssets,
        investor_type: investorType,
        content_preferences: contentPreferences,
      });
      // Reload to update auth state in App component
      window.location.href = '/dashboard';
    } catch (err) {
      setError(
        err.response?.data?.message ||
        Object.values(err.response?.data || {}).flat().join(', ') ||
        'Failed to save preferences'
      );
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h2>Welcome! Let's get started</h2>
        <p style={{ marginBottom: '24px', color: '#666' }}>Please answer a few questions to personalize your experience.</p>
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
          <button type="submit">Complete Onboarding</button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;

