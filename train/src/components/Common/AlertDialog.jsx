// train/src/components/Common/AlertDialog.jsx
import React from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import './ConfirmDialog.scss';

const ICONS = {
  success: <FiCheckCircle className="alert-icon alert-icon--success" />,
  error: <FiXCircle className="alert-icon alert-icon--error" />,
  warning: <FiAlertTriangle className="alert-icon alert-icon--warning" />,
};

const AlertDialog = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-body confirm-body--alert">
          {ICONS[type]}
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button className="btn-primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
