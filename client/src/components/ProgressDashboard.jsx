import React from 'react';

const ProgressDashboard = ({ progress }) => {
  return (
    <aside className="sidebar glass" aria-label="Learning Progress Dashboard">
      <div className="logo">Learning Companion</div>
      <div className="progress-section">
        <h3>Your Progress</h3>
        <div className="progress-list" role="list">
          {Object.entries(progress).map(([topic, level], index) => (
            <div className="progress-item" key={index} role="listitem">
              <span>{topic}</span>
              <span className="level-badge" aria-label={`Mastery level: ${level}`}>
                {level}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="progress-section" style={{ marginTop: 'auto' }}>
        <h3>System Status</h3>
        <div className="progress-item" style={{ background: 'transparent', padding: 0 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Google Cloud Agent</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} aria-label="Online"></span>
        </div>
      </div>
    </aside>
  );
};

export default ProgressDashboard;
