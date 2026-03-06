import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import VersionCheck from './components/VersionCheck';
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import DiscoveryPage from './components/pages/DiscoveryPage';
import ResultsPage from './components/pages/ResultsPage';
import ResultsProfilePage from './components/pages/ResultsProfilePage';
import ResultsTraitsValuesPage from './components/pages/ResultsTraitsValuesPage';
import ResultsAnswersPage from './components/pages/ResultsAnswersPage';
import RecommendationsPage from './components/pages/RecommendationsPage';
import SkillsPage from './components/pages/SkillsPage';
import NotFoundPage from './components/pages/NotFoundPage';

function App() {
  return (
    <>
      <VersionCheck />
      <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/results/profile" element={<ResultsProfilePage />} />
        <Route path="/results/traits-values" element={<ResultsTraitsValuesPage />} />
        <Route path="/results/answers" element={<ResultsAnswersPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
    </>
  );
}

export default App;
