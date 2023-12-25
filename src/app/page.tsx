'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import ColorGrid from '@/components/ColorGrid'
import ColorButton from '@/components/ColorButton'
import { styleFilters, colorFilters, StyleFilter, ColorFilter, Palette } from '@/types/pallete'
import { fetchPalettes, fetchStyles } from '@/server/db'


export default function Home() {
  const [colors, setColors] = useState<[string, string, string, string, string, string, string]>(
    // default color
    ['#F4F4F4', '#E4D2D8', '#C8D5BB', '#C099A0', '#D4DCDA', '#80989B', '#E5E4E6']
  )
  const [selectedPaletteId, setSelectedPaletteId] = useState<number | null>(null)
  const [colorFilter, setColorFilter] = useState<ColorFilter>({} as ColorFilter)
  const [styleFilter, setStyleFilter] = useState<StyleFilter>({} as StyleFilter)
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [styleIdMap, setStyleIdMap] = useState<Map<number, string>>({} as Map<number, string>)

  async function updatePalletes() {
    const newPalettes = await fetchPalettes(styleFilter, colorFilter)
    setPalettes(newPalettes)
  }

  async function updateStyleIdMap() {
    const newStyleIdMap = await fetchStyles()
    setStyleIdMap(newStyleIdMap)
  }

  useEffect(() => {
    updateStyleIdMap()
  }, [])

  // todo: log fetched palletes and also log the displayed pallete with info
  // todo: faster and more efficient way to fetch 
  // todo: should also fetch styles stable to make logging better
  // should probably fetch on filter change 

  async function handleGenerate() {
    // // Check if there are palettes available
    // if (palettes.length === 0) {

    //   console.log('no palettes')
    //   // Optionally handle the case where no palettes are available
    //   return;
    // }

    const newPalettes = await fetchPalettes(styleFilter, colorFilter)

    if (newPalettes.length === 0) {
      console.log('no palettes')
      return;
    }

    console.log('fetched palettes', newPalettes)
  
    let selectedPalette;
    let attempts = 0;
    do {
      // Choose a random palette from the list of palettes
      const randomIndex = Math.floor(Math.random() * newPalettes.length);
      selectedPalette = newPalettes[randomIndex];
  
      // Increment attempts to avoid an infinite loop in rare cases
      attempts++;
  
      // If only one palette is available, or too many attempts, break the loop
      if (newPalettes.length === 1 || attempts > 50) {
        break;
      }
    } while (selectedPalette.paletteId === selectedPaletteId);
  
    console.log("selected new palette", selectedPalette)
    console.log("style: ", styleIdMap.get(selectedPalette.styleId) || "no style id")

    // Set the colors and the selectedPaletteId state
    setColors(selectedPalette.colors);
    setSelectedPaletteId(selectedPalette.paletteId);
  }
  

  return (
    <main className={styles.main}>
      <div className={styles.leftPanel}>
        <div className={styles.titleContainer}>
          <div className={styles.title} >Colour Palette Generator</div>
          <div className={styles.body}>
            The colour palettes generated are from AI arts sampled from a stable diffusion model trained on artworks from different art movements
          </div>
        </div>
        <ColorGrid colors={colors}/>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.colorButtonGrid}>
          {colorFilters.map(( filter, index ) => (
            <div 
              key={`color-filter-${index}`}
              onClick={() => {
                setColorFilter(prev => {
                  return {
                    ...prev,
                    [filter]: !prev[filter]
                  }
                })
              }}
            >
              <ColorButton
                colorName={filter}
                selected={colorFilter[filter]}
              />
            </div>
          ))}
        </div>
        <div className={styles.styleButtonRow}>
          {styleFilters.map(( filter, index ) => (
            <div 
              key={`style-filter-${index}`}
              onClick={() => {
                setStyleFilter((prev) => {
                  return {
                    [filter]: !prev[filter]
                  } as StyleFilter
                })
              }}
            >
              <div className={`${styles.styleButton} ${styleFilter[filter] ? styles.selected : ''}`} >
                {filter}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.generateButton} onClick={() => {handleGenerate()}}>
          GENERATE
        </div>
      </div>
    </main>
  )
}
