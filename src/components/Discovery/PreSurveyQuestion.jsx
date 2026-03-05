import {
  Box,
  Button,
  Checkbox,
  IconButton,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

// Option texts that mean "none of the above" / neutral only; selecting one clears all others, and vice versa.
const EXCLUSIVE_OPTION_TEXTS = new Set([
  'A bit of everything / Not sure',
  'None of these / Neutral',
  'I prefer clear instructions with no games or stories',
  'Clear instructions, no games or stories',
]);

function isExclusiveOption(optionText) {
  return EXCLUSIVE_OPTION_TEXTS.has(optionText);
}

/**
 * Renders a single pre-survey question: single choice, multi choice, or rank (order options).
 * "None" / neutral options are exclusive in multi choice.
 * @param {{ question: { id: number, title: string, description?: string, type: string, options: Array<{ text: string, value: string }> }, value: string | string[], onChange: (value: string | string[]) => void, optional?: boolean, onSkip?: () => void, maxSelections?: number }}
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
  const isRank = question.type === 'rank';
  const selectedList = Array.isArray(value) ? value : value ? [value] : [];
  const atMax = maxSelections != null && selectedList.length >= maxSelections;

  // Rank: value is ordered array of option values. Reorder by moving up/down.
  const orderedValues = isRank
    ? (selectedList.length === question.options?.length
        ? selectedList
        : question.options?.map((o) => o.value) ?? [])
    : [];
  const moveRank = (index, direction) => {
    const next = [...orderedValues];
    const j = index + direction;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

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

        {isRank ? (
          <VStack align="stretch" spacing={2} role="group" aria-label={`${question.title} — order from most to least`}>
            {orderedValues.map((optValue, index) => {
              const opt = question.options?.find((o) => o.value === optValue);
              if (!opt) return null;
              return (
                <HStack
                  key={opt.value}
                  px={4}
                  py={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="chakra-border-color"
                  bg="chakra-body-bg"
                  justify="space-between"
                  _hover={{ borderColor: 'accent', bg: 'chakra-subtle-bg' }}
                >
                  <Text color="chakra-body-text" flex={1}>
                    {index + 1}. {opt.text}
                  </Text>
                  <HStack spacing={0}>
                    <IconButton
                      aria-label="Move up"
                      icon={<ChevronUpIcon />}
                      size="sm"
                      variant="ghost"
                      isDisabled={index === 0}
                      onClick={() => moveRank(index, -1)}
                    />
                    <IconButton
                      aria-label="Move down"
                      icon={<ChevronDownIcon />}
                      size="sm"
                      variant="ghost"
                      isDisabled={index === orderedValues.length - 1}
                      onClick={() => moveRank(index, 1)}
                    />
                  </HStack>
                </HStack>
              );
            })}
            <Text fontSize="xs" color="chakra-subtle-text">
              Order from most like you (top) to least (bottom).
            </Text>
          </VStack>
        ) : isSingle ? (
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
            {question.options?.map((opt) => (
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
                borderColor={selectedList.includes(opt.text) ? 'accent' : 'chakra-border-color'}
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
