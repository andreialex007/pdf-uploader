export const onOpen = () => {
    SlidesApp.getUi()
        .createMenu('My Sample React Project')
        .addItem('Open', 'openSidebar')
        .addToUi();
}

export const openSidebar = () => {
    const html = HtmlService.createHtmlOutputFromFile('client')
        .setTitle('My React Project');
    SlidesApp.getUi().showSidebar(html);
}
