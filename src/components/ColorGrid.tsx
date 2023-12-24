import React from 'react';
import styles from './ColorGrid.module.css'; // Assuming you have CSS module for styling
import { patterns } from '@/util/colorPatterns';

const ColorGrid = ({ colors }: { colors: string[] }) => {
  if (colors.length !== 7) {
    return <p>Invalid color array</p>;
  }

  const pattern = patterns[0];

  return (
    <div className={styles.gridContainer}>
      {pattern.map((colorId, index) => (
        <div key={index} className={styles.gridItem} style={{ backgroundColor: colors[colorId] }} />
      ))}
    </div>
  );
};

export default ColorGrid;
