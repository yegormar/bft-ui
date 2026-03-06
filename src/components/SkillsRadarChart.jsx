/**
 * Radar chart: blue = your match, red = AI future fit.
 * Uses Nivo with circular grid (real circles), circular background distinct from page, scale 1-5.
 * Based on the reference: smooth circles, clear axis/background colors, more graph than labels.
 */

import { Box, HStack, Text, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import { ResponsiveRadar } from '@nivo/radar';

const SCALE_MIN = 1;
const SCALE_MAX = 5;
/** Chart uses 0-4 so the radius is 1-5; scale labels show 1-5. */
const CHART_MAX = SCALE_MAX - SCALE_MIN;
const MAX_LABEL_LEN = 18;

const BLUE_STROKE = '#2563eb';
const BLUE_FILL = '#60a5fa';
const RED_STROKE = '#b91c1c';
const RED_FILL = '#f87171';

const STRUCTURAL_KEYS = [
  'ai_resistance',
  'leverage_multiplier',
  'authority_pathway',
  'scarcity_durability',
  'transferability',
  'time_to_compound',
];

function hasFullStructuralScores(skill) {
  const ss = skill.structural_scores;
  if (!ss || typeof ss !== 'object') return false;
  return STRUCTURAL_KEYS.every((k) => typeof ss[k] === 'number');
}

/**
 * AI future score 0-1. Use API value when present. For legacy reports, compute from
 * structural_scores (all six dimensions) only. No fallback: if we have no score we don't guess.
 */
function aiFutureScore(skill) {
  if (typeof skill.ai_future_score === 'number' && skill.ai_future_score >= 0 && skill.ai_future_score <= 1) {
    return skill.ai_future_score;
  }
  const ss = skill.structural_scores;
  if (ss && hasFullStructuralScores(skill)) {
    const r = (ss.ai_resistance ?? 0) / 5;
    const l = (ss.leverage_multiplier ?? 0) / 5;
    const a = (ss.authority_pathway ?? 0) / 5;
    const s = (ss.scarcity_durability ?? 0) / 5;
    const t = (ss.transferability ?? 0) / 5;
    const c = (ss.time_to_compound ?? 0) / 5;
    return (r + l + a + s + t + c) / 6;
  }
  return null;
}

function normalizeApplicability(applicability, maxApplicability) {
  if (applicability == null || applicability <= 0) return 0;
  if (maxApplicability == null || maxApplicability <= 0) return 0;
  const v = applicability / maxApplicability;
  return Math.min(1, Math.max(0, v));
}

function shortLabel(name) {
  if (!name || name.length <= MAX_LABEL_LEN) return name;
  return name.slice(0, MAX_LABEL_LEN - 1).trim() + '\u2026';
}

function toScale5(v) {
  if (v == null || Number.isNaN(v)) return SCALE_MIN;
  return SCALE_MIN + Math.max(0, Math.min(1, v)) * (SCALE_MAX - SCALE_MIN);
}

/** Format a number to one decimal place for display in tooltips. */
function roundTo1(num) {
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);
  return (Math.round(n * 10) / 10).toFixed(1);
}

/** Band label for a 1-5 match score (e.g. "Very High"). */
function matchBandForValue(score) {
  const s = Number(score);
  if (Number.isNaN(s)) return null;
  if (s >= 4.2) return 'Very High';
  if (s >= 3.4) return 'High';
  if (s >= 2.6) return 'Medium';
  if (s >= 1.8) return 'Low';
  if (s >= 1) return 'Very Low';
  return null;
}

function trendLabel(aiTrend) {
  if (!aiTrend) return null;
  const t = String(aiTrend).toLowerCase();
  if (t === 'grows') return 'Grows';
  if (t === 'stays') return 'Stays';
  if (t === 'decreasing') return 'Decreasing';
  if (t === 'mixed') return 'Mixed';
  return aiTrend;
}

/**
 * Nivo data: one object per skill with subject + keys for each series.
 * Only includes skills we can score (API ai_future_score or full structural_scores); no guesswork.
 */
