import { PaletteCell, PaletteGrid } from "@/types/pallete"

const pattern0 = [
  0, 0, 0, 0, 
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
]

const pattern1 = [
  0, 0, 0, 1, 
  0, 2, 2, 3,
  4, 5, 2, 3,
  6, 6 ,6, 3
]

const grid1: PaletteGrid = {
  width: 4,
  height: 4,
  cells: [
    { w: 3, h: 2, x: 0, y: 0 },
    { w: 1, h: 1, x: 3, y: 0 },
    { w: 2, h: 2, x: 1, y: 1 },
    { w: 1, h: 3, x: 3, y: 1 },
    { w: 1, h: 1, x: 0, y: 2 },
    { w: 1, h: 1, x: 1, y: 2 },
    { w: 3, h: 1, x: 0, y: 3 },
  ]
}

export const grids = [
  grid1
]

export const patterns = [
  pattern0,
  pattern1,
]

export function isLight(colorHex: string) {
  // Convert hex to RGB
  const hex = colorHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128; // Threshold can be adjusted if necessary
}