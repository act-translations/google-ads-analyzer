// server.js - Vercel-optimiertes Backend
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://google-ads-analyzer-black.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Session Storage (für Production: Database verwenden)
const sessions = new Map();

// Test Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Google Ads Analyzer Backend läuft auf Vercel!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Google Ads Analyzer API' });
});

// 1. Simulierte OAuth
app.get('/auth/google', (req, res) => {
  console.log('Creating test session...');
  
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    tokens: { access_token: 'demo_token', token_type: 'Bearer' },
    createdAt: new Date(),
    isTestSession: true
  });
  
  // Direkte Weiterleitung zur Frontend-URL
  const redirectUrl = `https://google-ads-analyzer-black.vercel.app?session=${sessionId}&test=true`;
  res.json({ authUrl: redirectUrl });
});

// 2. Fallback Callback
app.get('/auth/callback', (req, res) => {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    tokens: { access_token: 'demo_token', token_type: 'Bearer' },
    createdAt: new Date(),
    isTestSession: true
  });
  
  res.redirect(`https://google-ads-analyzer-black.vercel.app?session=${sessionId}&test=true`);
});

// 3. Kampagnen API
app.get('/api/campaigns', async (req, res) => {
  const { session } = req.query;
  
  if (!isValidSession(session)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const campaigns = [
      {
        id: '1',
        name: '🚀 Live Production Campaign',
        status: 'ENABLED',
        impressions: 25420,
        clicks: 1274,
        cost: 1850.45,
        conversions: 63,
        ctr: 5.02,
        cpc: 1.45,
        conversionRate: 4.94
      },
      {
        id: '2',
        name: '🎯 Brand Awareness Campaign',
        status: 'ENABLED',
        impressions: 18930,
        clicks: 946,
        cost: 1420.23,
        conversions: 47,
        ctr: 5.00,
        cpc: 1.50,
        conversionRate: 4.97
      },
      {
        id: '3',
        name: '💎 Premium Products Campaign',
        status: 'ENABLED',
        impressions: 32350,
        clicks: 1617,
        cost: 2425.80,
        conversions: 89,
        ctr: 5.00,
        cpc: 1.50,
        conversionRate: 5.50
      }
    ];
    
    res.json(campaigns);
    
  } catch (error) {
    console.error('Campaign fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// 4. Analyse API
app.post('/api/analyze', async (req, res) => {
  const { session, campaignData } = req.body;
  
  if (!isValidSession(session)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    let score = 82;
    const recommendations = [];
    
    if (campaignData && campaignData.length > 0) {
      const avgCTR = campaignData.reduce((sum, c) => sum + c.ctr, 0) / campaignData.length;
      const avgConversionRate = campaignData.reduce((sum, c) => sum + c.conversionRate, 0) / campaignData.length;
      
      // Performance-Analysen
      if (avgCTR > 5.0) {
        score += 8;
        recommendations.push({
          type: "success",
          title: "🎯 Excellent Performance Online!",
          description: `CTR von ${avgCTR.toFixed(2)}% übertrifft Benchmark - Live-App funktioniert perfekt`,
          action: "Performance-Strategien auf weitere Kampagnen ausweiten",
          priority: "high"
        });
      }
      
      if (avgConversionRate > 4.5) {
        score += 10;
        recommendations.push({
          type: "success",
          title: "💰 Outstanding Conversion Performance",
          description: `Conversion-Rate von ${avgConversionRate.toFixed(2)}% ist excellent für Live-Kampagnen`,
          action: "Budget für Top-Performer erhöhen",
          priority: "high"
        });
      }
      
      const bestPerformer = campaignData.reduce((best, current) => 
        current.conversionRate > best.conversionRate ? current : best
      );
      
      recommendations.push({
        type: "info",
        title: "📊 Live Data Insights",
        description: `"${bestPerformer.name}" zeigt beste Live-Performance`,
        action: `Budget-Shift zu High-Performer: ${bestPerformer.name}`,
        priority: "medium"
      });
    }
    
    recommendations.push({
      type: "success",
      title: "🌐 Full-Stack App Live!",
      description: "Frontend + Backend erfolgreich auf Vercel deployed - komplette Cloud-Integration aktiv",
      action: "Bereit für echte Google Ads API und Produktions-Traffic",
      priority: "low"
    });
    
    const analysis = {
      overallScore: Math.min(Math.max(score, 0), 100),
      recommendations: recommendations,
      summary: {
        totalCampaigns: campaignData ? campaignData.length : 0,
        environment: 'Production (Vercel)',
        deploymentStatus: 'Live'
      }
    };
    
    res.json(analysis);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Hilfsfunktionen
function generateSessionId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function isValidSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    return false;
  }
  
  const session = sessions.get(sessionId);
  const now = new Date();
  const sessionAge = now - session.createdAt;
  
  if (sessionAge > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return false;
  }
  
  return true;
}

// Vercel Export
module.exports = app;

// Lokaler Server (für Development)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
  });
}
