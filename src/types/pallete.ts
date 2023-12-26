export type ColorFilter = {
  red: boolean;
  orange: boolean;
  brown: boolean;
  yellow: boolean;
  green: boolean;
  blue: boolean;
  purple: boolean;
  pink: boolean;
  white: boolean;
  black: boolean;
}

// string array of color names
export const colorFilters = Object.keys({
  red: false,
  yellow: false,
  pink: false,
  orange: false,
  purple: false,
  brown: false,
  blue: false,
  black: false,
  green: false,
  white: false,
} as ColorFilter) as (keyof ColorFilter)[];

export type StyleFilter = {
  cubism: boolean;
  'ukiyo-e': boolean;
  surrealism: boolean;
  impressionism: boolean;
  abstract: boolean;
}

// string array of style names
export const styleFilters = Object.keys({
  cubism: false,
  'ukiyo-e': false,
  surrealism: false,
  impressionism: false,
  abstract: false,
} as StyleFilter) as (keyof StyleFilter)[];

export type Palette = {
  paletteId: number;
  image: string;
  styleId: number;
  colors: [string, string, string, string, string, string, string]; // exactly 7 colors
};


export type PaletteCell = {
  w: number;
  h: number;
  x: number;
  y: number;
}

export type PaletteGrid = {
  width: number;
  height: number;
  cells: PaletteCell[];
}