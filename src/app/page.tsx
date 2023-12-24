'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import localFont from '@next/font/local'
import ColorGrid from '@/components/ColorGrid'
import { stylesFilters, colorFilters } from '@/util/constants'


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
  const [colors, setColors] = useState<string[]>([])
  const [colorFilter, setColorFilter] = useState<string>('')
  const [styleFilter, setStyleFilter] = useState<string>('')

  useEffect(() => {
    setColors(['#F4F4F4', '#E4D2D8', '#C8D5BB', '#C099A0', '#D4DCDA', '#80989B', '#E5E4E6'])
  }, [])
    
  function handleGenerate() {
    console.log('generate')
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
