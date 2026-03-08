import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Text,
  UnorderedList,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import { SkillDetailsContent } from '../SkillDetailsContent';
import { getReport, getOccupationsBySkillIds, getOccupationByNocCode } from '../../services/surveyApi';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

const BUCKET_KEYS = ['low', 'medium', 'high'];
const BUCKET_LABELS = {
  low: 'Low time investment',
  medium: 'Medium time investment',
  high: 'High time investment',
};

const SHORT_DESC_LENGTH = 220;

/** First paragraph or first N characters for shortened description. */
function shortDescription(description) {
  if (!description || typeof description !== 'string') return { short: '', hasMore: false };
  const trimmed = description.trim();
  const firstPara = trimmed.split(/\n\n+/)[0];
  if (firstPara.length <= SHORT_DESC_LENGTH) {
    return { short: firstPara, hasMore: trimmed.length > firstPara.length };
  }
  return {
    short: firstPara.slice(0, SHORT_DESC_LENGTH).trim() + '…',
    hasMore: true,
  };
}

function skillMatchDisplay(applicability, maxApplicability) {
  if (applicability == null || maxApplicability == null || maxApplicability <= 0) return { text: '-', band: null };
  const ratio = Math.min(1, applicability / maxApplicability);
  const score = 1 + ratio * 4;
  const text = `${(Math.round(score * 10) / 10).toFixed(1)}/5`;
  let band = null;
  if (score >= 4.2) band = 'Very High';
  else if (score >= 3.4) band = 'High';
  else if (score >= 2.6) band = 'Medium';
  else if (score >= 1.8) band = 'Low';
  else band = 'Very Low';
  return { text, band };
}

function SkillDefinitionContent({
  skill,
  maxApplicability,
  expanded,
  onShowMore,
  structuralDimensionMeta,
}) {
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
  const match = skillMatchDisplay(skill.applicability, maxApplicability);
  const label = (skill.short_label && skill.short_label.trim()) ? skill.short_label.trim() : skill.name;
  const { short: shortDesc, hasMore } = shortDescription(skill.description);
  const hasExtraSections = !!(skill.ai_future_rationale || skill.how_measured_or_observed || (Array.isArray(skill.question_hints) && skill.question_hints.length > 0) || (skill.structural_scores && Object.keys(skill.structural_scores).length > 0));
  const showMoreLink = hasMore || hasExtraSections;

  if (expanded) {
    return (
      <VStack align="stretch" spacing={4}>
        <SkillDetailsContent
          skill={skill}
          maxApplicability={maxApplicability}
          structuralDimensionMeta={structuralDimensionMeta ?? []}
        />
        <Button
          variant="link"
          size="sm"
          color="accent"
          _hover={{ textDecoration: 'underline' }}
          onClick={onShowMore}
        >
          Less
        </Button>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={4}>
      {(shortDesc || skill.description) && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Definition
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {shortDesc || skill.description}
          </Text>
        </Box>
      )}
      <Box {...sectionProps}>
        <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
          Your match
        </Text>
        <Text fontSize="sm" color="chakra-body-text">
          {match.text}
          {match.band && (
            <Text as="span" color="chakra-subtle-text">
              {' '}({match.band})
            </Text>
          )}
        </Text>
      </Box>
      {!shortDesc && !skill.description && (
        <Text fontSize="sm" color="chakra-subtle-text">
          No definition available for {label}.
        </Text>
      )}
      {showMoreLink && (
        <Box>
          <Button
            variant="link"
            size="sm"
            color="accent"
            _hover={{ textDecoration: 'underline' }}
            onClick={onShowMore}
          >
            More
          </Button>
        </Box>
      )}
    </VStack>
  );
}

