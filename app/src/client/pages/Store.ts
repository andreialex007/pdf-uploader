import {makeAutoObservable} from "mobx";
import Swal from 'sweetalert2';

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
            await Swal.fire({
                icon: 'error',
                title: 'Invalid Google Slides URL',
                text: 'Please check the current Google Slides URL.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!this.currentFile) {
            console.error("No file uploaded.");
            await Swal.fire({
                icon: 'error',
                title: 'No File Uploaded',
                text: 'Please select a PDF file before generating the slide deck.',
                confirmButtonText: 'OK'
            });
            return;
        }

        this.isGenerating = true;

        try {
            const formData = new FormData();
            formData.append("presentationId", presentationId);
            formData.append("file", this.currentFile);

            await fetch("https://processpdf-64g4z47rmq-uc.a.run.app", {
                method: "POST",
                body: formData,
            });

            this.currentFile = undefined;
            this.fileName = undefined;

            // Show success alert using SweetAlert2
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Slide deck generated successfully!',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        } catch (error) {
            console.error("Error while generating slide deck:", error);

            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while generating the slide deck. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            this.isGenerating = false;
        }
    };
}
