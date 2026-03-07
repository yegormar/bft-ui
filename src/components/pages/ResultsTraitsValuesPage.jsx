import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import DimensionsRadarChart from '../DimensionsRadarChart';
import { getReport } from '../../services/surveyApi';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

const SORT_DESC = 'desc';
const SORT_ASC = 'asc';

function roundTo1(num) {
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);
  return (Math.round(n * 10) / 10).toFixed(1);
}

/** Display label for a dimension: short_label from meta if available, else name. */
function dimensionLabel(d, meta) {
  if (meta?.short_label && meta.short_label.trim()) return meta.short_label.trim();
  return d.name || d.id;
}

/** Neutral label for band so it reads as scale position, not good/bad. */
function bandDisplayLabel(band) {
  if (!band) return null;
  const b = String(band).toLowerCase();
  if (b === 'low') return 'Low';
  if (b === 'medium') return 'Middle';
  if (b === 'high') return 'High';
  return band;
}

const sectionProps = {
  p: 4,
  borderRadius: 'lg',
  borderWidth: '1px',
  borderColor: 'chakra-border-color',
  borderLeftWidth: '4px',
  borderLeftColor: 'accent',
  bg: 'blackAlpha.30',
  _dark: { bg: 'whiteAlpha.50' },
};

function DimensionDetailsContent({ dimension, type, dimensionMeta }) {
  const meta = dimensionMeta?.[type]?.[dimension?.id];
  const mean = dimension?.mean;
  const band = dimension?.band;
  const count = dimension?.count;
  const interpretation = meta?.score_scale?.interpretation;
  const bandKey = band && typeof interpretation === 'object' ? band : null;

  return (
    <VStack align="stretch" spacing={5}>
      {meta?.description && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Description
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {meta.description}
          </Text>
        </Box>
      )}

      <Box {...sectionProps}>
        <Text fontWeight="semibold" fontSize="xs" mb={3} color="accent">
          At a glance
        </Text>
        <VStack align="stretch" spacing={2}>
          {typeof mean === 'number' && (
            <Text fontSize="sm" color="chakra-body-text">
              <Text as="span" fontWeight="medium" color="chakra-subtle-text">
                Score{' '}
              </Text>
              <Text as="span" fontWeight="medium" color="accent">
                {roundTo1(mean)}
              </Text>
              {band && bandDisplayLabel(band) && (
                <Text as="span" color="chakra-subtle-text">
                  {' '}({bandDisplayLabel(band)} on scale)
                </Text>
              )}
            </Text>
          )}
          {count != null && (
            <Text fontSize="sm" color="chakra-body-text">
              <Text as="span" fontWeight="medium" color="chakra-subtle-text">
                Based on {count} {count === 1 ? 'answer' : 'answers'}
              </Text>
            </Text>
          )}
        </VStack>
      </Box>

      {meta?.ai_future_rationale && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            AI future rationale
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {meta.ai_future_rationale}
          </Text>
        </Box>
      )}

      {meta?.how_measured_or_observed && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            How measured or observed
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {meta.how_measured_or_observed}
          </Text>
        </Box>
      )}

      {Array.isArray(meta?.question_hints) && meta.question_hints.length > 0 && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Question hints
          </Text>
          <UnorderedList spacing={2} pl={4}>
            {meta.question_hints.map((hint, i) => (
              <Text as="li" key={i} fontSize="sm" lineHeight="tall" color="chakra-body-text">
                {hint}
              </Text>
            ))}
          </UnorderedList>
        </Box>
      )}

      {interpretation && bandKey && interpretation[bandKey] && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            What this score means
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {interpretation[bandKey]}
          </Text>
        </Box>
      )}
    </VStack>
  );
}

