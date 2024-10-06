import {makeAutoObservable} from "mobx";

export default class Store {
    isGenerating = false;
    fileName?: string;
    currentFile?: File;

    constructor() {
        makeAutoObservable(this);
    }

    onUploadFile = async (file: File) => {
        this.fileName = file.name;
        this.currentFile = file;
    };

    onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        this.onUploadFile(file);
    };

    generateSlideDeck = async () => {
        const presentationId = (window as any).presentationId;
        if (!presentationId) {
            console.error("Invalid Google Slides URL");
            return;
        }

        if (!this.currentFile) {
            console.error("No file uploaded.");
            return;
        }

        this.isGenerating = true;

        try {
            const formData = new FormData();
            formData.append("presentationId", presentationId);
            formData.append("file", this.currentFile);

            const response = await fetch("https://processpdf-64g4z47rmq-uc.a.run.app", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to process PDF: ${response.statusText}`);
            }

            const result = await response.text();
            console.log("Processed PDF and updated presentation:", result);
        } catch (error) {
            console.error("Error while generating slide deck:", error);
        } finally {
            this.isGenerating = false;
        }
    };
}
