import { useEffect, useRef } from 'react';
import { useToast, Button, Box, Text } from '@chakra-ui/react';
import { version as currentVersion } from 'virtual:build-version';

const VERSION_CHECK_INTERVAL_MS = 10 * 1000;
const VERSION_TOAST_ID = 'new-version-available';

function VersionCheck() {
  const toast = useToast();
  const shownRef = useRef(false);

  useEffect(() => {
    if (currentVersion === 'dev') return;

    const check = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        const latest = data?.version;
        if (latest && latest !== currentVersion && !shownRef.current) {
          shownRef.current = true;
          toast({
            id: VERSION_TOAST_ID,
            duration: null,
            position: 'top',
            render: ({ onClose }) => (
              <Box
                p={3}
                bg="blue.500"
                color="white"
                borderRadius="md"
                display="flex"
                alignItems="center"
                gap={3}
                role="alert"
              >
                <Text flex={1}>New version available. Reload to get the latest.</Text>
                <Button
                  size="sm"
                  colorScheme="whiteAlpha"
                  onClick={() => {
                    onClose();
                    window.location.reload();
                  }}
                >
                  Reload
                </Button>
              </Box>
            ),
          });
        }
      } catch {
        // Ignore network errors (e.g. offline, wrong origin)
      }
    };

    check();
    const interval = setInterval(check, VERSION_CHECK_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [toast]);

  return null;
}

export default VersionCheck;
