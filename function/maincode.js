/*
const pdfDoc = await PDFDocument.load(pdfBuffer);
const pageCount = pdfDoc.getPageCount();
logger.info(`PDF has ${pageCount} pages.`);

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

logger.info(`Slides added to presentation: https://docs.google.com/presentation/d/${presentationId}`);*/