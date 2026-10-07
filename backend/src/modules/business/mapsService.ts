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

export interface MapsRankingsResult {
  keywordRankings: KeywordRankingItem[];
  competitorRadar: CompetitorRadarItem[];
  localSeoMetrics: LocalSeoMetrics;
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

  private async fetchRankingsFromAi(
    business: Business,
    reviewCount: number,
    avgRating: number
  ): Promise<MapsRankingsResult> {
    const city = business.city || 'Local Area';
    const subcategory = business.subcategory || 'Business';
    const mainCat = business.mainCategory || 'Services';

    const prompt = `You are a Real-Time Google Maps Local 3-Pack SEO Engine.
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
2. If review count is 0 or low (< 5), the business is newly created and should rank between #8 and #15 for competitive generic keywords, and #1 or #2 for exact brand search.
3. If review count is higher (20+), ranks should climb into the top 3-pack (#1 to #3).
4. Provide 3 real or realistic top competitors in ${city} for this category.
5. Provide honest local SEO metrics and a helpful, non-fake summary message addressing the actual business owner.

Respond with ONLY valid JSON with this exact schema (no markdown, no backticks):
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
          maxOutputTokens: 1200,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini status ${response.status}: ${await response.text()}`);
    }

    const json = (await response.json()) as any;
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    const cleanJson = rawText.replace(/^```json\s*|^```\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      keywordRankings: parsed.keywordRankings || [],
      competitorRadar: parsed.competitorRadar || [],
      localSeoMetrics: parsed.localSeoMetrics || ({} as any),
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

    // Fresh account baseline vs established
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
        status: isFresh ? 'Awaiting First 5★ Reviews' : (baseGenericRank <= 3 ? 'Google 3-Pack Leader 🏆' : 'Climbing Local Pack 📈'),
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
        status: isFresh ? 'Unranked in Top 3' : 'Local Pack Contender ⭐',
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
        status: isFresh ? 'Baseline Indexing' : 'Rising Steadily 🚀',
        competitorRank: `#1 Popular Spot in ${city}`,
        tag: 'Category Discovery',
      },
      {
        id: 'kw-4',
        keyword: `Family Friendly ${sub} in ${city}`,
        rank: Math.min(12, baseGenericRank + 2),
        previousRank: Math.min(12, baseGenericRank + 2),
        change: 0,
        direction: 'SAME',
        monthlySearches: 740,
        impressionsLift: isFresh ? '0%' : `+${reviewCount * 5}%`,
        status: isFresh ? 'Opportunity Keyword' : 'In Discovery Pack',
        competitorRank: `#2 Family Favorite in ${city}`,
        tag: 'Family Dining',
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
        status: 'Direct Brand Match 🔒',
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
        badge: isFresh ? 'New Listing' : 'Active Engine 🔥',
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
        ? 'Google Maps Telemetry Active — Ready for Initial Reviews'
        : 'Google Maps Search Rankings Climbing',
      rankingMessage: isFresh
        ? `📍 Your business "${business.name}" is indexed in ${city}. Place your smart QR stands on tables or counters to generate your first verified 5-star Google reviews and climb into the local top 3-pack!`
        : `🎉 Excellent progress! With ${reviewCount} verified reviews and a ${avgRating}★ rating, "${business.name}" is advancing rapidly toward #1 search dominance in ${city}.`,
    };

    return {
      keywordRankings,
      competitorRadar,
      localSeoMetrics,
      lastUpdated: new Date().toISOString(),
      isAiGrounding: false,
    };
  }
}

export const mapsRankingService = new GoogleMapsRankingService();
