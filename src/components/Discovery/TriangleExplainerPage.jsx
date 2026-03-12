/**
 * Explainer page shown before the real triangle assessment. One hypothetical question,
 * draggable ball, and a live human-readable explanation of what the placement means.
 * No data is sent to the server.
 */

import { Box, Button, Container, List, ListItem, Text, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import TriangleQuestion from './TriangleQuestion';

const MIN_ZONES_BEFORE_START = 3;

const REJECTION_WEIGHT_THRESHOLD = 0.15;
const CORNER_THRESHOLD = 0.7;
const NEAR_CORNER_MIN = 0.55;
const EDGE_MIN_THRESHOLD = 0.2;

/** Hypothetical question: hosting, what you offer (one dimension, three options). */
const EXPLAINER_QUESTION = {
  id: 'explainer',
  title: 'How the triangle works',
  prompt: "You're having people over. What do you offer?",
  vertices: {
    a: { label: 'Desserts & treats' },
    b: { label: 'Full meal' },
    c: { label: 'Snacks & bites' },
  },
};

/** Detect zone from barycentric weights. Same logic as ResultsAnswersPage. */
function detectZone(na, nb, nc) {
  const arr = [na, nb, nc];
  const sum = arr.reduce((s, x) => s + x, 0);
  if (sum <= 0) return 'centre';
  const n = arr.map((x) => x / sum);
  const sorted = n.slice().sort((a, b) => b - a);
  const maxW = sorted[0];
  const minW = sorted[2];
  const midW = sorted[1];
  if (maxW >= CORNER_THRESHOLD) return 'corner';
  if (minW < EDGE_MIN_THRESHOLD) {
    if (maxW >= NEAR_CORNER_MIN) return 'near_corner';
    if (midW >= 0.35 && midW <= 0.65 && Math.abs(maxW - midW) < 0.2) return 'edge';
    return 'near_edge';
  }
  return 'centre';
}

/**
 * Structured interpretation in the methodology style: zone label, "You are saying X things", points, closing.
 * Uses vertex labels (no dimension ids). Returns { zoneLabel, intro, points[], closing } or null for no placement.
 */
function getPlacementExplanation(coords, labelA, labelB, labelC) {
  const na = coords.a ?? 1 / 3;
  const nb = coords.b ?? 1 / 3;
  const nc = coords.c ?? 1 / 3;
  const sum = na + nb + nc;
  if (sum <= 0) {
    return {
      zoneLabel: null,
      intro: 'Your position shows what you are leaning toward offering.',
      points: [],
      closing: null,
    };
  }
  const a = na / sum;
  const b = nb / sum;
  const c = nc / sum;
  const byWeight = [
    { key: 'a', label: labelA, w: a },
    { key: 'b', label: labelB, w: b },
    { key: 'c', label: labelC, w: c },
  ].sort((x, y) => y.w - x.w);
  const first = byWeight[0];
  const second = byWeight[1];
  const third = byWeight[2];
  const A = first.key.toUpperCase();
  const B = second.key.toUpperCase();
  const C = third.key.toUpperCase();
  const zone = detectZone(a, b, c);

  if (zone === 'corner') {
    return {
      zoneLabel: 'Corner',
      intro: 'In plain terms:',
      points: [
        `You are strongly leaning toward ${A}.`,
        `${B} and ${C} are barely in the picture.`,
        `So you are clearly choosing one and leaving the other two out.`,
      ],
      closing: `How the system reads it: one placement gives three scores. ${A} gets a high score; ${C} is treated as a clear no, not just low.`,
    };
  }

  if (zone === 'edge') {
    return {
      zoneLabel: 'Edge',
      intro: 'In plain terms:',
      points: [
        `You would offer a mix of ${A} and ${B}; both matter.`,
        `You are not really choosing between them.`,
        `${C} is not what you have in mind for this.`,
      ],
      closing: `How the system reads it: ${C} is an explicit rejection, not just a small score. It counts as "off the table."`,
    };
  }

  if (zone === 'near_edge') {
    return {
      zoneLabel: 'Near edge',
      intro: 'In plain terms:',
      points: [
        `${A} leads, but ${B} is still in the mix.`,
        `You did not fully commit to just one of those two.`,
        `${C} is not part of what you would offer.`,
      ],
      closing: `How the system reads it: ${C} is still treated as excluded, even though you did not go full corner on ${A} or ${B}.`,
    };
  }

  if (zone === 'centre') {
    return {
      zoneLabel: 'Centre',
      intro: 'In plain terms:',
      points: [
        'All three (A, B, C) are somewhat in play; no strong pull.',
        `Maybe ${A} a bit more, but only a bit.`,
        'You are not ruling anything out.',
      ],
      closing: 'How the system reads it: weak evidence. No rejection. No strong signal in any direction.',
    };
  }

  if (zone === 'near_corner') {
    return {
      zoneLabel: 'Near corner',
      intro: 'In plain terms:',
      points: [
        `${A} is your main choice, but you kept ${B} in the picture.`,
        `You did not go all the way to only ${A}.`,
        `${C} is out; you are not offering that.`,
      ],
      closing: `How the system reads it: strong pull toward ${A}, ${B} still counts, ${C} is treated as rejected.`,
    };
  }

  return {
    zoneLabel: 'Centre',
    intro: 'In plain terms:',
    points: [
      'All three (A, B, C) are somewhat in play; no strong pull.',
      `Maybe ${A} a bit more, but only a bit.`,
      'You are not ruling anything out.',
    ],
    closing: 'How the system reads it: weak evidence. No rejection. No strong signal in any direction.',
  };
}

export default function TriangleExplainerPage({ onStart }) {
  const [value, setValue] = useState({ a: 1 / 3, b: 1 / 3, c: 1 / 3 });
  const visitedZonesRef = useRef(new Set());
  const startingZoneRef = useRef(null);
  const [distinctZonesCount, setDistinctZonesCount] = useState(0);
  const v = EXPLAINER_QUESTION.vertices;
  const explanation = getPlacementExplanation(value, v.a.label, v.b.label, v.c.label);

  useEffect(() => {
    const zone = explanation.zoneLabel;
    if (!zone) return;
    if (startingZoneRef.current === null) startingZoneRef.current = zone;
    if (visitedZonesRef.current.has(zone)) return;
    visitedZonesRef.current.add(zone);
    const total = visitedZonesRef.current.size;
    const excludingStart = startingZoneRef.current && visitedZonesRef.current.has(startingZoneRef.current) ? total - 1 : total;
    setDistinctZonesCount(excludingStart);
  }, [explanation.zoneLabel]);

  const canStart = distinctZonesCount >= MIN_ZONES_BEFORE_START;

  return (
    <Box py={{ base: 6, md: 10 }} px={4} data-testid="page-triangle-explainer">
      <Container maxW="2xl" centerContent>
        <VStack align="stretch" spacing={6} w="full">
          <Box
            p={{ base: 4, md: 6 }}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="chakra-border-color"
            borderLeftWidth="4px"
            borderLeftColor="accent"
            bg="chakra-body-bg"
            boxShadow="sm"
          >
            <TriangleQuestion
              question={EXPLAINER_QUESTION}
              value={value}
              onChange={setValue}
            />
            <Box
              mt={4}
              pt={4}
              borderTopWidth="1px"
              borderColor="chakra-border-color"
              data-testid="triangle-explainer-summary"
            >
              <Text fontSize="sm" fontWeight="600" color="chakra-body-text" mb={2}>
                What your move says:
              </Text>
              {explanation.zoneLabel && (
                <Text fontSize="sm" fontWeight="600" color="chakra-body-text" mb={2}>
                  {explanation.zoneLabel}
                </Text>
              )}
              <Text fontSize="md" color="chakra-subtle-text" lineHeight="tall" mb={2}>
                {explanation.intro}
              </Text>
              {explanation.points.length > 0 && (
                <List spacing={2} mb={3} pl={5} styleType="disc">
                  {explanation.points.map((point, i) => (
                    <ListItem key={i} fontSize="md" color="chakra-subtle-text" lineHeight="tall">
                      {point}
                    </ListItem>
                  ))}
                </List>
              )}
              {explanation.closing && (
                <Text fontSize="md" color="chakra-subtle-text" lineHeight="tall">
                  {explanation.closing}
                </Text>
              )}
            </Box>
            <Box w="full" display="flex" alignItems="center" justifyContent="space-between" gap={4} mt={6} flexWrap="wrap">
              <Text fontSize="sm" color="chakra-subtle-text" flex="1" minW="0">
                {canStart
                  ? 'You can start the assessment.'
                  : `Try at least ${MIN_ZONES_BEFORE_START} different zones (e.g. corner, edge, centre). The starting zone does not count.`}
              </Text>
              <Button
                colorScheme="brand"
                size="lg"
                minH="44px"
                px={6}
                onClick={onStart}
                isDisabled={!canStart}
                data-testid="triangle-explainer-start"
              >
                Start the assessment
              </Button>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
