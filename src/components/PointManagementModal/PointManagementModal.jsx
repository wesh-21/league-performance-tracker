import React, { useState } from 'react';
import styles from './PointManagementModal.module.css';

const PointManagementModal = ({ player, onClose, onDelete, onPointModify }) => {
    const CATEGORIES = ["Overall", "KDA", "Vision Score", "Damage", "Gold Earned", "CS"];
 
    return (
      <div className={styles['modal-overlay']}>
        <div className={styles['modal-container']}>
          <h2 className={styles['modal-title']}>Manage Points for {player.name}</h2>
          <div className={styles['modal-grid']}>
            {CATEGORIES.slice(1).map((category) => (
              <div key={category} className={styles['modal-item']}>
                <button
                  onClick={() => onPointModify(player.id, category, 1)}
                  className={`${styles['btn']} ${styles['btn-add']}`}
                >
                  +1 {category}
                </button>
                <button
                  onClick={() => onPointModify(player.id, category, -1)}
                  className={`${styles['btn']} ${styles['btn-remove']}`}
                >
                  -1 {category}
                </button>
              </div>
            ))}
          </div>
          <div className={styles['modal-footer']}>
            <button
              onClick={() => {
                onDelete(player.id);
                onClose();
              }}
              className={`${styles['btn']} ${styles['btn-delete']}`}
            >
              Remove Player
            </button>
            <button onClick={onClose} className={`${styles['btn']} ${styles['btn-close']}`}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
 
export default PointManagementModal;