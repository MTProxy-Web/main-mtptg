const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
function block(from,to){return source.slice(source.indexOf(from),source.indexOf(to,source.indexOf(from)));}
function container(){
  return {html:'',buttons:[],set innerHTML(value){this.html=value;this.buttons=[...value.matchAll(/<button\b([^>]*)>/g)].map(match=>({attributes:match[1],handlers:{},addEventListener(event,fn){this.handlers[event]=fn;}}));},get innerHTML(){return this.html;},querySelectorAll(selector){assert.equal(selector,'button.btn-connect');return this.buttons;}};
}
function runtime(){
  const elements={proxyGrid:container(),pubBody:container()};
  const context={document:{getElementById:id=>elements[id]},window:{location:{href:''}},URLSearchParams,atob:value=>Buffer.from(value,'base64').toString('binary'),flagImg:()=>'',esc:value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))};
  vm.createContext(context);
  vm.runInContext(block('const T=','// ============ FLAGS')+'\nlet lang="ru",proxies=[],pubProxies=[];\n'+block('function bindProxyButtons','function toggleMobile')+block('function renderPublicGrid','// ============ RENDER')+block('function renderProxies','function renderFAQ'),context);
  return {context,elements};
}
for(const kind of ['sponsored','public'])test(kind+' buttons expose no proxy URLs and open only the selected proxy',()=>{
  const {context,elements}=runtime();
  const items=[{server:'edge.example',port:443,secret:'a&b=+' ,geo:'US',eventId:'proxy_12',status:'online',highlight:true},{server:'2001:db8::1',port:8443,secret:'second',geo:'DE'}];
  context.items=items;
  const target=kind==='public'?elements.pubBody:elements.proxyGrid;
  vm.runInContext(kind==='public'?'pubProxies=items;renderPublicGrid()':'proxies=items;renderProxies()',context);
  assert.equal(target.buttons.length,2);
  assert(!/href=|data-(?:url|secret|server)=/.test(target.buttons.map(button=>button.attributes).join(' ')));
  assert(!target.html.includes('tg://proxy'));
  assert(!target.html.includes('a&b=+'));
  assert.equal(context.window.location.href,'');
  if(kind==='sponsored')assert(target.buttons[0].attributes.includes('data-rybbit-event="proxy_12"'));
  target.buttons[1].handlers.click();
  const url=new URL(context.window.location.href);
  assert.equal(url.protocol,'tg:');
  assert.equal(url.hostname,'proxy');
  assert.equal(url.searchParams.get('server'),items[1].server);
  assert.equal(url.searchParams.get('port'),'8443');
  assert.equal(url.searchParams.get('secret'),'second');
  target.buttons[0].handlers.click();
  assert.equal(new URL(context.window.location.href).searchParams.get('secret'),'a&b=+');
  for(const language of ['en','ir','ru']){
    vm.runInContext('lang="'+language+'";'+(kind==='public'?'renderPublicGrid()':'renderProxies()'),context);
    assert.equal(target.buttons.length,2);
    target.buttons[1].handlers.click();
    assert.equal(new URL(context.window.location.href).searchParams.get('secret'),'second');
  }
});
