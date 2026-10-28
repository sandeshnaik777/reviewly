import { config } from '../../config/index.js';
import { Business } from '../../types/index.js';

export interface KeywordRankingItem {
  id: string;
  keyword: string;
  rank: number;
  previousRank: number;
  change: number;
  direction: 'UP' | 'DOWN' | 'SAME';
  monthlySearches: number;
  impressionsLift: string;
  status: string;
  competitorRank: string;
  tag: string;
}

export interface CompetitorRadarItem {
  name: string;
  rank: number;
  rating: number;
  reviewsCount: number;
  shareOfSearch: string;
  badge: string;
}

export interface LocalSeoMetrics {
  averageRankLift: string;
  totalSearchImpressions: number;
  impressionsGrowth: string;
  mapsDirectionsClicks: number;
  directionsGrowth: string;
  phoneCallClicks: number;
  phoneCallsGrowth: string;
  topThreeShare: string;
  headline: string;
  rankingMessage: string;
}

export interface GeoGridPoint {
  id: string;
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
  label: string; // 'NW', 'N', 'NE', 'W', 'Center', 'E', 'SW', 'S', 'SE'
  name: string; // e.g. "Center (Storefront)", "North (1.5 mi)", etc.
  distanceMiles: number; // e.g. 0.0, 1.5, 2.2
  rank: number; // e.g. 1, 2, 4, 8
  rankTier: 'TOP_3' | 'TOP_10' | 'OUTSIDE_10';
  change: number; // e.g. +2
}

export interface GeoGridData {
  radiusMiles: number;
  centerAddress: string;
  gridPoints: GeoGridPoint[];
  averageRank: number;
  topThreeCoveragePct: number;
  selectedKeyword: string;
  availableKeywords: string[];
}

export interface MapsRankingsResult {
  keywordRankings: KeywordRankingItem[];
  competitorRadar: CompetitorRadarItem[];
  localSeoMetrics: LocalSeoMetrics;
  geoGrid: GeoGridData;
  lastUpdated: string;
  isAiGrounding: boolean;
}

export class GoogleMapsRankingService {
  private cache = new Map<string, { timestamp: number; data: MapsRankingsResult }>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  async getRankings(
    business: Business,
    reviewCount: number,
    avgRating: number,
    forceRefresh = false
  ): Promise<MapsRankingsResult> {
    const cacheKey = business.id;
    const cached = this.cache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    let result: MapsRankingsResult;
    try {
      if (config.gemini.apiKey) {
        result = await this.fetchRankingsFromAi(business, reviewCount, avgRating);
      } else {
        result = this.generateDeterministicRankings(business, reviewCount, avgRating);
      }
    } catch (err) {
      console.warn('[MapsRankingService] AI evaluation failed, falling back to deterministic local model:', err);
      result = this.generateDeterministicRankings(business, reviewCount, avgRating);
    }

    this.cache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  }

