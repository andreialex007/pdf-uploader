const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {google} = require('googleapis');
const {PDFDocument} = require('pdf-lib');
const express = require('express');
const multer = require('multer');  // Multer for handling file uploads

// Initialize Express app
const app = express();
const upload = multer();  // Initialize Multer

const slides = google.slides({
    version: 'v1',
    auth: process.env.GOOGLE_API_KEY,
});

logger.info('BEFORE CALL');

// Set up the endpoint for processing the PDF
app.post('/process-pdf', upload.single('file'), async (req, res) => {
    logger.info('IN HANDLER');

    try {
        logger.info('Request headers:', req.headers);

        const presentationId = req.body.presentationId;
        const pdfBuffer = req.file.buffer;

        if (!presentationId) {
            return res.status(400).send('Presentation ID is required');
        }
        if (!pdfBuffer) {
            return res.status(400).send('No PDF file provided');
        }

        logger.info('Processing PDF...');


        logger.info(`Slides added to presentation: https://docs.google.com/presentation/d/${presentationId}`);
        res.status(200).send(`Slides added to presentation: https://docs.google.com/presentation/d/${presentationId}`);
    } catch (error) {
        logger.error('Error processing PDF or generating slides:', error);
        res.status(500).send('Failed to process PDF or add slides to the presentation');
    }
});

logger.info('AFTER CALL');

async function convertPageToImageBase64(pdfBuffer, pageNumber) {
    const converter = fromPath(Buffer.from(pdfBuffer), {
        density: 300,
        format: 'png',
        width: 1000,
        height: 1500,
        page: pageNumber,
    });

    const result = await converter(pageNumber);
    return result.base64;
}

// Export the function using Firebase Functions v2 "onRequest" trigger
exports.processPdf = onRequest(app);
