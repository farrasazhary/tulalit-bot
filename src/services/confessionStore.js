import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');
const FILE_PATH = path.join(DATA_DIR, 'confessions.json');

/**
 * Gets the next confession ID and updates the count on disk.
 * Handles directory creation and error fallbacks.
 *
 * @returns {number} The next sequential confession ID.
 */
export function getNextConfessionId() {
  try {
    // Ensure the data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let data = { lastId: 0 };

    // Read existing file if it exists
    if (fs.existsSync(FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
        data = JSON.parse(fileContent);
      } catch (readError) {
        console.error('[Confession Store] Failed to parse confessions.json, resetting counter.', readError);
      }
    }

    // Increment ID
    data.lastId = (data.lastId || 0) + 1;

    // Write back to disk
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return data.lastId;
  } catch (error) {
    console.error('[Confession Store Error] Error getting next confession ID:', error);
    // Fallback to random ID if filesystem fails completely
    return Math.floor(Math.random() * 10000) + 1;
  }
}
