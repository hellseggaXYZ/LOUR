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
  const [maxIndex, setMaxIndex] = useState<number>(0)
  const [styleIdMap, setStyleIdMap] = useState<Map<number, string>>({} as Map<number, string>)

  // newIndex: the index the search should start from
  // shouldGenerate: whether to generate a new pallete after fetching the palettes
  async function updatePalletes(newIndex: number, shouldGenerate: boolean = false) {
    const { palettes: newPalettes, maxIndex: newMaxIndex } = await fetchPalettes(styleFilter, colorFilter, newIndex, 50)

    console.log('fetched palettes', newPalettes)

    // if the newIndex is 0 then replace the palettes
    // this means that the user has changed the filter
    if (newIndex === 0) {
      setPalettes(newPalettes);
    } else {
      // else append to existing palettes
      // evict the first 50 palettes if the combined length is over 300
      setPalettes(prev => {
        // Combine the old and new palettes
        const combinedPalettes = [...prev, ...newPalettes];
    
        // If the combined length is over 300, truncate the first 50 entries
        if (combinedPalettes.length > 300) {
          return combinedPalettes.slice(50);
        } else {
          return combinedPalettes;
        }
      });
    }
    

    setMaxIndex(newMaxIndex)

    if (shouldGenerate) {
      handleGenerate(newPalettes)
    }
  }

  async function updateStyleIdMap() {
    const newStyleIdMap = await fetchStyles()
    setStyleIdMap(newStyleIdMap)
  }

  useEffect(() => {
    updateStyleIdMap()
    updatePalletes(0, true)
  }, []) 

  useEffect(() => {
    updatePalletes(0)
  }, [styleFilter, colorFilter])


  async function handleGenerate(newPalletes: Palette[] = palettes) {
    if (newPalletes.length === 0) {
      console.log('no palettes')
      return;
    }

    // fetch new palettes
    updatePalletes(maxIndex)

  
    let selectedPalette;
    let attempts = 0;
    do {
      // Choose a random palette from the list of palettes
      const randomIndex = Math.floor(Math.random() * newPalletes.length);
      selectedPalette = newPalletes[randomIndex];
  
      // Increment attempts to avoid an infinite loop in rare cases
      attempts++;
  
      // If only one palette is available, or too many attempts, break the loop
      if (newPalletes.length === 1 || attempts > 50) {
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
      <div className={styles.alignContainer}>
        <div className={styles.titleContainer}>
          <div className={styles.title} >Colour Palette Generator</div>
          <div className={styles.body}>
            The colour palettes generated are from AI arts sampled from a stable diffusion model trained on artworks from different art movements
          </div>
        </div>
        <div className={styles.mainPanel}>
          <div className={styles.leftPanel}>
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
            <div className={styles.styleContainer}>
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
          </div>
        </div>
      </div>
    </main>
  )
}
