// `$ npm run init-db` to run this script

import { sql, QueryResult, QueryResultRow } from "@vercel/postgres";
import fs from 'fs';
import { config } from 'dotenv';
config({ path: './.env.local' }); // load in .env.local explicitly

const STYLE_COL = 1;
const COLOR1_COL = 2; // Assuming color columns start from column 2
const COLOR_COUNT = 7; // Number of color columns


class LocalCache {
  styles: { [key: string]: number } = {};
  filters: { [key: string]: number } = {};
}

export async function createTables() {
  try {
    console.log("creating styles table...")
    await sql`
      CREATE TABLE IF NOT EXISTS styles (
        style_id SERIAL PRIMARY KEY,
        style_name TEXT NOT NULL UNIQUE
      );
    `;
    console.log("creating palettes table...")
    await sql`
      CREATE TABLE IF NOT EXISTS palettes (
        palette_id SERIAL PRIMARY KEY,
        image TEXT,
        style_id INTEGER REFERENCES styles(style_id),
        color1 TEXT DEFAULT '#000000',
        color2 TEXT DEFAULT '#000000',
        color3 TEXT DEFAULT '#000000',
        color4 TEXT DEFAULT '#000000',
        color5 TEXT DEFAULT '#000000',
        color6 TEXT DEFAULT '#000000',
        color7 TEXT DEFAULT '#000000',
        UNIQUE(style_id, color1, color2, color3, color4, color5, color6, color7)
      );
    `;
    console.log("creating filters table...")
    await sql`
      CREATE TABLE IF NOT EXISTS filters (
        filter_id SERIAL PRIMARY KEY,
        filter_name TEXT NOT NULL UNIQUE
      );
    `;
    console.log("creating palettes_filters table...")
    await sql`
      CREATE TABLE IF NOT EXISTS palettes_filters (
        palette_id INTEGER REFERENCES palettes(palette_id),
        filter_id INTEGER REFERENCES filters(filter_id),
        PRIMARY KEY (palette_id, filter_id)
      );
    `;
  } catch (err) {
    console.error(err);
    throw new Error('Error creating tables');
  }
}

// todo: finish populating the tables from the csv
// todo: write function to fetch and cache styles in the state/redis?
// todo: make sure colors are ordered lexigraphically on insertion

// helper function to fetch id for style or filter
// todo: maybe do better error handling here but fine for now
async function fetchIdFromTable(type: 'filter' | 'style', value: string, cache: LocalCache): Promise<number> {
  const table = type + 's';
  const id = type + '_id';
  const name = type + '_name';

  // check if value is in cache
  if (cache[table][value]) {
    return cache[table][value];
  }

  // if not in cache, fetch from db
  const res: QueryResult<QueryResultRow> = await sql`
    SELECT ${id}
    FROM ${table}
    WHERE ${name} = ${value}
  `;
  
  // if entry exists, cache and return id
  if (res.rowCount > 0) {
    cache[table][value] = res.rows[0][id];
  } else {
    // otherwise, insert into table and cache
    const res: QueryResult<QueryResultRow> = await sql`
      INSERT INTO ${table} (${name})
      VALUES (${value})
      RETURNING ${id}
    `;
    cache[table][value] = res.rows[0][id];
  }

  return cache[table][value];
}

