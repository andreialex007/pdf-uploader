const functions = require('firebase-functions');
const {google} = require('googleapis');
const {PDFDocument} = require('pdf-lib');
const {createCanvas} = require('canvas');
const express = require('express');
const bodyParser = require('body-parser');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const slides = google.slides({
    version: 'v1',
    auth: process.env.GOOGLE_API_KEY, // Set your Google API Key here
});

app.post('/process-pdf', async (req, res) => {
    try {
        const file = req.files?.pdf;
        const presentationId = req.body.presentationId;

        if (!presentationId) {
            return res.status(400).send('Presentation ID is required');
        }

        if (!file) {
            return res.status(400).send('No PDF file provided');
        }

        // Load the PDF
        const pdfBuffer = file.data;
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        const pageCount = pdfDoc.getPageCount();

        const imageBase64s = [];
        for (let i = 0; i < pageCount; i++) {
            const imageBase64 = await convertPageToImageBase64(pdfBuffer, i + 1);
            imageBase64s.push(imageBase64);
        }

        const requests = imageBase64s.map((imageBase64, index) => ({
            createSlide: {
                objectId: `slide_${index + 1}`,
                insertionIndex: `${index + 1}`,
                slideLayoutReference: {
                    predefinedLayout: 'BLANK',
                },
            },
            createImage: {
                objectId: `image_${index + 1}`,
                imageProperties: {
                    contentUrl: `data:image/png;base64,${imageBase64}`, // Directly use Base64 image data
                },
                elementProperties: {
                    pageObjectId: `slide_${index + 1}`,
                    size: {
                        height: {
                            magnitude: 300,
                            unit: 'PT',
                        },
                        width: {
                            magnitude: 500,
                            unit: 'PT',
                        },
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
            requestBody: {
                requests: requests.flat(),
            },
        });

        res.status(200).send(`Slides added to presentation: https://docs.google.com/presentation/d/${presentationId}`);
    } catch (error) {
        console.error('Error processing PDF or generating slides:', error);
        res.status(500).send('Failed to process PDF or add slides to the presentation');
    }
});

async function convertPageToImageBase64(pdfBuffer, pageNumber) {
    const loadingTask = pdfjsLib.getDocument({data: pdfBuffer});
    const pdf = await loadingTask.promise;

    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({scale: 2.0});
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };

    await page.render(renderContext).promise;

    const imageBase64 = canvas.toDataURL('image/png').split(',')[1]; // Base64 without prefix
    return imageBase64;
}

exports.processPdf = functions.https.onRequest(app);
