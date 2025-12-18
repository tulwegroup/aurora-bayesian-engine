"use client"

import React from 'react'

export default function AuroraDashboardClient() {
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
              <button style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#2563eb',
                border: '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>🔄 Re-analyze All Targets</button>
              <button style={{
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
              }}>🎯 Targets (3)</h2>
              <button style={{
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
              {/* Target 1 */}
              <div
                style={{
                  padding: '16px',
                  marginBottom: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb'
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
                    }}>Andes Copper Prospect</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      margin: 0
                    }}>COPPER PORPHYRY</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>📍 37.80°, -118.50°</p>
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
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>prospective</span>
                  </div>
                </div>
              </div>

              {/* Target 2 */}
              <div
                style={{
                  padding: '16px',
                  marginBottom: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb'
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
                    }}>Island Arc Target</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      margin: 0
                    }}>COPPER PORPHYRY</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>📍 38.20°, -119.00°</p>
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
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>prospective</span>
                  </div>
                </div>
              </div>

              {/* Target 3 */}
              <div
                style={{
                  padding: '16px',
                  marginBottom: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb'
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
                    }}>Rift Zone Prospect</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      margin: 0
                    }}>COPPER PORPHYRY</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>📍 38.50°, -117.80°</p>
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
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>prospective</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}