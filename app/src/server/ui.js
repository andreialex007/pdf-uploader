export const onOpen = () => {
    SlidesApp.getUi()
        .createAddonMenu()  // This method makes sure the menu shows in the Extensions tab
        .addItem('Convert PDF document to slides', 'openSidebar')
        .addToUi();
}

export const onInstall = (e) => {
    onOpen(e);
}

export const openSidebar = () => {
    // Get the current presentation ID
    const presentationId = SlidesApp.getActivePresentation().getId();

    // Pass the presentationId to the client-side HTML using Google Apps Script templating
    const template = HtmlService.createTemplateFromFile('client');
    template.presentationId = presentationId; 

    const html = template.evaluate()
        .setTitle('PDF to Slides');

    SlidesApp.getUi().showSidebar(html);
}
