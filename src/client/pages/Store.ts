import {makeAutoObservable} from "mobx";
import {sleep} from "../common/Utils.ts";

export default class Store {
    isUploading = false;
    fileName? : string;

    constructor() {
        makeAutoObservable(this);
    }

    onUploadFile = async (file: File) => {
        this.isUploading = true
        this.fileName = file.name;
        await sleep(2000);
        this.isUploading = false;
    };

    onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        this.onUploadFile(file);
    };
}
