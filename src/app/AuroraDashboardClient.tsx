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
  posterior: { mean: number; variance: number; confidence_interval: number[] }
  vetoResult: { vetoed: boolean; reason?: string; category?: string }
  playbookResult: { compliant: boolean; score: number; violations: string[] }
  timestamp: string
}

export default function AuroraDashboardClient() {
  const [mounted, setMounted] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Aurora Bayesian Certainty Engine Ready! 🎉')

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
    console.log('AuroraDashboardClient: Component mounting...')
    setMounted(true)
  }, [])

  const analyzeTarget = (target: Target) => {
    if (!target) return
    
    console.log('AuroraDashboardClient: Starting analysis for', target.name)
    setSelectedTarget(target)
    setLoading(true)
    setMessage(`Analyzing ${target.name}...`)
    
    // Simulate analysis completion after 3 seconds
    setTimeout(() => {
      const mockAnalysis: Analysis = {
        target: target,
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
        timestamp: new Date().toISOString()
      }
      
      console.log('AuroraDashboardClient: Analysis completed', mockAnalysis)
      setAnalysis(mockAnalysis)
      setLoading(false)
      setMessage(`Analysis complete for ${target.name}! 📊`)
    }, 3000)
  }

  const analyzeAllTargets = () => {
    setLoading(true)
    setMessage('Analyzing all targets... 🔄')
    let completedCount = 0
    
    targets.forEach((target, index) => {
      setTimeout(() => {
        const mockAnalysis: Analysis = {
          target: target,
          posterior: { 
            mean: 0.6 + Math.random() * 0.2, 
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
          timestamp: new Date().toISOString()
        }
        
        if (index === 0) {
          setAnalysis(mockAnalysis)
          setSelectedTarget(target)
        }
        
        completedCount++
        if (completedCount === targets.length) {
          setLoading(false)
          setMessage('All targets analyzed! 🎯')
        }
      }, 1000 + (index * 500))
    })
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
    setAnalysis(null)
    setMessage(`New target added: ${newTarget.name} ➕`)
  }

  const clearAnalysis = () => {
    setAnalysis(null)
    setSelectedTarget(null)
    setMessage('Analysis cleared 🧹')
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

  if (!mounted) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
              <button 
                onClick={() => alert('Download functionality coming soon! 📥')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >📥 Download</button>
              <button 
                onClick={() => alert('Publish functionality coming soon! 📤')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >📤 Publish</button>
              <button 
                onClick={analyzeAllTargets}
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
                }}
              >{loading ? '⏳ Analyzing...' : '🔄 Re-analyze All Targets'}</button>
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
                }}
              >➕ Add New Target</button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#059669',
            margin: 0,
            fontWeight: '500'
          }}>{message}</p>
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
                }}>Analyzing Targets</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: 0,
                  margin: 0
                }}>Processing geological data...</p>
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
                }}
              >Clear Selection</button>
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
                  }}>25,000,000 tons</div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>Value: $220M</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
  )
}