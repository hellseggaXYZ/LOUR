const pattern1 = [
  0, 0, 0, 1, 
  0, 2, 2, 3,
  4, 5, 2, 3,
  6, 6 ,6, 3
]


export const patterns = [
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