// All tiles use PageHero background; only the top indicator shows compatibility (red / yellow / green).
// _dark: explicit color so tile title stays visible; only side/bottom border so top indicator is not overwritten.
function getSkillTileColor(applicability, maxApplicability) {
  const base = {
    bg: 'hero-bg',
    color: 'hero-title',
    _dark: {
      color: 'brand.200',
      borderLeftColor: 'hero-border',
      borderRightColor: 'hero-border',
      borderBottomColor: 'hero-border',
    },
  };
  if (maxApplicability == null || maxApplicability <= 0) {
    return { ...base, topIndicatorColor: 'red.500' };
  }
  const ratio = Math.min(1, (applicability ?? 0) / maxApplicability);
  const topIndicatorColor =
    ratio <= 1 / 3 ? 'red.500' : ratio <= 2 / 3 ? 'yellow.500' : 'green.500';
  return { ...base, topIndicatorColor };
}

function OccupationDetailContent({ occupation }) {
  if (!occupation) return null;
  const { name, nocCode, exampleTitles, mainDuties, employmentRequirements, additionalInformation } = occupation;
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
  return (
    <VStack align="stretch" spacing={4}>
      {name && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Occupation
          </Text>
          <Text fontSize="md" color="chakra-body-text">
            {name}
          </Text>
          {nocCode && (
            <Text fontSize="xs" color="chakra-subtle-text" mt={1}>
              NOC {nocCode}
            </Text>
          )}
        </Box>
      )}
      {exampleTitles && exampleTitles.length > 0 && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Example titles
          </Text>
          <UnorderedList pl={4} spacing={1} fontSize="sm" color="chakra-body-text">
            {exampleTitles.slice(0, 12).map((title, i) => (
              <li key={i}>{title}</li>
            ))}
            {exampleTitles.length > 12 && (
              <Text as="li" listStyleType="none" pl={0} color="chakra-subtle-text">
                ... and {exampleTitles.length - 12} more
              </Text>
            )}
          </UnorderedList>
        </Box>
      )}
      {mainDuties && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Main duties
          </Text>
          <Text fontSize="sm" color="chakra-body-text" whiteSpace="pre-wrap" lineHeight="tall">
            {mainDuties}
          </Text>
        </Box>
      )}
      {employmentRequirements && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Employment requirements
          </Text>
          <Text fontSize="sm" color="chakra-body-text" whiteSpace="pre-wrap" lineHeight="tall">
            {employmentRequirements}
          </Text>
        </Box>
      )}
      {additionalInformation && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Additional information
          </Text>
          <Text fontSize="sm" color="chakra-body-text" whiteSpace="pre-wrap" lineHeight="tall">
            {additionalInformation}
          </Text>
        </Box>
      )}
    </VStack>
  );
}

