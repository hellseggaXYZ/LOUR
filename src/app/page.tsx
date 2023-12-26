'use client'

import { useState, useEffect, use } from 'react'
import styles from './page.module.css'
import PalleteGrid from '@/components/PalleteGrid'
import ColorButton from '@/components/ColorButton'
import { styleFilters, colorFilters, StyleFilter, ColorFilter, Palette } from '@/types/pallete'
import { fetchPalettes, fetchStyles } from '@/server/db'


export default function Home() {
  const [colors, setColors] = useState<[string, string, string, string, string, string, string]>(
    // default color
    // ['#F4F4F4', '#E4D2D8', '#C8D5BB', '#C099A0', '#D4DCDA', '#80989B', '#E5E4E6']
    ['#F4F4F4', '#F4F4F4', '#F4F4F4', '#F4F4F4', '#F4F4F4', '#F4F4F4', '#F4F4F4']
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

  useEffect(() => {
    updatePalletes()
  }, [styleFilter, colorFilter])

  // todo: faster and more efficient way to fetch 
  // todo: should probably fetch on filter change 
  // todo: better skeleton loading (maybe just fetch one palette and use that as skeleton)
  // todo: should evict pallete after displaying it unless there is less than 5 palletes then just loop it at the back
  // no need to randomize

  async function handleGenerate() {
    // // Check if there are palettes available
    // if (palettes.length === 0) {

    //   console.log('no palettes')
    //   // Optionally handle the case where no palettes are available
    //   return;
    // }


    if (palettes.length === 0) {
      console.log('no palettes')
      return;
    }

    console.log('fetched palettes', palettes)
  
    let selectedPalette;
    let attempts = 0;
    do {
      // Choose a random palette from the list of palettes
      const randomIndex = Math.floor(Math.random() * palettes.length);
      selectedPalette = palettes[randomIndex];
  
      // Increment attempts to avoid an infinite loop in rare cases
      attempts++;
  
      // If only one palette is available, or too many attempts, break the loop
      if (palettes.length === 1 || attempts > 50) {
        break;
      }
    } while (selectedPalette.paletteId === selectedPaletteId);
  
    console.log("selected new palette", selectedPalette)
    if (styleIdMap.size > 0) { // Check if the Map has entries
      console.log("style: ", styleIdMap.get(selectedPalette.styleId) || "no style id");
    }

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
        <PalleteGrid colors={colors}/>
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
