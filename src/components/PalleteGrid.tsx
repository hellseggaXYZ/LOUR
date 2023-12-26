// 'use client'

import React from 'react';
import styles from './PalleteGrid.module.css'; // Assuming you have CSS module for styling
import { patterns, grids, isLight } from '@/util/colorPatterns';

const PalleteGrid = ({ colors }: { colors: string[] }) => {
  if (colors.length !== 7) {
    return <p>Invalid color array</p>;
  }

  // const pattern = patterns[1];
  const grid = grids[0];

  // const includeHex: number[] = [];

  // mark first occurence of each color as includeHex
  // const seen: { [key: string]: boolean } = {};
  // for (let i = 0; i < pattern.length; i++) {
  //   const colorIdx = pattern[i];
  //   if (!seen[colorIdx]) {
  //     includeHex.push(i);
  //     seen[colorIdx] = true;
  //   }
  // }

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
  }

  return (
    <div style={{
      width: `${4 * 10}vh`,
      height: `${4 * 10}vh`,
      position: 'relative',
    }}>
      {grid.cells.map((cell, index) => {

        const width = `${cell.w * 10}vh`;
        const height = `${cell.h * 10}vh`;

        console.log(width, height);
        const textColor = isLight(colors[index]) ? '#333' : '#CCC';
        return (
          <div 
            key={`cell-${index}`}
            className={styles.cell}
            style={{ 
              backgroundColor: colors[index],
              position: 'absolute',
              left: `${cell.x * 10}vh`,
              top: `${cell.y * 10}vh`,
              width: width, 
              height: height,
            }} 
            onClick={() => {copyToClipboard(colors[index])}}
          >
            <div className={styles.hexText} style={{ color: textColor }} >
              {colors[index]}
            </div>
          </div>
        )
      })}
    </div>
    // <div className={styles.gridContainer}>
    //   {pattern.map((colorId, index) => {
    //     // Determine text color based on background color
    //     const textColor = isLight(colors[colorId]) ? '#333' : '#CCC';

    //     return (
    //       <div key={index} className={styles.gridItem} style={{ backgroundColor: colors[colorId] }} onClick={() => {copyToClipboard(colors[colorId])}}>
    //         {includeHex.includes(index) && (
    //           <div className={styles.hexText} style={{ color: textColor }} >
    //             {colors[colorId]}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   })}
    // </div>
  );
};

export default PalleteGrid;