function buildChartData(skills, maxApplicability) {
  const scoreable = skills.filter(
    (s) => typeof s.ai_future_score === 'number' || hasFullStructuralScores(s)
  );
  return scoreable.map((s) => {
    const myMatch = normalizeApplicability(s.applicability, maxApplicability);
    const aiFuture = aiFutureScore(s);
    const matchScaled = toScale5(myMatch);
    const aiScaled = toScale5(aiFuture);
    const subject = (s.short_label && s.short_label.trim()) ? s.short_label.trim() : shortLabel(s.name);
    return {
      subject,
      fullName: s.name,
      'Your match': matchScaled - SCALE_MIN,
      'AI future fit': aiScaled - SCALE_MIN,
      displayMatch: matchScaled,
      displayFuture: aiScaled,
      matchBand: matchBandForValue(matchScaled),
      trend: trendLabel(s.ai_trend),
    };
  });
}

/**
 * Custom layer: draw a filled circle behind the grid so the chart area has a distinct background.
 */
function CircularBackgroundLayer({ centerX, centerY, radiusScale }) {
  const fill = useColorModeValue('#f8fafc', '#1e293b');
  const r = radiusScale(CHART_MAX);
  return (
    <circle
      cx={centerX}
      cy={centerY}
      r={r}
      fill={fill}
      style={{ shapeRendering: 'geometricPrecision' }}
    />
  );
}

/** 11 o'clock in radians: Nivo uses 0 = 3 o'clock, first axis at -PI/2 (12 o'clock), clockwise. */
const ELEVEN_OCLOCK_RAD = -Math.PI / 2 - Math.PI / 6;

/**
 * Custom layer: scale labels 1-5 along the axis closest to 11 o'clock (on the axis line).
 */
function ScaleLabelsLayer({ centerX, centerY, radiusScale, angleStep, data }) {
  const fill = useColorModeValue('#475569', '#94a3b8');
  const n = data?.length ?? 1;
  const step = angleStep ?? (2 * Math.PI) / n;
  const axisIndex =
    (Math.round((ELEVEN_OCLOCK_RAD + Math.PI / 2) / step) % n + n) % n;
  const scaleAngle = -Math.PI / 2 + axisIndex * step;
  const labels = [];
  for (let level = SCALE_MIN; level <= SCALE_MAX; level++) {
    const r = radiusScale(level - SCALE_MIN);
    const x = centerX + r * Math.cos(scaleAngle);
    const y = centerY + r * Math.sin(scaleAngle);
    labels.push(
      <text
        key={level}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={fill}
        fontSize={10}
        fontWeight={500}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        {level}
      </text>
    );
  }
  return <g>{labels}</g>;
}

/**
 * Split label into two lines at first space so multi-word labels wrap and use less horizontal space.
 */
function splitLabel(text) {
  if (!text || typeof text !== 'string') return [text || ''];
  const t = text.trim();
  const i = t.indexOf(' ');
  if (i <= 0) return [t];
  return [t.slice(0, i), t.slice(i + 1)];
}

const LINE_HEIGHT = 10;

/**
 * Custom grid label: wrap to two lines when label has more than one word.
 */
function GridLabelTwoLines({ id, anchor, x, y, animated }) {
  const fill = useColorModeValue('#475569', '#94a3b8');
  const [line1, line2] = splitLabel(id);
  const textAnchor = anchor === 'start' ? 'start' : anchor === 'end' ? 'end' : 'middle';
  return (
    <g transform={animated?.transform ?? undefined} style={{ transformOrigin: `${x}px ${y}px` }}>
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill={fill}
        fontSize={10}
        fontWeight={500}
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <tspan x={x} dy={0}>
          {line1}
        </tspan>
        {line2 ? (
          <tspan x={x} dy={LINE_HEIGHT}>
            {line2}
          </tspan>
        ) : null}
      </text>
    </g>
  );
}

