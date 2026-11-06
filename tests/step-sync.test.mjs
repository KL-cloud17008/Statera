import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const at = value => new Date(`${value}T00:00:00.000Z`);
const instant = '2026-11-06T17:00:00.000Z';
class Clock extends Date { constructor(...args) { super(...(args.length ? args : [instant])); } static now() { return new Date(instant).getTime(); } }
const form = values => { const f = new FormData(); for (const [k,v] of Object.entries(values)) f.set(k, v); return f; };
function fixture() {
  const state = { connections: [], records: [], days: [], users: [{id:'owner', timezone:'America/New_York'}, {id:'other', timezone:'UTC'}], installed: false, sql: [], invalidations: [], fail: false };
  let auth = state.users[0], serial = 0, tail = Promise.resolve();
  const matches = (row, where = {}) => Object.entries(where).every(([key,value]) => {
    if (['userId_date','connectionId_date'].includes(key)) return matches(row,value);
    return value instanceof Date ? row[key]?.getTime() === value.getTime() : row[key] === value;
  });
  const db = {};
  for (const [name,list] of Object.entries({stepSyncConnection:'connections',stepSyncRecord:'records',dailyLog:'days',user:'users'})) {
    const find = where => state[list].find(row => matches(row,where));
    const create = async ({data}) => {
      const row = { id: `id-${++serial}`, tokenHash:null,pairCodeHash:null,pairCodeExpiresAt:null,pairedAt:null,lastSyncAt:null,blocked:false,lastSteps:null,observedAt:null,steps:null,sleepHours:null,moodRating:null,notes:null,...structuredClone(data) };
      state[list].push(row); return structuredClone(row);
    };
    const update = async ({where,data}) => { if (state.fail && name === 'stepSyncRecord') throw new Error('Simulated save failure'); const row = find(where); assert.ok(row); Object.assign(row,structuredClone(data)); return structuredClone(row); };
    db[name] = {
      findUnique: async ({where}) => structuredClone(find(where) ?? null), findFirst: async ({where}) => structuredClone(find(where) ?? null),
      create, update, upsert: async ({where,create:data,update:changes}) => {
        if (state.fail && name === 'stepSyncRecord') throw new Error('Simulated save failure');
        return find(where) ? update({where,data:changes}) : create({data});
      },
      updateMany: async ({where,data}) => { const rows = state[list].filter(row=>matches(row,where)); for(const row of rows) await update({where:{id:row.id},data}); return {count:rows.length}; },
      deleteMany: async ({where}) => { const rows = state[list].filter(row=>matches(row,where)); state[list] = state[list].filter(row=>!matches(row,where)); if(list === 'connections') state.records = state.records.filter(r=>!rows.some(c=>c.id===r.connectionId)); return {count:rows.length}; }
    };
  }
  db.$queryRaw = async strings => strings.join('').includes('to_regclass') ? [{installed:state.installed}] : [];
  db.$executeRawUnsafe = async sql => { state.sql.push(sql); state.installed = true; };
  db.$transaction = async operation => {
    const prior = tail; let release; tail = new Promise(r=>release=r); await prior;
    const snapshot = structuredClone(state);
    try { return await operation(db); } catch (error) { Object.assign(state,snapshot); throw error; } finally { release(); }
  };
  const cache = new Map();
  function load(path) {
    const file = resolve(path); if(cache.has(file)) return cache.get(file).exports;
    const mod = {exports:{}}; cache.set(file,mod);
    const output = ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    vm.runInNewContext(output,{module:mod,exports:mod.exports,Date:Clock,Request,Response,FormData,Uint8Array,TextDecoder,Set,Map,JSON,
      require: specifier => {
        if(specifier === '@/lib/db') return {prisma:db};
        if(specifier === '@/lib/current-user') return {getOrCreateCurrentUser:async()=>auth};
        if(specifier === 'next/cache') return {revalidatePath:path=>state.invalidations.push(path)};
        if(specifier.startsWith('@/')) return load(specifier.replace('@/','src/')+'.ts');
        if(specifier.startsWith('.')) return load(resolve(dirname(file),specifier)+'.ts');
        return require(specifier);
      }},{filename:file});
    return mod.exports;
  }
  const actions = load('src/actions/step-sync.ts'), service = load('src/lib/step-sync/service.ts'), protocol = load('src/lib/step-sync/protocol.ts');
  return {state,db,load,actions,service,protocol,auth:value=>auth=value,
    pair: async () => { const code = await actions.createStepPairingCode(); return service.claimStepSyncCode({code:code.code,deviceLabel:'Test Samsung'}); },
    upload: (token,steps=8000,date='2026-11-06',observedAt=instant) => service.importDeviceSteps(protocol.secretHash(token),{version:1,source:'samsung-health',timezone:'America/New_York',days:[{date,steps,observedAt}]}) };
}