export async function populateTablesFromCSV(path: string) {
  try {
    const palettesCSV = fs.readFileSync(path, 'utf8');
    // const styles: Set<string> = new Set();
    // const colors: Set<string> = new Set();
    const cache = new LocalCache();
    const rows = palettesCSV.split('\n');

    // Extract headers for color names
    const headers = rows.shift()?.split(','); // Remove headers
    if (!headers) {
      throw new Error('Error parsing CSV headers');
    }

    // get all filter names from palettes.csv by looking at the headers
    // hard coded to skip the first 9 columns
    const filters = headers.slice(COLOR1_COL + COLOR_COUNT)
    for (const filter of filters) {
      const filter_name = filter.trim();
      // cache filter ids by "fetching" id
      await fetchIdFromTable('filter', filter_name, cache);
    }

    for (const row of rows) {
      const columns = row.split(',');
      const image = columns[0].trim();
      const style = columns[STYLE_COL].trim();
      const stlye_id = await fetchIdFromTable('style', style, cache); // cache style ids and populate styles table
      const colors = columns.slice(COLOR1_COL, COLOR1_COL + COLOR_COUNT).map(color => color.trim());
      const filter_flags = columns.slice(COLOR1_COL + COLOR_COUNT).map(filter => filter.trim());

      // insert palette data
      if (colors.length !== COLOR_COUNT) {
        console.log(`img: ${image}, style: ${style}, colors: ${colors}`)
        throw new Error('Error parsing CSV: invalid number of colors');
      }
      const res = await sql`
        INSERT INTO palettes (image, style_id, color1, color2, color3, color4, color5, color6, color7)
        VALUES (${image}, ${stlye_id}, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]}, ${colors[4]}, ${colors[5]}, ${colors[6]})
        RETURNING palette_id
      `;
      const pallete_id = res.rows[0].palette_id;
    
      // populate filters table and palettes_filters table
      for (const [index, filter_flag] of filter_flags.entries()) {
        if (filter_flag === '1') {
          const filter_name = filters[index];
          const filter_id = await fetchIdFromTable('filter', filter_name, cache);
          await sql`
            INSERT INTO palettes_filters (palette_id, filter_id)
            VALUES (${pallete_id}, ${filter_id})
          `;
        }
      }



    }

    // Extract styles and prepare palettes data
    rows.forEach(async (row) => {
      const columns = row.split(',');
      const image = columns[0].trim();
      const style = columns[STYLE_COL].trim();
      // populates the styles table and caches the id
      const style_id = await fetchIdFromTable('style', style, cache);

      // insert palette data
      const palette = {
        image: columns[0].trim(),
        style: style,
        colors: columns.slice(COLOR1_COL, COLOR1_COL + COLOR_COUNT).map(color => color.trim()),
        filters: columns.slice(COLOR1_COL + COLOR_COUNT).map(filter => filter.trim())
      };

      const res = sql`
        INSERT INTO palettes (image, style_id, color1, color2, color3, color4, color5, color6, color7)
        VALUES (${palette.image}, ${style_id}, ${palette.colors[0]}, ${palette.colors[1]}, ${palette.colors[2]}, ${palette.colors[3]}, ${palette.colors[4]}, ${palette.colors[5]}, ${palette.colors[6]})
        RETURNING palette_id
      `;
      
    });

    // Populate styles and colors tables
    await Promise.all(Array.from(styles).map(style => {
      return sql`INSERT INTO styles (style_name) VALUES (${style})`;
    }));

    await Promise.all(Array.from(colors).sort().map(color => {
      return sql`INSERT INTO colors (color_name) VALUES (${color})`;
    }));

    // Populate palettes table
    // Note: This part of the code needs to be adapted based on how you plan to store and reference styles and colors
    for (const palette of palettesData) {
      const { image, style, colors } = palette;
      const styleId = LocalCache.styles[style];
      // Insert palette data (assuming color columns are named color1, color2, etc.)
      const paletteId = (await sql`INSERT INTO palettes (image, style_id, color1, color2, color3, color4, color5, color6, color7) VALUES (${image}, ${styleId}, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]}, ${colors[4]}, ${colors[5]}, ${colors[6]}) RETURNING palette_id`).rows[0].palette_id;

      // Populate palettes_colors table
      // This assumes you have a mechanism to map color names to color_ids
      colors.forEach(async colorName => {
        const colorId = LocalCache.colors[colorName];
        await sql`INSERT INTO palettes_colors (palette_id, color_id) VALUES (${paletteId}, ${colorId})`;
      });
    }
  } catch (err) {
    console.error(err);
    throw new Error('Error populating tables from CSV');
  }
}

// Start of script
// console.log('Creating tables...');
// createTables().then(() => {
//   console.log('Populating tables from CSV...');
//   populateTablesFromCSV('path/to/your/csvfile.csv');
// });

// start of script
async function main() {
  console.log('Creating tables...');
  await createTables();
  console.log('Populating tables from CSV...');
  await populateTablesFromCSV('path/to/your/csvfile.csv');

}

main().catch(err => {
  console.error(err);
  process.exit(1);
});