import {
  Box,
  Button,
  Container,
  HStack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { Star } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import { submitFeedback } from '../../services/surveyApi';

const FEEDBACK_STORAGE_KEY = 'bft_feedback_submitted';

const RATING_LABELS = {
  1: 'Not for me',
  2: 'It was okay',
  3: 'Pretty good',
  4: 'Really liked it',
  5: 'Loved it',
};

function StarRating({ value, onChange, disabled }) {
  return (
    <HStack spacing={{ base: 2, sm: 3 }} justify="center" flexWrap="wrap">
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          as="button"
          type="button"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={value === star}
          minW={12}
          minH={12}
          p={1}
          rounded="lg"
          color={value >= star ? 'brand.500' : 'gray.300'}
          _dark={{ color: value >= star ? 'brand.400' : 'whiteAlpha.400' }}
          _hover={disabled ? {} : { color: 'brand.600', _dark: { color: 'brand.300' } }}
          _focus={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '2px' }}
          transition="color 0.15s"
          cursor={disabled ? 'default' : 'pointer'}
          onClick={() => !disabled && onChange(star)}
          data-testid={`feedback-star-${star}`}
        >
          <Star size={36} strokeWidth={1.5} fill="currentColor" />
        </Box>
      ))}
    </HStack>
  );
}

export default function FeedbackPage() {
  const [rating, setRating] = useState(null);
  const [improve, setImprove] = useState('');
  const [good, setGood] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (rating == null) return;
      setError(null);
      setSubmitting(true);
      try {
        await submitFeedback({ rating, improve: improve.trim() || undefined, good: good.trim() || undefined });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(FEEDBACK_STORAGE_KEY, 'true');
        }
        setSubmitted(true);
      } catch (err) {
        setError(err.message || 'Something went wrong. You can try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [rating, improve, good]
  );

  if (submitted) {
    return (
      <>
        <PageHero title="Thanks for your feedback" tagline="It really helps us improve for everyone" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-feedback">
          <Container maxW="md" centerContent>
            <VStack spacing={6} textAlign="center">
              <Text fontSize="lg" color="chakra-subtle-text">
                We read every response. If you want to explore more, head back to your results.
              </Text>
              <Button as={RouterLink} to="/results" colorScheme="brand" size="lg" px={8} data-testid="feedback-back-to-results">
                Back to results
              </Button>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Feedback"
        tagline="Your opinion helps us improve. We’d love to hear from you."
      />
      <Box as="main" py={8} px={4} bg="chakra-body-bg" data-testid="page-feedback">
        <Container maxW="md">
          <form onSubmit={handleSubmit}>
            <VStack spacing={8} align="stretch">
              <VStack spacing={3} align="stretch">
                <Text fontWeight="semibold" fontSize="lg">
                  How was your experience?
                </Text>
                <StarRating value={rating} onChange={setRating} disabled={submitting} />
                {rating != null && (
                  <Text fontSize="sm" color="chakra-subtle-text">
                    {RATING_LABELS[rating]}
                  </Text>
                )}
              </VStack>

              <VStack spacing={2} align="stretch">
                <Text fontWeight="semibold" fontSize="lg">
                  What could we improve?
                </Text>
                <Textarea
                  placeholder="Anything that felt confusing, boring, or could be better..."
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  minH={24}
                  resize="vertical"
                  maxLength={1000}
                  disabled={submitting}
                  data-testid="feedback-improve"
                />
              </VStack>

              <VStack spacing={2} align="stretch">
                <Text fontWeight="semibold" fontSize="lg">
                  What did you like?
                </Text>
                <Textarea
                  placeholder="What worked well? What was fun or useful?"
                  value={good}
                  onChange={(e) => setGood(e.target.value)}
                  minH={24}
                  resize="vertical"
                  maxLength={1000}
                  disabled={submitting}
                  data-testid="feedback-good"
                />
              </VStack>

              {error && (
                <Text color="red.500" fontSize="sm" role="alert">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                w="full"
                isLoading={submitting}
                isDisabled={rating == null}
                loadingText="Sending..."
                data-testid="feedback-submit"
              >
                Send feedback
              </Button>
            </VStack>
          </form>
        </Container>
      </Box>
    </>
  );
}
