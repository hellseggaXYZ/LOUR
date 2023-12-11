export type ColorFlags = {
  red: boolean;
  orange: boolean;
  yellow: boolean;
  green: boolean;
  blue: boolean;
  purple: boolean;
  pink: boolean;
  gray: boolean;
  white: boolean;
  black: boolean;
}

export type Palette = {
  palette_id: number;
  image: string;
  style_id: number;
  colors: [string, string, string, string, string, string, string]; // exactly 7 colors
  color_flags: ColorFlags;
};