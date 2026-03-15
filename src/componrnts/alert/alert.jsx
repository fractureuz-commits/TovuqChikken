import React from 'react';
import '../alert/alert.css';
const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-backdrop">
      <div className="confirm-box">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button onClick={onConfirm} className="yes">Ha</button>
          <button onClick={onCancel} className="no">Yo‘q</button>
        </div>.
        0
      </div>
    </div>
  );
};
export default ConfirmDialog;