  private generateGeoGrid(business: Business, reviewCount: number, baseRank: number): GeoGridData {
    const city = business.city || 'Your City';
    const sub = business.subcategory || 'Business';

    const availableKeywords = [
      `Best ${sub} in ${city}`,
      `Top Rated ${sub} Near Me`,
      `${sub} near me`,
      `${business.name} ${city}`,
    ];

    const selectedKeyword = availableKeywords[0];

    // Grid layout: 3x3 surrounding radius
    // Center at (1,1) is baseRank
    // Cardinals (0,1), (2,1), (1,0), (1,2) have +1 rank penalty (further away)
    // Diagonals (0,0), (0,2), (2,0), (2,2) have +2 rank penalty
    const pointDefs = [
      { id: 'grid-0-0', row: 0, col: 0, label: 'NW', name: 'North-West (2.2 mi)', distance: 2.2, penalty: 2 },
      { id: 'grid-0-1', row: 0, col: 1, label: 'N', name: 'North (1.5 mi)', distance: 1.5, penalty: 1 },
      { id: 'grid-0-2', row: 0, col: 2, label: 'NE', name: 'North-East (2.2 mi)', distance: 2.2, penalty: 2 },
      { id: 'grid-1-0', row: 1, col: 0, label: 'W', name: 'West (1.5 mi)', distance: 1.5, penalty: 1 },
      { id: 'grid-1-1', row: 1, col: 1, label: 'Center', name: 'Storefront (0.0 mi)', distance: 0.0, penalty: 0 },
      { id: 'grid-1-2', row: 1, col: 2, label: 'E', name: 'East (1.5 mi)', distance: 1.5, penalty: 1 },
      { id: 'grid-2-0', row: 2, col: 0, label: 'SW', name: 'South-West (2.2 mi)', distance: 2.2, penalty: 2 },
      { id: 'grid-2-1', row: 2, col: 1, label: 'S', name: 'South (1.5 mi)', distance: 1.5, penalty: 1 },
      { id: 'grid-2-2', row: 2, col: 2, label: 'SE', name: 'South-East (2.2 mi)', distance: 2.2, penalty: 2 },
    ];

    const gridPoints: GeoGridPoint[] = pointDefs.map((p) => {
      const calculatedRank = Math.min(20, Math.max(1, baseRank + p.penalty));
      const tier: 'TOP_3' | 'TOP_10' | 'OUTSIDE_10' =
        calculatedRank <= 3 ? 'TOP_3' : calculatedRank <= 9 ? 'TOP_10' : 'OUTSIDE_10';
      return {
        id: p.id,
        row: p.row,
        col: p.col,
        label: p.label,
        name: p.name,
        distanceMiles: p.distance,
        rank: calculatedRank,
        rankTier: tier,
        change: reviewCount > 0 ? (p.penalty === 0 ? 3 : 1) : 0,
      };
    });

    const sumRanks = gridPoints.reduce((sum, pt) => sum + pt.rank, 0);
    const avgRank = Number((sumRanks / gridPoints.length).toFixed(1));
    const topThreeCount = gridPoints.filter((pt) => pt.rankTier === 'TOP_3').length;
    const topThreeCoveragePct = Math.round((topThreeCount / gridPoints.length) * 100);

    return {
      radiusMiles: 3.0,
      centerAddress: `${business.address || ''}, ${city}`,
      gridPoints,
      averageRank: avgRank,
      topThreeCoveragePct,
      selectedKeyword,
      availableKeywords,
    };
  }

