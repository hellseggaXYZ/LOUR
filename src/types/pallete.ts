export type ColorFilter = {
  red: boolean;
  orange: boolean;
  brown: boolean;
  yellow: boolean;
  green: boolean;
  blue: boolean;
  purple: boolean;
  pink: boolean;
  gray: boolean;
  white: boolean;
  black: boolean;
}

// string array of color names
export const colorFilters = Object.keys({
  red: false,
  orange: false,
  brown: false,
  yellow: false,
  green: false,
  blue: false,
  purple: false,
  pink: false,
  gray: false,
  white: false,
  black: false,
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