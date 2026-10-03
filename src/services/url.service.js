const crypto = require('crypto');
const { query } = require('../config/database');
const { urlsCreatedTotal, redirectsTotal } = require('../metrics/metrics');

function generateShortCode() {
  return crypto.randomBytes(5).toString('base64url');
}

async function createShortUrl(originalUrl) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = generateShortCode();
    try {
      const result = await query(
        `INSERT INTO urls (original_url, short_code)
         VALUES ($1, $2)
         RETURNING id, original_url, short_code, created_at, click_count`,
        [originalUrl, shortCode]
      );
      urlsCreatedTotal.inc();
      return result.rows[0];
    } catch (error) {
      if (error.code !== '23505' || attempt === 4) throw error;
    }
  }
  throw new Error('Could not generate a unique short code');
}

async function listUrls() {
  const result = await query(
    `SELECT id, original_url, short_code, created_at, click_count
     FROM urls ORDER BY created_at DESC`
  );
  return result.rows;
}

async function findAndIncrement(shortCode) {
  const result = await query(
    `UPDATE urls
     SET click_count = click_count + 1
     WHERE short_code = $1
     RETURNING id, original_url, short_code, created_at, click_count`,
    [shortCode]
  );
  if (result.rows.length > 0) redirectsTotal.inc();
  return result.rows[0] || null;
}

module.exports = { generateShortCode, createShortUrl, listUrls, findAndIncrement };
