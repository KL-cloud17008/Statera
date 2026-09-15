import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const settings = { stepGoal: 9000, distanceUnit: 'km', weightGoalTargetDate: null };
const stubs = {
  'next/link': { __esModule: true, default: ({children, href, ...props}) => React.createElement('a',{href,...props},children) },
  '@/components/settings/AppSettingsProvider': { useAppSettings: () => ({settings}) },
  '@/components/pain/PainCheckInCard': { PainCheckInCard: () => React.createElement('span',null,'Pain check-in') },
  '@/components/workout/WorkoutSessionActionButton': { WorkoutSessionActionButton: ({status}) => React.createElement('a',{href:status==='view'?'/workout/history':'/workout'},status) },
};
const cache = new Map();
function load(file) {
  const path=resolve(file); if(cache.has(path)) return cache.get(path).exports;
  const loadedModule={exports:{}};cache.set(path,loadedModule);
  const source=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const localRequire=id=>{
    if(stubs[id]) return stubs[id];
    if(id.startsWith('@/')) { const base=resolve('src',id.slice(2)); try{return load(base+'.ts');}catch(error){ if(error.code!=='ENOENT') throw error; return load(base+'.tsx'); } }
    if(id.startsWith('.')) { const base=resolve(dirname(path),id);try{return load(base+'.ts');}catch(error){if(error.code!=='ENOENT')throw error;return load(base+'.tsx');} }
    return require(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${source}\n})`,{filename:path})(localRequire,loadedModule,loadedModule.exports);
  return loadedModule.exports;
}
const {getPainGuidance,initialRecoveryMode,MOVEMENT_STOP_RULE}=load('src/lib/movement-guidance.ts');
const dates=load('src/lib/dates.ts');
const {addDaysToDateString}=dates;
let today='2026-09-09';
stubs['@/lib/dates']={...dates,getTodayDateString:()=>today};
const {DashboardPageClient}=load('src/components/dashboard/DashboardPageClient.tsx');
function dashboardProps(pain=null) {
  return { stepsEntries:Array.from({length:7},(_,i)=>({id:String(i),date:addDaysToDateString(today,-i),steps:15000})),todaySteps:18000,
    weightStats:{currentWeight:270,trend:'down'},workoutSummary:{weeklyVolume:8115,prevWeeklyVolume:7500,weeklySessions:1,hasCompletedWorkoutToday:false,lastWorkout:null},
    workoutDayStatuses:[{planId:'mon',dayOfWeek:1,status:'resume'}],mobilitySummary:{completedTypes:['POST_WORKOUT'],footFlareLogged:true},latestWeightDate:today,timezone:'America/New_York',trainingDayOfWeek:3,painCheckIn:pain==null?null:{date:today,footPain:pain,lowerBackPain:1} };
}
test('high steps and a previously logged comfort routine never infer an acute flare',()=>{
  for (const pain of [null,0,1,2]) {
    const html=renderToStaticMarkup(React.createElement(DashboardPageClient,dashboardProps(pain)));
    assert.doesNotMatch(html,/Required foot-flare|recovery only|Foot pain|No flare signal|Readiness|High step load/i);
    assert.match(html,/18,000/);assert.match(html,/of 9,000/);assert.match(html,/Session in progress/);assert.match(html,/270\.0 lb/);assert.match(html,/122\.5 kg/);
  }
});
test('reported pain protections distinguish stable 3 from above 3',()=>{
  assert.match(getPainGuidance(3).text,/only if stable/);assert.match(getPainGuidance(3).text,/gait and form stay normal/);
  assert.match(getPainGuidance(4).text,/Reduce load, range, or pace/);
  assert.match(getPainGuidance(2).text,/if stable/);
  assert.equal(getPainGuidance(null).attention,false);
  for (const pain of [null,0,2,3,4,8]) assert.equal(initialRecoveryMode(pain),'standard');
  for (const word of ['sharp pain','limping','swelling','warmth','numbness','tingling','weakness','rest or night']) assert.ok(MOVEMENT_STOP_RULE.includes(word));
  const html=renderToStaticMarkup(React.createElement(DashboardPageClient,dashboardProps(3)));
  assert.match(html,/continue only if stable/);assert.doesNotMatch(html,/Recovery only|Required foot-flare/);
});

test('calendar-day step guidance stays on Sunday after training rolls to Monday',()=>{
  today='2026-09-13';
  try {
    const html=renderToStaticMarkup(React.createElement(DashboardPageClient,{...dashboardProps(),trainingDayOfWeek:1}));
    assert.match(html,/Rest day · no goal/);
    assert.doesNotMatch(html,/of 9,000/);
    assert.match(html,/18,000/);
  } finally { today='2026-09-09'; }
});
test('logged step totals no longer trigger a mobility query or automatic mode',()=>{
  const page=readFileSync('src/app/(app)/mobility/page.tsx','utf8');
  assert.doesNotMatch(page,/getStepsEntries|highStepLoad/);
  const source=readFileSync('src/components/mobility/MobilityPageClient.tsx','utf8');
  assert.doesNotMatch(source,/highStepLoad \|\||recentStepTotal >|Required when soles are irritated or step load is high/);
});
