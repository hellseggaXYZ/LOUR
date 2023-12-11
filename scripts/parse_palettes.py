import pandas as pd
from dataclasses import dataclass
import colorsys
from typing import List, Dict


class Color:
  hex: str
  h: float
  s: float
  l: float

  HUE_CUTOFFS = {
    'red': [[0, 22],[340, 360]],
    'orange': [[23, 38]],
    'yellow': [[39, 70]],
    'green': [[71, 155]],
    'blue': [[156, 260]],
    'purple': [[261, 290]],
    'pink': [[291, 340]],
  }

  SATURATION_CUTOFFS = {
    'gray': [[0, 30]],
  }

  LIGHTNESS_CUTOFFS = {
    'black': [[0, 5]],
    'white': [[91, 100]],
  }

  def __init__(self, hex: str):
    self.hex = hex.lstrip('#')

    # Convert hex to RGB
    r, g, b = tuple(int(self.hex[i:i+2], 16) for i in (0, 2, 4))

    # Normalize RGB values to the range 0-1
    r, g, b = r / 255.0, g / 255.0, b / 255.0

    # Convert RGB to HSL
    h, l, s = colorsys.rgb_to_hls(r, g, b)

    # Convert H, L, S values to the range 0-100 and round them
    h = round(h * 360, 2)
    s = round(s * 100, 2)
    l = round(l * 100, 2)

    self.h = h
    self.s = s
    self.l = l

  def _get_filters_by_cutoff(self, cutoffs: Dict[str, List[List[int]]]) -> List[str]:
    res = []
    for color, ranges in cutoffs.items():
      for range in ranges:
        if self.h >= range[0] and self.h <= range[1]:
          res.append(color)
    
    return res
  
  def get_hsl_filters(self) -> List[str]:
    res = []
    res.extend(self._get_filters_by_cutoff(self.HUE_CUTOFFS))
    res.extend(self._get_filters_by_cutoff(self.SATURATION_CUTOFFS))
    res.extend(self._get_filters_by_cutoff(self.LIGHTNESS_CUTOFFS))

    return res
  
  @staticmethod
  def get_color_names() -> List[str]:
      res = []
      res.extend(Color.HUE_CUTOFFS.keys())
      res.extend(Color.SATURATION_CUTOFFS.keys())
      res.extend(Color.LIGHTNESS_CUTOFFS.keys())

      return res


def parse_color_categories(path):
  palletes_df = pd.read_csv(f'./{path}')


  # add new columns for color filters and set them to false
  color_filters = Color.get_color_names()
  for color_filter in color_filters:
    palletes_df[color_filter] = False

  # apply color filters to each row
  def apply_color_filters(row):
    colors: List[Color] = []
    # get all colors in the palette
    for i in range(1, 8):
      color = row[f'color{i}']
      if type(color) is str:
        colors.append(Color(color))
    
    # get all filters for each color
    filters = []
    for color in colors:
      filters.extend(color.get_hsl_filters())

    # set the relevant filters to true
    for filter in filters:
      row[filter] = True

    return row

  palletes_df = palletes_df.apply(apply_color_filters, axis=1)

  palletes_df.to_csv(f'./parsed_{path}', index=False)

def count_color_freq(path):
    palettes_df = pd.read_csv(path)

    # Aggregate color frequency across all color columns
    color_columns = [f'color{i}' for i in range(1, 8)]
    merged_color_freq = palettes_df[color_columns].apply(pd.Series.value_counts).sum(axis=1).sort_values(ascending=False)

    # Print top 50 colors
    for color, freq in merged_color_freq.head(50).items():
        print(f'{color}: {int(freq)}')

# count_color_freq('../palettes.csv')
parse_color_categories('palettes.csv')






  