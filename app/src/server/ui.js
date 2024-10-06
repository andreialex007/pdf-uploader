export const onOpen = () => {
    SlidesApp.getUi()
        .createAddonMenu() 
        .addItem('Convert PDF document to slides', 'openSidebar')
        .addToUi();
}

export const onInstall = (e) => {
    onOpen(e);
}

export const openSidebar = () => {
    const presentationId = SlidesApp.getActivePresentation().getId();
    const template = HtmlService.createTemplateFromFile('client');
    template.presentationId = presentationId; 
    const html = template.evaluate()
        .setTitle('PDF to Slides');
    SlidesApp.getUi().showSidebar(html);
}
