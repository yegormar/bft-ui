import { describe, it, expect } from 'vitest';
import { computeClusterProfile } from '../clusterProfile';
import preSurveyData from '../../data/pre_survey_questions.json';

const QUESTIONS = preSurveyData.pre_survey.questions;

describe('computeClusterProfile', () => {
  it('returns profile with neutral dominant when no Q3/Q4 answers', () => {
    const answers = {
      1: 'She / Her',
      2: 'High school',
    };
    const profile = computeClusterProfile(QUESTIONS, answers);
    expect(profile.dominant).toEqual(['neutral']);
    expect(profile.weights).toEqual({});
    expect(profile.secondaryTone).toBe('neutral');
    expect(profile.demographics.gender).toBe('She / Her');
    expect(profile.demographics.ageGroup).toBe('High school');
  });

  it('derives dominant cluster from Q3 and Q4 with option weights', () => {
    const answers = {
      3: ['Creating stuff: art, music, writing, video', 'Puzzles, strategy, or planning ahead'],
      4: ['You get to experiment and try things your way', 'There\'s a story or bigger picture pulling you in'],
    };
    const profile = computeClusterProfile(QUESTIONS, answers);
    expect(profile.dominant).toContain('creative');
    expect(profile.weights.creative).toBeGreaterThan(0);
  });

  it('always sets toneInstruction to default friendly but straightforward', () => {
    const profile = computeClusterProfile(QUESTIONS, {});
    expect(profile.toneInstruction).toBe('Friendly but straightforward; no jokes needed.');
  });

  it('sets secondaryTone from Q5 vibe when selected', () => {
    const answers = {
      5: 'Surprise me: I like when things are unpredictable',
    };
    const profile = computeClusterProfile(QUESTIONS, answers);
    expect(profile.secondaryTone).toBe('adventurous');
    expect(profile.toneInstruction).toBe('Friendly but straightforward; no jokes needed.');
  });

  it('returns empty preferredSettings (no settings question)', () => {
    const profile = computeClusterProfile(QUESTIONS, {});
    expect(profile.preferredSettings).toEqual([]);
  });

  it('sets complexityInstruction from Q2 age group', () => {
    const answers = {
      2: 'Middle school (or younger)',
    };
    const profile = computeClusterProfile(QUESTIONS, answers);
    expect(profile.complexityInstruction).toContain('simpler sentences');
  });

  it('includes avoidClusters for unselected clusters', () => {
    const answers = {
      3: ['Gaming: video games, board games, card games'],
      4: ['There\'s a challenge or something to beat'],
    };
    const profile = computeClusterProfile(QUESTIONS, answers);
    expect(profile.avoidClusters).not.toContain('gaming');
    expect(profile.avoidClusters.length).toBeGreaterThan(0);
  });
});
