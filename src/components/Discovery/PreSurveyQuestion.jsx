import {
  Box,
  Button,
  Checkbox,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';

// Option texts that mean "none of the above" / neutral only; selecting one clears all others, and vice versa.
const EXCLUSIVE_OPTION_TEXTS = new Set([
  'None of these / Neutral',
  'I prefer clear instructions with no games or stories',
]);

function isExclusiveOption(optionText) {
  return EXCLUSIVE_OPTION_TEXTS.has(optionText);
}

/**
 * Renders a single pre-survey question: single or multi choice, optional Skip, optional maxSelections.
 * "None" / neutral options are exclusive: selecting one clears others; selecting any other clears "None".
 * @param {{ question: { id: number, title: string, description?: string, type: string, options: Array<{ text: string }> }, value: string | string[], onChange: (value: string | string[]) => void, optional?: boolean, onSkip?: () => void, maxSelections?: number }}
 */
function PreSurveyQuestion({
  question,
  value,
  onChange,
  optional = false,
  onSkip,
  maxSelections,
}) {
  const isSingle = question.type === 'single_choice';
  const selectedList = Array.isArray(value) ? value : value ? [value] : [];
  const atMax = maxSelections != null && selectedList.length >= maxSelections;

  const handleSingleChange = (next) => {
    onChange(next);
  };

  const handleMultiChange = (optionText, checked) => {
    if (checked) {
      if (isExclusiveOption(optionText)) {
        onChange([optionText]);
        return;
      }
      const withoutExclusive = selectedList.filter((t) => !isExclusiveOption(t));
      if (maxSelections != null && withoutExclusive.length >= maxSelections) return;
      onChange([...withoutExclusive, optionText]);
    } else {
      onChange(selectedList.filter((t) => t !== optionText));
    }
  };

  return (
    <Box as="section" aria-labelledby={`q-${question.id}-title`}>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text
            id={`q-${question.id}-title`}
            as="h2"
            fontSize="xl"
            fontWeight="semibold"
            color="chakra-body-text"
          >
            {question.title}
          </Text>
          {question.description && (
            <Text mt={1} fontSize="sm" color="chakra-subtle-text">
              {question.description}
            </Text>
          )}
        </Box>

        {isSingle ? (
          <RadioGroup
            value={typeof value === 'string' ? value : selectedList[0]}
            onChange={handleSingleChange}
            name={`q-${question.id}`}
          >
            <Stack spacing={2} role="group" aria-label={question.title}>
              {question.options.map((opt) => (
                <Box
                  key={opt.text}
                  as="label"
                  cursor="pointer"
                  minH="44px"
                  display="flex"
                  alignItems="center"
                  px={4}
                  py={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="chakra-border-color"
                  bg="chakra-body-bg"
                  _hover={{ borderColor: 'accent', bg: 'chakra-subtle-bg' }}
                  _focusWithin={{ borderColor: 'accent', boxShadow: 'outline' }}
                >
                  <Radio value={opt.text} colorScheme="brand" size="lg" mr={3} />
                  <Text color="chakra-body-text">{opt.text}</Text>
                </Box>
              ))}
            </Stack>
          </RadioGroup>
        ) : (
          <Stack spacing={2} role="group" aria-label={question.title}>
            {question.options.map((opt) => (
              <Box
                key={opt.text}
                as="label"
                cursor={atMax && !selectedList.includes(opt.text) ? 'not-allowed' : 'pointer'}
                minH="44px"
                display="flex"
                alignItems="center"
                px={4}
                py={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor="chakra-border-color"
                bg="chakra-body-bg"
                opacity={atMax && !selectedList.includes(opt.text) ? 0.6 : 1}
                _hover={
                  atMax && !selectedList.includes(opt.text)
                    ? undefined
                    : { borderColor: 'accent', bg: 'chakra-subtle-bg' }
                }
                _focusWithin={{ borderColor: 'accent', boxShadow: 'outline' }}
              >
                <Checkbox
                  isChecked={selectedList.includes(opt.text)}
                  onChange={(e) => handleMultiChange(opt.text, e.target.checked)}
                  colorScheme="brand"
                  size="lg"
                  mr={3}
                  isDisabled={atMax && !selectedList.includes(opt.text)}
                />
                <Text color="chakra-body-text">{opt.text}</Text>
              </Box>
            ))}
          </Stack>
        )}

        {optional && onSkip && (
          <HStack w="full" justify="flex-end" pt={2}>
            <Button variant="ghost" size="md" onClick={onSkip} color="chakra-subtle-text">
              Skip
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

export default PreSurveyQuestion;
