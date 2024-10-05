import { observer } from 'mobx-react-lite';
import Store from "./Store.ts";

export default observer(({ store }: { store: Store }) => {
    return (
        <div className="flex flex-col p-5 gap-3">
            <div className="w-full text-center text-2xl font-bold">PDF to Slides</div>
            <div className="border-2 border-gray-400 w-full h-36 rounded-xl p-5">
                <label htmlFor="file-upload" className="border-2 border-dashed border-gray-400 w-full h-full rounded-xl p-5 flex items-center 
                justify-center cursor-pointer hover:bg-gray-50">
                    <input
                        id="file-upload"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={store.onFileInputChange}
                    />
                    <span className="flex gap-x-3">
                        <i className={`${!!store.fileName ? 'fa-file' : 'fa-upload'} fa-solid mt-1`}></i>
                        <span className="font-bold">
                            { store.fileName || "Choose file" }
                        </span>
                    </span>
                </label>
            </div>

            <div className={`rounded-3xl bg w-full flex bg-gray-500 text-white py-3 items-center 
            justify-center ${!!store.fileName ? 'hover:opacity-90 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                <span className="flex gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles mt-1"></i>
                    Generate Slide Deck
                </span>
            </div>
        </div>
    );
});

