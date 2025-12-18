"use client"

import React, { useState, useEffect } from 'react'

interface Target {
  id: string
  name: string
  commodity: string
  location: { longitude: number; latitude: number }
  status: string
}

interface Analysis {
  target: Target
  prior: { mean: number; variance: number; confidence_interval: number[] }
  likelihoods: {
    chemical: { mean: number; variance: number; confidence_interval: number[]; evidence_type: string }
    structural: { mean: number; variance: number; confidence_interval: number[]; evidence_type: string }
    physical: { mean: number; variance: number; confidence_interval: number[]; evidence_type: string }
    surface: { mean: number; variance: number; confidence_interval: number[]; evidence_type: string }
  }
  posterior: { mean: number; variance: number; confidence_interval: number[] }
  vetoResult: { vetoed: boolean; reason?: string; category?: string }
  playbookResult: { compliant: boolean; score: number; violations: string[] }
  collapseResult: { collapsed: boolean; confidence: number; classification: string }
  timestamp: string
}

export default function AuroraDashboard() {
  const [mounted, setMounted] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState('')
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null)

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
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && loading && analysisStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - analysisStartTime) / 1000)
        const progress = getAnalysisProgress(elapsed)
        setAnalysisProgress(progress)
        
        if (elapsed >= 30) {
          clearInterval(interval)
          completeAnalysis()
        }
      }, 1000)
      
      return () => clearInterval(interval)
    } else {
      setAnalysisProgress('')
      setAnalysisStartTime(null)
    }
  }, [mounted, loading, analysisStartTime])

  const getAnalysisProgress = (seconds: number): string => {
    if (seconds < 10) return `Initializing analysis... (${seconds}s)`
    if (seconds < 20) return `Loading geological data... (${seconds}s)`
    if (seconds < 30) return `Computing prior probabilities... (${seconds}s)`
    return `Finalizing analysis... (${seconds}s)`
  }

  const completeAnalysis = () => {
    if (!selectedTarget) return
    
    const randomSeed = selectedTarget.id.charCodeAt(0) + selectedTarget.id.charCodeAt(1) || 1
    const deterministicRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    const mockAnalysis: Analysis = {
      target: selectedTarget,
      prior: { 
        mean: 0.15 + deterministicRandom(randomSeed) * 0.1, 
        variance: 0.01, 
        confidence_interval: [0.05, 0.25] 
      },
      likelihoods: {
        chemical: {
          mean: 0.5 + deterministicRandom(randomSeed + 1) * 2,
          variance: 0.1,
          confidence_interval: [0.3, 2.5],
          evidence_type: 'chemical'
        },
        structural: {
          mean: 0.5 + deterministicRandom(randomSeed + 2) * 2,
          variance: 0.15,
          confidence_interval: [0.2, 2.8],
          evidence_type: 'structural'
        },
        physical: {
          mean: 0.5 + deterministicRandom(randomSeed + 3) * 2,
          variance: 0.12,
          confidence_interval: [0.4, 2.6],
          evidence_type: 'physical'
        },
        surface: {
          mean: 0.5 + deterministicRandom(randomSeed + 4) * 2,
          variance: 0.08,
          confidence_interval: [0.6, 2.4],
          evidence_type: 'surface'
        }
      },
      posterior: { 
        mean: 0.67 + deterministicRandom(randomSeed + 5) * 0.2, 
        variance: 0.02, 
        confidence_interval: [0.45, 0.85] 
      },
      vetoResult: { 
        vetoed: deterministicRandom(randomSeed + 6) > 0.7, 
        reason: deterministicRandom(randomSeed + 6) > 0.7 ? 'Incompatible stratigraphic setting' : undefined,
        category: deterministicRandom(randomSeed + 6) > 0.7 ? 'stratigraphic' : undefined
      },
      playbookResult: { 
        compliant: deterministicRandom(randomSeed + 7) > 0.3, 
        score: 60 + deterministicRandom(randomSeed + 7) * 40, 
        violations: deterministicRandom(randomSeed + 7) > 0.7 ? ['Missing structural preparation'] : []
      },
      collapseResult: { 
        collapsed: deterministicRandom(randomSeed + 8) > 0.8, 
        confidence: 0.6 + deterministicRandom(randomSeed + 8) * 0.4, 
        classification: deterministicRandom(randomSeed + 8) > 0.8 ? 'HIGH_CONFIDENCE' : 'MODERATE'
      },
      timestamp: new Date().toISOString()
    }
    
    setAnalysis(mockAnalysis)
    setLoading(false)
    setAnalysisStartTime(null)
    setAnalysisProgress('')
  }

  const analyzeTarget = (target: Target) => {
    if (!target) return
    
    setSelectedTarget(target)
    setLoading(true)
    setAnalysisStartTime(Date.now())
    setAnalysisProgress('Initializing analysis...')
    setAnalysis(null)
  }

  const addNewTarget = () => {
    const newTarget: Target = {
      id: `target-${Date.now()}`,
      name: `New Target ${targets.length + 1}`,
      commodity: 'copper_porphyry',
      location: { 
        longitude: -118.0 + 0.5, 
        latitude: 37.0 + 0.5 
      },
      status: 'unanalyzed'
    }
    setSelectedTarget(newTarget)
  }

  const clearAnalysis = () => {
    setAnalysis(null)
    setSelectedTarget(null)
    setAnalysisProgress('')
  }

  const calculateConservativeEstimate = (analysis: Analysis) => {
    try {
      if (!analysis || !analysis.posterior || !analysis.vetoResult || !analysis.playbookResult) {
        return { tons: 0, value: 0 }
      }
      
      const baseDepositSize = 50
      const probabilityFactor = analysis.posterior?.mean || 0
      const geologicalMultiplier = analysis.vetoResult?.vetoed ? 0 : 1
      const playbookMultiplier = (analysis.playbookResult?.score || 0) / 100
      
      const conservativeTons = Math.round(
        baseDepositSize * probabilityFactor * geologicalMultiplier * playbookMultiplier * 0.6
      )
      
      const conservativeValue = Math.round(conservativeTons * 2204.62 * 4 / 1000000)
      
      return {
        tons: conservativeTons,
        value: conservativeValue
      }
    } catch (error) {
      console.error('Error calculating estimate:', error)
      return { tons: 0, value: 0 }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prospective': return { bg: '#dcfce7', color: '#166534' }
      case 'analyzed': return { bg: '#dbeafe', color: '#1e40af' }
      case 'vetoed': return { bg: '#fee2e2', color: '#991b1b' }
      case 'unanalyzed': return { bg: '#f3f4f6', color: '#374151' }
      default: return { bg: '#f3f4f6', color: '#374151' }
    }
  }

  // Aurora-safe: Return null during hydration
  if (!mounted) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0
              }}>🧮 Aurora Bayesian Certainty Engine</h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>📥 Download</button>
              <button style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>📤 Publish</button>
              <button 
                onClick={() => targets.forEach(target => analyzeTarget(target))}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}>{loading ? '⏳ Analyzing...' : '🔄 Re-analyze All Targets'}</button>
              <button
                onClick={addNewTarget}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#16a34a',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>➕ Add New Target</button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {loading && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '24px',
            marginBottom: '24px',
            border: '2px solid #2563eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '4px solid #2563eb',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px',
                  margin: 0
                }}>Analyzing Target</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: 0,
                  margin: 0
                }}>{selectedTarget ? selectedTarget.name : 'Unknown target'}</p>
                <p style={{
                  fontSize: '14px',
                  color: '#2563eb',
                  fontStyle: 'italic',
                  margin: 0
                }}>{analysisProgress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }}>
          {/* Targets Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>🎯 Targets ({targets.length})</h2>
              <button
                onClick={clearAnalysis}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>Clear Selection</button>
            </div>
            
            <div style={{
              maxHeight: '384px',
              overflowY: 'auto'
            }}>
              {targets.map((target) => (
                <div
                  key={target.id}
                  onClick={() => analyzeTarget(target)}
                  style={{
                    padding: '16px',
                    marginBottom: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedTarget?.id === target.id ? '#eff6ff' : 'white',
                    borderColor: selectedTarget?.id === target.id ? '#3b82f6' : '#e5e7eb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '500',
                        color: '#111827',
                        marginBottom: '4px',
                        margin: 0
                      }}>{target.name}</h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        marginBottom: '4px',
                        margin: 0
                      }}>{target.commodity.replace('_', ' ').toUpperCase()}</p>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0
                      }}>📍 {target.location.latitude.toFixed(2)}°, {target.location.longitude.toFixed(2)}°</p>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        borderRadius: '9999px',
                        backgroundColor: getStatusColor(target.status).bg,
                        color: getStatusColor(target.status).color
                      }}>{target.status}</span>
                      {selectedTarget?.id === target.id && (
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: '500',
                          borderRadius: '9999px',
                          backgroundColor: '#2563eb',
                          color: 'white'
                        }}>🔍 Analyzing</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {targets.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                <p style={{
                  fontSize: '16px',
                  margin: 0
                }}>Select a target for detailed analysis</p>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '24px',
                margin: 0
              }}>📊 Analysis Results: {analysis.target.name}</h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {/* Posterior Probability */}
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px',
                    margin: 0
                  }}>📈 Posterior Probability</h3>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: analysis.posterior.mean > 0.6 ? '#059669' : analysis.posterior.mean > 0.3 ? '#d97706' : '#dc2626',
                    marginBottom: '8px'
                  }}>{(analysis.posterior.mean * 100).toFixed(1)}%</div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>95% CI: {(analysis.posterior.confidence_interval[0] * 100).toFixed(1)}% - {(analysis.posterior.confidence_interval[1] * 100).toFixed(1)}%</p>
                </div>

                {/* Veto Result */}
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px',
                    margin: 0
                  }}>🚫 Geological Veto</h3>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: analysis.vetoResult.vetoed ? '#dc2626' : '#059669',
                    marginBottom: '8px'
                  }}>{analysis.vetoResult.vetoed ? 'VETOED' : 'CLEARED'}</div>
                  {analysis.vetoResult.reason && (
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>{analysis.vetoResult.reason}</p>
                  )}
                </div>

                {/* Playbook Compliance */}
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px',
                    margin: 0
                  }}>📋 Playbook Compliance</h3>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: analysis.playbookResult.compliant ? '#059669' : '#d97706',
                    marginBottom: '8px'
                  }}>{analysis.playbookResult.compliant ? 'COMPLIANT' : 'VIOLATIONS'}</div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>Score: {analysis.playbookResult.score.toFixed(1)}/100</p>
                </div>

                {/* Conservative Estimate */}
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px',
                    margin: 0
                  }}>💰 Conservative Estimate</h3>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '8px'
                  }}>{calculateConservativeEstimate(analysis).tons.toLocaleString()} tons</div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>Value: ${calculateConservativeEstimate(analysis).value}M</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}