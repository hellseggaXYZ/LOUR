'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import localFont from '@next/font/local'
import ColorGrid from '@/components/ColorGrid'
import { styleFilters, colorFilters, StyleFilter, ColorFilter, Palette } from '@/types/pallete'
import { fetchPalettes } from '@/server/db'

const sfProDisplay = localFont({
  src: [
    { path: '../font/SF-Pro-Display/sf-pro-display_ultralight.woff2', weight: '100',  style: 'normal' },
    { path: '../font/SF-Pro-Display/sf-pro-display_light.woff2', weight: '200',  style: 'normal' },
    { path: '../font/SF-Pro-Display/sf-pro-display_thin.woff2', weight: '300',  style: 'normal' },
    { path: '../font/SF-Pro-Display/sf-pro-display_regular.woff2', weight: '400',  style: 'normal' },
    { path: '../font/SF-Pro-Display/sf-pro-display_medium.woff2', weight: '500',  style: 'normal' },
    { path: '../font/SF-Pro-Display/sf-pro-display_semibold.woff2', weight: '600',  style: 'normal' },
    { path: '../font/SF-Pro-Display/sf-pro-display_bold.woff2', weight: '700',  style: 'normal' },
  ],
  variable:'--font',
})

export default function Home() {
  const [colors, setColors] = useState<[string, string, string, string, string, string, string]>(
    // default color
    ['#F4F4F4', '#E4D2D8', '#C8D5BB', '#C099A0', '#D4DCDA', '#80989B', '#E5E4E6']
  )
  const [selectedPaletteId, setSelectedPaletteId] = useState<number | null>(null)
  const [colorFilter, setColorFilter] = useState<ColorFilter>({} as ColorFilter)
  const [styleFilter, setStyleFilter] = useState<StyleFilter>({} as StyleFilter)
  const [palettes, setPalettes] = useState<Palette[]>([])
    
  
  async function updatePalletes() {
    const newPalettes = await fetchPalettes(styleFilter, colorFilter)
    setPalettes(newPalettes)
  }

  // todo: log fetched palletes and also log the displayed pallete with info
  // todo: faster and more efficient way to fetch 
  // should probably fetch on filter change 



  async function handleGenerate() {
    // // Check if there are palettes available
    // if (palettes.length === 0) {

    //   console.log('no palettes')
    //   // Optionally handle the case where no palettes are available
    //   return;
    // }

    const newPalettes = await fetchPalettes(styleFilter, colorFilter)

    console.log(newPalettes)
  
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
  
    // Set the colors and the selectedPaletteId state
    setColors(selectedPalette.colors);
    setSelectedPaletteId(selectedPalette.paletteId);
  }
  
  

  return (
    <main className={sfProDisplay.className}>
      <div className={styles.titleContainer}>
        <div className={styles.title} >Colour Palette Generator</div>
        <div className={styles.body}>
          The colour palettes generated are from AI arts sampled from a stable diffusion model trained on artworks from different art movements
        </div>
        <div className={styles.button} onClick={() => {handleGenerate()}}>
          GENERATE
        </div>
        <ColorGrid colors={colors}/>
      </div>
    </main>
  )
}
