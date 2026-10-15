const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
// Exercise actual game functions in an isolated DOM stub; never touch a player save.
class Element{
  constructor(){this.dataset={};this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){},contains(){return false}};this.hidden=true;this.children=[];this.innerHTML='';this.textContent='';}
  querySelector(){return new Element()}
  querySelectorAll(selector){if(selector==='[data-status-bed]')return [...this.innerHTML.matchAll(/data-status-bed="(\d+)"/g)].map(m=>{let n=new Element();n.dataset.statusBed=m[1];return n});return []}
  setAttribute(){}
  appendChild(n){this.children.push(n)}
  remove(){}
  getBoundingClientRect(){return{left:0,top:0,width:600,height:400}}
}
const nodes=new Map(),saved=new Map();
const context={console,Date,Math,performance:{now:()=>0},innerWidth:1200,innerHeight:800,requestAnimationFrame(){},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},Event:class{},navigator:{language:'ru'},location:{hostname:'127.0.0.1'},localStorage:{setItem:(k,v)=>saved.set(k,v)},window:{addEventListener(){},dispatchEvent(){}},document:{hidden:false,documentElement:{},getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id)},querySelectorAll:()=>[],createElement:()=>new Element()}};
const file=path.join(__dirname,'../game.js');
const source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n').replace('  setupGardenWorld();\n  if(window.__yandexSdkSettled)',`  cache();globalThis.testGame={defaults,sanitize,selectCrop,harvest,prestige,render,updateBedStatuses,getState:()=>state,setState:s=>{state=sanitize(s);paused=false}};\n  if(window.__yandexSdkSettled)`);
vm.runInNewContext(source,context,{filename:file});
const game=context.testGame;
assert.ok(game,'Test seam must match bootstrap');
let state=game.defaults();state.coins=89;game.setState(state);game.selectCrop(1);
assert.equal(game.getState().coins,89,'Insufficient purchase must not debit coins');
assert.equal(game.getState().purchasedCrops.includes('carrot'),false);
state.coins=90;game.setState(state);game.selectCrop(1);
assert.equal(game.getState().coins,0,'First purchase debits exactly once');
assert.equal(game.getState().beds[0].cropIndex,1);
assert.equal(game.getState().purchasedCrops.includes('carrot'),true);
game.selectCrop(0);game.selectCrop(1);
assert.equal(game.getState().coins,0,'Replanting an owned crop is free');
let restored=game.sanitize(JSON.parse(saved.get('grandma-garden-save-v2')));
assert.equal(restored.purchasedCrops.includes('carrot'),true,'Purchase survives reload');
state=game.defaults();state.seasonHarvests=999;game.setState(state);game.harvest(0);
assert.equal(game.getState().purchasedCrops.length,1,'Harvest count cannot unlock crops');
let legacy=game.defaults();delete legacy.purchasedCrops;legacy.version=5;legacy.seasonHarvests=50;
assert.equal(game.sanitize(legacy).purchasedCrops.includes('pumpkin'),true,'Legacy unlocks are preserved');
state=game.defaults();state.purchasedCrops.push('carrot');state.seasonCoins=3500;state.seasonHarvests=120;game.setState(state);game.prestige();
assert.equal(game.getState().season,2);
assert.equal(game.getState().purchasedCrops.includes('carrot'),true,'Purchased seeds survive prestige');
state=game.defaults();state.upgrades.auto=1;game.setState(state);game.render();
assert.match(nodes.get('income-rate').textContent,/0,22/,'Radish auto income: 0.3 / 16 * 12');
game.getState().beds[0].weedHp=3;game.updateBedStatuses();
assert.match(nodes.get('income-rate').textContent,/0,05/,'Weeds reduce auto income to one quarter');
console.log('PASS: insufficient funds, one-time debit, replanting, reload, no harvest unlocks, legacy migration, prestige, auto income, weeds');
