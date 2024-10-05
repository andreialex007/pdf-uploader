const Main = () => {
    return (
        <div className="flex flex-col p-5 gap-3">
            <div className="w-full text-center text-2xl font-bold">PDF to Slides</div>
            <div className="border-2 border-gray-400 w-full h-36 rounded-xl p-5">
                <div className="border-2 border-dashed border-gray-400 w-full h-full rounded-xl p-5 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <span className="flex gap-x-3"><i className="fa-solid fa-upload mt-1"></i>
                       <span className="font-bold">Upload PDF</span>
                    </span>
                </div>
            </div>
            <div className="rounded-3xl bg w-full flex bg-gray-500 text-white py-3 items-center justify-center hover:opacity-90 cursor-pointer">
                <span className="flex gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles mt-1"></i>
                    Generate Slide Deck
                </span>
            </div>
        </div>
    )
}

export default Main
