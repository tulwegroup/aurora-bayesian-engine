"use client"

import React, { useState, useEffect } from 'react'

export default function AuroraDashboardClient() {
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState('Aurora Bayesian Certainty Engine Loading...')

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setMessage('Aurora Engine Ready! 🎉'), 1000)
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
                onClick={() => setMessage('Button clicked! 🎉')}
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
          }}>🎯 Status</h2>
          
          <div style={{
            fontSize: '16px',
            color: '#059669',
            backgroundColor: '#f0fdf4',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #10b981',
            textAlign: 'center'
          }}>
            <strong>🎉 SUCCESS!</strong> Aurora Engine is loaded and working!
            <br />
            <br />
            If you can see this message and buttons work, then deployment is successful!
          </div>
        </div>
      </div>
    </div>
  )
}