export default function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [occupationGroups, setOccupationGroups] = useState([]);
  const [occupationsLoading, setOccupationsLoading] = useState(false);
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [occupationDetail, setOccupationDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isSkillDefOpen, onOpen: onSkillDefOpen, onClose: onSkillDefClose } = useDisclosure();
  const [skillForDefinition, setSkillForDefinition] = useState(null);
  const [skillDefExpanded, setSkillDefExpanded] = useState(false);

  const [pool, setPool] = useState([]);
  const [buckets, setBuckets] = useState({ low: [], medium: [], high: [] });

  const bucketDisplayOrder = useBreakpointValue({
    base: ['high', 'medium', 'low'],
    md: ['low', 'medium', 'high'],
  }) ?? BUCKET_KEYS;

  const isTouchDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const resolvedSessionId =
    location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);

  const fetchReport = useCallback(async (sid) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReport(sid);
      setReport(data);
      const skills = data?.skillDevelopmentRoadmap ?? [];
      const maxApp = skills.length ? Math.max(...skills.map((s) => s.applicability ?? 0), 0) : 0;
      const highBucket = [];
      const poolList = [];
      skills.forEach((s) => {
        const copy = { ...s };
        const ratio = maxApp > 0 ? (s.applicability ?? 0) / maxApp : 0;
        if (ratio > 2 / 3) {
          highBucket.push(copy);
        } else {
          poolList.push(copy);
        }
      });
      setPool(poolList);
      setBuckets({ low: [], medium: [], high: highBucket });
    } catch (err) {
      setError(err.message || 'We couldn\'t load your careers. Try again or start a new discovery.');
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

  const maxApplicability = useMemo(() => {
    const all = [...pool, ...buckets.low, ...buckets.medium, ...buckets.high];
    if (all.length === 0) return 0;
    return Math.max(...all.map((s) => s.applicability ?? 0), 0);
  }, [pool, buckets]);

  const skillIdsInBuckets = useMemo(() => {
    const ids = new Set();
    BUCKET_KEYS.forEach((key) => {
      buckets[key].forEach((s) => s.id && ids.add(s.id));
    });
    return Array.from(ids);
  }, [buckets]);

  useEffect(() => {
    if (skillIdsInBuckets.length === 0) {
      setOccupationGroups([]);
      return;
    }
    let cancelled = false;
    setOccupationsLoading(true);
    getOccupationsBySkillIds(skillIdsInBuckets, true)
      .then((data) => {
        if (!cancelled) {
          const groups = data && Array.isArray(data.groups) ? data.groups : [];
          setOccupationGroups(groups);
        }
      })
      .catch(() => {
        if (!cancelled) setOccupationGroups([]);
      })
      .finally(() => {
        if (!cancelled) setOccupationsLoading(false);
      });
    return () => { cancelled = true; };
  }, [skillIdsInBuckets.join(',')]);

  const moveSkill = useCallback((skill, fromSource, toBucket) => {
    const fromPool = fromSource === 'pool';
    const fromBucketKey = BUCKET_KEYS.includes(fromSource) ? fromSource : null;

    setPool((prev) => {
      if (toBucket === 'pool') {
        if (fromPool) return prev;
        return [...prev, skill];
      }
      if (fromPool) return prev.filter((s) => s.id !== skill.id);
      return prev;
    });

    setBuckets((prev) => {
      const next = { ...prev };
      if (fromBucketKey && fromBucketKey !== toBucket) {
        next[fromBucketKey] = next[fromBucketKey].filter((s) => s.id !== skill.id);
      }
      if (toBucket !== 'pool') {
        if (fromPool || fromBucketKey) {
          next[toBucket] = [...(next[toBucket] || []), skill];
        }
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e, skill, source) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ skillId: skill.id, source }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e, toBucket) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return;
    }
    const { skillId, source } = payload;
    const fromPool = source === 'pool';
    const fromBucketKey = BUCKET_KEYS.includes(source) ? source : null;
    const allSkills = [...pool, ...buckets.low, ...buckets.medium, ...buckets.high];
    const skill = allSkills.find((s) => s.id === skillId);
    if (!skill) return;
    moveSkill(skill, fromPool ? 'pool' : fromBucketKey, toBucket);
  }, [pool, buckets, moveSkill]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const openOccupationDetail = useCallback(async (occ) => {
    setSelectedOccupation(occ);
    setOccupationDetail(null);
    setDetailLoading(true);
    onDetailOpen();
    try {
      const full = await getOccupationByNocCode(occ.nocCode);
      setOccupationDetail(full);
    } catch {
      setOccupationDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [onDetailOpen]);

  const closeOccupationDetail = useCallback(() => {
    onDetailClose();
    setSelectedOccupation(null);
    setOccupationDetail(null);
  }, [onDetailClose]);

  const handleMoveTo = useCallback((skill, source, toBucket) => {
    moveSkill(skill, source, toBucket);
  }, [moveSkill]);

  const openSkillDefinition = useCallback((skill) => {
    setSkillForDefinition(skill);
    setSkillDefExpanded(false);
    onSkillDefOpen();
  }, [onSkillDefOpen]);

  const closeSkillDefinition = useCallback(() => {
    onSkillDefClose();
    setSkillForDefinition(null);
    setSkillDefExpanded(false);
  }, [onSkillDefClose]);

  const renderSkillTile = useCallback((skill, source) => {
    const colorScheme = getSkillTileColor(skill.applicability, maxApplicability);
    const label = (skill.short_label && skill.short_label.trim()) ? skill.short_label.trim() : skill.name;
    const fromPool = source === 'pool';
    return (
      <Box key={skill.id} flex="0 0 calc(50% - 4px)" minW={0}>
        <Menu placement="bottom-start" isLazy>
        <MenuButton
          as={Box}
          draggable={!isTouchDevice}
          onDragStart={!isTouchDevice ? (e) => handleDragStart(e, skill, source) : undefined}
          w="100%"
          minW={0}
          h="9"
          px={3}
          py={2}
          borderRadius="md"
          borderWidth="1px"
          borderColor="chakra-border-color"
          borderTopWidth="3px"
          borderTopColor={colorScheme.topIndicatorColor}
          bg={colorScheme.bg}
          color={colorScheme.color}
          fontSize="sm"
          fontWeight="medium"
          textAlign="left"
          cursor={isTouchDevice ? 'pointer' : 'grab'}
          _hover={{ opacity: 0.9 }}
          _active={isTouchDevice ? undefined : { cursor: 'grabbing' }}
          _dark={colorScheme._dark}
          sx={{ touchAction: 'manipulation' }}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          title={label}
        >
          {label}
        </MenuButton>
        <MenuList minW="220px" zIndex={10}>
          {!fromPool && (
            <MenuItem onClick={() => handleMoveTo(skill, source, 'pool')}>
              Back to skills pool
            </MenuItem>
          )}
          {BUCKET_KEYS.map((key) => (
            <MenuItem
              key={key}
              onClick={() => handleMoveTo(skill, source, key)}
              isDisabled={!fromPool && source === key}
            >
              {BUCKET_LABELS[key]}
              {!fromPool && source === key ? ' (current)' : ''}
            </MenuItem>
          ))}
          <MenuDivider />
          <MenuItem
            onClick={() => openSkillDefinition(skill)}
            as="button"
            color="accent"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline', bg: 'transparent' }}
          >
            View definition
          </MenuItem>
        </MenuList>
      </Menu>
      </Box>
    );
  }, [maxApplicability, handleDragStart, handleMoveTo, openSkillDefinition, isTouchDevice]);

  const renderBucket = useCallback((bucketKey) => {
    const list = buckets[bucketKey] || [];
    const label = BUCKET_LABELS[bucketKey];
    return (
      <Box
        minH="80px"
        p={3}
        borderRadius="lg"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="chakra-border-color"
        bg="blackAlpha.30"
        _dark={{ bg: 'whiteAlpha.50' }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, bucketKey)}
      >
        <Text fontSize="xs" fontWeight="semibold" color="chakra-subtle-text" mb={2}>
          {label}
        </Text>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {list.map((skill) => renderSkillTile(skill, bucketKey))}
        </Box>
      </Box>
    );
  }, [buckets, handleDragOver, handleDrop, renderSkillTile]);

  if (!resolvedSessionId) {
    return (
      <>
        <PageHero title="Careers" tagline="Career directions that fit your profile" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
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
                  Complete a discovery to see your career directions.
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
        <PageHero title="Careers" tagline="Career directions that fit your profile" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading your careers...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Careers" tagline="Career directions that fit your profile" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
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
      <PageHero title="Careers" tagline="Career directions that fit your profile" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
        <Container maxW="2xl">
          <VStack align="stretch" spacing={8} w="full">
            <Box>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/results', { state: { sessionId: resolvedSessionId } })}
                mb={2}
                color="chakra-subtle-text"
                _hover={{ color: 'accent' }}
              >
                ← Back to results
              </Button>
              <Text color="chakra-subtle-text" fontSize="sm">
                Tap or drag skills into time-investment buckets. Careers below match the skills you assign. Top bar: green = strong fit, yellow = medium, red = low fit to your profile.
              </Text>
            </Box>

            <Box w="full">
              <Heading size="sm" mb={3} color="chakra-body-text">
                Skills (tap to move, or drag into buckets below)
              </Heading>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                minH="60px"
                maxH={{ base: '11rem', md: 'none' }}
                overflowY={{ base: 'auto', md: 'visible' }}
                p={3}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="chakra-border-color"
                bg="chakra-body-bg"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'pool')}
              >
                {pool.map((skill) => renderSkillTile(skill, 'pool'))}
              </Box>
            </Box>

            <Box w="full">
              <Heading size="sm" mb={3} color="chakra-body-text">
                Time investment
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {bucketDisplayOrder.map((key) => (
                  <Box key={key}>{renderBucket(key)}</Box>
                ))}
              </SimpleGrid>
            </Box>

            <Box w="full">
              <Heading size="sm" mb={3} color="chakra-body-text">
                Careers that match your selected skills
              </Heading>
              {skillIdsInBuckets.length === 0 ? (
                <Text color="chakra-subtle-text" fontSize="sm">
                  Move skills into the buckets above to see matching careers.
                </Text>
              ) : occupationsLoading ? (
                <HStack spacing={2}>
                  <Spinner size="sm" />
                  <Text color="chakra-subtle-text" fontSize="sm">Loading careers...</Text>
                </HStack>
              ) : occupationGroups.length === 0 ? (
                <Text color="chakra-subtle-text" fontSize="sm">
                  No occupations match the selected skills.
                </Text>
              ) : (
                <VStack align="stretch" spacing={6}>
                  {occupationGroups.map((group) => (
                    <Box key={group.categoryKey || group.categoryLabel || 'other'}>
                      <Text fontSize="sm" color="chakra-subtle-text" mb={3} fontWeight="semibold">
                        {group.categoryLabel}
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        {(group.occupations || []).map((occ) => (
                          <Box
                            key={occ.nocCode}
                            as="button"
                            type="button"
                            textAlign="left"
                            p={4}
                            borderWidth="1px"
                            borderRadius="lg"
                            borderColor="chakra-border-color"
                            borderLeftWidth="4px"
                            borderLeftColor="accent"
                            bg="chakra-body-bg"
                            boxShadow="sm"
                            cursor="pointer"
                            onClick={() => openOccupationDetail(occ)}
                            _hover={{ bg: 'blackAlpha.50', _dark: { bg: 'whiteAlpha.50' } }}
                          >
                            <Text fontWeight="semibold" fontSize="md">
                              {occ.name}
                            </Text>
                            {occ.matchScore != null && (
                              <Text fontSize="xs" color="chakra-subtle-text" mt={1}>
                                Match: {occ.matchScore}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </Container>
      </Box>

      <Modal isOpen={isDetailOpen} onClose={closeOccupationDetail} size="xl" scrollBehavior="inside">
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
            {selectedOccupation?.name ?? 'Occupation'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} pt={4} bg="chakra-body-bg">
            {detailLoading ? (
              <Spinner size="lg" />
            ) : (
              <OccupationDetailContent occupation={occupationDetail} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSkillDefOpen} onClose={closeSkillDefinition} size="md" scrollBehavior="inside">
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
            {skillForDefinition && (
              (skillForDefinition.short_label && skillForDefinition.short_label.trim())
                ? skillForDefinition.short_label.trim()
                : skillForDefinition.name
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} pt={4} bg="chakra-body-bg">
            {skillForDefinition && (
              <SkillDefinitionContent
                skill={skillForDefinition}
                maxApplicability={maxApplicability}
                expanded={skillDefExpanded}
                onShowMore={() => setSkillDefExpanded((e) => !e)}
                structuralDimensionMeta={report?.structuralDimensionMeta}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
