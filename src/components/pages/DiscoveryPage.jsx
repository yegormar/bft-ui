import { useState } from 'react';
import MainSurvey from '../Discovery/MainSurvey';
import PreSurveyWizard from '../Discovery/PreSurveyWizard';

function DiscoveryPage() {
  const [phase, setPhase] = useState('pre_survey');
  const [clusterProfile, setClusterProfile] = useState(null);

  const handlePreSurveyComplete = (profile) => {
    setClusterProfile(profile);
    setPhase('main_survey');
  };

  if (phase === 'main_survey') {
    return <MainSurvey clusterProfile={clusterProfile} />;
  }

  return <PreSurveyWizard onComplete={handlePreSurveyComplete} />;
}

export default DiscoveryPage;
