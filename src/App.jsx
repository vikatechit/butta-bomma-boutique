import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './context/Store';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Categories from './pages/Categories';
import How from './pages/How';
import CustomizationPage from './pages/CustomizationPage';
import ReviewsPage from './pages/ReviewsPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import LegalPage from './pages/LegalPage';

const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:slug" element={<Shop />} />
            <Route path="/how" element={<How />} />
            <Route path="/customization" element={<CustomizationPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/order" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/terms" element={<LegalPage />} />
            <Route path="/shipping" element={<LegalPage />} />
            <Route path="/refunds" element={<LegalPage />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<p className="section-container page-pad text-center">Loading control room…</p>}>
                  <Admin />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
}
