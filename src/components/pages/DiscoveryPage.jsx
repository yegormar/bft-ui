import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import PageHero from '../Layout/PageHero';
import MainSurvey from '../Discovery/MainSurvey';
import PreSurveyWizard from '../Discovery/PreSurveyWizard';
import TriangleExplainerPage from '../Discovery/TriangleExplainerPage';
import { getAppConfig } from '../../services/surveyApi';
import { getVersionedFlag, setVersionedFlag, TRIANGLE_TUTORIAL_FLAG_KEY } from '../../utils/versionedStorage';

function DiscoveryPage() {
  const [phase, setPhase] = useState('pre_survey');
  const [clusterProfile, setClusterProfile] = useState(null);

  const handlePreSurveyComplete = async (profile) => {
    setClusterProfile(profile);
    try {
      const config = await getAppConfig();
      if (config.assessmentMode === 'triangles') {
        setPhase(getVersionedFlag(TRIANGLE_TUTORIAL_FLAG_KEY) ? 'main_survey' : 'triangle_explainer');
      } else {
        setPhase('main_survey');
      }
    } catch (_) {
      setPhase('main_survey');
    }
  };

  const handleExplainerStart = () => {
    setVersionedFlag(TRIANGLE_TUTORIAL_FLAG_KEY);
    setPhase('main_survey');
  };

  const heroTagline =
    phase === 'main_survey'
      ? 'Your tailored interview'
      : phase === 'triangle_explainer'
        ? 'How the triangle works'
        : 'A few questions to tailor your experience';

  let content;
  if (phase === 'pre_survey') {
    content = <PreSurveyWizard onComplete={handlePreSurveyComplete} />;
  } else if (phase === 'triangle_explainer') {
    content = <TriangleExplainerPage onStart={handleExplainerStart} />;
  } else {
    content = <MainSurvey clusterProfile={clusterProfile} />;
  }

  return (
    <>
      <PageHero title="Discovery" tagline={heroTagline} />
      <Box bg="chakra-body-bg" minH="50vh">
        {content}
      </Box>
    </>
  );
}

export default DiscoveryPage;