const CHART_MARGIN_BASE = { top: 24, right: 24, bottom: 24, left: 24 };
const CHART_MARGIN_MD = { top: 40, right: 40, bottom: 40, left: 40 };

export default function SkillsRadarChart({ skills, maxApplicability }) {
  const data = buildChartData(skills, maxApplicability);
  const subjectToFullName = Object.fromEntries(data.map((d) => [d.subject, d.fullName]));

  const chartMargin = useBreakpointValue({ base: CHART_MARGIN_BASE, md: CHART_MARGIN_MD });
  const gridStroke = useColorModeValue('rgba(100, 116, 139, 0.4)', 'rgba(148, 163, 184, 0.45)');
  const labelColor = useColorModeValue('#475569', '#94a3b8');
  const legendColor = useColorModeValue('#334155', '#e2e8f0');
  const pageBg = useColorModeValue('transparent', 'transparent');

  if (data.length === 0) return null;

  return (
    <Box
      w="full"
      minH={{ base: '340px', md: '520px' }}
      py={{ base: 1, md: 6 }}
      px={2}
      bg={pageBg}
      sx={{ '& svg': { shapeRendering: 'geometricPrecision' } }}
    >
      <HStack spacing={4} mb={1} justify="center" flexWrap="wrap">
        <HStack spacing={2} align="center">
          <Box w={3} h={3} borderRadius="sm" bg={BLUE_FILL} flexShrink={0} />
          <Text fontSize="sm" fontWeight={500} color={legendColor}>
            You
          </Text>
        </HStack>
        <HStack spacing={2} align="center">
          <Box w={3} h={3} borderRadius="sm" bg={RED_FILL} flexShrink={0} />
          <Text fontSize="sm" fontWeight={500} color={legendColor}>
            AI future
          </Text>
        </HStack>
      </HStack>
      <Box h={{ base: '360px', md: '540px' }} w="full" position="relative">
        <ResponsiveRadar
          data={data}
          keys={['Your match', 'AI future fit']}
          indexBy="subject"
          maxValue={CHART_MAX}
          margin={chartMargin}
          curve="linearClosed"
          borderWidth={2}
          gridShape="circular"
          gridLevels={5}
          gridLabel={GridLabelTwoLines}
          gridLabelOffset={12}
          enableDots
          dotSize={6}
          dotBorderWidth={0}
          colors={[BLUE_FILL, RED_FILL]}
          fillOpacity={0.4}
          blendMode="normal"
          borderColor={{ from: 'color' }}
          theme={{
            grid: {
              line: {
                stroke: gridStroke,
                strokeWidth: 1,
              },
            },
            labels: {
              text: {
                fontSize: 10,
                fill: labelColor,
                fontWeight: 500,
              },
            },
          }}
          layers={[
            CircularBackgroundLayer,
            'grid',
            ScaleLabelsLayer,
            'layers',
            'slices',
            'dots',
          ]}
          sliceTooltip={({ index }) => {
            const fullName = subjectToFullName[index] ?? index;
            const row = data[index];
            const matchStr =
              row?.displayMatch != null
                ? row.matchBand
                  ? `${roundTo1(row.displayMatch)} (${row.matchBand})`
                  : roundTo1(row.displayMatch)
                : '-';
            const futureStr =
              row?.displayFuture != null
                ? row.trend
                  ? `${roundTo1(row.displayFuture)} (${row.trend})`
                  : roundTo1(row.displayFuture)
                : '-';
            return (
              <Box
                bg="chakra-body-bg"
                borderWidth="1px"
                borderRadius="md"
                px={3}
                py={2}
                shadow="md"
                borderColor="chakra-border-color"
              >
                <Text fontWeight="semibold" fontSize="sm" mb={1}>
                  {fullName}
                </Text>
                <Text fontSize="xs" style={{ color: BLUE_STROKE }}>
                  Your match: {matchStr}
                </Text>
                <Text fontSize="xs" style={{ color: RED_STROKE }}>
                  AI future fit: {futureStr}
                </Text>
              </Box>
            );
          }}
        />
      </Box>
    </Box>
  );
}
