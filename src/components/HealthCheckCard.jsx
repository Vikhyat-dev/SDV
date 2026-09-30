import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, RefreshCw, AlertCircle, FileCheck, Cpu, Sliders, Stethoscope } from 'lucide-react';

export default function HealthCheckCard({ healthChecks }) {
  const getIconForCheck = (key) => {
    switch (key) {
      case 'firmwareIntegrity':
        return <FileCheck size={16} color="var(--accent-cyan)" />;
      case 'bootSuccess':
        return <Cpu size={16} color="var(--accent-cyan)" />;
      case 'configValidation':
        return <Sliders size={16} color="var(--accent-cyan)" />;
      case 'diagnosticSelfTest':
        return <Stethoscope size={16} color="var(--accent-cyan)" />;
      default:
        return <ShieldCheck size={16} color="var(--accent-cyan)" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'PASSED') {
      return (
        <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.74rem', fontWeight: 600 }}>
          <CheckCircle2 size={14} /> PASSED
        </span>
      );
    }
    if (status === 'CHECKING') {
      return (
        <span style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.74rem', fontWeight: 600 }}>
          <RefreshCw size={14} className="animate-spin" /> EVALUATING...
        </span>
      );
    }
    return (
      <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>
        PENDING
      </span>
    );
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <ShieldCheck size={18} color="var(--accent-cyan)" />
          <span>Dynamic ECU Post-Update Health Check</span>
        </div>
        <span className="card-badge">
          4-POINT VALIDATION SUITE
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {Object.entries(healthChecks).map(([key, check]) => (
          <div key={key} className="metric-box" style={{ padding: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem', color: '#f1f5f9' }}>
                {getIconForCheck(key)}
                <span>{check.name}</span>
              </div>
              {getStatusBadge(check.status)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>
              {check.details}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
