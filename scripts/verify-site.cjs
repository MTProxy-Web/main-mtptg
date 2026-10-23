const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const publicDir=path.join(root,'public');
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const source=read(path.join(root,'index.html'));
const css=source.match(/<style>([\s\S]*?)<\/style>/)[1];
const pages=JSON.parse(read(path.join(publicDir,'pages.json')));
assert.equal(pages.length,18);
assert.equal(pages.filter(p=>p.view==='article').length,12);
const urls=new Set(pages.map(p=>p.url));
const titles=new Set();
for(const page of pages){
  const html=read(path.join(publicDir,page.url,'index.html'));
  const styles=[...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)];
  assert.equal(styles[0][2],css,'unchanged template CSS: '+page.url);
  assert.equal(styles.length,['blog','article'].includes(page.view)?2:1,'isolated blog styles');
  assert.equal((html.match(/<h1(?: |>)/g)||[]).length,1,'one primary heading');
  assert(!/noindex|nofollow|nosnippet/.test(html),'indexable page');
  assert(html.includes(`href="https://mtproxy.bar${page.url}"`),'canonical');
  assert(html.includes('content="index, follow, max-image-preview:large"'),'robots');
  assert.equal((html.match(/var id='1dadaf455d89'/g)||[]).length,1,'original analytics integration');
  assert(!/MOCK_PROXY|fixtures\/|\.example\.com/.test(html),'no preview fixtures');
  assert(html.includes("const SITE_PROXY_URL = '/v1/site-proxies'"),'live sponsored API');
  assert(html.includes("const PUBLIC_PROXY_URL = '/v1/public-proxies'"),'live public API');
  const title=html.match(/<title>([^<]+)<\/title>/)[1];assert(!titles.has(title),'unique title');titles.add(title);
  assert(html.match(/<meta name="description" content="[^"]+">/),'description');
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'unique IDs');
  for(const link of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(link[1]),'section anchor');
  for(const link of html.matchAll(/href="(\/[^"#?]*)(?:#[^"]*)?"/g))assert(urls.has(link[1]),'internal link '+link[1]);
  for(const script of html.matchAll(/<script(?: type="([^"]+)")?>([\s\S]*?)<\/script>/g)){
    if(script[1]==='application/ld+json'){
      const graph=JSON.parse(script[2])['@graph'];assert.equal(graph[1].url,'https://mtproxy.bar'+page.url);
      if(page.view==='article'){
        const article=graph.find(n=>n['@type']==='BlogPosting');
        assert(article?.articleBody.length>100);
        assert.equal(article.headline,page.title);
        assert.deepEqual(graph.find(n=>n['@type']==='BreadcrumbList').itemListElement.map(n=>n.position),[1,2,3]);
      }
    }else new vm.Script(script[2]);
  }
  if(page.view==='home')assert(!html.includes('class="article-list"'),'no home blog section');
  if(page.view==='article'){
    assert(!/Prime VPN|primenow|MTProxy4free|tgmtproxy|mtprotohelp|mtproto\.fyi|mtproxy\.fyi|tgproxy\.fyi|proxytelegram\.bond/i.test(html),'no imported promotion');
    const officialHosts=new Set(['mtproxy.bar','core.telegram.org','telegram.org','translations.telegram.org','support.apple.com','support.google.com']);
    for(const link of html.matchAll(/href="(https?:\/\/[^" ]+)"/g)){
      const url=new URL(link[1]);
      const officialGithub=url.hostname==='github.com'&&/^\/(TelegramMessenger|DrKLO|telegramdesktop)\//.test(url.pathname);
      assert(url.protocol==='https:'&&(officialHosts.has(url.hostname)||officialGithub),'official article sources');
    }
  }
}
const sitemap=read(path.join(publicDir,'sitemap.xml'));
assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length);
assert(read(path.join(publicDir,'robots.txt')).includes('Allow: /'));
assert(!fs.existsSync(path.join(publicDir,'v1')),'no published API fixtures');
console.log('PASS: 18 production pages, 12 articles, original stylesheet, SEO, links, structured data, live API integration and original analytics.');