  private async fetchRankingsFromAi(
    business: Business,
    reviewCount: number,
    avgRating: number
  ): Promise<MapsRankingsResult> {
    const city = business.city || 'Local Area';
    const subcategory = business.subcategory || 'Business';
    const mainCat = business.mainCategory || 'Services';

    const prompt = `You are a Google Maps Local 3-Pack SEO Analytics Engine.
Analyze Google Maps and Local Search visibility for this business:
- Business Name: "${business.name}"
- Category: ${mainCat} (${subcategory})
- City / Area: "${city}", ${business.state || ''}, ${business.country || 'India'}
- Address: "${business.address || ''}"
- Verified Review Count on Platform: ${reviewCount}
- Average Star Rating: ${avgRating > 0 ? `${avgRating} ★` : '0 (No reviews yet)'}
- Google Maps URL: "${business.googleReviewUrl || ''}"

TASK:
1. Provide a realistic Google Maps ranking evaluation for 5 key search queries:
   - "Best ${subcategory} in ${city}"
   - "Top Rated ${subcategory} Near Me"
   - "${subcategory} in ${city}"
   - "Popular ${subcategory} in ${city}"
   - "${business.name} ${city}" (Brand search)
2. If review count is low (< 5), rank between #8 and #15 for generic keywords, and #1 for exact brand.
3. If review count is higher (15+), ranks climb into top 3-pack (#1 to #3).
4. Provide 3 real or realistic top competitors in ${city} for this category.
5. Provide honest local SEO metrics and an encouraging, executive-ready message.

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "keywordRankings": [
    {
      "id": "kw-1",
      "keyword": "string",
      "rank": number,
      "previousRank": number,
      "change": number,
      "direction": "UP" | "DOWN" | "SAME",
      "monthlySearches": number,
      "impressionsLift": "string",
      "status": "string",
      "competitorRank": "string",
      "tag": "string"
    }
  ],
  "competitorRadar": [
    {
      "name": "string",
      "rank": number,
      "rating": number,
      "reviewsCount": number,
      "shareOfSearch": "string",
      "badge": "string"
    }
  ],
  "localSeoMetrics": {
    "averageRankLift": "string",
    "totalSearchImpressions": number,
    "impressionsGrowth": "string",
    "mapsDirectionsClicks": number,
    "directionsGrowth": "string",
    "phoneCallClicks": number,
    "phoneCallsGrowth": "string",
    "topThreeShare": "string",
    "headline": "string",
    "rankingMessage": "string"
  }
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${config.gemini.apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const payload = (await response.json()) as any;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No content returned from AI');
    }

    const parsed = JSON.parse(text);
    const centerRank = parsed.keywordRankings?.[0]?.rank || 5;
    const geoGrid = this.generateGeoGrid(business, reviewCount, centerRank);

    return {
      keywordRankings: parsed.keywordRankings || [],
      competitorRadar: parsed.competitorRadar || [],
      localSeoMetrics: parsed.localSeoMetrics || {},
      geoGrid,
      lastUpdated: new Date().toISOString(),
      isAiGrounding: true,
    };
  }

  private generateDeterministicRankings(
    business: Business,
    reviewCount: number,
    avgRating: number
  ): MapsRankingsResult {
    const city = business.city || 'Your City';
    const sub = business.subcategory || 'Restaurant';

    const isFresh = reviewCount === 0;
    const baseGenericRank = isFresh ? 10 : Math.max(1, 10 - Math.floor(reviewCount / 3));

    const keywordRankings: KeywordRankingItem[] = [
      {
        id: 'kw-1',
        keyword: `Best ${sub} in ${city}`,
        rank: baseGenericRank,
        previousRank: baseGenericRank,
        change: isFresh ? 0 : 2,
        direction: isFresh ? 'SAME' : 'UP',
        monthlySearches: 1850,
        impressionsLift: isFresh ? '0%' : `+${reviewCount * 12}%`,
        status: isFresh ? 'Awaiting First 5★ Reviews' : (baseGenericRank <= 3 ? 'Google 3-Pack Leader' : 'Climbing Local Pack'),
        competitorRank: `#1 Top Rated ${sub} in ${city}`,
        tag: 'Highest Intent',
      },
      {
        id: 'kw-2',
        keyword: `Top Rated ${sub} Near Me`,
        rank: Math.min(15, baseGenericRank + 1),
        previousRank: Math.min(15, baseGenericRank + 1),
        change: isFresh ? 0 : 1,
        direction: isFresh ? 'SAME' : 'UP',
        monthlySearches: 2420,
        impressionsLift: isFresh ? '0%' : `+${reviewCount * 15}%`,
        status: isFresh ? 'Unranked in Top 3' : 'Local Pack Contender',
        competitorRank: `#2 Area Choice in ${city}`,
        tag: 'High Volume',
      },
      {
        id: 'kw-3',
        keyword: `${sub} in ${city}`,
        rank: baseGenericRank,
        previousRank: baseGenericRank,
        change: 0,
        direction: 'SAME',
        monthlySearches: 1300,
        impressionsLift: isFresh ? '0%' : `+${reviewCount * 8}%`,
        status: isFresh ? 'Baseline Indexing' : 'Rising Steadily',
        competitorRank: `#1 Popular Spot in ${city}`,
        tag: 'Category Discovery',
      },
      {
        id: 'kw-4',
        keyword: `Top ${sub} in ${city}`,
        rank: Math.min(12, baseGenericRank + 2),
        previousRank: Math.min(12, baseGenericRank + 2),
        change: 0,
        direction: 'SAME',
        monthlySearches: 740,
        impressionsLift: isFresh ? '0%' : `+${reviewCount * 5}%`,
        status: isFresh ? 'Opportunity Keyword' : 'In Discovery Pack',
        competitorRank: `#2 Favorite in ${city}`,
        tag: 'Search Volume',
      },
      {
        id: 'kw-5',
        keyword: `${business.name} ${city}`,
        rank: 1,
        previousRank: 1,
        change: 0,
        direction: 'SAME',
        monthlySearches: isFresh ? 120 : 450,
        impressionsLift: isFresh ? '0%' : `+${reviewCount * 20}%`,
        status: 'Direct Brand Match',
        competitorRank: '-',
        tag: 'Brand Search',
      },
    ];

    const competitorRadar: CompetitorRadarItem[] = [
      {
        name: `${business.name} (You)`,
        rank: baseGenericRank,
        rating: avgRating > 0 ? avgRating : 0,
        reviewsCount: reviewCount,
        shareOfSearch: isFresh ? '4%' : `${Math.min(45, 10 + reviewCount * 2)}%`,
        badge: isFresh ? 'New Listing' : 'Active Growth',
      },
      {
        name: `Top Competitor A (${city})`,
        rank: 1,
        rating: 4.4,
        reviewsCount: 320,
        shareOfSearch: '34%',
        badge: 'Area Leader',
      },
      {
        name: `Local Spot B (${city})`,
        rank: 2,
        rating: 4.2,
        reviewsCount: 210,
        shareOfSearch: '26%',
        badge: 'Established',
      },
      {
        name: `Neighborhood Venue C (${city})`,
        rank: 3,
        rating: 4.1,
        reviewsCount: 165,
        shareOfSearch: '18%',
        badge: 'Local Regular',
      },
    ];

    const localSeoMetrics: LocalSeoMetrics = {
      averageRankLift: isFresh ? '0 Positions (Baseline Initialized)' : `+${Math.min(9, Math.floor(reviewCount / 2))} Positions Gained`,
      totalSearchImpressions: isFresh ? 0 : reviewCount * 140,
      impressionsGrowth: isFresh ? '0%' : `+${Math.min(300, reviewCount * 14)}%`,
      mapsDirectionsClicks: isFresh ? 0 : Math.round(reviewCount * 4.5),
      directionsGrowth: isFresh ? '0%' : `+${Math.min(180, reviewCount * 8)}%`,
      phoneCallClicks: isFresh ? 0 : Math.round(reviewCount * 1.8),
      phoneCallsGrowth: isFresh ? '0%' : `+${Math.min(120, reviewCount * 6)}%`,
      topThreeShare: isFresh ? '0%' : `${Math.min(95, reviewCount * 4)}%`,
      headline: isFresh
        ? 'Google Maps Tracking Active — Ready for Customer Reviews'
        : 'Google Maps Search Rankings Climbing',
      rankingMessage: isFresh
        ? `Your business "${business.name}" is indexed in ${city}. Place your smart QR stands on tables or counters to generate verified 5-star Google reviews and climb into the local top 3-pack.`
        : `Strong performance! With ${reviewCount} verified reviews and a ${avgRating}★ rating, "${business.name}" is expanding local search visibility across ${city}.`,
    };

    const geoGrid = this.generateGeoGrid(business, reviewCount, baseGenericRank);

    return {
      keywordRankings,
      competitorRadar,
      localSeoMetrics,
      geoGrid,
      lastUpdated: new Date().toISOString(),
      isAiGrounding: false,
    };
  }
}

