import { Container, } from "@mui/material";
import AppBar from "./components/AppBar";
import PackageFlowFile from "./routes/PackageFlowFile";
import { HashRouter, Route, Routes } from "react-router-dom";
import UnpackageFlowFile from "./routes/UnpackageFlowFile";
import Source from "./routes/Source";
import BulkUnpackageFlowFile from "./routes/BulkUnpackageFlowFile";

function App() {
  return (
    <Container >
      <HashRouter>
        <AppBar />
        <div style={{ marginTop: "10px" }} />
        <Routes>
          <Route path="*" element={<UnpackageFlowFile />} />
          <Route path="/bulkUnpackage" element={<BulkUnpackageFlowFile />} />
          <Route path="/package" element={<PackageFlowFile />} />
          <Route path="/source" element={<Source />}/>
        </Routes>
      </HashRouter>
    </Container>
  )
}

export default App
