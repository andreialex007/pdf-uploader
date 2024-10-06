const functions = require('firebase-functions');
const {google} = require('googleapis');
const {PDFDocument} = require('pdf-lib');
const express = require('express');
const {fromPath} = require('pdf2pic');

const app = express();

const slides = google.slides({
    version: 'v1',
    auth: process.env.GOOGLE_API_KEY,
});

app.post('/process-pdf', async (req, res) => {
    try {
        console.log('Request headers:', req.headers);

        let chunks = [];
        let totalBytes = 0;

        // Log incoming data size without logging the content
        req.on('data', (chunk) => {
            totalBytes += chunk.length;
            chunks.push(chunk);
        });

        req.on('end', async () => {
            console.log(`Received a total of ${totalBytes} bytes of data.`);

            const body = Buffer.concat(chunks);
            const boundary = req.headers['content-type'].split('boundary=')[1];
            const parts = body.toString().split(`--${boundary}`);

            let pdfBuffer;
            let presentationId;

            for (const part of parts) {
                if (part.includes('name="presentationId"')) {
                    presentationId = part.split('\r\n\r\n')[1].split('\r\n')[0];
                    console.log('Extracted presentationId:', presentationId);
                }
                if (part.includes('name="file"')) {
                    const filePart = part.split('\r\n\r\n')[1];
                    pdfBuffer = Buffer.from(filePart, 'binary');
                    console.log('Extracted PDF file buffer of size:', pdfBuffer.length, 'bytes');
                }
            }

            if (!presentationId) {
                return res.status(400).send('Presentation ID is required');
            }
            if (!pdfBuffer) {
                return res.status(400).send('No PDF file provided');
            }

            console.log('Processing PDF...');
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const pageCount = pdfDoc.getPageCount();
            console.log(`PDF has ${pageCount} pages.`);

            const imageBase64s = [];
            for (let i = 0; i < pageCount; i++) {
                const imageBase64 = await convertPageToImageBase64(pdfBuffer, i + 1);
                imageBase64s.push(imageBase64);
            }

            const requests = imageBase64s.map((imageBase64, index) => ({
                createSlide: {
                    objectId: `slide_${index + 1}`,
                    insertionIndex: `${index + 1}`,
                    slideLayoutReference: {predefinedLayout: 'BLANK'},
                },
                createImage: {
                    objectId: `image_${index + 1}`,
                    imageProperties: {
                        contentUrl: `data:image/png;base64,${imageBase64}`,
                    },
                    elementProperties: {
                        pageObjectId: `slide_${index + 1}`,
                        size: {
                            height: {magnitude: 300, unit: 'PT'},
                            width: {magnitude: 500, unit: 'PT'},
                        },
                        transform: {
                            scaleX: 1,
                            scaleY: 1,
                            translateX: 0,
                            translateY: 0,
                            unit: 'PT',
                        },
                    },
                },
            }));

            await slides.presentations.batchUpdate({
                presentationId,
                requestBody: {requests: requests.flat()},
            });

            console.log(`Slides added to presentation: https://docs.google.com/presentation/d/${presentationId}`);
            res.status(200).send(`Slides added to presentation: https://docs.google.com/presentation/d/${presentationId}`);
        });
    } catch (error) {
        console.error('Error processing PDF or generating slides:', error);
        res.status(500).send('Failed to process PDF or add slides to the presentation');
    }
});

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

exports.processPdf = functions.https.onRequest(app);
