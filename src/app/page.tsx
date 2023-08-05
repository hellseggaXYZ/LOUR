import Image from 'next/image'
import styles from './page.module.css'
import localFont from '@next/font/local'


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
  return (
    <main className={sfProDisplay.className}>
      <div className={styles.title} style={{position: "absolute", left: "13vw", top: "20vh"}}>Colour Palette Generator</div>
      <div className={styles.body} style={{position: "absolute", left: "13vw", top: "24vh"}}>
        The colour palettes generated are from AI arts sampled from a stable diffusion model trained on artworks from historic art movements
      </div>
    </main>
  )
}
