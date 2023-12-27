import React, { useState, useEffect } from 'react';
import styles from './PalleteGrid.module.css';
import { grids, isLight } from '@/util/colorPatterns';
import { CopyIcon } from '@/svg/copy';
import { CheckIcon } from '@/svg/check';

const PalleteGrid = ({ colors }: { colors: string[] }) => {
  if (colors.length !== 7) {
    return <p>Invalid color array</p>;
  }

  const grid = grids[0];
  const [copied, setCopied] = useState(Array(grid.cells.length).fill(false));
  const [isMobile, setIsMobile] = useState(false); // State to track if the screen is mobile
  useEffect(() => {
    // check if the screen is mobile
    if (window.innerWidth <= 768) {
      setIsMobile(true);
    }
  }, []);

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(copied.map((c, i) => i === index ? true : c));
      setTimeout(() => {
        setCopied(copied.map((c, i) => i === index ? false : c));
      }, 2000);
    });
  }
  

  return (
    <div style={{ width: `${grid.width * 7.25}vh`, height: `${grid.height * 7.25}vh`, position: 'relative' }}>
      {grid.cells.map((cell, index) => {

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
              width: `${cell.w * 7.25}vh`,
              height: `${cell.h * 7.25}vh`,
            }}
            onClick={() => copyToClipboard(colors[index], index)}
          >
            {isMobile ?
              (
                <div className={styles.copyIcon} style={{ color: textColor }}>
                  <CopyIcon />
                </div>
              ) : (
                <div className={`${styles.copyIcon} ${copied[index] ? styles.copied : ''}`} style={{ color: textColor }}>
                  <CopyIcon style={{ opacity: copied[index] ? 0 : 1 }} />
                  <CheckIcon style={{ opacity: copied[index] ? 1 : 0 }} />
                </div>
              )
            }
            
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
