const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
// Exercise actual game functions in an isolated DOM stub; never touch a player save.
class Element {
  constructor() {
    this.dataset = {};
    this.style = { setProperty() {} };
    this.classList = {
      add() {},
      remove() {},
      toggle() {},
      contains() {
        return false;
      },
    };
    this.hidden = true;
    this.children = [];
    this.innerHTML = "";
    this.textContent = "";
  }
  querySelector() {
    return new Element();
  }
  querySelectorAll(selector) {
    if (selector === "[data-status-bed]")
      return [...this.innerHTML.matchAll(/data-status-bed="(\d+)"/g)].map(
        (m) => {
          let n = new Element();
          n.dataset.statusBed = m[1];
          return n;
        },
      );
    return [];
  }
  setAttribute() {}
  appendChild(n) {
    this.children.push(n);
  }
  remove() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 600, height: 400 };
  }
}
const nodes = new Map(),
  saved = new Map();
const context = {
  console,
  Date,
  Math,
  performance: { now: () => 0 },
  innerWidth: 1200,
  innerHeight: 800,
  requestAnimationFrame() {},
  setTimeout() {},
  clearTimeout() {},
  setInterval() {},
  clearInterval() {},
  Event: class {},
  navigator: { language: "ru" },
  location: { hostname: "127.0.0.1" },
  localStorage: {
    setItem: (k, v) => saved.set(k, v),
    getItem: (k) => saved.get(k) || null,
  },
  window: { addEventListener() {}, dispatchEvent() {} },
  document: {
    hidden: false,
    documentElement: {},
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, new Element());
      return nodes.get(id);
    },
    querySelectorAll: () => [],
    createElement: () => new Element(),
  },
};
const file = path.join(__dirname, "../game.js");
const production = fs.readFileSync(file, "utf8");
assert.ok(production.includes("// Bootstrap:"), "Test marker must exist");
const source =
  production.slice(0, production.indexOf("// Bootstrap:")) +
  `cache();globalThis.testGame={defaults,sanitize,selectCrop,harvest,prestige,render,updateBedStatuses,crops,upgradeDefs,cost,prestigeReward,gardenLayout,save,localSave,initPlayer,attachPlatformEvents,syncPause,rewarded,markReady,loadVisibleAssets,offerOffline,collectOffline,showMegaWatermelon,updateMegaTimer,hitMegaWatermelon,closeMegaHarvest,growthBoost,tapPower,autoPower,reward,maxCrop,hitWeed,offlineAmount,getFlags:()=>({paused,megaDeadline,megaHp,readySent}),setInteractive:v=>{interactiveReady=v},setPlayer:p=>{player=p;cloudDirty=false;cloudFlush=false;cloudInFlight=false;cloudTimer=null;lastCloudSentAt=-Infinity},getState:()=>state,setState:s=>{state=sanitize(s);paused=false}};})();`;
