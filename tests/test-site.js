/*
 Node 測試：檢查靜態資源是否可取得與基本 Content-Type
 使用： node tests/test-site.js
*/
const urls = [
  {url:'http://localhost:8000/', expect:200, typeHint:'text/html'},
  {url:'http://localhost:8000/styles.css', expect:200, typeHint:'text/css'},
  {url:'http://localhost:8000/scripts.js', expect:200, typeHint:'application/javascript'},
  {url:'http://localhost:8000/data/videos.json', expect:200, typeHint:'application/json'},
  {url:'http://localhost:8000/assets/images/gp-poster.jpg', expect:200, typeHint:'image/'},
];

(async () => {
  for (const u of urls) {
    try {
      const res = await fetch(u.url, {cache:'no-cache'});
      console.log(u.url, '=>', res.status, res.headers.get('content-type') || '');
      if (res.status !== u.expect) {
        console.error('❌ unexpected status for', u.url);
        process.exitCode = 2;
      } else {
        const ct = (res.headers.get('content-type')||'').toLowerCase();
        if (!ct.includes(u.typeHint.split('/')[0])) {
          console.warn('⚠ content-type unexpected for', u.url, ct);
        }
      }
    } catch (err) {
      console.error('❌ fetch failed for', u.url, err.message);
      process.exitCode = 2;
    }
  }
  if (!process.exitCode) console.log('All checks passed (basic resource availability).');
})();
