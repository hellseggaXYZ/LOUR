import React, { useState } from 'react';
import styles from './PalleteGrid.module.css';
import { patterns, grids, isLight } from '@/util/colorPatterns';
import { CopyIcon } from '@/svg/copy';
import { CheckIcon } from '@/svg/check';

const PalleteGrid = ({ colors }: { colors: string[] }) => {
  if (colors.length !== 7) {
    return <p>Invalid color array</p>;
  }

  const grid = grids[0];
  const [copied, setCopied] = useState(Array(grid.cells.length).fill(false)); // State to track copied status of each cell

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex).then(() => {
      // Set the copied state to true for the cell
      setCopied(copied.map((copied, i) => i === index ? true : copied));

      // Set a timeout to change the icon back to CopyIcon after 2 seconds
      setTimeout(() => {
        setCopied(copied.map((copied, i) => i === index ? false : copied));
      }, 2000); // 2000 milliseconds = 2 seconds
    });
  }
  

  return (
    <div style={{
      width: `${grid.width * 7.25}vh`,
      height: `${grid.height * 7.25}vh`,
      position: 'relative',
    }}>
      {grid.cells.map((cell, index) => {
        const width = `${cell.w * 7.25}vh`;
        const height = `${cell.h * 7.25}vh`;
        const textColor = isLight(colors[index]) ? '#333' : '#CCC';

        return (
          <div 
            key={`cell-${index}`}
            className={styles.cell}
            style={{ 
              backgroundColor: colors[index],
              position: 'absolute',
              left: `${cell.x * 7.25}vh`,
              top: `${cell.y * 7.25}vh`,
              width: width, 
              height: height,
            }} 
            onClick={() => copyToClipboard(colors[index], index)}
          >
            <div className={styles.copyIcon} style={{ color: textColor }}>
              {copied[index] ? <CheckIcon /> : <CopyIcon />}
            </div>
            <div className={styles.hexText} style={{ color: textColor }}>
              {colors[index]}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default PalleteGrid;
