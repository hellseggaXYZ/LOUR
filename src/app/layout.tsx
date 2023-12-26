import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from '@next/font/local'
import Document, { Html, Head, Main, NextScript } from 'next/document'


export const metadata: Metadata = {
  title: 'LOUR',
  description: 'Colour Palette Generator',
}


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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={sfProDisplay.className}>{children}</body>
    </html>
  )
}
