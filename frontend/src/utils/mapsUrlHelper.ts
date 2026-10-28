import { api } from '../services/api.js';

export interface MapsLinkConversionResult {
  originalUrl: string;
  directReviewUrl: string;
  detectedType: string;
  placeId?: string;
  cid?: string;
  businessName?: string;
}

/**
 * Convert Google Maps hex coordinates (!1s0x...:0x...) to a valid Google Place ID via protobuf encoding
 */
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

/**
 * Client-side instant heuristic parser for Google Maps URLs
 */
export function quickParseMapsUrl(input: string): MapsLinkConversionResult | null {
  const raw = (input || '').trim();
  if (!raw) return null;

  // 1. Direct Place ID
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(raw)) {
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?placeid=${raw}`,
      detectedType: 'PLACE_ID',
      placeId: raw,
    };
  }

  let targetUrl = raw;
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  // 2. Already direct review URL
  if (targetUrl.includes('search.google.com/local/writereview') || (targetUrl.includes('g.page') && targetUrl.endsWith('/review'))) {
    return {
      originalUrl: raw,
      directReviewUrl: targetUrl,
      detectedType: 'ALREADY_DIRECT_REVIEW_URL',
    };
  }

  // 3. g.page URL without /review
  if (targetUrl.includes('g.page/') && !targetUrl.includes('/review')) {
    const clean = targetUrl.replace(/\/+$/, '') + '/review';
    return {
      originalUrl: raw,
      directReviewUrl: clean,
      detectedType: 'G_PAGE_REVIEW_URL',
    };
  }

  // 4. URL with placeid parameter
  const placeIdParam = targetUrl.match(/[?&](?:placeid|query_place_id)=([^&]+)/i);
  if (placeIdParam && placeIdParam[1]) {
    const pId = decodeURIComponent(placeIdParam[1]);
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?placeid=${pId}`,
      detectedType: 'PARAM_PLACE_ID',
      placeId: pId,
    };
  }

  // 5. URL with CID parameter
  const cidParam = targetUrl.match(/[?&]cid=([0-9]+)/i);
  if (cidParam && cidParam[1]) {
    const cid = cidParam[1];
    return {
      originalUrl: raw,
      directReviewUrl: `https://maps.google.com/?cid=${cid}`,
      detectedType: 'PARAM_CID',
      cid,
    };
  }

  // 6. Data place id
  const dataPlaceId = targetUrl.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
  if (dataPlaceId && dataPlaceId[1]) {
    const pId = dataPlaceId[1];
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?placeid=${pId}`,
      detectedType: 'DATA_PLACE_ID',
      placeId: pId,
    };
  }

  // 7. Hex coordinates pair in data (!1s0x...:0x...) -> Direct Google Maps Reviews Tab
  const hexPair = targetUrl.match(/!1s(0x[a-fA-F0-9]+):(0x[a-fA-F0-9]+)/);
  if (hexPair && hexPair[2]) {
    try {
      const decimalCid = BigInt(hexPair[2]).toString();

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

  // 8. Hex CID in data (!1s0x...:0x[HEX]) fallback
  const hexCid = targetUrl.match(/!1s0x[a-fA-F0-9]+:0x([a-fA-F0-9]+)/);
  if (hexCid && hexCid[1]) {
    try {
      const decimalCid = BigInt('0x' + hexCid[1]).toString();
      return {
        originalUrl: raw,
        directReviewUrl: `https://maps.google.com/?cid=${decimalCid}`,
        detectedType: 'HEX_CID_DECODED',
        cid: decimalCid,
      };
    } catch {
      // ignore BigInt error
    }
  }

  return null;
}

/**
 * Complete converter that handles short links via server redirect expansion
 */
export async function convertGoogleMapsUrl(input: string): Promise<MapsLinkConversionResult> {
  const raw = (input || '').trim();
  if (!raw) {
    throw new Error('Please enter a valid Google Maps link.');
  }

  // If it's a shortened share link (maps.app.goo.gl or goo.gl/maps), call the backend resolver
  if (raw.includes('maps.app.goo.gl') || raw.includes('goo.gl/maps') || raw.includes('app.goo.gl')) {
    try {
      const res = await api.convertMapsLink(raw);
      if (res && res.directReviewUrl) {
        return res;
      }
    } catch (err: any) {
      console.warn('Backend link expansion failed, falling back to quick parse:', err);
    }
  }

  // Try instant quick parse
  const quick = quickParseMapsUrl(raw);
  if (quick) return quick;

  // Call backend resolver as fallback
  try {
    const res = await api.convertMapsLink(raw);
    if (res && res.directReviewUrl) {
      return res;
    }
  } catch (err: any) {
    // If backend also fails, create standard search review link
    const clean = raw.startsWith('http') ? raw : `https://${raw}`;
    return {
      originalUrl: raw,
      directReviewUrl: `https://search.google.com/local/writereview?query=${encodeURIComponent(clean)}`,
      detectedType: 'FALLBACK_URL',
    };
  }

  return {
    originalUrl: raw,
    directReviewUrl: `https://search.google.com/local/writereview?query=${encodeURIComponent(raw)}`,
    detectedType: 'FALLBACK_URL',
  };
}
