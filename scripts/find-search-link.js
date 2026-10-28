import fs from 'fs';

async function test() {
  const url = 'https://www.google.com/search?q=StringStack+Bengaluru&hl=en';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  fs.writeFileSync('stringstack_search.html', html);
  console.log('Saved search HTML, length:', html.length);

  const lrdMatches = html.match(/data-lrd="([^"]+)"/g) || html.match(/#lrd=([^"&\s]+)/g) || html.match(/lrd=([^"&\s]+)/g);
  console.log('lrd matches:', lrdMatches);

  const chMatches = html.match(/data-pid="([^"]+)"/g) || html.match(/ChIJ[a-zA-Z0-9_\-]{15,}/g);
  console.log('ChIJ / pid matches:', chMatches ? [...new Set(chMatches)] : 'None');

  const reviewBtn = html.match(/Write a review/gi) || html.match(/Reviews/gi);
  console.log('Review text matches count:', reviewBtn ? reviewBtn.length : 0);
}

test().catch(console.error);
