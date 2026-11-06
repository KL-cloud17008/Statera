import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),ts=require('typescript');
function middleware(authenticated=false) {
  let authReads=0;
  const mod={exports:{}};
  const output=ts.transpileModule(readFileSync('src/proxy.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(output,{module:mod,exports:mod.exports,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://fixture.invalid',NEXT_PUBLIC_SUPABASE_ANON_KEY:'synthetic-public-key'}},require:specifier=>{
    if(specifier==='next/server')return{NextResponse:{next:()=>({kind:'next',cookies:{set(){}}}),redirect:url=>({kind:'redirect',url:String(url)})}};
    if(specifier==='@supabase/ssr')return{createServerClient:()=>({auth:{getUser:async()=>{authReads++;return{data:{user:authenticated?{id:'fixture'}:null}};}}})};
    throw new Error('Unexpected dependency '+specifier);
  }});
  return {readCount:()=>authReads,request:async path=>{
    const url=new URL(path,'https://stateraone.vercel.app');url.clone=()=>new URL(url);
    return mod.exports.proxy({nextUrl:url,cookies:{getAll:()=>[],set(){}}});
  }};
}
test('Android installation and domain association are public without an auth dependency',async()=>{
  const m=middleware();
  for(const path of ['/android','/.well-known/assetlinks.json','/downloads/athanor-steps.apk'])assert.equal((await m.request(path)).kind,'next');
  assert.equal(m.readCount(),0);
});
test('the Android public-route exception never exposes private ledger pages or sibling resources',async()=>{
  const m=middleware();
  for(const path of ['/weight','/workout','/steps/connect','/api/sync','/.well-known/private.json','/android/account','/downloads/private.apk']){
    const result=await m.request(path);assert.equal(result.kind,'redirect',path);assert.equal(new URL(result.url).pathname,'/login');
  }
});
test('signed-in users still reach weight and training through the normal session',async()=>{
  const m=middleware(true);
  assert.equal((await m.request('/weight')).kind,'next');assert.equal((await m.request('/workout')).kind,'next');assert.equal(m.readCount(),2);
});
test('domain association grants only the existing signed Android application the web relationship',()=>{
  const statements=JSON.parse(readFileSync('public/.well-known/assetlinks.json','utf8'));
  assert.equal(statements.length,1);assert.deepEqual(statements[0].relation,['delegate_permission/common.handle_all_urls']);
  const target=statements[0].target;
  assert.equal(target.namespace,'android_app');assert.equal(target.package_name,'app.athanor.steps');assert.equal(target.sha256_cert_fingerprints.length,1);
  assert.match(target.sha256_cert_fingerprints[0],/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/);
});
