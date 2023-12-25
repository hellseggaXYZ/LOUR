import React from 'react';
import styles from './ColorButton.module.css';

function ColorButton({ colorName, selected }: { colorName: string, selected: boolean }) {
  const className = selected ? `${styles.colorButton} ${styles.selected}` : styles.colorButton;

  return (
    <div className={className} style={{ backgroundColor: colorName }} />
  );

}


export default ColorButton;