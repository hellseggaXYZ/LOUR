import pandas as pd
from dataclasses import dataclass
import colorsys
from typing import List, Dict, Tuple

@dataclass
class Filter:
    name: str
    hue_ranges: List[Tuple[int, int]]
    saturation_ranges: List[Tuple[int, int]]
    lightness_ranges: List[Tuple[int, int]]


class Color:
  hex: str
  h: float
  s: float
  l: float

  # cutoffs should be NON-OVERLAPPING
  HUE_CUTOFFS: Dict[str, List[Tuple[float, float]]] = {
    'red': [[0, 22],[340.01, 360]],
    'orange': [[22.01, 39]],
    'yellow': [[39.01, 70]],
    'green': [[70.01, 155]],
    'blue': [[155.01, 260]],
    'purple': [[260.01, 290]],
    'pink': [[290.01, 340]],
  }

  SATURATION_CUTOFFS: Dict[str, List[Tuple[float, float]]] = {
    'gray': [[0, 30]],
  }

  LIGHTNESS_CUTOFFS: Dict[str, List[Tuple[float, float]]] = {
    'black': [[0, 5]],
    'dark': [[5.01, 35]],
    'light': [[75, 90]],
    'white': [[90.01, 100]],
  }

  FILTERS: List[Filter] = [
    # check lightness first
    Filter('black', [], [], LIGHTNESS_CUTOFFS['black']),
    Filter('white', [], [], LIGHTNESS_CUTOFFS['white']),
    # then check saturation
    Filter('gray', [], SATURATION_CUTOFFS['gray'], []),
    # then check hue combinations
    Filter('pink', HUE_CUTOFFS['red'], [], LIGHTNESS_CUTOFFS['light']),
    Filter('brown', HUE_CUTOFFS['orange'], [], LIGHTNESS_CUTOFFS['dark']),
    # then check hue filters
    Filter('red', HUE_CUTOFFS['red'], [], []),
    Filter('orange', HUE_CUTOFFS['orange'], [], []),
    Filter('yellow', HUE_CUTOFFS['yellow'], [], []),
    Filter('green', HUE_CUTOFFS['green'], [], []),
    Filter('blue', HUE_CUTOFFS['blue'], [], []),
    Filter('purple', HUE_CUTOFFS['purple'], [], []),
    Filter('pink', HUE_CUTOFFS['pink'], [], []),
  ]


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

    # flatten lists of ranges and check for overlap

    hue_ranges = [range for ranges in Color.HUE_CUTOFFS.values() for range in ranges] # ranges: List[List[int]], range: List[int]
    saturation_ranges = [range for ranges in Color.SATURATION_CUTOFFS.values() for range in ranges]
    lightness_ranges = [range for ranges in Color.LIGHTNESS_CUTOFFS.values() for range in ranges]

    if self._check_overlap(hue_ranges):
      raise Exception('Hue ranges overlap')
    if self._check_overlap(saturation_ranges):
      raise Exception('Saturation ranges overlap')
    if self._check_overlap(lightness_ranges):
      raise Exception('Lightness ranges overlap')

  def _check_overlap(self, ranges: List[List[int]]) -> bool:
    # sorts ranges by start value
    ranges.sort(key=lambda x: x[0])

    # checks if any range overlaps with the next range
    for i in range(len(ranges) - 1):
      if ranges[i][1] >= ranges[i+1][0]:
        return True
    
    return False

  def _check_filter(self, filter: Filter) -> bool:
    # Check passes if no hue ranges found or if hue is in any of the ranges
    hue_check = any(self.h >= hue_range[0] and self.h <= hue_range[1] for hue_range in filter.hue_ranges) if filter.hue_ranges else True
    # Check saturation
    saturation_check = any(self.s >= saturation_range[0] and self.s <= saturation_range[1] for saturation_range in filter.saturation_ranges) if filter.saturation_ranges else True
    # Check lightness
    lightness_check = any(self.l >= lightness_range[0] and self.l <= lightness_range[1] for lightness_range in filter.lightness_ranges) if filter.lightness_ranges else True

    # Return True if all checks pass
    return hue_check and saturation_check and lightness_check


  def get_filter(self) -> str:
    for filter in Color.FILTERS:
      if self._check_filter(filter):
        return filter.name
      
    # should never reach here 
    raise Exception('No filter found for color ' + self.hex)
  
    return ''
  
  @staticmethod
  def get_color_names() -> List[str]:
    res = []
    seen = set()

    for filter in Color.FILTERS:
      if filter.name not in seen:
        seen.add(filter.name)
      res.append(filter.name)

    return res


def parse_color_categories(path):
  palletes_df = pd.read_csv(f'./{path}')


  # add new columns for color filters and set them to false
  color_filters = Color.get_color_names()
  for color_filter in color_filters:
    palletes_df[color_filter] = '0'

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
      filters.append(color.get_filter())

    # set the relevant filters to true
    for filter in filters:
      row[filter] = '1'

    return row

  palletes_df = palletes_df.apply(apply_color_filters, axis=1)

  palletes_df.to_csv(f'./parsed_{path}', index=False)

# count color frequency across all palettes
# check for color duplicates in palettes
def count_color_freq(path):
    palettes_df = pd.read_csv(path)

    # Aggregate color frequency across all color columns
    color_columns = [f'color{i}' for i in range(1, 8)]
    merged_color_freq = palettes_df[color_columns].apply(pd.Series.value_counts).sum(axis=1).sort_values(ascending=False)

    # Print top 50 colors
    for color, freq in merged_color_freq.head(50).items():
        print(f'{color}: {int(freq)}')

# count_color_freq('../palettes.csv')
parse_color_categories('palettes_sm.csv')






  