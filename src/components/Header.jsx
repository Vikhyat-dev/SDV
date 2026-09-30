import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Radio, AlertTriangle, BookOpen, Clock } from 'lucide-react';

export default function Header({ onOpenVivaGuide }) {
  const getISTTime = () => {
    return new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const [currentTime, setCurrentTime] = useState(getISTTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getISTTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header-bar">
      <div className="header-left">
        <div className="brand-icon">
          <Cpu size={26} />
        </div>
        <div className="header-title-wrap">
          <h1>AIRBAG CONTROL UNIT [ACU-01] - SECURE SIGNED OTA SIMULATOR</h1>
          <p>Automotive-Style A/B Dual-Slot Flash • Web Crypto SHA-256 & ECDSA P-256 • Automatic Rollback</p>
        </div>
      </div>

      <div className="header-meta">
        <div className="disclaimer-badge">
          <AlertTriangle size={14} />
          <span>Educational Simulation — Scoped to 1 Airbag ECU (ACU-01)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
          <Radio size={14} className="animate-pulse" />
          <span>OTA LINK: ACTIVE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          <Clock size={13} />
          <span>{currentTime} IST</span>
        </div>

        <button 
          className="btn-secondary" 
          onClick={onOpenVivaGuide}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', color: 'var(--accent-cyan)', borderColor: 'rgba(56, 189, 248, 0.4)' }}
          title="Open Project Presentation Script & Technical Q&A"
        >
          <BookOpen size={14} />
          <span>Project & Presentation Guide</span>
        </button>
      </div>
    </header>
  );
}
