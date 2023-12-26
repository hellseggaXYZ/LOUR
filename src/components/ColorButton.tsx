import React from 'react';
import styles from './ColorButton.module.css';

function ColorButton({ colorName, selected }: { colorName: string, selected: boolean }) {
  const className = `${styles.colorButton} 
  ${selected ? styles.selected : ''} 
  ${colorName === 'white' ? styles.whiteBorder : ''}`;

  return (
    <div className={className} style={{ backgroundColor: colorName }} />
  );

}


export default ColorButton;
