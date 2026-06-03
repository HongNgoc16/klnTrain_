// train/src/components/Common/ConfirmDialog.jsx
import React from 'react';
import './ConfirmDialog.scss';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;
  
  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button className="btn-secondary" onClick={onClose}>
            {cancelText || 'Hủy'}
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            {confirmText || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;