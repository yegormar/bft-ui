import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import DiscoveryPage from './components/pages/DiscoveryPage';
import ResultsPage from './components/pages/ResultsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
