import React from 'react';

const Messages = ({ error, success, onErrorClose, onSuccessClose }) => {
  return (
    <>
      {success && (
        <div className="message success">
          <span className="message-icon">✅</span>
          {success}
          <button onClick={onSuccessClose} className="message-close">×</button>
        </div>
      )}

      {error && (
        <div className="message error">
          <span className="message-icon">❌</span>
          {error}
          <button onClick={onErrorClose} className="message-close">×</button>
        </div>
      )}
    </>
  );
};

export default Messages;