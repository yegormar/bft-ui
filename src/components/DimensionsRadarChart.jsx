/**
 * Radar chart for dimension scores (traits + values): one series = your mean per dimension.
 * Scale 1-5. Reuses Nivo circular grid pattern from SkillsRadarChart.
 */

import { Box, Text, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import { ResponsiveRadar } from '@nivo/radar';

const SCALE_MIN = 1;
const SCALE_MAX = 5;
/** Nivo uses 0-based radius; we pass value - SCALE_MIN so maxValue is 4 and labels show 1-5. */
const CHART_MAX = SCALE_MAX - SCALE_MIN;
const MAX_LABEL_LEN = 18;

const BLUE_STROKE = '#2563eb';
const BLUE_FILL = '#60a5fa';

function shortLabel(name, maxLen = MAX_LABEL_LEN) {
  if (!name || name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1).trim() + '\u2026';
}

/**
 * Build chart data from dimensions (aptitudes, traits, values; each item: id, name, mean).
 * dimensionMeta: { aptitudes, traits, values } each { [id]: { short_label } } for display labels.
 */
function buildChartData(dimensions, dimensionMeta = {}) {
  return dimensions.map((d) => {
    const meta =
      dimensionMeta.aptitudes?.[d.id] ||
      dimensionMeta.traits?.[d.id] ||
      dimensionMeta.values?.[d.id];
    const label = (meta?.short_label && meta.short_label.trim()) || d.name || d.id;
    const subject = shortLabel(label);
    const mean = typeof d.mean === 'number' ? d.mean : SCALE_MIN;
    const value = Math.max(SCALE_MIN, Math.min(SCALE_MAX, mean));
    return {
      subject,
      fullName: d.name || d.id,
      'Your score': value - SCALE_MIN,
      displayScore: value,
    };
  });
}

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

const ELEVEN_OCLOCK_RAD = -Math.PI / 2 - Math.PI / 6;

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

function splitLabel(text) {
  if (!text || typeof text !== 'string') return [text || ''];
  const t = text.trim();
  const i = t.indexOf(' ');
  if (i <= 0) return [t];
  return [t.slice(0, i), t.slice(i + 1)];
}

const LINE_HEIGHT = 10;

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

function roundTo1(num) {
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);
  return (Math.round(n * 10) / 10).toFixed(1);
}

const CHART_MARGIN_BASE = { top: 0, right: 24, bottom: 24, left: 24 };
/** Top margin on desktop must fit dimension labels (gridLabelOffset + two-line text) so they don't overlap the caption above. */
const CHART_MARGIN_MD = { top: 48, right: 40, bottom: 40, left: 40 };

export default function DimensionsRadarChart({ dimensions, dimensionMeta }) {
  const data = buildChartData(dimensions || [], dimensionMeta || {});
  const subjectToFullName = Object.fromEntries(data.map((d) => [d.subject, d.fullName]));

  const chartMargin = useBreakpointValue({ base: CHART_MARGIN_BASE, md: CHART_MARGIN_MD });
  const gridStroke = useColorModeValue('rgba(100, 116, 139, 0.4)', 'rgba(148, 163, 184, 0.45)');
  const labelColor = useColorModeValue('#475569', '#94a3b8');
  const pageBg = useColorModeValue('transparent', 'transparent');

  if (data.length === 0) return null;

  return (
    <Box
      w="full"
      minH={{ base: '340px', md: '520px' }}
      py={0}
      px={0}
      bg={pageBg}
      sx={{ '& svg': { shapeRendering: 'geometricPrecision' } }}
    >
      <Box h={{ base: '360px', md: '540px' }} w="full" position="relative">
        <ResponsiveRadar
          data={data}
          keys={['Your score']}
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
          colors={[BLUE_FILL]}
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
            const scoreStr =
              row?.displayScore != null ? roundTo1(row.displayScore) : '-';
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
                  Your score: {scoreStr}/5
                </Text>
              </Box>
            );
          }}
        />
      </Box>
    </Box>
  );
}