vm.runInNewContext(
  source.replace(
    "getFlags:",
    "homeDefs,buyHome,requestHomePurchase,cancelHomePurchase,openHome,closeHome,renderHome,getPendingHome:()=>pendingHomePurchase,forceCloudImport:()=>{preferCloudOnce=true},getFlags:",
  ),
  context,
  { filename: file },
);
const game = context.testGame;
assert.ok(game, "Test seam must match bootstrap");
const markup = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "../styles.css"), "utf8");
assert.ok(!markup.includes("hose-extension"), "No separate hose seam remains");
assert.match(
  markup,
  /granny-hose-long\.png/,
  "Use the regenerated continuous hose",
);
const spriteRule = styles.match(/\.granny-sprite\s*\{([^}]+)\}/)[1];
assert.match(
  spriteRule,
  /pointer-events:\s*none/,
  "Long sprite cannot block crops",
);
const hoseLeft = Number(spriteRule.match(/left:\s*(-?[\d.]+)px/)[1]);
assert.ok(
  hoseLeft < -1700,
  "Hose extends more than two character heights left",
);
for (const [width, height] of [
  [630, 241],
  [480, 210],
  [300, 440],
  [720, 660],
  [1400, 700],
]) {
  const camera = game.gardenLayout(width, height),
    w = 1754 * camera.scale,
    h = 826 * camera.scale;
  assert.ok(
    camera.left >= camera.edge - 0.001 && camera.top >= camera.edge - 0.001,
    "Complete foreground fits with safe margins",
  );
  assert.ok(
    camera.left + w <= width - camera.edge + 0.001 &&
      camera.top + h <= height - camera.edge + 0.001,
  );
  assert.ok(
    Math.abs(camera.left + w / 2 - width / 2) < 0.001 &&
      Math.abs(camera.top + h / 2 - height / 2) < 0.001,
    "Foreground is centred in the actual scene",
  );
  assert.ok(
    camera.left + hoseLeft * camera.scale < 0,
    "Generated hose reaches beyond the left camera edge without changing character scale",
  );
}
assert.ok(
  game.gardenLayout(630, 241).scale * 826 >= 210,
  "Landscape regression: no HUD or hidden speech deduction; granny must not shrink to 100px",
);
assert.deepEqual(
  Array.from(game.crops, (c) => c.purchasePrice),
  [
    0, 360, 1500, 6000, 22000, 80000, 280000, 3000, 12000, 42000, 140000,
    480000, 850000,
  ],
);
let state = game.defaults();
state.coins = 359;
game.setState(state);
game.selectCrop(1);
assert.equal(
  game.getState().coins,
  359,
  "Insufficient purchase must not debit coins",
);
assert.equal(game.getState().purchasedCrops.includes("carrot"), false);
game.render();
assert.equal(
  (nodes.get("crop-list").innerHTML.match(/class="crop-unlock-overlay"/g) || [])
    .length,
  game.crops.length - 1,
  "Every unpurchased crop has a price overlay",
);
assert.match(
  nodes.get("crop-list").innerHTML,
  /280\s000/,
  "Late crop price is shown in full",
);
state.coins = 360;
game.setState(state);
game.selectCrop(1);
assert.equal(game.getState().coins, 0, "First purchase debits exactly once");
assert.equal(game.getState().beds[0].cropIndex, 1);
assert.equal(game.getState().purchasedCrops.includes("carrot"), true);
assert.equal(
  (nodes.get("crop-list").innerHTML.match(/class="crop-unlock-overlay"/g) || [])
    .length,
  game.crops.length - 2,
  "Buying a crop removes its blur overlay",
);
game.selectCrop(0);
game.selectCrop(1);
assert.equal(game.getState().coins, 0, "Replanting an owned crop is free");
let restored = game.sanitize(JSON.parse(saved.get("grandma-garden-save-v2")));
assert.equal(
  restored.purchasedCrops.includes("carrot"),
  true,
  "Purchase survives reload",
);
state = game.defaults();
state.seasonHarvests = 999;
game.setState(state);
game.harvest(0);
assert.equal(
  game.getState().purchasedCrops.length,
  1,
  "Harvest count cannot unlock crops",
);
let legacy = game.defaults();
delete legacy.purchasedCrops;
legacy.version = 5;
legacy.seasonHarvests = 50;
assert.equal(
  game.sanitize(legacy).purchasedCrops.includes("pumpkin"),
  true,
  "Legacy unlocks are preserved",
);
state = game.defaults();
state.purchasedCrops = game.crops.map((c) => c.id);
state.seasonCoins = 3500;
state.seasonHarvests = 120;
state.collection.magic = 12;
state.fertilizer = 3;
game.setState(state);
game.prestige();
assert.equal(game.getState().season, 2);
assert.deepEqual(
  Array.from(game.getState().purchasedCrops),
  ["radish"],
  "Only free radish survives prestige",
);
assert.equal(
  game.getState().collection.magic,
  12,
  "Collection survives prestige",
);
assert.equal(game.getState().fertilizer, 3, "Fertilizer survives prestige");
assert.equal(game.getState().coins, 0);
assert.equal(game.getState().bedsCount, 1);
assert.ok(
  game.getState().beds.every((b) => b.cropIndex === 0 && b.growth === 0),
);
restored = game.sanitize(JSON.parse(saved.get("grandma-garden-save-v2")));
assert.deepEqual(
  Array.from(restored.purchasedCrops),
  ["radish"],
  "Reload cannot restore previous-season unlocks from the collection",
);
game.setState(restored);
game.selectCrop(1);
assert.equal(
  game.getState().purchasedCrops.includes("carrot"),
  false,
  "New season requires payment again",
);
game.getState().coins = 360;
game.selectCrop(1);
assert.equal(
  game.getState().coins,
  0,
  "Reopening in a new season charges full seed price",
);
for (let i = 1; i < game.crops.length; i++) {
  state = game.defaults();
  state.coins = game.crops[i].purchasePrice;
  game.setState(state);
  game.selectCrop(i);
  assert.equal(game.getState().coins, 0, `${game.crops[i].id}: exact price`);
  assert.equal(game.getState().beds[0].cropIndex, i);
}
state = game.defaults();
state.purchasedCrops.push("carrot");
state.seasonHarvests = 119;
state.seasonCoins = 100000;
game.setState(state);
game.prestige();
assert.equal(
  game.getState().season,
  1,
  "Insufficient harvests cannot reset the season",
);
assert.equal(
  game.getState().purchasedCrops.includes("carrot"),
  true,
  "Failed prestige cannot erase purchases",
);
state = game.defaults();
state.upgrades.auto = 1;
game.setState(state);
game.render();
assert.match(
  nodes.get("income-rate").textContent,
  /0,22/,
  "Radish auto income: 0.3 / 16 * 12",
);
game.getState().beds[0].weedHp = 3;
game.updateBedStatuses();
assert.match(
  nodes.get("income-rate").textContent,
  /0,05/,
  "Weeds reduce auto income to one quarter",
);
state = game.defaults();
state.upgrades.value = 1;
game.setState(state);
game.render();
assert.match(
  nodes.get("crop-list").innerHTML,
  /17 монет/,
  "Picker payout includes market upgrade, matching the HUD",
);
if (process.argv.includes("--balance")) {
  console.table(
    Array.from(game.crops, (c, i) => ({
      crop: c.id,
      price: c.purchasePrice,
      normalYield: c.value,
      growth: c.need,
      previousCropHarvests: i
        ? Math.ceil(c.purchasePrice / game.crops[i - 1].value)
        : 0,
    })),
  );
  state = game.defaults();
  state.seasonHarvests = 120;
  state.seasonCoins = 3500;
  game.setState(state);
  console.log(
    "Season 1 can reset with only radish owned:",
    game.prestigeReward() > 0,
  );
  console.log(
    "Carrot auto-only incremental payback, no bonuses:",
    Math.round(360 / (0.3 * (32 / 25 - 12 / 16)) / 60),
    "minutes",
  );
}
state = game.defaults();
state.bedsCount = 3;
state.beds[0].weedHp = 3;
state.beds[2].weedHp = 2;
game.setState(state);
game.render();
const statuses = nodes.get("bed-status-list").innerHTML;
assert.equal((statuses.match(/class="bed-status-item"/g) || []).length, 3);
assert.equal(
  (statuses.match(/data-status-weed=/g) || []).length,
  3,
  "Each open bed has its own stable weed alert node",
);
assert.match(
  statuses,
  /data-status-bed="2"[\s\S]+data-status-weed="2"/,
  "Third-bed notice is grouped with its own progress card",
);
game.hitWeed(2);
assert.equal(game.getState().beds[2].weedHp, 1);
assert.equal(
  game.getState().beds[0].weedHp,
  3,
  "Removing weeds from one alert does not affect another bed",
);
state = game.defaults();
state.purchasedCrops = ["radish", "magic", "cucumber"];
state.beds[0].cropIndex = 6;
game.setState(state);
assert.equal(
  game.getState().beds[0].cropIndex,
  6,
  "Legacy magic crop index is unchanged",
);
assert.equal(
  game.maxCrop(),
  6,
  "Rewards use highest-value owned crop, not appended index",
);
game.render();
const pickerOrder = [
  ...nodes.get("crop-list").innerHTML.matchAll(/data-crop="(\d+)"/g),
].map((m) => +m[1]);
assert.equal(pickerOrder.length, 13);
assert.ok(
  pickerOrder.every(
    (i, k) =>
      !k ||
      game.crops[pickerOrder[k - 1]].purchasePrice <=
        game.crops[i].purchasePrice,
  ),
  "Picker sorted by opening price without rewriting saved indices",
);
console.log(
  "PASS: camera fit, 13 crops/12 seed prices, sorted picker, legacy crop IDs, purchase/reset/reload, auto income, per-bed weeds",
);
module.exports = { game, context, nodes, saved };
