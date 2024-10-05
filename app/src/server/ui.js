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
    const html = HtmlService.createHtmlOutputFromFile('client')
        .setTitle('PDF to Slides');
    SlidesApp.getUi().showSidebar(html);
}
