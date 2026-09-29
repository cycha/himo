import { RawAdData } from '../types/scraper.types';

export interface LatestAd {
  date: Date;
  title: string;
}

export function getReleaseDate(rawAd: RawAdData): Date {
  return new Date(rawAd.first_publication_date || rawAd.index_date || Date.now());
}

/**
 * Splits a page of raw ads (newest first) at the latest ad already stored:
 * everything before it is new, and `reachedLatest` tells the caller to stop.
 */
export function takeNewAds(
  rawAds: RawAdData[],
  latest: LatestAd
): { newAds: RawAdData[]; reachedLatest: boolean } {
  const knownIndex = rawAds.findIndex((rawAd) => {
    const releaseDate = getReleaseDate(rawAd);
    return (
      releaseDate < latest.date ||
      (releaseDate.getTime() === latest.date.getTime() && rawAd.subject === latest.title)
    );
  });
  if (knownIndex === -1) return { newAds: rawAds, reachedLatest: false };
  return { newAds: rawAds.slice(0, knownIndex), reachedLatest: true };
}
