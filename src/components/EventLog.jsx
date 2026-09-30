import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Copy, Trash2, Check, Filter } from 'lucide-react';

export default function EventLog({ logs, onClearLogs }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom as new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level.toUpperCase() === filterLevel;
  });

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <Terminal size={18} color="var(--accent-cyan)" />
          <span>Real-Time ECU Security & Diagnostics Event Log</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Filter options */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
            {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                style={{
                  background: filterLevel === lvl ? 'var(--border-color)' : 'transparent',
                  color: filterLevel === lvl ? '#fff' : 'var(--text-dim)',
                  border: 'none',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '0.2rem',
                  cursor: 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            className="btn-secondary"
            onClick={handleCopyLogs}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
            title="Copy log to clipboard"
          >
            {copied ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onClearLogs}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
            title="Clear event log"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="event-log-container" ref={logContainerRef}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', margin: 'auto', fontSize: '0.75rem' }}>
            Diagnostic log initialized. Standby for OTA transmission events...
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="log-entry">
              <span className="log-time">[{log.timestamp}]</span>
              <span className={`log-level ${log.level}`}>
                {log.level}
              </span>
              <span className="log-msg" style={{
                color: log.level === 'error' ? '#fca5a5' :
                       log.level === 'warn' ? '#fde68a' :
                       log.level === 'success' ? '#86efac' : '#e2e8f0'
              }}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
