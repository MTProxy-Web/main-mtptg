import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export function git(args,cwd,options={}){
  const result=spawnSync('git',args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024,...options});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error('git '+args[0]+' failed: '+result.stderr);
  return result.stdout.trimEnd();
}

export function sharedFile(file){
  return !['CNAME','PENDING_PRODUCTION.md','DEPLOYMENTS.md','mtproxy-bar-subdomains.json'].includes(file)&&file!=='.github'&&!file.startsWith('.github/');
}

function safePath(root,file){
  const target=path.resolve(root,file);
  const relative=path.relative(root,target);
  if(!relative||relative.startsWith('..')||path.isAbsolute(relative)||file.split('/').includes('.git'))throw new Error('Invalid repository path');
  return target;
}

export function prepareMirror(source,target,sourceSha){
  if(!/^[a-f0-9]{40}$/.test(sourceSha))throw new Error('Invalid source commit');
  if(git(['status','--porcelain'],target))throw new Error('Mirror checkout is not clean');
  const cname=fs.readFileSync(path.join(target,'CNAME'));
  const hostname=cname.toString('utf8').trim();
  if(!/^[a-z0-9-]+\.mtproxy\.bar$/.test(hostname))throw new Error('Invalid mirror custom domain');
  const files=git(['ls-files','-z'],source).split('\0').filter(Boolean).filter(sharedFile);
  if(!files.includes('index.html'))throw new Error('Source index is missing');
  const sourceSet=new Set(files);
  for(const file of git(['ls-files','-z'],target).split('\0').filter(Boolean).filter(sharedFile)){
    if(!sourceSet.has(file))fs.rmSync(safePath(target,file),{force:true});
  }
  for(const file of files){
    const origin=safePath(source,file),destination=safePath(target,file);
    const stat=fs.lstatSync(origin);
    if(!stat.isFile())throw new Error('Only regular source files can be synchronized');
    if(fs.existsSync(destination)&&!fs.lstatSync(destination).isFile())throw new Error('Invalid mirror file');
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.copyFileSync(origin,destination);
    fs.chmodSync(destination,stat.mode&0o777);
  }
  if(!fs.readFileSync(path.join(target,'CNAME')).equals(cname))throw new Error('Mirror CNAME changed');
  git(['add','-u'],target);
  git(['add','--force','--pathspec-from-file=-','--pathspec-file-nul'],target,{input:files.join('\0')+'\0'});
  if(!git(['diff','--cached','--name-only'],target))return false;
  git(['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m','chore(mirrors): sync shared site','-m','Source-Commit: '+sourceSha],target);
  return true;
}

export function validateManifest(manifest){
  const mirrors=manifest.mirrors;
  if(!Array.isArray(mirrors)||mirrors.length!==5)throw new Error('Exactly five mirrors are required');
  const seen=new Set();
  for(const mirror of mirrors){
    if(!/^MTProxy-Web\/web-[1-5]$/.test(mirror.repository)||mirror.branch!=='simple-html'||!/^MIRROR_DEPLOY_KEY_[1-5]$/.test(mirror.key)||seen.has(mirror.repository))throw new Error('Invalid mirror configuration');
    if(mirror.key!=='MIRROR_DEPLOY_KEY_'+mirror.repository.slice(-1))throw new Error('Mirror key mismatch');
    seen.add(mirror.repository);
  }
  return mirrors;
}

export async function synchronize(source){
  const mirrors=validateManifest(JSON.parse(fs.readFileSync(path.join(source,'.github/mirrors.json'),'utf8')));
  const revision=git(['rev-parse','HEAD'],source);
  for(const mirror of mirrors)if(!process.env[mirror.key])throw new Error('Missing deploy key: '+mirror.key);
  const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'mtproxy-mirror-sync-'));
  const prepared=[];
  try{
    for(const mirror of mirrors){
      const keyPath=path.join(workspace,mirror.repository.slice(-5)+'.key');
      fs.writeFileSync(keyPath,process.env[mirror.key].replace(/\r\n/g,'\n').trimEnd()+'\n',{mode:0o600});
      const knownHosts=path.join(source,'.github/known_hosts');
      const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>!key.startsWith('MIRROR_DEPLOY_KEY_')));
      env.GIT_SSH_COMMAND='ssh -i "'+keyPath+'" -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="'+knownHosts+'"';
      const target=path.join(workspace,mirror.repository.slice(-5));
      git(['clone','--single-branch','--branch',mirror.branch,'git@github.com:'+mirror.repository+'.git',target],source,{env});
      const changed=prepareMirror(source,target,revision);
      prepared.push({mirror,target,env,changed});
    }
    for(const item of prepared){
      if(item.changed)git(['push','origin','HEAD:refs/heads/'+item.mirror.branch],item.target,{env:item.env});
      const head=git(['rev-parse','HEAD'],item.target);
      const remote=git(['ls-remote','origin','refs/heads/'+item.mirror.branch],item.target,{env:item.env}).split(/\s+/)[0];
      if(head!==remote)throw new Error('Mirror push verification failed: '+item.mirror.repository);
      console.log(item.mirror.repository+': '+(item.changed?'updated':'unchanged')+' '+head);
    }
  }finally{
    const relative=path.relative(os.tmpdir(),workspace);
    if(relative.startsWith('mtproxy-mirror-sync-')&&!relative.includes(path.sep))fs.rmSync(workspace,{recursive:true,force:true});
  }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await synchronize(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'));