export default function ResultsTraitsValuesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrderTraits, setSortOrderTraits] = useState(SORT_DESC);
  const [sortOrderValues, setSortOrderValues] = useState(SORT_DESC);
  const [selectedDimension, setSelectedDimension] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  const resolvedSessionId =
    location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);

  const fetchReport = useCallback(async (sid) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReport(sid);
      setReport(data);
    } catch (err) {
      setError(err.message || 'We couldn\'t load your traits and values. Try again or start a new discovery.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resolvedSessionId) {
      fetchReport(resolvedSessionId);
    } else {
      setLoading(false);
    }
  }, [resolvedSessionId, fetchReport]);

  const dimensionScores = report?.dimensionScores ?? { traits: [], values: [], aptitudes: [] };
  const dimensionMeta = report?.dimensionMeta ?? { traits: {}, values: {}, aptitudes: {} };
  const profileByDimensions = report?.profileByDimensions ?? {};
  const rawTraits = dimensionScores.traits ?? [];
  const rawValues = dimensionScores.values ?? [];
  const rawAptitudes = dimensionScores.aptitudes ?? [];
  const aptitudesFromProfile = profileByDimensions.aptitudes ?? [];
  const aptitudesList =
    rawAptitudes.length > 0
      ? rawAptitudes
      : aptitudesFromProfile.map((a) => ({ id: a.id, name: a.name, mean: null, band: null, count: null }));

  const sortedTraits = useMemo(() => {
    const list = [...rawTraits];
    if (sortOrderTraits === SORT_ASC) {
      list.sort((a, b) => (a.mean ?? 0) - (b.mean ?? 0));
    } else {
      list.sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));
    }
    return list;
  }, [rawTraits, sortOrderTraits]);

  const sortedValues = useMemo(() => {
    const list = [...rawValues];
    if (sortOrderValues === SORT_ASC) {
      list.sort((a, b) => (a.mean ?? 0) - (b.mean ?? 0));
    } else {
      list.sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));
    }
    return list;
  }, [rawValues, sortOrderValues]);

  const [sortOrderAptitudes, setSortOrderAptitudes] = useState(SORT_DESC);
  const sortedAptitudes = useMemo(() => {
    const list = [...aptitudesList];
    const hasScores = list.some((d) => typeof d.mean === 'number');
    if (!hasScores) return list;
    if (sortOrderAptitudes === SORT_ASC) {
      list.sort((a, b) => (a.mean ?? 0) - (b.mean ?? 0));
    } else {
      list.sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));
    }
    return list;
  }, [aptitudesList, sortOrderAptitudes]);

  const radarDimensions = useMemo(
    () => [...rawAptitudes, ...rawTraits, ...rawValues],
    [rawAptitudes, rawTraits, rawValues]
  );

  const openDetail = useCallback((dimension, type) => {
    setSelectedDimension(dimension);
    setSelectedType(type);
    onDetailsOpen();
  }, [onDetailsOpen]);

  const closeDetail = useCallback(() => {
    onDetailsClose();
    setSelectedDimension(null);
    setSelectedType(null);
  }, [onDetailsClose]);

  const hasContent =
    rawTraits.length > 0 || rawValues.length > 0 || aptitudesList.length > 0;

  if (!resolvedSessionId) {
    return (
      <>
        <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-traits-values">
          <Container maxW="2xl" centerContent>
            <Box
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              borderLeftWidth="4px"
              borderLeftColor="accent"
              bg="chakra-body-bg"
              boxShadow="sm"
              w="full"
              maxW="md"
            >
              <VStack spacing={4} align="center" textAlign="center">
                <Text color="chakra-subtle-text">
                  Complete a discovery to see your traits and values.
                </Text>
                <Button as={RouterLink} to="/discovery" colorScheme="brand" size="lg" px={8}>
                  Start discovery
                </Button>
              </VStack>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-traits-values">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading your dimensions...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-traits-values">
          <Container maxW="2xl" centerContent>
            <Box
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              borderLeftWidth="4px"
              borderLeftColor="accent"
              bg="chakra-body-bg"
              boxShadow="sm"
              w="full"
              maxW="md"
            >
              <VStack spacing={4} align="center" textAlign="center">
                <Text color="red.500">{error}</Text>
                <Button as={RouterLink} to="/discovery" colorScheme="brand" size="lg" px={8}>
                  Start discovery
                </Button>
              </VStack>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
      <Box as="main" py={0} px={0} bg="chakra-body-bg" data-testid="page-results-traits-values">
        <Container maxW="2xl" p={0}>
          <VStack align="stretch" spacing={{ base: 2, md: 4 }} w="full">
            <Box>
              <Button
                variant="link"
                size="sm"
                minH="36px"
                onClick={() => navigate('/results', { state: { sessionId: resolvedSessionId } })}
                mb={1}
                color="accent"
                _hover={{ textDecoration: 'underline' }}
              >
                ← Back to results
              </Button>
            </Box>

            {hasContent && (
              <Text fontSize="sm" color="chakra-subtle-text" mb={2}>
                These results show where you land on each dimension. The higher the value, the better the compatibility (fit) on that dimension.
              </Text>
            )}

            {radarDimensions.length > 0 && (
              <Box w="full">
                <DimensionsRadarChart dimensions={radarDimensions} dimensionMeta={dimensionMeta} />
              </Box>
            )}

            {hasContent ? (
              <>
                {sortedAptitudes.length > 0 && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    borderLeftWidth="4px"
                    borderLeftColor="accent"
                    bg="chakra-body-bg"
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      Aptitudes (your natural tendencies)
                    </Heading>
                    {rawAptitudes.length > 0 && (
                      <HStack spacing={3} mb={3} flexWrap="wrap">
                        <Button
                          size="sm"
                          minH="36px"
                          colorScheme={sortOrderAptitudes === SORT_DESC ? 'brand' : 'gray'}
                          variant={sortOrderAptitudes === SORT_DESC ? 'solid' : 'outline'}
                          onClick={() => setSortOrderAptitudes(SORT_DESC)}
                          aria-pressed={sortOrderAptitudes === SORT_DESC}
                          data-testid="sort-aptitudes-desc"
                        >
                          High to low
                        </Button>
                        <Button
                          size="sm"
                          minH="36px"
                          colorScheme={sortOrderAptitudes === SORT_ASC ? 'brand' : 'gray'}
                          variant={sortOrderAptitudes === SORT_ASC ? 'solid' : 'outline'}
                          onClick={() => setSortOrderAptitudes(SORT_ASC)}
                          aria-pressed={sortOrderAptitudes === SORT_ASC}
                          data-testid="sort-aptitudes-asc"
                        >
                          Low to high
                        </Button>
                      </HStack>
                    )}
                    <TableContainer>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th isNumeric>Score</Th>
                            <Th>Compatibility</Th>
                            <Th isNumeric>Based on</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {sortedAptitudes.map((d) => {
                            const meta = dimensionMeta.aptitudes?.[d.id];
                            const label = dimensionLabel(d, meta);
                            const hasDetail = !!meta;
                            return (
                              <Tr
                                key={`aptitude-${d.id ?? d.name}`}
                                cursor={hasDetail ? 'pointer' : undefined}
                                onClick={hasDetail ? () => openDetail(d, 'aptitudes') : undefined}
                                _hover={
                                  hasDetail
                                    ? { bg: 'blackAlpha.50', _dark: { bg: 'whiteAlpha.50' } }
                                    : undefined
                                }
                              >
                                <Td fontWeight="medium">{label}</Td>
                                <Td isNumeric color="accent">
                                  {typeof d.mean === 'number' ? roundTo1(d.mean) : '—'}
                                </Td>
                                <Td>{bandDisplayLabel(d.band) ?? '—'}</Td>
                                <Td isNumeric>{d.count ?? '—'}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {sortedTraits.length > 0 && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    borderLeftWidth="4px"
                    borderLeftColor="accent"
                    bg="chakra-body-bg"
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      Traits (how you tend to behave)
                    </Heading>
                    <HStack spacing={3} mb={3} flexWrap="wrap">
                      <Button
                        size="sm"
                        minH="36px"
                        colorScheme={sortOrderTraits === SORT_DESC ? 'brand' : 'gray'}
                        variant={sortOrderTraits === SORT_DESC ? 'solid' : 'outline'}
                        onClick={() => setSortOrderTraits(SORT_DESC)}
                        aria-pressed={sortOrderTraits === SORT_DESC}
                        data-testid="sort-traits-desc"
                      >
                        High to low
                      </Button>
                      <Button
                        size="sm"
                        minH="36px"
                        colorScheme={sortOrderTraits === SORT_ASC ? 'brand' : 'gray'}
                        variant={sortOrderTraits === SORT_ASC ? 'solid' : 'outline'}
                        onClick={() => setSortOrderTraits(SORT_ASC)}
                        aria-pressed={sortOrderTraits === SORT_ASC}
                        data-testid="sort-traits-asc"
                      >
                        Low to high
                      </Button>
                    </HStack>
                    <TableContainer>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th isNumeric>Score</Th>
                            <Th>Compatibility</Th>
                            <Th isNumeric>Based on</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {sortedTraits.map((d) => {
                            const meta = dimensionMeta.traits?.[d.id];
                            const label = dimensionLabel(d, meta);
                            return (
                              <Tr
                                key={`trait-${d.id}`}
                                cursor="pointer"
                                onClick={() => openDetail(d, 'traits')}
                                _hover={{ bg: 'blackAlpha.50', _dark: { bg: 'whiteAlpha.50' } }}
                              >
                                <Td fontWeight="medium">{label}</Td>
                                <Td isNumeric color="accent">
                                  {typeof d.mean === 'number' ? roundTo1(d.mean) : '—'}
                                </Td>
                                <Td>{bandDisplayLabel(d.band) ?? '—'}</Td>
                                <Td isNumeric>{d.count ?? '—'}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {sortedValues.length > 0 && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    borderLeftWidth="4px"
                    borderLeftColor="accent"
                    bg="chakra-body-bg"
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      Values (what matters to you)
                    </Heading>
                    <HStack spacing={3} mb={3} flexWrap="wrap">
                      <Button
                        size="sm"
                        minH="36px"
                        colorScheme={sortOrderValues === SORT_DESC ? 'brand' : 'gray'}
                        variant={sortOrderValues === SORT_DESC ? 'solid' : 'outline'}
                        onClick={() => setSortOrderValues(SORT_DESC)}
                        aria-pressed={sortOrderValues === SORT_DESC}
                        data-testid="sort-values-desc"
                      >
                        High to low
                      </Button>
                      <Button
                        size="sm"
                        minH="36px"
                        colorScheme={sortOrderValues === SORT_ASC ? 'brand' : 'gray'}
                        variant={sortOrderValues === SORT_ASC ? 'solid' : 'outline'}
                        onClick={() => setSortOrderValues(SORT_ASC)}
                        aria-pressed={sortOrderValues === SORT_ASC}
                        data-testid="sort-values-asc"
                      >
                        Low to high
                      </Button>
                    </HStack>
                    <TableContainer>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th isNumeric>Score</Th>
                            <Th>Compatibility</Th>
                            <Th isNumeric>Based on</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {sortedValues.map((d) => {
                            const meta = dimensionMeta.values?.[d.id];
                            const label = dimensionLabel(d, meta);
                            return (
                              <Tr
                                key={`value-${d.id}`}
                                cursor="pointer"
                                onClick={() => openDetail(d, 'values')}
                                _hover={{ bg: 'blackAlpha.50', _dark: { bg: 'whiteAlpha.50' } }}
                              >
                                <Td fontWeight="medium">{label}</Td>
                                <Td isNumeric color="accent">
                                  {typeof d.mean === 'number' ? roundTo1(d.mean) : '—'}
                                </Td>
                                <Td>{bandDisplayLabel(d.band) ?? '—'}</Td>
                                <Td isNumeric>{d.count ?? '—'}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </>
            ) : (
              <Box
                p={6}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="chakra-border-color"
                borderLeftWidth="4px"
                borderLeftColor="accent"
                bg="chakra-body-bg"
                boxShadow="sm"
              >
                <Text color="chakra-subtle-text">
                  No traits or values yet. Complete a discovery to see your dimensions.
                </Text>
              </Box>
            )}

            <Modal isOpen={isDetailsOpen} onClose={closeDetail} size="xl" scrollBehavior="inside">
              <ModalOverlay bg="blackAlpha.600" _dark={{ bg: 'blackAlpha.700' }} />
              <ModalContent
                maxH="90vh"
                bg="chakra-body-bg"
                borderWidth="1px"
                borderColor="chakra-border-color"
                borderRadius="xl"
                boxShadow="xl"
              >
                <ModalHeader
                  borderBottomWidth="1px"
                  borderColor="chakra-border-color"
                  pb={4}
                  bg="blackAlpha.20"
                  _dark={{ bg: 'whiteAlpha.50' }}
                  borderTopRadius="xl"
                >
                  {selectedDimension && selectedType && (
                    <Text as="span" color="chakra-body-text" fontWeight="semibold">
                      {dimensionLabel(
                        selectedDimension,
                        dimensionMeta?.[selectedType]?.[selectedDimension.id]
                      )}
                    </Text>
                  )}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6} pt={4} bg="chakra-body-bg">
                  {selectedDimension && selectedType && (
                    <DimensionDetailsContent
                      dimension={selectedDimension}
                      type={selectedType}
                      dimensionMeta={dimensionMeta}
                    />
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>

            <Box pt={3} borderTopWidth="1px" borderColor="chakra-border-color">
              <Button
                variant="link"
                size="sm"
                minH="36px"
                onClick={() => navigate('/results', { state: { sessionId: resolvedSessionId } })}
                color="accent"
                _hover={{ textDecoration: 'underline' }}
              >
                ← Back to results
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
}
