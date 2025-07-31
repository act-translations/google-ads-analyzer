// server.js - Vereinfachtes Backend für Tests
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Session Storage
const sessions = new Map();

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Google Ads Analyzer Backend läuft!' });
});

// 1. Simulierte OAuth - Erstellt direkt eine Session
app.get('/auth/google', (req, res) => {
  console.log('Creating test session without real OAuth...');
  
  // Direkt Test-Session erstellen
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    tokens: { access_token: 'test_token', token_type: 'Bearer' },
    createdAt: new Date(),
    isTestSession: true
  });
  
  console.log('Test session created:', sessionId);
  
  // Direkte Weiterleitung (simuliert erfolgreiche OAuth)
  const redirectUrl = `http://localhost:3000?session=${sessionId}&test=true`;
  res.json({ authUrl: redirectUrl });
});

// 2. Fallback Callback (falls noch aufgerufen)
app.get('/auth/callback', (req, res) => {
  console.log('Callback received - redirecting to test session');
  
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    tokens: { access_token: 'test_token', token_type: 'Bearer' },
    createdAt: new Date(),
    isTestSession: true
  });
  
  res.redirect(`http://localhost:3000?session=${sessionId}&test=true`);
});

// 3. Kampagnen abrufen
app.get('/api/campaigns', async (req, res) => {
  const { session } = req.query;
  
  console.log('Campaign request for session:', session);
  
  if (!isValidSession(session)) {
    console.log('Invalid session');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Realistische Test-Daten
    const testCampaigns = [
      {
        id: '1',
        name: '🏆 Hauptkampagne Produkte',
        status: 'ENABLED',
        impressions: 15420,
        clicks: 892,
        cost: 1250.45,
        conversions: 23,
        ctr: 5.79,
        cpc: 1.40,
        conversionRate: 2.58
      },
      {
        id: '2',
        name: '🎯 Brand Keywords',
        status: 'ENABLED',
        impressions: 8930,
        clicks: 456,
        cost: 650.23,
        conversions: 18,
        ctr: 5.11,
        cpc: 1.43,
        conversionRate: 3.95
      },
      {
        id: '3',
        name: '🚀 Performance Campaign',
        status: 'ENABLED',
        impressions: 12350,
        clicks: 617,
        cost: 925.80,
        conversions: 31,
        ctr: 5.00,
        cpc: 1.50,
        conversionRate: 5.02
      }
    ];
    
    console.log('Sending test campaigns');
    res.json(testCampaigns);
    
  } catch (error) {
    console.error('Campaign fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// 4. Analyse mit detaillierteren Empfehlungen
app.post('/api/analyze', async (req, res) => {
  const { session, campaignData } = req.body;
  
  console.log('Analysis request for session:', session);
  
  if (!isValidSession(session)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Echte Analyse basierend auf Kampagnendaten
    let score = 75;
    const recommendations = [];
    
    if (campaignData && campaignData.length > 0) {
      // Performance-basierte Analysen
      const avgCTR = campaignData.reduce((sum, c) => sum + c.ctr, 0) / campaignData.length;
      const avgConversionRate = campaignData.reduce((sum, c) => sum + c.conversionRate, 0) / campaignData.length;
      const totalCost = campaignData.reduce((sum, c) => sum + c.cost, 0);
      
      // CTR Analyse
      if (avgCTR > 5.5) {
        score += 10;
        recommendations.push({
          type: "success",
          title: "🎯 Excellent Click-Through-Rate",
          description: `Durchschnittliche CTR von ${avgCTR.toFixed(2)}% liegt über dem Branchendurchschnitt`,
          action: "Erfolgreiche Anzeigentexte als Template für neue Kampagnen nutzen",
          priority: "low"
        });
      } else if (avgCTR < 3.0) {
        score -= 10;
        recommendations.push({
          type: "warning",
          title: "⚠️ Niedrige Click-Through-Rate",
          description: `CTR von ${avgCTR.toFixed(2)}% unter dem Branchendurchschnitt`,
          action: "Anzeigentexte überarbeiten, A/B-Tests starten",
          priority: "high"
        });
      }
      
      // Conversion Rate Analyse
      if (avgConversionRate < 3.0) {
        score -= 15;
        recommendations.push({
          type: "warning",
          title: "📉 Conversion-Rate optimierungsbedürftig",
          description: `Durchschnittliche Conversion-Rate von ${avgConversionRate.toFixed(2)}% könnte verbessert werden`,
          action: "Landing Pages optimieren, Negative Keywords hinzufügen",
          priority: "high"
        });
      } else {
        score += 5;
        recommendations.push({
          type: "success",
          title: "✅ Gute Conversion Performance",
          description: `Conversion-Rate von ${avgConversionRate.toFixed(2)}% ist solide`,
          action: "Performance-Kampagnen weiter ausbauen",
          priority: "medium"
        });
      }
      
      // Budget-Empfehlungen
      const bestPerformer = campaignData.reduce((best, current) => 
        current.conversionRate > best.conversionRate ? current : best
      );
      
      recommendations.push({
        type: "info",
        title: "💰 Budget-Optimierung möglich",
        description: `"${bestPerformer.name}" zeigt beste Performance (${bestPerformer.conversionRate.toFixed(2)}% CR)`,
        action: `Budget von schwächeren Kampagnen zu "${bestPerformer.name}" umschichten`,
        priority: "medium"
      });
    }
    
    // Allgemeine Empfehlungen
    recommendations.push({
      type: "success",
      title: "🎉 Test-Integration erfolgreich",
      description: "Die Google Ads Analyzer App funktioniert einwandfrei mit Test-Daten",
      action: "Bereit für echte Google Ads API Integration",
      priority: "low"
    });
    
    const analysis = {
      overallScore: Math.min(Math.max(score, 0), 100), // Zwischen 0-100
      recommendations: recommendations,
      summary: {
        totalCampaigns: campaignData ? campaignData.length : 0,
        totalCost: campaignData ? campaignData.reduce((sum, c) => sum + c.cost, 0) : 0,
        avgCTR: campaignData ? (campaignData.reduce((sum, c) => sum + c.ctr, 0) / campaignData.length) : 0
      }
    };
    
    console.log('Sending detailed analysis');
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

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📊 Google Ads Analyzer Backend bereit`);
  console.log(`🔗 Test: http://localhost:${PORT}`);
  console.log(`🧪 Test-Modus: OAuth umgangen, direkte Sessions`);
});
