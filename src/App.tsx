import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { ParticipatePage } from "./pages/ParticipatePage";
import { MosaicPage } from "./pages/MosaicPage";
import { PulsePage } from "./pages/PulsePage";
import { DisplayPage } from "./pages/DisplayPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      {/* شاشة العرض الكبيرة بدون Navbar أو تخطيط عام — مخصصة للاحتفال */}
      <Route path="/display" element={<DisplayPage />} />

      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/participate" element={<ParticipatePage />} />
              <Route path="/mosaic" element={<MosaicPage />} />
              <Route path="/pulse" element={<PulsePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
