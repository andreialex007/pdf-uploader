import {createRoot} from "react-dom/client"
import "./index.css"
import Main from "./pages/Upload.tsx"
import UploadStore from "./pages/Store.ts";

let uploadStore = new UploadStore()
const container = document.getElementById("root")
const root = createRoot(container)
root.render(<Main store={uploadStore} />)
