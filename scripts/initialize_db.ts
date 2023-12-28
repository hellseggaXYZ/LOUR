// `$ npm run init-db` to run this script

import { VercelPoolClient, QueryResult, QueryResultRow, db } from "@vercel/postgres";
import fs from 'fs';
import { config } from 'dotenv';
config({ path: './.env.local' }); // load in .env.local explicitly

const STYLE_COL = 1; // column index of style name
const COLOR1_COL = 2; // Assuming color columns start from column 2 (idx of col for 'color1')
const COLOR_COUNT = 7; // Number of color columns (# of colors per pallete) assumes everything after are the color filters
const NUM_FILTERS = 10; // Number of color filters
const TOTAL_COLS = COLOR1_COL + COLOR_COUNT + NUM_FILTERS; // total number of columns in the csv

// simple local cache to avoid unnecessary db calls
class LocalCache {
  styles: { [key: string]: number } = {};
  filters: { [key: string]: number } = {};
}

export async function createTables() {
  const client = await db.connect();

  try {
    console.log("creating styles table...")
    await client.sql`
      CREATE TABLE IF NOT EXISTS styles (
        style_id SERIAL PRIMARY KEY,
        style_name TEXT NOT NULL UNIQUE
      );
    `;
    console.log("creating palettes table...")
    await client.sql`
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
    await client.sql`
      CREATE TABLE IF NOT EXISTS filters (
        filter_id SERIAL PRIMARY KEY,
        filter_name TEXT NOT NULL UNIQUE
      );
    `;
    console.log("creating palettes_filters table...")
    await client.sql`
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


// todo: write function to fetch and cache styles in the state/redis?

// helper function to fetch id for style or filter from the sql table
// todo: maybe do better error handling here but fine for now
async function fetchIdFromTable(client: VercelPoolClient, type: 'filter' | 'style', value: string, cache: LocalCache): Promise<number> {
  const table = type + 's';
  const id = type + '_id';
  const name = type + '_name';

  // check if value is in cache
  if (cache[table][value]) {
    return cache[table][value];
  }

  // if not in cache, fetch from db
  let res: QueryResult<QueryResultRow>

  if (type === 'style') {
    res = await client.sql`
      SELECT style_id
      FROM styles
      WHERE style_name = ${value}
    `;
  } else {
    res = await client.sql`
      SELECT filter_id
      FROM filters
      WHERE filter_name = ${value}
    `;
  }

  // if entry exists, cache and return id
  if (res.rowCount > 0) {
    cache[table][value] = res.rows[0][id];
  } else {
    // otherwise, insert into table and cache
    let id_res: QueryResult<QueryResultRow>
    if (type === 'style') {
      id_res = await client.sql`
        INSERT INTO styles (style_name)
        VALUES (${value})
        returning style_id
      `;
    } else {
      id_res = await client.sql`
        INSERT INTO filters (filter_name)
        VALUES (${value})
        returning filter_id
      `;
    }

    cache[table][value] = id_res.rows[0][id];
  }

  return cache[table][value];
}

export async function populateTablesFromCSV(path: string) {
  const client = await db.connect();

  try {
    console.log("reading csv...")
    const palettesCSV = fs.readFileSync(path, 'utf8');
    // const styles: Set<string> = new Set();
    // const colors: Set<string> = new Set();
    const cache = new LocalCache();
    const rows = palettesCSV.split('\n');

    console.log("parsing csv headers...")
    // Extract headers for color names
    const headers = rows.shift()?.split(','); // Remove headers
    if (!headers) {
      throw new Error('Error parsing CSV headers');
    }

    // get all filter names from palettes.csv by looking at the headers
    // hard coded to skip the first 9 columns
    const filters = headers.slice(COLOR1_COL + COLOR_COUNT) // array storing all filter names

    console.log("populating styles table...")
    for (const filter of filters) {
      const filter_name = filter.trim();
      // cache filter ids by "fetching" id
      await fetchIdFromTable(client, 'filter', filter_name, cache);
    }

    console.log("populating palettes table...")
    let count = 0;
    for (const row of rows) {
      count++;
      console.log("inserting row #" + count)
      const columns = row.split(',');
      if (columns.length != TOTAL_COLS) {
        console.log(`invalid # of cols. skipping row ${count}: ${row}`);
        continue;
      }
      const image = columns[0].trim();
      const style = columns[STYLE_COL].trim();
      const stlye_id = await fetchIdFromTable(client, 'style', style, cache); // cache style ids and populate styles table
      const colors = columns.slice(COLOR1_COL, COLOR1_COL + COLOR_COUNT).map(color => color.trim());
      const filter_color_flags = columns.slice(COLOR1_COL + COLOR_COUNT).map(filter => filter.trim());

      // insert palette data
      // need to gaurantee that the number of colors on the pallete is 7
      if (colors.length !== COLOR_COUNT) {
        console.log(`img: ${image}, style: ${style}, colors: ${colors}`)
        throw new Error('Error parsing CSV: invalid number of colors');
      }

      const res = await client.sql`
        INSERT INTO palettes (image, style_id, color1, color2, color3, color4, color5, color6, color7)
        VALUES (${image}, ${stlye_id}, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]}, ${colors[4]}, ${colors[5]}, ${colors[6]})
        RETURNING palette_id
      `;
      const pallete_id = res.rows[0].palette_id;
    
      // populate filters table and palettes_filters table
      for (const [index, flag] of filter_color_flags.entries()) {
        if (flag === '1') {
          const filter_name = filters[index];
          const filter_id = await fetchIdFromTable(client, 'filter', filter_name, cache);
          await client.sql`
            INSERT INTO palettes_filters (palette_id, filter_id)
            VALUES (${pallete_id}, ${filter_id})
          `;
        }
      }
    }
  } catch (err) {
    console.error(err);
    throw new Error('Error populating tables from CSV');
  }
}

async function clearTables() {
  const client = await db.connect();

  try {
    await client.sql`DELETE FROM palettes_filters;`
    await client.sql`DELETE FROM palettes;`
    await client.sql`DELETE FROM styles;`
    await client.sql`DELETE FROM filters;`
  } catch (err) {
    console.error(err);
    throw new Error('Error clearing tables');
  }
}

// start of script
async function main() {
  console.log('Clearing tables...');
  clearTables()
  console.log('Creating tables...');
  await createTables();
  console.log('Populating tables from CSV...');
  await populateTablesFromCSV('./scripts/parsed_palettes.csv');

}

main().catch(err => {
  console.error(err);
  process.exit(1);
});