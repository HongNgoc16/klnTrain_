import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ size = 'md', text = 'Đang tải...' }) => {
  return (
    <div className="loading-spinner">
      <div className={`spinner spinner-${size}`}></div>
      {text && <p>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;