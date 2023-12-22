'use server';

import { sql } from "@vercel/postgres";
import fs from 'fs';

const STYLE_COL = 1;
const COLORS_START_COL = 9;

class LocalCache {
  styles: { [key: string]: number } = {};
  colors: { [key: string]: number } = {};
}

export async function createTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS styles (
        style_id SERIAL PRIMARY KEY,
        style_name TEXT NOT NULL
      );
    `;
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
        UNIQUE(style, color1, color2, color3, color4, color5, color6, color7)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS colors (
        color_id SERIAL PRIMARY KEY,
        color_name TEXT NOT NULL
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS palettes_colors (
        palette_id INTEGER REFERENCES palettes(palette_id),
        color_id INTEGER REFERENCES colors(color_id),
        PRIMARY KEY (palette_id, color_id)
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


export async function populateTablesFromCSV() {
  try {
    const palletesCSV = fs.readFileSync(`/palettes.csv`, 'utf8');

    const styles: Set<string> = new Set();
    const colors: Set<string> = new Set();
    const rows = palletesCSV.split('\n');

    // get all color names from palettes.csv by looking at the headers
    // hard coded to skip the first 9 columns
    const headers = rows[0].split(',');
    headers.slice(COLORS_START_COL).forEach(color => {
      colors.add(color);
    });

    
    // get all styles from palettes.csv in the style column
    rows.shift(); // remove headers
    rows.forEach(row => {
      // get the style from the second column
      const style = row.split(',')[STYLE_COL];
      styles.add(style);
    });

    // populate styles table
    styles.forEach(async (style: string) => {
      await sql`
        INSERT INTO styles (style_name)
        VALUES (${style})
      `;
    });

    // populate colors table
    colors.forEach(async (color: string) => {
      await sql`
        INSERT INTO colors (color_name)
        VALUES (${color})
      `;
    });
  } catch (err) {
    console.error(err);
    throw new Error('Error populating tables from CSV');
  }
}
