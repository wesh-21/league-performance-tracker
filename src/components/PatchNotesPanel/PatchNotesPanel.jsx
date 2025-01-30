import React, { useState } from 'react';
import styles from './PatchNotesPanel.module.css';

const PatchNotesPanel = ({ isVisible, onToggle }) => {
    const patchNotes = [
      {
        version: "1.00",
        date: "2024-01-30",
        changes: [
          "Added new performance tracking metrics",
          "Improved KDA calculation algorithm",
          "Fixed bug with vision score tracking",
          "Updated UI for better readability",
          "Added support for multiple regions"
        ]
      },
      {
        version: "13.9",
        date: "2024-01-15",
        changes: [
          "Introduced automated refresh system",
          "Enhanced player statistics display",
          "Added sorting functionality",
          "Fixed player deletion issues",
          "Improved error handling"
        ]
      },
    ];
 
    return (
      <>
        <button className={styles['patch-notes-toggle']} onClick={onToggle}>
          Patch Notes
        </button>
        <div className={`${styles['patch-notes-panel']} ${isVisible ? styles.visible : ''}`}>
          <h2 className={styles['patch-notes-title']}></h2>
          <div className={styles['patch-notes-content']}>
            {patchNotes.map((patch, index) => (
              <div key={index} className={styles['patch-note']}>
                <h3 className={styles['patch-version']}>Version {patch.version}</h3>
                <p className={styles['patch-date']}>{patch.date}</p>
                <ul className={styles['patch-changes']}>
                  {patch.changes.map((change, changeIndex) => (
                    <li key={changeIndex}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

export default PatchNotesPanel;