'use client';

import React, { useState, useEffect } from 'react';

export default function SimpleAuroraPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Test API connectivity
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        setStatus(`✅ ${data.message} - ${data.timestamp}`);
      })
      .catch(err => {
        setLoading(false);
        setStatus(`❌ API Error: ${err.message}`);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid #60a5fa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', fontSize: '18px', color: '#1f2937' }}>
            Initializing Aurora System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 10px 0'
          }}>
            🧮 Aurora Bayesian Certainty Engine
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#64748b',
            margin: '0'
          }}>
            Subsurface Intelligence through Physics-First Principles
          </p>
        </div>

        {/* Status */}
        <div style={{
          background: status.startsWith('✅') ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '1.1rem',
          marginBottom: '30px'
        }}>
          {status}
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>🎯 Mathematical Foundation</h3>
            <p style={{ margin: '0', color: '#374151' }}>Formal Bayesian fusion with uncertainty propagation</p>
          </div>

          <div style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>🏗️ Data Infrastructure</h3>
            <p style={{ margin: '0', color: '#374151' }}>STAC-compliant data lake with uncertainty quantification</p>
          </div>

          <div style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>🔬 Physics Microservices</h3>
            <p style={{ margin: '0', color: '#374151' }}>Prior, Chemical, Structural, and Physical likelihood services</p>
          </div>

          <div style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>🚫 Geological Veto</h3>
            <p style={{ margin: '0', color: '#374151' }}>Absolute rejection when geology is impossible (P=0)</p>
          </div>

          <div style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>📋 Commodity Playbooks</h3>
            <p style={{ margin: '0', color: '#374151' }}>Copper Porphyry with mandatory conditions and kill factors</p>
          </div>

          <div style={{
            padding: '20px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>📊 Interactive Dashboard</h3>
            <p style={{ margin: '0', color: '#374151' }}>Real-time probability analysis with visualizations</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => window.location.href = '/api/health'}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Test API
          </button>
          
          <button
            onClick={() => window.location.href = '/test.html'}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Test Static
          </button>
        </div>

        {/* Add CSS animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}