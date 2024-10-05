import {makeAutoObservable} from "mobx";
import {sleep} from "../common/Utils.ts";

export default class Store {
    isGenerating = false;
    fileName?: string;

    constructor() {
        makeAutoObservable(this);
    }

    onUploadFile = async (file: File) => {
        this.fileName = file.name;
    };

    onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        this.onUploadFile(file);
    };

    generateSlideDeck = async () => {
        this.isGenerating = true
        await sleep(2000);
        this.isGenerating = false;
    }

}
