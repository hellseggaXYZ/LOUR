import React from 'react';
import styles from './PalleteGrid.module.css'; // Assuming you have CSS module for styling
import { patterns, isLight } from '@/util/colorPatterns';


const PalleteGrid = ({ colors }: { colors: string[] }) => {
  if (colors.length !== 7) {
    return <p>Invalid color array</p>;
  }

  const pattern = patterns[1];

  const includeHex: number[] = [];

  // mark first occurence of each color as includeHex
  const seen: { [key: string]: boolean } = {};
  for (let i = 0; i < pattern.length; i++) {
    const colorIdx = pattern[i];
    if (!seen[colorIdx]) {
      includeHex.push(i);
      seen[colorIdx] = true;
    }
  }

  return (
    <div className={styles.gridContainer}>
      {pattern.map((colorId, index) => {
        // Determine text color based on background color
        const textColor = isLight(colors[colorId]) ? '#333' : '#CCC';

        return (
          <div key={index} className={styles.gridItem} style={{ backgroundColor: colors[colorId] }}>
            {includeHex.includes(index) && (
              <div className={styles.hexText} style={{ color: textColor }}>
                {colors[colorId]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PalleteGrid;
