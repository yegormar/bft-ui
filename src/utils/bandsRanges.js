/**
 * Band ranges from API config (BFT_BANDS_RANGES_FILE).
 * Applied to skills, dimensions (values, traits, aptitudes). Bands define ranges on the 1-5 scale; used for match label and tile color.
 */

/**
 * Find the band that contains the given score.
 * @param {number} score - Score on 1-5 scale (or 0 for no link).
 * @param {Array<{ id: string, label: string, min: number, max: number, maxInclusive: boolean }>} bands - From API config.
 * @returns {{ id: string, label: string } | null}
 */
export function getBandForScore(score, bands) {
  if (bands == null || !Array.isArray(bands) || bands.length === 0) return null;
  const s = Number(score);
  if (Number.isNaN(s) || s < 1 || s > 5) return null;
  for (const b of bands) {
    if (s < b.min) continue;
    if (b.maxInclusive ? s <= b.max : s < b.max) return { id: b.id, label: b.label };
  }
  return null;
}

/**
 * Chakra color for the tile top indicator by band id.
 * @param {string} [bandId] - low | medium | high | very_high
 * @returns {string}
 */
export function getTileColorForBand(bandId) {
  if (bandId === 'low') return 'red.500';
  if (bandId === 'medium') return 'yellow.500';
  if (bandId === 'high' || bandId === 'very_high') return 'green.500';
  return 'gray.400';
}