test('only a signed-in website user can provision additive, RLS-protected pairing storage', async()=>{
  const f=fixture(); f.auth(null); assert.ok((await f.actions.createStepPairingCode()).error); assert.equal(f.state.sql.length,0);
  assert.equal(await f.service.claimStepSyncCode({code:'ABCD-EFGH-2345'}),null); assert.equal(f.state.sql.length,0);
  f.auth(f.state.users[0]); const created=await f.actions.createStepPairingCode();
  assert.match(created.code,/^[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){2}$/);
  assert.equal(f.state.sql.length,4); assert.equal(f.state.connections[0].pairCodeHash.includes(created.code),false);
  const migration=readFileSync('prisma/migrations/20261106_step_sync/migration.sql','utf8');
  for(const sql of f.state.sql) assert.ok(migration.includes(sql));
  assert.equal(f.state.sql.filter(sql=>sql.includes('ENABLE ROW LEVEL SECURITY')).length,2);
  await f.actions.createStepPairingCode(); assert.equal(f.state.sql.length,4);
});
test('codes expire and are single-use, including simultaneous claims; pairing rotates the old device token',async()=>{
  const f=fixture(); let code=await f.actions.createStepPairingCode(); f.state.connections[0].pairCodeExpiresAt=new Date('2026-11-06T16:59:00Z');
  assert.equal(await f.service.claimStepSyncCode({code:code.code}),null);
  code=await f.actions.createStepPairingCode();
  const claims=await Promise.all([f.service.claimStepSyncCode({code:code.code}),f.service.claimStepSyncCode({code:code.code})]);
  assert.equal(claims.filter(Boolean).length,1); const token=claims.find(Boolean).token;
  assert.match(token,/^[\w-]{43}$/); assert.notEqual(f.state.connections[0].tokenHash,token);
  code=await f.actions.createStepPairingCode(); assert.equal((await f.upload(token)).status,200);
  const replacement=await f.service.claimStepSyncCode({code:code.code}); assert.notEqual(replacement.token,token); assert.equal((await f.upload(token)).status,401);
});
test('retries replace daily aggregates without adding counts or duplicating rows; other metadata survives',async()=>{
  const f=fixture(), c=await f.pair(); f.state.days.push({id:'day',userId:'owner',date:at('2026-11-06'),steps:null,sleepHours:7.5,moodRating:8,notes:'Original'});
  assert.equal((await f.upload(c.token,8000,undefined,'2026-11-06T16:55:00Z')).status,200);
  assert.equal((await f.upload(c.token,9000)).status,200); await f.upload(c.token,9000);
  assert.equal(f.state.days.length,1); assert.equal(f.state.days[0].steps,9000); assert.equal(f.state.records.length,1);
  assert.equal(f.state.days[0].sleepHours,7.5); assert.equal(f.state.days[0].moodRating,8); assert.equal(f.state.days[0].notes,'Original');
  assert.equal((await f.upload(c.token,7000,undefined,'2026-11-06T16:55:00Z')).results[0].status,'stale'); assert.equal(f.state.days[0].steps,9000);
  assert.equal((await f.upload(c.token,7000)).results[0].status,'stale');
});
test('existing manual totals are preserved even if equal to the first uploaded total',async()=>{
  const f=fixture(), c=await f.pair(); f.state.days.push({id:'manual',userId:'owner',date:at('2026-11-06'),steps:8000});
  assert.equal((await f.upload(c.token,8000)).results[0].status,'manual-entry-kept');
  await f.upload(c.token,12000); assert.equal(f.state.days[0].steps,8000);
});
test('manual corrections and deletions prevent subsequent uploads from replacing or recreating a day',async()=>{
  for(const action of ['log','correct','delete','same-value']) {
    const f=fixture(),c=await f.pair(); await f.upload(c.token); const steps=f.load('src/actions/steps.ts'), id=f.state.days[0].id;
    if(action==='log') await steps.logSteps(form({date:'2026-11-06',steps:'8500'}));
    else if(action==='delete') await steps.deleteStepsEntry(form({id}));
    else await steps.updateStepsEntry(form({id,date:'2026-11-06',steps:action==='same-value'?'8000':'8500',originalSteps:'8000',originalDate:'2026-11-06'}));
    assert.equal((await f.upload(c.token,10000)).results[0].status,'manual-entry-kept');
    assert.equal(f.state.days[0].steps,action==='delete'?null:action==='same-value'?8000:8500);
  }
});
test('bad payloads, old history, future days and time zone changes never write steps',async()=>{
  const f=fixture(),c=await f.pair();
  const payload={version:1,source:'samsung-health',timezone:c.timezone,days:[{date:'2026-11-06',steps:100,observedAt:instant}]};
  const invalid=[{version:2},{source:'leap'},{timezone:'UTC'},{days:[]},{days:[...payload.days,...payload.days]},
    ...[-1,1.5,200001].map(steps=>({days:[{...payload.days[0],steps}]})),
    ...['2026-11-05','2026-11-07','2026-02-30'].map(date=>({days:[{...payload.days[0],date}]})),
    {days:[{...payload.days[0],observedAt:'2026-11-06T17:06:00Z'}]}];
  for(const patch of invalid) assert.equal((await f.service.importDeviceSteps(f.protocol.secretHash(c.token),{...payload,...patch})).status,400);
  assert.equal(f.state.days.length,0);
  f.state.users[0].timezone='UTC'; assert.equal((await f.upload(c.token)).status,409);
});
test('seven-day catch-up has a hard floor and respects pairing date across time zones',()=>{
  const f=fixture(),p={version:1,source:'samsung-health',timezone:'America/New_York',days:[{date:'2026-10-31',steps:100,observedAt:instant}]};
  assert.ok(f.protocol.validateStepSyncPayload(p,p.timezone,'2026-01-01'));
  assert.equal(f.protocol.validateStepSyncPayload({...p,days:[{...p.days[0],date:'2026-10-30'}]},p.timezone,'2026-01-01'),null);
});
test('a failed transaction rolls back totals and provenance, so retry is safe',async()=>{
  const f=fixture(),c=await f.pair(); f.state.fail=true;
  await assert.rejects(f.upload(c.token)); assert.equal(f.state.days.length,0); assert.equal(f.state.records.length,0);
  f.state.fail=false; assert.equal((await f.upload(c.token)).status,200); assert.equal(f.state.days.length,1);
});
test('status and disconnect are scoped to the website owner; old tokens cannot upload after revocation or data replacement',async()=>{
  const f=fixture(),c=await f.pair();
  f.auth(f.state.users[1]); assert.equal((await f.actions.getStepSyncStatus()).paired,false); await f.actions.disconnectStepSync(); assert.equal((await f.upload(c.token)).status,200);
  f.auth(f.state.users[0]); const status=await f.actions.getStepSyncStatus(); assert.equal(status.paired,true); assert.equal(JSON.stringify(status).includes(c.token),false);
  await f.actions.disconnectStepSync(); assert.equal((await f.upload(c.token)).status,401);
  const fresh=await f.pair(); await f.load('src/lib/step-sync/schema.ts').revokeStepSyncBeforeReplacement('owner');
  assert.equal((await f.upload(fresh.token)).status,401); assert.equal(f.state.days.length,1);
});
test('native routes require capabilities, bound streamed bodies, and expose no authentication cookies',async()=>{
  const f=fixture(),pair=f.load('src/app/api/health-connect/pair/route.ts'),api=f.load('src/app/api/health-connect/steps/route.ts');
  const req=(body,token) => new Request('https://athanor.test/api/health-connect/steps',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
  assert.equal((await api.POST(req({}))).status,401); assert.equal(f.state.sql.length,0);
  assert.equal((await pair.POST(req({code:'ABCD-EFGH-2345'}))).status,401);
  const huge=new Request('https://athanor.test/api/health-connect/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(17000)});
  assert.equal((await pair.POST(huge)).status,400);
  const c=await f.pair(); const response=await api.POST(req({version:1,source:'samsung-health',timezone:c.timezone,days:[{date:'2026-11-06',steps:100,observedAt:instant}]},c.token));
  assert.equal(response.status,200); assert.equal(response.headers.get('cache-control'),'no-store'); assert.equal(response.headers.has('set-cookie'),false);
  assert.equal((await api.DELETE(new Request('https://athanor.test/api/health-connect/steps',{method:'DELETE',headers:{Authorization:`Bearer ${c.token}`}}))).status,200);
  assert.equal((await api.POST(req({},c.token))).status,401);
});
