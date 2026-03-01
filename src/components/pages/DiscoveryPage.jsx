import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import PageHero from '../Layout/PageHero';
import MainSurvey from '../Discovery/MainSurvey';
import PreSurveyWizard from '../Discovery/PreSurveyWizard';

function DiscoveryPage() {
  const [phase, setPhase] = useState('pre_survey');
  const [clusterProfile, setClusterProfile] = useState(null);

  const handlePreSurveyComplete = (profile) => {
    setClusterProfile(profile);
    setPhase('main_survey');
  };

  const heroTagline = phase === 'main_survey' ? 'Your tailored interview' : 'A few questions to tailor your experience';
  const content = phase === 'main_survey' ? (
    <MainSurvey clusterProfile={clusterProfile} />
  ) : (
    <PreSurveyWizard onComplete={handlePreSurveyComplete} />
  );

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
