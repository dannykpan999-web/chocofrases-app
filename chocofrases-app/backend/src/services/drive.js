const { google } = require('googleapis');
const { Readable } = require('stream');
const config = require('../config');
const logger = require('../utils/logger');

const getAuth = () => {
  const creds = JSON.parse(config.google.serviceAccountJson);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
};

const uploadRemito = async (pdfBuffer, filename) => {
  try {
    const auth   = getAuth();
    const drive  = google.drive({ version: 'v3', auth });
    const stream = Readable.from(pdfBuffer);

    const res = await drive.files.create({
      requestBody: {
        name:    filename,
        mimeType: 'application/pdf',
        parents: [config.google.driveFolderId],
      },
      media: {
        mimeType: 'application/pdf',
        body:     stream,
      },
      fields: 'id, webViewLink',
    });

    // Make publicly readable
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return { fileId: res.data.id, url: res.data.webViewLink };
  } catch (err) {
    logger.error('Drive uploadRemito error:', err.message);
    return null;
  }
};

module.exports = { uploadRemito };
