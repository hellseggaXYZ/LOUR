import React from 'react';
import styles from './PalleteGrid.module.css'; // Assuming you have CSS module for styling
import { patterns, isLight } from '@/util/colorPatterns';




const PalleteGrid = ({ colors }: { colors: string[] }) => {
  if (colors.length !== 7) {
    return <p>Invalid color array</p>;
  }

  const pattern = patterns[0];

  const includeHex: number[] = [];

  // mark first occurence of each color as includeHex
  const seen: { [key: string]: boolean } = {};
  for (let i = 0; i < pattern.length; i++) {
    const color = pattern[i];
    if (!seen[color]) {
      includeHex.push(i);
      seen[color] = true;
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
