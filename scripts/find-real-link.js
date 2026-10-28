import fs from 'fs';

async function test() {
  const url = 'https://www.google.com/maps/place/StringStack/@12.9149755,77.6042884,795m/data=!3m1!1e3!4m6!3m5!1s0x3bae15c7142be8af:0xe560c10b3294ca59!8m2!3d12.916289!4d77.6041643!16s%2Fg%2F11z8j_znvh';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });
  const html = await res.text();
  fs.writeFileSync('stringstack_maps.html', html);
  console.log('Saved HTML, length:', html.length);

  // Search for any placeid pattern
  const chMatches = html.match(/ChIJ[a-zA-Z0-9_\-]{15,}/g);
  console.log('ChIJ matches:', chMatches ? [...new Set(chMatches)] : 'None');

  // Search for review button links or action links in html
  const reviewUrls = html.match(/https:\/\/[^"\s]+writereview[^"\s]+/g);
  console.log('writereview links:', reviewUrls);

  // Search for search.google.com
  const searchGoogle = html.match(/https:\/\/search\.google\.com\/[^"\s]+/g);
  console.log('search.google.com links:', searchGoogle ? [...new Set(searchGoogle)] : 'None');
}

test().catch(console.error);
