import Image from 'next/image'
import styles from './page.module.css'
import localFont from '@next/font/local'
import ColorGrid from '@/components/ColorGrid'


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


  const colors = ['#F4F4F4', '#E4D2D8', '#C8D5BB', '#C099A0', '#D4DCDA', '#80989B', '#E5E4E6']; // Your color array

  return (
    <main className={sfProDisplay.className}>
      <div className={styles.titleContainer}>
        <div className={styles.title} >Colour Palette Generator</div>
        <div className={styles.body}>
          The colour palettes generated are from AI arts sampled from a stable diffusion model trained on artworks from different art movements
        </div>
        <ColorGrid colors={colors}/>
      </div>
      


      {/* <div className={styles.colourContainer}>
        <div style={{ position: "absolute", left: "13vw", top: "33vh", width: "400px", height: "400px", backgroundColor: "#F4F4F4" }}>
        </div>
        <div style={{ position: "absolute", left: "300px", top: "0px", width: "100px", height: "100px", backgroundColor: "#E4D2D8" }}>
        </div>
        <div style={{ position: "absolute", left: "300px", top: "100px", width: "100px", height: "300px", backgroundColor: "#C099A0" }}>
        </div>
        <div style={{ position: "absolute", left: "100px", top: "100px", width: "200px", height: "200px", backgroundColor: "#C8D5BB" }}>
        </div>
        <div style={{ position: "absolute", left: "0px", top: "200px", width: "100px", height: "100px", backgroundColor: "#D4DCDA" }}>
        </div>
        <div style={{ position: "absolute", left: "100px", top: "200px", width: "100px", height: "100px", backgroundColor: "#80989B" }}>
        </div>
        <div style={{ position: "absolute", left: "0px", top: "300px", width: "300px", height: "100px", backgroundColor: "#E5E4E6" }}>
        </div>
      </div> */}
    </main>
  )
}
