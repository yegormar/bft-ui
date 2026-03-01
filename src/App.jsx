import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import DiscoveryPage from './components/pages/DiscoveryPage';
import ResultsPage from './components/pages/ResultsPage';
import RecommendationsPage from './components/pages/RecommendationsPage';
import NotFoundPage from './components/pages/NotFoundPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
