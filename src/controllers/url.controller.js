const {
  createShortUrl,
  listUrls,
  findAndIncrement
} = require('../services/url.service');

function isValidUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function errorResponse(response, status, message) {
  return response.status(status).json({ error: message });
}

async function shortenUrl(request, response, next) {
  const { url } = request.body || {};
  if (!isValidUrl(url)) {
    return errorResponse(response, 400, 'A valid HTTP or HTTPS URL is required');
  }

  try {
    const record = await createShortUrl(url.trim());
    const baseUrl = (process.env.BASE_URL || `${request.protocol}://${request.get('host')}`).replace(/\/$/, '');
    return response.status(201).json({
      originalUrl: record.original_url,
      shortCode: record.short_code,
      shortUrl: `${baseUrl}/${record.short_code}`
    });
  } catch (error) {
    return next(error);
  }
}

async function getUrls(request, response, next) {
  try {
    const records = await listUrls();
    return response.json(records.map((record) => ({
      id: record.id,
      originalUrl: record.original_url,
      shortCode: record.short_code,
      shortUrl: `${(process.env.BASE_URL || `${request.protocol}://${request.get('host')}`).replace(/\/$/, '')}/${record.short_code}`,
      createdAt: record.created_at,
      clickCount: record.click_count
    })));
  } catch (error) {
    return next(error);
  }
}

async function redirectUrl(request, response, next) {
  try {
    const record = await findAndIncrement(request.params.shortCode);
    if (!record) return errorResponse(response, 404, 'Short URL not found');
    return response.redirect(302, record.original_url);
  } catch (error) {
    return next(error);
  }
}

module.exports = { shortenUrl, getUrls, redirectUrl, isValidUrl };