export const mapsRankingService = new GoogleMapsRankingService();

export function hexPairToPlaceId(hex1: string, hex2: string): string {
  try {
    const toVarint = (val: string): number[] => {
      let v = BigInt(val);
      const bytes: number[] = [];
      while (v > 127n) {
        bytes.push(Number((v & 127n) | 128n));
        v >>= 7n;
      }
      bytes.push(Number(v & 127n));
      return bytes;
    };

    const v1 = toVarint(hex1);
    const v2 = toVarint(hex2);
    const f1 = [0x08, ...v1];
    const f2 = [0x10, ...v2];
    const payload = [0x0a, f1.length + f2.length, ...f1, ...f2];

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(payload).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }
    const binary = String.fromCharCode(...payload);
    return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } catch (err) {
    console.warn('Failed to convert hex pair to Place ID:', err);
    return '';
  }
}

export async function convertMapsUrlToDirectReviewUrl(input: string): Promise<{
  originalUrl: string;
  directReviewUrl: string;
  detectedType: string;
  placeId?: string;
  cid?: string;
  businessName?: string;
}> {
  const raw = (input || '').trim();
  if (!raw) {
    throw new Error('Please provide a Google Maps URL or link.');
  }

  // 1. Direct Place ID input (e.g. ChIJN1t_tDeuEmsRUsoyG83frY4)
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(raw)) {
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?placeid=${raw}`,
      detectedType: 'PLACE_ID',
      placeId: raw,
    };
  }

  let targetUrl = raw;

  // Ensure protocol
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  // 2. Check if already a direct review URL
  if (targetUrl.includes('search.google.com/local/writereview') || (targetUrl.includes('g.page') && targetUrl.endsWith('/review'))) {
    return {
      originalUrl: raw,
      directReviewUrl: targetUrl,
      detectedType: 'ALREADY_DIRECT_REVIEW_URL',
    };
  }

  // If it's a g.page link without /review, append /review
  if (targetUrl.includes('g.page/') && !targetUrl.includes('/review')) {
    const clean = targetUrl.replace(/\/+$/, '') + '/review';
    return {
      originalUrl: raw,
      directReviewUrl: clean,
      detectedType: 'G_PAGE_REVIEW_URL',
    };
  }

  // 3. If shortened share link, resolve canonical redirect
  if (targetUrl.includes('maps.app.goo.gl') || targetUrl.includes('goo.gl/maps') || targetUrl.includes('app.goo.gl')) {
    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (res.url && res.url !== targetUrl) {
        targetUrl = res.url;
      }
    } catch (fetchErr) {
      console.warn('Redirect expansion error for maps short link:', fetchErr);
    }
  }

  // 4. Try extracting Place ID from URL query parameters
  const placeIdParamMatch = targetUrl.match(/[?&](?:placeid|query_place_id)=([^&]+)/i);
  if (placeIdParamMatch && placeIdParamMatch[1]) {
    const pId = decodeURIComponent(placeIdParamMatch[1]);
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?placeid=${pId}`,
      detectedType: 'PARAM_PLACE_ID',
      placeId: pId,
    };
  }

  // 5. Try extracting explicit CID query parameter (e.g. ?cid=1234567890)
  const cidParamMatch = targetUrl.match(/[?&]cid=([0-9]+)/i);
  if (cidParamMatch && cidParamMatch[1]) {
    const cid = cidParamMatch[1];
    return {
      originalUrl: raw,
      directReviewUrl: `https://maps.google.com/?cid=${cid}`,
      detectedType: 'PARAM_CID',
      cid,
    };
  }

  // 6. Try extracting Place ID from Google Maps path data (!1sChIJ...)
  const placeIdDataMatch = targetUrl.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
  if (placeIdDataMatch && placeIdDataMatch[1]) {
    const pId = placeIdDataMatch[1];
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?placeid=${pId}`,
      detectedType: 'DATA_PLACE_ID',
      placeId: pId,
    };
  }

  // 7. Try extracting Hex coordinates pair from data (!1s0x...:0x...) -> Direct Google Maps Reviews Tab
  const hexPairMatch = targetUrl.match(/!1s(0x[a-fA-F0-9]+):(0x[a-fA-F0-9]+)/);
  if (hexPairMatch && hexPairMatch[2]) {
    try {
      const decimalCid = BigInt(hexPairMatch[2]).toString();

      // Extract business name if present in URL (/maps/place/Business+Name/...)
      const nameMatch = targetUrl.match(/\/maps\/place\/([^/@?]+)/i);
      const name = nameMatch && nameMatch[1] ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : '';

      // If full maps place URL is available, append Google Maps Reviews tab trigger (!9m1!1b1)
      let reviewsDirectUrl = `https://maps.google.com/?cid=${decimalCid}`;
      if (targetUrl.includes('/maps/place/')) {
        const basePlace = targetUrl.split('?')[0];
        reviewsDirectUrl = basePlace.includes('!9m1!1b1') ? basePlace : `${basePlace}!9m1!1b1`;
      }

      return {
        originalUrl: raw,
        directReviewUrl: reviewsDirectUrl,
        detectedType: 'GOOGLE_MAPS_REVIEWS_TAB',
        cid: decimalCid,
        businessName: name,
      };
    } catch {
      // ignore
    }
  }

  // 8. Try extracting Hex CID from data (!1s0x...:0x[HEX]) single hex fallback
  const hexCidMatch = targetUrl.match(/!1s0x[a-fA-F0-9]+:0x([a-fA-F0-9]+)/);
  if (hexCidMatch && hexCidMatch[1]) {
    try {
      const hex = hexCidMatch[1];
      const decimalCid = BigInt('0x' + hex).toString();
      return {
        originalUrl: raw,
        directReviewUrl: `https://maps.google.com/?cid=${decimalCid}`,
        detectedType: 'HEX_CID_DECODED',
        cid: decimalCid,
      };
    } catch {
      // ignore BigInt parse error
    }
  }

  // 8. Try extracting Business Name from /maps/place/Business+Name/@...
  const placeNameMatch = targetUrl.match(/\/maps\/place\/([^/@?]+)/i);
  if (placeNameMatch && placeNameMatch[1]) {
    const name = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?query=${encodeURIComponent(name)}`,
      detectedType: 'BUSINESS_NAME_LOOKUP',
      businessName: name,
    };
  }

  // 9. Fallback: If nothing matched, construct standard search write review format
  return {
    originalUrl: raw,
    directReviewUrl: `https://search.google.com/local/writereview?query=${encodeURIComponent(targetUrl)}`,
    detectedType: 'FALLBACK_URL',
  };
}
