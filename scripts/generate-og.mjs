import fs from 'fs';
import sharp from 'sharp';

async function run() {
  const width = 1200;
  const height = 630;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ea580c"/>
        <stop offset="100%" stop-color="#f97316"/>
      </linearGradient>
    </defs>

    <rect width="100%" height="100%" fill="url(#bgGrad)"/>

    <circle cx="950" cy="180" r="350" fill="#ea580c" opacity="0.12"/>
    <circle cx="200" cy="500" r="250" fill="#10b981" opacity="0.08"/>

    <g transform="translate(100, 100)">
      <rect width="64" height="64" rx="16" fill="#ffffff" />
      <text x="32" y="45" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="800" fill="#00383B" text-anchor="middle">K</text>
      
      <text x="86" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="36" font-weight="800" fill="#ffffff" letter-spacing="-0.5">
        Kindly<tspan fill="#f97316">Rate</tspan>
      </text>
    </g>

    <text x="100" y="240" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="56" font-weight="800" fill="#ffffff" letter-spacing="-1.5">
      #1 AI Google Reviews &amp;
    </text>
    <text x="100" y="305" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="56" font-weight="800" fill="#f97316" letter-spacing="-1.5">
      Local SEO Platform
    </text>

    <text x="100" y="375" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="400" fill="#94a3b8">
      Turn in-store customers into verified 5-star Google Maps reviews automatically.
    </text>
    <text x="100" y="412" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="400" fill="#94a3b8">
      Zero app download • Smart QR Stands • Automated Reputation Shield.
    </text>

    <g transform="translate(100, 480)">
      <rect width="250" height="50" rx="25" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="125" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="#38bdf8" text-anchor="middle">
        Smart QR Counter Stands
      </text>

      <rect x="270" width="220" height="50" rx="25" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="380" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="#34d399" text-anchor="middle">
        AI Review Drafting
      </text>

      <rect x="510" width="230" height="50" rx="25" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <text x="625" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="#fbbf24" text-anchor="middle">
        Local 3-Pack Growth
      </text>
    </g>

    <text x="1100" y="570" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="600" fill="#64748b" text-anchor="end">
      kindlyrate.com
    </text>
  </svg>
  `;

  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  fs.writeFileSync('./frontend/public/og-preview.png', buf);
  console.log('Successfully generated og-preview.png (1200x630)');
}

run().catch(console.error);

