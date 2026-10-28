async function test() {
  const url = 'https://www.google.com/search?kgmid=/g/11z8j_znvh&hl=en';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  const m = text.match(/ChIJ[a-zA-Z0-9_-]{20,}/g);
  console.log('ChIJ in kgmid search:', m ? [...new Set(m)] : 'None');
  const lrd = text.match(/lrd=[^"'\s]+/g);
  console.log('lrd matches:', lrd ? [...new Set(lrd)] : 'None');
}
test().catch(console.error);
