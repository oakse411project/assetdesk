import { Route, Routes } from 'react-router-dom';
import { AssetProvider } from './context/AssetContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AssetsPage from './pages/AssetsPage.jsx';
import AddAssetPage from './pages/AddAssetPage.jsx';
import EditAssetPage from './pages/EditAssetPage.jsx';
import AssetDetailsPage from './pages/AssetDetailsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/new" element={<AddAssetPage />} />
        <Route path="assets/:id" element={<AssetDetailsPage />} />
        <Route path="assets/:id/edit" element={<EditAssetPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

/** Providers + routes. The router itself is added in main.jsx (or by tests). */
export default function App({ initialAssets }) {
  return (
    <ToastProvider>
      <AssetProvider initialAssets={initialAssets}>
        <AppRoutes />
      </AssetProvider>
    </ToastProvider>
  );
}
