const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const sourceDir = root;
const source = fs.readFileSync(path.join(sourceDir, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const encode = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const translations = vm.runInNewContext(source.slice(source.indexOf('const T='), source.indexOf('// ============ FLAGS')) + '\nT');
const t = translations.ru;
const blogTitle = 'Блог';
const blogDescription = 'Подключение, настройка и решение проблем с прокси в Telegram.';
const articles = [
  {slug:'kak-podklyuchit-proksi-telegram',title:'Как подключить прокси в Telegram',description:'Как подключить MTProto-прокси в Telegram по ссылке или вручную: настройка на Android, iPhone и компьютере, адрес сервера, порт и secret.',paragraphs:[
    'Откройте каталог, выберите сервер и нажмите «Подключить». Telegram предложит добавить прокси. Подтвердите действие и дождитесь соединения.',
    'Если ссылка не открывается, добавьте сервер вручную в настройках прокси Telegram. Для MTProto понадобятся адрес сервера, порт и secret.',
    'На Android и iPhone настройки прокси находятся в разделе «Данные и память». На компьютере откройте «Продвинутые настройки», затем «Тип соединения». Названия пунктов могут отличаться в разных версиях приложения.',
    'Если соединение не устанавливается, попробуйте другой сервер из каталога. Не передавайте владельцу прокси код входа в Telegram или пароль двухэтапной аутентификации: для подключения они не нужны.'
  ]},
  {slug:'pochemu-ne-rabotaet-proksi-telegram',title:'Почему не работает прокси в Telegram',description:'Что проверить, если MTProto-прокси в Telegram недоступен: адрес, порт, secret, другой сервер и подключение через Wi-Fi или мобильную сеть.',paragraphs:[
    'Если Telegram завис на подключении, сначала отключите прокси и проверьте интернет. Затем попробуйте другой сервер из каталога. Если он работает, причина может быть в недоступности первого сервера, его нагрузке или ограничениях вашей сети.',
    'При ручной настройке проверьте адрес, порт и secret. Уберите случайные пробелы и убедитесь, что выбран тип MTProto. Старую запись удобнее заменить новой ссылкой из каталога, чем исправлять наугад.',
    'Сравните подключение через Wi-Fi и мобильный интернет. Если прокси работает только в одной сети, проблема связана с доступом из другой сети. Если не работает ни один вариант, проверьте обновления Telegram и доступность самого сервиса.',
    'Один неудачный тест не доказывает блокировку. Попробуйте другой сервер и повторите проверку позже.'
  ]},
  {slug:'mtproto-ili-socks5',title:'MTProto и SOCKS5: какой прокси выбрать',description:'Чем отличаются MTProto и SOCKS5 для Telegram: параметры подключения, работа в других приложениях и какие данные доступны оператору прокси.',paragraphs:[
    'Для подключения из нашего каталога используйте MTProto: ссылки открывают настройки прокси прямо в Telegram. MTProto предназначен для Telegram. SOCKS5 поддерживают и другие приложения, но каждое из них настраивается отдельно.',
    'Для MTProto нужны адрес, порт и secret. Для SOCKS5 нужны адрес и порт, а иногда ещё логин и пароль, которые выдаёт оператор. Secret MTProto нельзя использовать как пароль SOCKS5.',
    'Оба варианта направляют трафик через выбранный сервер. Прокси, настроенный в Telegram, не меняет маршрут всего интернет-трафика устройства и не заменяет VPN для других приложений.',
    'Выбирайте оператора, которому доверяете. Он может видеть ваш IP-адрес и время подключения. Само использование прокси не даёт оператору доступ к переписке в Telegram.'
  ]},
  {slug:'telegram-zavis-na-podklyuchenii',title:'Telegram завис на «Подключение…»: что проверить',description:'Что делать, если Telegram долго пишет «Подключение…»: проверка интернета, настроек MTProto-прокси и подключения через другую сеть.',sections:[
    {id:'without-proxy',title:'Проверьте соединение без прокси',start:1},
    {id:'servers-and-networks',title:'Сравните серверы и сети',start:3}
  ],paragraphs:[
    'Если Telegram долго показывает «Подключение…», сначала выясните, не мешает ли выбранный прокси. Откройте настройки прокси и временно отключите его. Затем снова попробуйте отправить сообщение.',
    'Если без прокси всё работает, попробуйте другой сервер из каталога. При ручной настройке проверьте адрес, порт и secret. Используйте параметры из выбранной записи, не смешивая их с настройками старого сервера.',
    'Если без прокси Telegram тоже не подключается, откройте несколько других сайтов. Когда не работает весь интернет, замена MTProto-сервера не решит проблему доступа к сети.',
    'Повторите проверку через Wi-Fi и мобильный интернет. Если один и тот же сервер доступен только в одной сети, это помогает сузить поиск причины, но само по себе не доказывает блокировку.',
    'Для постоянного использования можно добавить несколько прокси и включить автоматическое переключение в Telegram. Приложение сможет перейти к следующему серверу при отключении текущего.'
  ]},
  {slug:'telegram-ne-zagruzhaet-foto-i-video',title:'Telegram не загружает фото и видео: что делать',description:'Почему в Telegram не загружаются фото и видео: как проверить автозагрузку, свободное место, сеть и выбранный MTProto-прокси.',sections:[
    {id:'downloads-and-storage',title:'Проверьте автозагрузку и свободное место',start:1},
    {id:'proxy-and-network',title:'Сравните работу с прокси и без него',start:3}
  ],sources:[
    {url:'https://telegram.org/blog/autoplay',title:'Автозагрузка медиа в Telegram'},
    {url:'https://telegram.org/faq',title:'Справка Telegram'}
  ],paragraphs:[
    'Если сообщения приходят, а фото или видео не загружаются, попробуйте открыть несколько разных файлов. Важно понять, не работает только один файл или вся загрузка медиа.',
    'Нажмите на файл, чтобы запустить загрузку вручную. Если это помогает, проверьте настройки автоматической загрузки в разделе «Данные и память». Для мобильной сети и Wi-Fi могут действовать разные ограничения по типу и размеру файлов.',
    'Проверьте свободное место на устройстве. Не выходите из аккаунта и не переустанавливайте приложение только ради этой проверки: выход из Telegram приводит к потере секретных чатов на этом устройстве.',
    'Если используется прокси, временно отключите его и повторите загрузку. Затем попробуйте другой сервер. Сравнивайте один и тот же файл, чтобы результат проверки был понятнее.',
    'Переключитесь между Wi-Fi и мобильным интернетом. Если проблема остаётся с разными файлами и серверами, проверьте обновления Telegram и повторите попытку позже. Подключение прокси не гарантирует устранение любой ошибки загрузки.'
  ]}
];
articles.push(...JSON.parse(fs.readFileSync(path.join(root,'content/expanded-articles.json'),'utf8')));
const homeTitle = 'Бесплатные прокси для Telegram: MTProto | MTProxy';
const homeDescription = 'Бесплатные MTProto-прокси для Telegram. Выберите сервер и подключитесь в один клик. Инструкции по настройке на Android, iPhone и компьютере.';
const pages = [{view:'home',url:'/',title:homeTitle,description:homeDescription},
  ...['howto','about','pwa','contacts'].map(view => ({view,url:`/${view}/`,title:t[view].title,description:t[view].desc})),
  {view:'blog',url:'/blog/',title:blogTitle,description:blogDescription},
  ...articles.map(article=>({view:'article',url:`/blog/${article.slug}/`,title:article.title,description:article.description||article.paragraphs[0],article}))];
const navLinks = view => ['home','howto','blog','about','pwa','contacts'].map(k => `<a href="${k==='home'?'/':`/${k}/`}" class="nav-link${view===k||view==='article'&&k==='blog'?' active':''}">${encode(k==='blog'?blogTitle:t.nav[k])}</a>`).join('');
const footerLinks = () => ['home','howto','blog','about','pwa','contacts'].map(k=>`<a href="${k==='home'?'/':`/${k}/`}">${encode(k==='blog'?blogTitle:t.nav[k])}</a>`).join('');
const articleList = (level=3,items=articles) => '<div class="article-list">'+items.map(a=>`<a class="article-link" href="/blog/${a.slug}/"><h${level}>${encode(a.title)}</h${level}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a>`).join('')+'</div>';
function articleContent(article){
  if(article.blocks){
    const sections=article.blocks.filter(b=>b.type==='h2');
    const contents=`<nav class="article-toc" aria-labelledby="contents-title"><h2 id="contents-title">Содержание</h2><ul>${sections.map(s=>`<li><a href="#${encode(s.id)}">${encode(s.text)}</a></li>`).join('')}</ul></nav>`;
    return article.blocks.map((block,i)=>(i===1?contents:'')+renderArticleBlock(block)).join('');
  }
  const sections=article.sections||[];
  const contents=sections.length?`<nav class="article-toc" aria-labelledby="contents-title"><h2 id="contents-title">Содержание</h2><ul>${sections.map(s=>`<li><a href="#${s.id}">${encode(s.title)}</a></li>`).join('')}</ul></nav>`:'';
  return article.paragraphs.map((p,i)=>{
    const section=sections.find(s=>s.start===i);
    return (i===1?contents:'')+(section?`<h2 id="${section.id}">${encode(section.title)}</h2>`:'')+'<p>'+encode(p)+'</p>';
  }).join('');
}
function renderArticleBlock(block){
  if(block.type==='p')return '<p>'+encode(block.text)+'</p>';
  if(block.type==='h2')return `<h2 id="${encode(block.id)}">${encode(block.text)}</h2>`;
  if(block.type==='ol'||block.type==='ul')return `<${block.type}>${block.items.map(item=>'<li>'+encode(item)+'</li>').join('')}</${block.type}>`;
  if(block.type==='table')return '<div class="article-table"><table><thead><tr>'+block.headers.map(h=>'<th scope="col">'+encode(h)+'</th>').join('')+'</tr></thead><tbody>'+block.rows.map(row=>'<tr>'+row.map(cell=>'<td>'+encode(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  throw new Error('Unknown article block: '+block.type);
}
function articleText(article){
  if(!article.blocks)return article.paragraphs.join('\n\n');
  return article.blocks.map(b=>b.text||b.items?.join('\n')||[b.headers.join(' | '),...b.rows.map(row=>row.join(' | '))].join('\n')).join('\n\n');
}
function articleSources(article){
  const sources=article.blocks?article.sources:[{url:'https://core.telegram.org/proxy',title:'Документация Telegram'},...(article.sources||[])];
  return sources.map(s=>`<a href="${encode(s.url)}" class="article-source" target="_blank" rel="noopener">${encode(s.title)}</a>`).join('');
}
function relatedArticles(article){
  const mapping={
    'kak-podklyuchit-proksi-telegram':['proksi-telegram-iphone','proksi-telegram-android'],
    'pochemu-ne-rabotaet-proksi-telegram':['telegram-wifi-mobilnyy-internet','telegram-zavis-na-podklyuchenii'],
    'mtproto-ili-socks5':['bezopasnost-proksi-telegram','zvonki-cherez-proksi-telegram'],
    'telegram-ne-zagruzhaet-foto-i-video':['telegram-wifi-mobilnyy-internet','pochemu-ne-rabotaet-proksi-telegram'],
    'proksi-telegram-iphone':['proksi-telegram-android','proksi-telegram-kompyuter'],
    'proksi-telegram-android':['proksi-telegram-iphone','telegram-wifi-mobilnyy-internet'],
    'proksi-telegram-kompyuter':['webproxy-telegram','kak-podklyuchit-proksi-telegram'],
    'telegram-wifi-mobilnyy-internet':['telegram-zavis-na-podklyuchenii','pochemu-ne-rabotaet-proksi-telegram'],
    'webproxy-telegram':['mtproto-ili-socks5','bezopasnost-proksi-telegram'],
    'bezopasnost-proksi-telegram':['zvonki-cherez-proksi-telegram','mtproto-ili-socks5'],
    'zvonki-cherez-proksi-telegram':['bezopasnost-proksi-telegram','mtproto-ili-socks5']
  };
  const preferred=mapping[article.slug]||[];
  const related=preferred.length?preferred.map(slug=>articles.find(a=>a.slug===slug)):articles.filter(a=>a.slug!==article.slug).slice(0,2);
  return `<section class="article-related"><h2>Читайте также</h2>${articleList(3,related)}</section>`;
}
const dom = {};
const sandbox = {T:translations,lang:'ru',document:{getElementById:id=>dom[id]??=( {} )},esc:encode};
vm.createContext(sandbox);
vm.runInContext(source.slice(source.indexOf('function renderFAQ(){'), source.indexOf('function esc(s)')), sandbox);
for(const fn of ['renderFAQ','renderHowto','renderAbout','renderPWA']) vm.runInContext(fn+'()',sandbox);
let base = source;
base = base.replace(/<meta name="robots"[^>]+>/, '<meta name="robots" content="index, follow, max-image-preview:large">');
base = base.replace(/src="assets\//g,'src="/assets/').replace("return '<img src=\"assets/", "return '<img src=\"/assets/").replace("this.src=\\'assets/", "this.src=\\'/assets/");
base = base.replace("let lang='ru',currentView='home',proxies=[];", "let lang='ru',currentView=document.body.dataset.view,proxies=[];");
base = base.replace("if(['home','howto','about','pwa','contacts'].includes(h))currentView=h;", "if(['home','howto','about','pwa','contacts'].includes(h))location.replace(h==='home'?'/':'/'+h+'/');");
base = base.replace(/function navigate\(v\)\{[^\n]+\}/, "function navigate(v){location.href=v==='home'?'/':'/'+v+'/';}");
base = base.replace("if(s&&T[s])lang=s;", "if(s&&T[s]&&!['blog','article'].includes(currentView))lang=s;");
base = base.replace('\nloadProxies();','\nif(currentView===\'home\')loadProxies();');
for(const [fn,id] of Object.entries({renderProxies:'proxyGrid',renderFAQ:'faqList',renderHowto:'howtoSteps',renderAbout:'aboutBlocks',renderPWA:'pwaSections'})){
  base=base.replace(`function ${fn}(){`,`function ${fn}(){\n  if(!document.getElementById('${id}'))return;`);
}
const navStart = base.indexOf("  const navKeys=['home'");
const navEnd = base.indexOf('  renderProxies();',navStart);
base = base.slice(0,navStart)+`  const navKeys=['home','howto','blog','about','pwa','contacts'];
  const nav=navKeys.map(k=>'<a href="'+(k==='home'?'/':'/'+k+'/')+'" class="nav-link'+(currentView===k||currentView==='article'&&k==='blog'?' active':'')+'">'+esc(k==='blog'?'Блог':t.nav[k])+'</a>').join('');
  const languages=['blog','article'].includes(currentView)?'':'<div class="lang-switch">'+['ru','en','ir'].map(l=>'<button class="lang-btn'+(lang===l?' active':'')+'" onclick="setLang(\\''+l+'\\')">'+l.toUpperCase()+'</button>').join('')+'</div>';
  document.getElementById('desktopNav').innerHTML=nav+languages;
  document.getElementById('mobileMenu').innerHTML=nav+languages.replace('<div class="lang-switch">','<div class="lang-switch" style="margin:16px 0 0;justify-content:center">');
  document.getElementById('footerLinks').innerHTML=navKeys.map(k=>'<a href="'+(k==='home'?'/':'/'+k+'/')+'">'+esc(k==='blog'?'Блог':t.nav[k])+'</a>').join('');
`+base.slice(navEnd);
base = base.replace(/<([a-z0-9]+)([^>]*data-i18n="([^"]+)"[^>]*)><\/\1>/g,(_,tag,attrs,key)=>`<${tag}${attrs}>${encode(key.split('.').reduce((o,k)=>o?.[k],t)||'')}</${tag}>`);
for(const [id,el] of Object.entries(dom)) base=base.replace(`<div${id==='faqList'?' class="faq-list"':''} id="${id}"></div>`,`<div${id==='faqList'?' class="faq-list"':''} id="${id}">${el.innerHTML}</div>`);
base=base.replace('<nav class="nav" id="desktopNav"></nav>',`<nav class="nav" id="desktopNav">${navLinks('home')}</nav>`);
base=base.replace('<div class="footer-links" id="footerLinks"></div>',`<div class="footer-links" id="footerLinks">${footerLinks()}</div>`);
base=base.replace(/href="#(?:howto|about|pwa|contacts)"/g,m=>m.replace('#','/').replace('"','"').slice(0,-1)+'/"');
base=base.replace('href="#" class="btn btn-outline"','href="/howto/" class="btn btn-outline"');
const extraCSS = `
body[data-view="blog"] .main,body[data-view="article"] .main{width:100%}
.article-back,.article-source{color:var(--accent);text-decoration:underline;text-underline-offset:4px}
.article-list{margin-top:24px;border-top:1px solid var(--border-light)}.article-link{display:flex;align-items:center;justify-content:space-between;gap:28px;padding:24px 0;border-bottom:1px solid var(--border-light);color:var(--text-primary)}.article-link :is(h2,h3){font-size:19px;font-weight:600;line-height:1.4}.article-link svg{flex-shrink:0;color:var(--accent)}.article-link:hover :is(h2,h3){color:var(--accent)}
.article-shell{max-width:720px;margin:32px auto 0}.article-shell h1{font-size:clamp(28px,4vw,40px);line-height:1.2;letter-spacing:-.025em;margin:32px 0}.article-prose{max-width:68ch}.article-prose p{font-size:17px;line-height:1.85;color:var(--text-secondary);margin-bottom:24px}.article-actions{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;padding-top:24px;margin-top:32px;border-top:1px solid var(--border-light)}
.breadcrumbs{list-style:none;display:flex;flex-wrap:wrap;gap:8px 14px;font-size:13px;line-height:1.7;color:var(--text-secondary)}.breadcrumbs li+li::before{content:'/';margin-right:14px;color:var(--text-secondary)}.breadcrumbs a{color:var(--accent);text-decoration:underline;text-underline-offset:4px}.breadcrumbs li:last-child{max-width:100%}
.article-prose h2{font-size:25px;line-height:1.35;letter-spacing:-.015em;margin:40px 0 16px;scroll-margin-top:88px}.article-toc{margin:28px 0 36px;padding:20px 0;border-block:1px solid var(--border-light)}.article-toc h2{font-size:16px;letter-spacing:0;margin:0 0 12px}.article-toc ul{list-style:none;display:grid;gap:12px}.article-toc a{color:var(--accent);line-height:1.6;text-decoration:underline;text-underline-offset:4px}.article-related{margin-top:48px}.article-related>h2{font-size:23px;line-height:1.4}.article-sources{display:flex;flex-wrap:wrap;gap:12px 24px;font-size:14px;line-height:1.7}
.article-prose>ol,.article-prose>ul{padding-inline-start:25px;margin:20px 0 28px;color:var(--text-secondary);font-size:17px;line-height:1.85}.article-prose>ol li,.article-prose>ul li{padding-inline-start:6px;margin-bottom:14px}.article-table{width:100%;margin:24px 0 28px;overflow-x:auto}.article-table table{width:100%;border-collapse:collapse;table-layout:fixed;color:var(--text-secondary);font-size:14px;line-height:1.7}.article-table th,.article-table td{text-align:start;vertical-align:top;padding:14px 12px;border-bottom:1px solid var(--border-light);overflow-wrap:anywhere}.article-table th{font-weight:600;color:var(--text-primary)}
@media(max-width:600px){.article-link{padding:22px 0}.article-link :is(h2,h3){font-size:17px}.article-shell{margin-top:16px}.article-prose p{font-size:16px}}
`;
fs.mkdirSync(publicDir,{recursive:true});
fs.cpSync(path.join(sourceDir,'assets'),path.join(publicDir,'assets'),{recursive:true});

for(const page of pages){
  let html=base.replace('<body>',`<body data-view="${page.view}">`);
  if(page.view==='blog'||page.view==='article')html=html.replace('</head>',`<style data-blog-styles>${extraCSS}</style>\n</head>`);
  html=html.replace('<div class="view active" id="view-home">','<div class="view" id="view-home">');
  html=html.replace(`<div class="view" id="view-${page.view}">`,`<div class="view active" id="view-${page.view}">`);
  html=html.replace(/<h1>/g,'<h2>').replace(/<h1 /g,'<h2 ').replace(/<\/h1>/g,'</h2>');
  if(page.view==='home') html=html.replace('<h2><span data-i18n="hero.title">','<h1><span data-i18n="hero.title">').replace('</span></h2>','</span></h1>');
  else if(!['blog','article'].includes(page.view)) html=html.replace(`<h2 data-i18n="${page.view}.title">${encode(t[page.view].title)}</h2>`,`<h1 data-i18n="${page.view}.title">${encode(t[page.view].title)}</h1>`);
  if(page.view==='blog') html=html.replace('</main>',`<div class="view active" id="view-blog"><div class="page-header"><h1>${blogTitle}</h1><p>${blogDescription}</p></div>${articleList(2)}</div></main>`);
  if(page.article) html=html.replace('</main>',`<div class="view active" id="view-article"><article class="article-shell"><ol class="breadcrumbs"><li><a href="/">${t.nav.home}</a></li><li><a href="/blog/">${blogTitle}</a></li><li aria-current="page">${encode(page.title)}</li></ol><h1>${encode(page.title)}</h1><div class="article-prose">${articleContent(page.article)}</div><div class="article-actions"><a href="/#proxies" class="btn btn-primary">Выбрать прокси</a><div class="article-sources">${articleSources(page.article)}</div></div>${relatedArticles(page.article)}</article></div></main>`);
  html=html.replace(/<div class="view" id="view-[^"]+">[\s\S]*?(?=(?:<!-- [A-Z]+ -->\n)?<div class="view(?: active)?" id="view-|<\/main>)/g,'');
  html=html.replaceAll(navLinks('home'),navLinks(page.view));
  const canonical='https://mtproxy.bar'+page.url;
  const metadata=`<meta name="description" content="${encode(page.description)}">\n<link rel="canonical" href="${canonical}">\n<meta property="og:title" content="${encode(page.title)}">\n<meta property="og:description" content="${encode(page.description)}">\n<meta property="og:url" content="${canonical}">\n<meta property="og:site_name" content="MTProxy for Telegram">\n<meta property="og:locale" content="ru_RU">\n<meta property="og:type" content="${page.article?'article':'website'}">\n<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="${encode(page.title)}">\n<meta name="twitter:description" content="${encode(page.description)}">`;
  const website={'@type':'WebSite','@id':'https://mtproxy.bar/#website',url:'https://mtproxy.bar/',name:'MTProxy for Telegram',inLanguage:'ru'};
  const webPage={'@type':page.view==='blog'?'CollectionPage':'WebPage','@id':canonical,url:canonical,name:page.title,description:page.description,inLanguage:'ru',isPartOf:{'@id':website['@id']}};
  const graph=[website,webPage];
  if(page.article){
    const breadcrumbs={'@type':'BreadcrumbList','@id':canonical+'#breadcrumbs',itemListElement:[{name:t.nav.home,url:'https://mtproxy.bar/'},{name:blogTitle,url:'https://mtproxy.bar/blog/'},{name:page.title,url:canonical}].map((entry,i)=>({'@type':'ListItem',position:i+1,name:entry.name,item:entry.url}))};
    webPage.breadcrumb={'@id':breadcrumbs['@id']};
    webPage.mainEntity={'@id':canonical+'#article'};
    graph.push({'@type':'BlogPosting','@id':canonical+'#article',url:canonical,headline:page.title,description:page.description,articleBody:articleText(page.article),inLanguage:'ru',mainEntityOfPage:{'@id':canonical},isPartOf:{'@id':'https://mtproxy.bar/blog/'},publisher:{'@type':'Organization',name:'MTProxy for Telegram',url:'https://mtproxy.bar/'}});
    graph.push(breadcrumbs);
  }
  if(page.view==='blog') graph.push({'@type':'ItemList',itemListElement:articles.map((article,i)=>({'@type':'ListItem',position:i+1,url:'https://mtproxy.bar/blog/'+article.slug+'/'}))});
  const structured={'@context':'https://schema.org','@graph':graph};
  html=html.replace(/<title>[^<]*<\/title>/,`<title>${encode(page.title)}</title>\n${metadata}\n<script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script>`);
  html=html.replace(/<!--[^]*?-->/g,'');
  const bodyStart=html.indexOf('</head>')+7;
  html=html.slice(0,bodyStart)+html.slice(bodyStart).replace(/^[\t ]+$/gm,'');
  const output=path.join(publicDir,page.url,'index.html');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,html);
}
fs.writeFileSync(path.join(publicDir,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /v1/\nSitemap: https://mtproxy.bar/sitemap.xml\n');
fs.writeFileSync(path.join(publicDir,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>`<url><loc>https://mtproxy.bar${p.url}</loc></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(publicDir,'pages.json'),JSON.stringify(pages.map(({article,...page})=>page),null,2));
console.log(`Built ${pages.length} production static pages with live API routes and the existing analytics integration.`);
