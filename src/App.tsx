import { Container, } from "@mui/material";
import NifiAppBar from "./NifiAppBar";
import PackageNifi from "./PackageNifi";
import { HashRouter, Route, Routes } from "react-router-dom";
import UnPackageNifi from "./UnPackageNifi";

function App() {
  return (
    <Container >
      <HashRouter>
        <NifiAppBar />
        <div style={{ marginTop: "10px" }} />
        <Routes>
          <Route path="*" element={<UnPackageNifi />} />
          <Route path="/package" element={<PackageNifi />} />
        </Routes>
      </HashRouter>
    </Container>
  )
}

export default App
