'use server';

import { Pool } from 'pg';
import { StyleFilter, ColorFilter, Palette } from "@/types/pallete";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

export async function fetchPalettes(
  styleFilters: StyleFilter, 
  colorFilters: ColorFilter, 
  minIndex: number = 0,
  querySize: number = 50
): Promise<{ palettes: Palette[], maxIndex: number }> {
  // Filter and map style and color conditions
  const styleConditions = Object.entries(styleFilters)
    .filter(([_, value]) => value)
    .map(([key, _]) => `styles.style_name = '${key}'`);
  const colorConditions = Object.entries(colorFilters)
    .filter(([_, value]) => value)
    .map(([key, _]) => `EXISTS (
      SELECT 1 
      FROM palettes_filters 
      JOIN filters ON palettes_filters.filter_id = filters.filter_id 
      WHERE palettes_filters.palette_id = palettes.palette_id 
      AND filters.filter_name = '${key}')`
    );

  // Construct the WHERE clause based on provided conditions
  // the color fitlers should filter for palletes that have all the colors and NOT one of the colors
  // style filter expected to only have one but just to be safe here
  // Build the WHERE clause with minIndex and querySize
  let whereClause = `WHERE palettes.palette_id > ${minIndex}`;
  if (styleConditions.length > 0) {
    whereClause += ` AND (${styleConditions.join(' OR ')})`;
  }
  if (colorConditions.length > 0) {
    whereClause += ` AND (${colorConditions.join(' AND ')})`;
  }

  // Build the complete SQL query with ordering and limit
  const queryString = `
    SELECT palettes.*
    FROM palettes 
    JOIN styles ON palettes.style_id = styles.style_id 
    ${whereClause}
    ORDER BY palettes.palette_id ASC
    LIMIT ${querySize}
  `;

  console.log('query', queryString)

  try {
    const client = await pool.connect();
    const result = await client.query(queryString);
    client.release();

    const palettes: Palette[] = result.rows.map(row => ({
      paletteId: row.palette_id,
      image: row.image,
      styleId: row.style_id,
      colors: [row.color1, row.color2, row.color3, row.color4, row.color5, row.color6, row.color7]
    }));

    const maxIndex = result.rows.length > 0 ? result.rows[result.rows.length - 1].palette_id : minIndex;

    return {
      palettes,
      maxIndex // return the maximum index found in the query
    };

  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}

// return a map from style to style id
export async function fetchStyles(): Promise<Map<number, string>> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM styles');
    client.release();

    const styles = new Map<number, string>()
    result.rows.forEach(row => styles.set(row.style_id, row.style_name));
    return styles;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}