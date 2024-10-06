const functions = require('firebase-functions');
const admin = require('firebase-admin/app');
const Busboy = require('busboy');
const {google} = require('googleapis');
const fs = require('fs');
const os = require('os');
const path = require('path');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const {v4: uuidv4} = require('uuid');

admin.initializeApp();

const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');

const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/presentations', 'https://www.googleapis.com/auth/drive'],
});

// Access the OpenAI API key from Firebase environment configuration
//const openaiApiKey = functions.config().openai.api_key;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: "",
});

exports.processPdf = functions.https.onRequest(async (req, res) => {
    // Set CORS headers for all responses
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(204).send('');  // Send an empty response to preflight
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const busboy = Busboy({headers: req.headers});
    const tmpdir = os.tmpdir();

    let presentationId = null;
    const uploads = [];

    busboy.on('field', (fieldname, val) => {
        if (fieldname === 'presentationId') {
            presentationId = val;
        }
    });

    busboy.on('file', (fieldname, fileStream, file) => {
        if (fieldname === 'file') {
            const filepath = path.join(tmpdir, file.filename);
            const writeStream = fs.createWriteStream(filepath);

            fileStream.pipe(writeStream);
            uploads.push(filepath);

            writeStream.on('error', (err) => {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing file');
            });

            fileStream.on('error', (err) => {
                console.error('File stream error:', err);
                return res.status(500).send('File stream error');
            });

            writeStream.on('finish', async () => {
                try {
                    const pdfBuffer = fs.readFileSync(filepath);

                    const data = await pdfParse(pdfBuffer);
                    const textContent = data.text;
                    console.log("Extracted PDF text:", textContent);

                    // Process PDF text with OpenAI
                    const openaiResponse = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [{
                            role: "system", content: `
                        Your task is:
                        - Convert the provided text into a series of slides in form of array of objects
                        - Title max length is 40 symbols, body max length is 800 symbols
                        - The object format is this: { "title": "", "body": "" }
                        - Do not include any explanations, only provide a RFC8259 compliant JSON response
                        Provided text:
                        \n\n${textContent}`
                        }],
                        max_tokens: 2000,
                    });

                    let slideContent = openaiResponse.choices[0].message.content.trim();
                    console.log("OpenAI response:", slideContent);
                    slideContent = slideContent.replace(/```json/g, '').replace(/```/g, '').trim();

                    const slidesRequests = generateSlidesRequests(slideContent); // Generate requests to create slides
                    const authClient = await auth.getClient();
                    const slides = google.slides({version: 'v1', auth: authClient});

                    await slides.presentations.batchUpdate({
                        presentationId,
                        requestBody: {requests: slidesRequests},
                    });

                    // Clean up
                    uploads.forEach(upload => {
                        try {
                            fs.unlinkSync(upload);
                        } catch (error) {
                            console.error('Error cleaning up file:', error);
                        }
                    });

                    return res.status(200).send(`Processed PDF and updated presentation ${presentationId}`);
                } catch (error) {
                    console.error('Error processing PDF:', error);
                    return res.status(500).send('Failed to process the PDF');
                }
            });
        }
    });

    busboy.end(req.rawBody);
});

function generateSlidesRequests(slideContent) {
    const requests = [];

    const slidesData = JSON.parse(slideContent);

    slidesData.forEach((slide) => {

        const slideId = `slide_${uuidv4()}`;
        const titleObjectId = `title_${uuidv4()}`;
        const bodyObjectId = `body_${uuidv4()}`;

        // Create the slide with TITLE_AND_BODY layout
        requests.push({
            createSlide: {
                objectId: slideId,
                slideLayoutReference: {
                    predefinedLayout: 'TITLE_AND_BODY',
                },
                placeholderIdMappings: [
                    {
                        layoutPlaceholder: {
                            type: 'TITLE',
                        },
                        objectId: titleObjectId,
                    },
                    {
                        layoutPlaceholder: {
                            type: 'BODY',
                        },
                        objectId: bodyObjectId,
                    }
                ]
            }
        });

        requests.push({
            insertText: {
                objectId: titleObjectId,
                text: slide.title,
                insertionIndex: 0,
            },
        });
        // Insert body text
        requests.push({
            insertText: {
                objectId: bodyObjectId,
                text: slide.body,
                insertionIndex: 0,
            },
        });
    });

    return requests;
}