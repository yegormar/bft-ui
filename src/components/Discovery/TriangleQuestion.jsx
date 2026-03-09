import { Box, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Equilateral-ish triangle in normalized coords (0..1): A top, B bottom-left, C bottom-right.
const VERTICES = {
  a: { x: 0.5, y: 0.12 },
  b: { x: 0.08, y: 0.88 },
  c: { x: 0.92, y: 0.88 },
};

function cartesianToBarycentric(px, py) {
  const { a: va, b: vb, c: vc } = VERTICES;
  const areaABC =
    0.5 *
    Math.abs((vb.x - va.x) * (vc.y - va.y) - (vc.x - va.x) * (vb.y - va.y));
  if (areaABC < 1e-10) return { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  const a =
    (0.5 *
      Math.abs((vb.x - px) * (vc.y - py) - (vc.x - px) * (vb.y - py))) /
    areaABC;
  const b =
    (0.5 *
      Math.abs((vc.x - px) * (va.y - py) - (va.x - px) * (vc.y - py))) /
    areaABC;
  const c =
    (0.5 *
      Math.abs((va.x - px) * (vb.y - py) - (vb.x - px) * (va.y - py))) /
    areaABC;
  const sum = a + b + c;
  if (sum < 1e-10) return { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  return { a: a / sum, b: b / sum, c: c / sum };
}

function barycentricToCartesian(a, b, c) {
  const { a: va, b: vb, c: vc } = VERTICES;
  const x = a * va.x + b * vb.x + c * vc.x;
  const y = a * va.y + b * vb.y + c * vc.y;
  return { x, y };
}

/** Clamp barycentric so all components in [0,1] and sum = 1 (nearest point inside triangle). */
function clampBarycentric({ a, b, c }) {
  let na = Math.max(0, Math.min(1, a));
  let nb = Math.max(0, Math.min(1, b));
  let nc = Math.max(0, Math.min(1, c));
  const sum = na + nb + nc;
  if (sum < 1e-10) return { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  na /= sum;
  nb /= sum;
  nc /= sum;
  return { a: na, b: nb, c: nc };
}

const SVG_SIZE = 380;
const BALL_R = 14;
const STROKE_WIDTH = 2;

/**
 * Triangle assessment question: drag the ball to the position that best represents you.
 * value/onChange use barycentric coords { a, b, c } (sum = 1).
 */
export default function TriangleQuestion({ question, value, onChange }) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const coords = value && typeof value.a === 'number' && typeof value.b === 'number' && typeof value.c === 'number'
    ? clampBarycentric(value)
    : { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  const pos = barycentricToCartesian(coords.a, coords.b, coords.c);

  const svgToNorm = useCallback((clientX, clientY) => {
    const el = svgRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return { x, y };
  }, []);

  const handlePointer = useCallback(
    (norm) => {
      if (!norm) return;
      const bc = cartesianToBarycentric(norm.x, norm.y);
      const clamped = clampBarycentric(bc);
      onChange({
        a: Math.round(clamped.a * 1000) / 1000,
        b: Math.round(clamped.b * 1000) / 1000,
        c: Math.round(clamped.c * 1000) / 1000,
      });
    },
    [onChange]
  );

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      const norm = svgToNorm(e.clientX, e.clientY);
      setDragging(true);
      handlePointer(norm);
    },
    [svgToNorm, handlePointer]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging) return;
      e.preventDefault();
      const norm = svgToNorm(e.clientX, e.clientY);
      handlePointer(norm);
    },
    [dragging, svgToNorm, handlePointer]
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      e.preventDefault();
      const norm = svgToNorm(e.clientX, e.clientY);
      if (norm) handlePointer(norm);
    };
    const preventTouch = (e) => e.preventDefault();
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('touchmove', preventTouch, { passive: false });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', preventTouch);
    };
  }, [dragging, svgToNorm, handlePointer]);

  const pathD = `M ${VERTICES.a.x * SVG_SIZE} ${VERTICES.a.y * SVG_SIZE} L ${VERTICES.b.x * SVG_SIZE} ${VERTICES.b.y * SVG_SIZE} L ${VERTICES.c.x * SVG_SIZE} ${VERTICES.c.y * SVG_SIZE} Z`;
  const ballCx = pos.x * SVG_SIZE;
  const ballCy = pos.y * SVG_SIZE;

  const vertexLabels = [
    { key: 'a', ...VERTICES.a, label: question.vertices?.a?.label },
    { key: 'b', ...VERTICES.b, label: question.vertices?.b?.label },
    { key: 'c', ...VERTICES.c, label: question.vertices?.c?.label },
  ];

  return (
    <VStack align="stretch" spacing={4} as="section" aria-labelledby={`triangle-${question.id}-title`}>
      <Box>
        <Text
          id={`triangle-${question.id}-title`}
          as="h2"
          fontSize="xl"
          fontWeight="semibold"
          color="chakra-body-text"
        >
          {question.title}
        </Text>
        <Text mt={1} fontSize="sm" color="chakra-subtle-text" fontStyle="italic">
          Drag the ball to the position that best represents you.
        </Text>
        {question.prompt && (
          <Text mt={2} fontSize="md" color="chakra-subtle-text" lineHeight="tall">
            {question.prompt}
          </Text>
        )}
      </Box>

      <Box
        position="relative"
        w="full"
        maxW={`${SVG_SIZE}px`}
        mx="auto"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={dragging ? undefined : onPointerUp}
        cursor={dragging ? 'grabbing' : 'grab'}
        sx={{
          userSelect: 'none',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
        }}
        data-triangle-drag
        onTouchStart={(e) => {
          if (e.currentTarget.contains(e.target)) e.preventDefault();
        }}
        aria-label="Drag the ball to your position on the triangle"
      >
        <svg
          ref={svgRef}
          width="100%"
          height="auto"
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', maxHeight: '420px' }}
        >
          <defs>
            <linearGradient id="triangle-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--chakra-colors-brand-50)" />
              <stop offset="100%" stopColor="var(--chakra-colors-brand-100)" />
            </linearGradient>
            <filter id="ball-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>
          <path
            d={pathD}
            fill="url(#triangle-fill)"
            stroke="var(--chakra-colors-brand-300)"
            strokeWidth={STROKE_WIDTH}
            strokeLinejoin="round"
          />
          {vertexLabels.map(({ key, x, y, label }) => (
            <g key={key}>
              <circle
                cx={x * SVG_SIZE}
                cy={y * SVG_SIZE}
                r={6}
                fill="var(--chakra-colors-brand-500)"
                stroke="var(--chakra-colors-white)"
                strokeWidth={2}
              />
              <text
                x={x * SVG_SIZE}
                y={y * SVG_SIZE + (key === 'a' ? -28 : 22)}
                textAnchor="middle"
                dominantBaseline={key === 'a' ? 'auto' : 'hanging'}
                fontSize="11"
                fontWeight="600"
                fill="var(--chakra-colors-brand-800)"
                style={{ pointerEvents: 'none' }}
              >
                {key === 'a' ? 'A' : key === 'b' ? 'B' : 'C'}
              </text>
            </g>
          ))}
          <circle
            cx={ballCx}
            cy={ballCy}
            r={BALL_R}
            fill="var(--chakra-colors-brand-500)"
            stroke="var(--chakra-colors-white)"
            strokeWidth={3}
            filter="url(#ball-shadow)"
            style={{ pointerEvents: 'none', touchAction: 'none' }}
            aria-hidden="true"
          />
        </svg>
      </Box>

      <VStack align="stretch" spacing={2} pt={2} borderTopWidth="1px" borderColor="chakra-border-color">
        {vertexLabels.map(({ key, label }) => (
          <Box key={key} fontSize="sm">
            <Text as="span" fontWeight="600" color="chakra-body-text">
              {key === 'a' ? 'A' : key === 'b' ? 'B' : 'C'}.{' '}
            </Text>
            <Text as="span" color="chakra-body-text">
              {label || ''}
            </Text>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
}
