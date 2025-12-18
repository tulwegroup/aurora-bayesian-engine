"use client"

import React, { useState, useEffect } from 'react'

export default function AuroraDashboardClient() {
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState('Initializing Aurora Engine...')

  useEffect(() => {
    console.log('AuroraDashboardClient: Component mounting...')
    setMounted(true)
    setMessage('Aurora Engine Loaded Successfully! 🎉')
  }, [])

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
                onClick={() => alert('Button clicked! 🎉')}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#2563eb',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >🔄 Test Button</button>
              <button 
                onClick={() => setMessage('Button 2 clicked! 🚀')}
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
              >📊 Test Button 2</button>
            </div>
          </div>
        </div>

        {/* Main Content */}
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
          }}>🎯 Debug Status</h2>
          
          <div style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '16px'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>Mounted: {mounted ? '✅ Yes' : '❌ No'}</p>
            <p style={{ margin: '0 0 8px 0' }}>Message: {message}</p>
            <p style={{ margin: '0 0 8px 0' }}>Time: {new Date().toLocaleTimeString()}</p>
          </div>

          <div style={{
            fontSize: '14px',
            color: '#059669',
            backgroundColor: '#f0fdf4',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #10b981'
          }}>
            <strong>🎉 SUCCESS!</strong> Aurora Engine is loaded and working.
            <br />
            If you can see this message and the buttons work, then the deployment is successful!
          </div>
        </div>

        {/* Test Targets */}
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
          }}>🎯 Test Targets (3)</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            <div
              style={{
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white'
              }}
            >
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
              <span style={{
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: '9999px',
                backgroundColor: '#dcfce7',
                color: '#166534'
              }}>prospective</span>
            </div>

            <div
              style={{
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white'
              }}
            >
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
              <span style={{
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: '9999px',
                backgroundColor: '#dcfce7',
                color: '#166534'
              }}>prospective</span>
            </div>

            <div
              style={{
                padding: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white'
              }}
            >
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
  )
}