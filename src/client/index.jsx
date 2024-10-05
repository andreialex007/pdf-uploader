import {createRoot} from "react-dom/client"
import "./index.css"
import Main from "./pages/Upload.jsx"

const container = document.getElementById("root")
const root = createRoot(container)
root.render(<Main/>)
