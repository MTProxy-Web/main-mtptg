import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {git,prepareMirror,validateManifest} from '../scripts/sync-mirrors.mjs';
function fixture(t){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'mirror-test-'));
  t.after(()=>{const relative=path.relative(os.tmpdir(),root);assert(!relative.startsWith('..')&&!path.isAbsolute(relative)&&relative.startsWith('mirror-test-'));fs.rmSync(root,{recursive:true,force:true});});
  return root;
}
function write(root,file,value){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),value);}
function initialize(root){fs.mkdirSync(root,{recursive:true});git(['init','-b','simple-html'],root);git(['config','user.name','Fixture'],root);git(['config','user.email','fixture@example.invalid'],root);}
function commit(root){git(['add','-A'],root);git(['commit','-m','test(fixtures): update repository files'],root);return git(['rev-parse','HEAD'],root);}
test('mirror synchronization preserves domains and workflows, removes stale files, and is idempotent',t=>{
  const root=fixture(t),source=path.join(root,'source');initialize(source);
  write(source,'index.html','new shared design');write(source,'assets/site.css','new stylesheet');write(source,'CNAME','source.mtproxy.bar\n');write(source,'.github/workflows/private.yml','source workflow');write(source,'mtproxy-bar-subdomains.json','private history');
  const revision=commit(source);
  for(const label of ['fixture-a','fixture-b']){
    const target=path.join(root,label);initialize(target);
    write(target,'index.html','old design');write(target,'obsolete.txt','remove');write(target,'CNAME',label+'.mtproxy.bar\n');write(target,'.github/workflows/keep.yml','target workflow');commit(target);
    assert(prepareMirror(source,target,revision));
    assert.equal(fs.readFileSync(path.join(target,'index.html'),'utf8'),'new shared design');
    assert.equal(fs.readFileSync(path.join(target,'CNAME'),'utf8'),label+'.mtproxy.bar\n');
    assert.equal(fs.readFileSync(path.join(target,'.github/workflows/keep.yml'),'utf8'),'target workflow');
    assert(!fs.existsSync(path.join(target,'.github/workflows/private.yml')));
    assert(!fs.existsSync(path.join(target,'mtproxy-bar-subdomains.json')));
    assert(!fs.existsSync(path.join(target,'obsolete.txt')));
    const head=git(['rev-parse','HEAD'],target);
    assert.equal(prepareMirror(source,target,revision),false);
    assert.equal(git(['rev-parse','HEAD'],target),head);
  }
});
test('an overlapping remote edit rejects a normal mirror push',t=>{
  const root=fixture(t),source=path.join(root,'source'),seed=path.join(root,'seed'),remote=path.join(root,'remote.git'),mirror=path.join(root,'mirror'),other=path.join(root,'other');
  initialize(source);write(source,'index.html','new source');const revision=commit(source);
  initialize(seed);write(seed,'index.html','old');write(seed,'CNAME','fixture.mtproxy.bar\n');commit(seed);
  git(['clone','--bare',seed,remote],root);git(['clone',remote,mirror],root);git(['clone',remote,other],root);
  git(['config','user.name','Fixture'],other);git(['config','user.email','fixture@example.invalid'],other);
  prepareMirror(source,mirror,revision);
  write(other,'index.html','parallel edit');const otherHead=commit(other);git(['push'],other);
  assert.throws(()=>git(['push'],mirror),/failed/);
  assert.equal(git(['ls-remote','origin','refs/heads/simple-html'],mirror).split(/\s+/)[0],otherHead);
});
test('mirror manifests reject duplicates and unexpected repositories',()=>{
  const mirrors=Array.from({length:5},(_,i)=>({repository:'MTProxy-Web/web-'+(i+1),branch:'simple-html',key:'MIRROR_DEPLOY_KEY_'+(i+1)}));
  assert.equal(validateManifest({mirrors}).length,5);
  assert.throws(()=>validateManifest({mirrors:[mirrors[0],...mirrors.slice(0,4)]}));
  assert.throws(()=>validateManifest({mirrors:mirrors.map((mirror,i)=>i===0?{...mirror,repository:'Other/repository'}:mirror)}));
});
