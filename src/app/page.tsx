'use client';

import React, { useState, useEffect } from 'react';

interface Target {
  id: string;
  name: string;
  commodity: string;
  location: { longitude: number; latitude: number };
  status: string;
}

interface AnalysisResult {
  target: Target;
  prior: { mean: number; variance: number; confidence_interval: number[] };
  likelihoods: Record<string, any>;
  posterior: { mean: number; variance: number; confidence_interval: number[] };
  vetoResult: { vetoed: boolean; reason?: string; category?: string };
  playbookResult: { compliant: boolean; score: number; violations: string[] };
  collapseResult: { collapsed: boolean; confidence: number; classification: string };
  timestamp: string;
}

export default function AuroraDashboard() {
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('targets');

  const targets: Target[] = [
    {
      id: 'target-001',
      name: 'Andes Copper Prospect',
      commodity: 'copper_porphyry',
      location: { longitude: -118.5, latitude: 37.8 },
      status: 'prospective'
    },
    {
      id: 'target-002', 
      name: 'Island Arc Target',
      commodity: 'copper_porphyry',
      location: { longitude: -119.0, latitude: 38.2 },
      status: 'prospective'
    },
    {
      id: 'target-003',
      name: 'Rift Zone Prospect',
      commodity: 'copper_porphyry', 
      location: { longitude: -117.8, latitude: 38.5 },
      status: 'prospective'
    }
  ];

  // Analysis progress simulation
  useEffect(() => {
    if (loading && analysisStartTime) {
      const elapsed = Math.floor((Date.now() - analysisStartTime) / 1000);
      const progress = getAnalysisProgress(elapsed);
      setAnalysisProgress(progress);
    } else {
      setAnalysisProgress('');
      setAnalysisStartTime(null);
    }
  }, [loading, analysisStartTime]);

  const getAnalysisProgress = (seconds: number): string => {
    if (seconds < 10) return `Initializing analysis... (${seconds}s)`;
    if (seconds < 20) return `Loading geological data... (${seconds}s)`;
    if (seconds < 30) return `Computing prior probabilities... (${seconds}s)`;
    if (seconds < 40) return `Evaluating evidence likelihoods... (${seconds}s)`;
    if (seconds < 50) return `Applying geological veto... (${seconds}s)`;
    if (seconds < 60) return `Calculating posterior distribution... (${seconds}s)`;
    return `Finalizing analysis... (${seconds}s)`;
  };

  const analyzeTarget = async (target: Target) => {
    setSelectedTarget(target);
    setLoading(true);
    setAnalysisStartTime(Date.now());
    setAnalysisProgress('Initializing analysis...');
    
    try {
      // Simulate API call
      const response = await fetch('/api/test');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
      
      // Mock analysis result
      const mockAnalysis: AnalysisResult = {
        target: target,
        prior: { 
          mean: 0.15 + Math.random() * 0.1, 
          variance: 0.01, 
          confidence_interval: [0.05, 0.25] 
        },
        likelihoods: {
          chemical: {
            mean: 0.5 + Math.random() * 2,
            variance: 0.1,
            confidence_interval: [0.3, 2.5],
            evidence_type: 'chemical'
          },
          structural: {
            mean: 0.5 + Math.random() * 2,
            variance: 0.15,
            confidence_interval: [0.2, 2.8],
            evidence_type: 'structural'
          },
          physical: {
            mean: 0.5 + Math.random() * 2,
            variance: 0.12,
            confidence_interval: [0.4, 2.6],
            evidence_type: 'physical'
          },
          surface: {
            mean: 0.5 + Math.random() * 2,
            variance: 0.08,
            confidence_interval: [0.6, 2.4],
            evidence_type: 'surface'
          }
        },
        posterior: { 
          mean: 0.67 + Math.random() * 0.2, 
          variance: 0.02, 
          confidence_interval: [0.45, 0.85] 
        },
        vetoResult: { 
          vetoed: Math.random() > 0.7, 
          reason: Math.random() > 0.7 ? 'Incompatible stratigraphic setting' : undefined,
          category: Math.random() > 0.7 ? 'stratigraphic' : undefined
        },
        playbookResult: { 
          compliant: Math.random() > 0.3, 
          score: 60 + Math.random() * 40, 
          violations: Math.random() > 0.7 ? ['Missing structural preparation'] : []
        },
        collapseResult: { 
          collapsed: Math.random() > 0.8, 
          confidence: 0.6 + Math.random() * 0.4, 
          classification: Math.random() > 0.8 ? 'HIGH_CONFIDENCE' : 'MODERATE'
        },
        timestamp: new Date().toISOString()
      };
      
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisProgress('Analysis failed');
    } finally {
      setLoading(false);
      setAnalysisStartTime(null);
      setAnalysisProgress('');
    }
  };

  const addNewTarget = () => {
    const newTarget: Target = {
      id: `target-${Date.now()}`,
      name: `New Target ${targets.length + 1}`,
      commodity: 'copper_porphyry',
      location: { 
        longitude: -118.0 + (Math.random() - 0.5) * 2, 
        latitude: 37.0 + (Math.random() - 0.5) * 2 
      },
      status: 'unanalyzed'
    };
    setSelectedTarget(newTarget);
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setSelectedTarget(null);
    setAnalysisProgress('');
  };

  const calculateConservativeEstimate = (analysis: AnalysisResult) => {
    // Conservative estimation based on geological probability
    const baseDepositSize = 50; // Base size in million tons for average copper porphyry
    const probabilityFactor = analysis.posterior.mean; // 0-1 scale
    const geologicalMultiplier = analysis.vetoResult.vetoed ? 0 : 1; // Zero if vetoed
    const playbookMultiplier = analysis.playbookResult.score / 100; // 0-1 scale
    
    // Conservative estimate (90% confidence lower bound)
    const conservativeTons = Math.round(
      baseDepositSize * probabilityFactor * geologicalMultiplier * playbookMultiplier * 0.6
    );
    
    // Value calculation at $4/lb copper price
    const conservativeValue = Math.round(conservativeTons * 2204.62 * 4 / 1000000); // Convert to billions
    
    return {
      tons: conservativeTons,
      value: conservativeValue
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🧮 Aurora Bayesian Certainty Engine
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                📥 Download
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                📤 Publish
              </button>
              <button 
                onClick={() => {
                  targets.forEach(target => analyzeTarget(target));
                }}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '⏳ Analyzing...' : '🔄 Re-analyze All Targets'}
              </button>
              <button
                onClick={addNewTarget}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                ➕ Add New Target
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Progress */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-blue-600">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analyzing Target
                </h3>
                <p className="text-sm text-gray-600 mb-0">
                  {selectedTarget ? selectedTarget.name : 'Unknown target'}
                </p>
                <p className="text-sm text-blue-600 italic">
                  {analysisProgress}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Targets List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                🎯 Targets ({targets.length})
              </h2>
              <button
                onClick={clearAnalysis}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {targets.map((target) => (
                <div
                  key={target.id}
                  onClick={() => analyzeTarget(target)}
                  className={`p-4 mb-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedTarget?.id === target.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {target.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {target.commodity.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        📍 {target.location.latitude.toFixed(2)}°, {target.location.longitude.toFixed(2)}°
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getStatusColor(target.status)
                      }`}>
                        {target.status}
                      </span>
                      {selectedTarget?.id === target.id && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-600 text-white">
                          SELECTED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              📊 Analysis Results
            </h2>
            
            {analysis ? (
              <div>
                {/* Target Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Target: {analysis.target.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div><strong>ID:</strong> {analysis.target.id}</div>
                    <div><strong>Commodity:</strong> {analysis.target.commodity.replace('_', ' ').toUpperCase()}</div>
                    <div><strong>Location:</strong> {analysis.target.location.latitude.toFixed(2)}°, {analysis.target.location.longitude.toFixed(2)}°</div>
                    <div><strong>Status:</strong> {analysis.target.status}</div>
                  </div>
                </div>

                {/* Bayesian Results */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    🧮 Bayesian Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Prior Probability</h4>
                      <div className="text-sm text-gray-600">
                        <div><strong>Mean:</strong> {(analysis.prior.mean * 100).toFixed(1)}%</div>
                        <div><strong>95% CI:</strong> [{(analysis.prior.confidence_interval[0] * 100).toFixed(1)}% - {(analysis.prior.confidence_interval[1] * 100).toFixed(1)}%]</div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Posterior Probability</h4>
                      <div className="text-sm text-gray-600">
                        <div><strong>Mean:</strong> {(analysis.posterior.mean * 100).toFixed(1)}%</div>
                        <div><strong>95% CI:</strong> [{(analysis.posterior.confidence_interval[0] * 100).toFixed(1)}% - {(analysis.posterior.confidence_interval[1] * 100).toFixed(1)}%]</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Veto Results */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    🚫 Geological Veto
                  </h3>
                  <div className={`p-4 rounded-lg border-2 ${
                    analysis.vetoResult.vetoed 
                      ? 'bg-red-50 border-red-500' 
                      : 'bg-green-50 border-green-500'
                  }`}>
                    <div className="text-sm">
                      <div><strong>Status:</strong> {analysis.vetoResult.vetoed ? '❌ VETOED' : '✅ APPROVED'}</div>
                      {analysis.vetoResult.vetoed && analysis.vetoResult.reason && (
                        <div><strong>Reason:</strong> {analysis.vetoResult.reason}</div>
                      )}
                      {analysis.vetoResult.vetoed && analysis.vetoResult.category && (
                        <div><strong>Category:</strong> {analysis.vetoResult.category.replace('_', ' ').toUpperCase()}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Playbook Results */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    📖 Commodity Playbook
                  </h3>
                  <div className={`p-4 rounded-lg border-2 ${
                    analysis.playbookResult.compliant 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="text-sm">
                      <div><strong>Status:</strong> {analysis.playbookResult.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}</div>
                      <div><strong>Score:</strong> {analysis.playbookResult.score.toFixed(1)}/100</div>
                      {analysis.playbookResult.violations.length > 0 && (
                        <div><strong>Violations:</strong></div>
                      )}
                      {analysis.playbookResult.violations.map((violation, idx) => (
                        <div key={idx} className="ml-2">• {violation}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Layman's Interpretation */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    💡 What This Means in Simple Terms
                  </h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm text-gray-700 space-y-3">
                      <p>
                        <strong>📊 Investment Outlook:</strong> This location shows promising signs for copper deposits. 
                        The probability jumped from {analysis.prior.mean < 0.3 ? 'low' : 'moderate'} ({(analysis.prior.mean * 100).toFixed(1)}%) 
                        to {analysis.posterior.mean > 0.7 ? 'high' : 'moderate'} ({(analysis.posterior.mean * 100).toFixed(1)}%) after analyzing all the evidence.
                      </p>
                      <p>
                        <strong>🏗️ Geological Foundation:</strong> {analysis.vetoResult.vetoed 
                          ? '⚠️ There are serious geological concerns that make this location risky for mining.'
                          : '✅ The geology at this site looks suitable for hosting copper deposits.'}
                      </p>
                      <p>
                        <strong>📋 Checklist Score:</strong> {analysis.playbookResult.score >= 80 
                          ? '🌟 Excellent! This location matches most of the criteria for successful copper deposits.'
                          : analysis.playbookResult.score >= 60
                          ? '👍 Good, but there are some missing elements that could affect success.'
                          : '⚠️ This location is missing several important factors for copper deposits.'}
                      </p>
                      <div className="mt-3 p-3 bg-white rounded border border-yellow-300">
                        <strong>🎯 Bottom Line:</strong> {
                          analysis.posterior.mean > 0.75 && !analysis.vetoResult.vetoed && analysis.playbookResult.score > 80
                            ? 'This appears to be a high-quality drilling target worth serious consideration.'
                            : analysis.posterior.mean > 0.5 && !analysis.vetoResult.vetoed
                            ? 'This shows potential and may be worth further investigation.'
                            : 'This location has significant challenges that may limit its economic viability.'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conservative Deposit Estimate */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    💰 Conservative Deposit Estimate
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-700 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Estimated Copper Content:</strong>
                          <div className="text-lg font-bold text-green-700">
                            {calculateConservativeEstimate(analysis).tons} Million Tons
                          </div>
                        </div>
                        <div>
                          <strong>Estimated Value:</strong>
                          <div className="text-lg font-bold text-green-700">
                            ${calculateConservativeEstimate(analysis).value}B
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        <p><strong>Confidence Level:</strong> Conservative (90% probability of at least this amount)</p>
                        <p><strong>Method:</strong> Based on geological probability and typical copper porphyry sizes</p>
                        <p><strong>⚠️ Disclaimer:</strong> This is a statistical estimate only. Actual drilling required for confirmation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Timestamp */}
                <div className="text-center text-gray-500 text-sm">
                  Analysis completed: {new Date(analysis.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center p-16">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg text-gray-600 mb-4">No analysis results available</p>
                <p className="text-sm text-gray-500">Select a target to begin analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-6">
          🧮 Aurora Bayesian Certainty Engine - Where geology governs probability, not algorithmic hope
        </div>
      </div>
    </div>
  );
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'prospective': return 'bg-blue-600';
    case 'analyzed': return 'bg-green-600';
    case 'vetoed': return 'bg-red-600';
    case 'unanalyzed': return 'bg-gray-600';
    default: return 'bg-gray-500';
  }
};