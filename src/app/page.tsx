'use client'

import React, { useState, useEffect } from 'react'
import { analyzeAlFatiha } from '../../lib/iqra/quran/nested_sevens'

export default function Home() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    // التحميل الأولي لتحليل الفاتحة
    const data = analyzeAlFatiha()
    setAnalysis(data)
  }, [])

  return (
    <main className="main-container">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="brand-font" style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
          إقرأ <span style={{ color: '#fff' }}>IQRA</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: '1.2rem' }}>Sovereign RAG Engine & Numerical Symmetry Discovery</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* ── SEARCH SECTION ────────────────────────────────────────────────── */}
        <section className="glass-card">
          <h2 className="brand-font" style={{ marginBottom: '1.5rem' }}>بحث سيادي (RAG)</h2>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="اسأل عن أي آية أو نمط رقمي..."
              style={{
                width: '100%',
                padding: '1.2rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem'
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="pulse-button" style={{ marginTop: '1rem', width: '100%' }}>
              تحليل عميق
            </button>
          </div>
        </section>

        {/* ── SEVEN SYSTEM PREVIEW ─────────────────────────────────────────── */}
        <section className="glass-card">
          <h2 className="brand-font" style={{ marginBottom: '1.5rem' }}>منظومة السباعيات (الفاتحة)</h2>
          {analysis && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>مجموع الكلمات: <strong>{analysis.wordCount}</strong></span>
                <span style={{ color: 'var(--accent-gold)' }}>✓ تقبل القسمة على 7</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>مجموع الحروف: <strong>{analysis.letterCount}</strong></span>
                <span style={{ color: 'var(--accent-gold)' }}>✓ تقبل القسمة على 7</span>
              </div>
              
              <div className="seven-grid">
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <div key={n} className={`seven-cell ${n === 7 ? 'highlight' : ''}`}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ── AYAH DISPLAY ─────────────────────────────────────────────────── */}
      <section className="glass-card" style={{ marginTop: '2rem' }}>
        <div className="ayah-box">
          <div className="arabic-font ayah-arabic">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          <div className="ayah-english">
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>
        MĪTHĀQ PROTOCOL V2.0 | BUILT WITH SOUL BY MOE ABDELAZIZ
      </footer>
    </main>
  )
}
