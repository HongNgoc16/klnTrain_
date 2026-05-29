import React from 'react';
import './StatCard.scss';

const StatCard = ({ title, value, icon, color, growth, onClick }) => {
  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-card-inner">
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
        <div className="stat-content">
          <h4 className="stat-title">{title}</h4>
          <div className="stat-value">{value}</div>
          {growth !== undefined && (
            <div className={`stat-growth ${growth >= 0 ? 'positive' : 'negative'}`}>
              {growth >= 0 ? '+' : ''}{growth}% so với kỳ trước
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;