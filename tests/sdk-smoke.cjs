const assert = require("node:assert/strict");
const { game, context, nodes, saved } = require("./economy-smoke.cjs");
let clock = 1800000000000,
  id = 0;
const timers = new Map(),
  calls = [],
  handlers = {};
context.Date = class extends Date {
  static now() {
    return clock;
  }
};
context.setTimeout = (fn, delay = 0) => {
  const key = ++id;
  timers.set(key, { fn, at: clock + delay });
  return key;
};
context.clearTimeout = (key) => timers.delete(key);
const tick = async (ms) => {
  clock += ms;
  for (const [key, t] of [...timers])
    if (t.at <= clock) {
      timers.delete(key);
      t.fn();
    }
  for (let n = 0; n < 8; n++) await Promise.resolve();
};
let callbacks,
  adRequests = 0,
  readyCalls = 0;
context.window.ysdk = {
  EVENTS: {
    ACCOUNT_SELECTION_DIALOG_OPENED: "account-open",
    ACCOUNT_SELECTION_DIALOG_CLOSED: "account-close",
  },
  on: (key, fn) => (handlers[key] = fn),
  features: {
    LoadingAPI: { ready: () => readyCalls++ },
    GameplayAPI: { start() {}, stop() {} },
  },
  adv: {
    showRewardedVideo: ({ callbacks: c }) => {
      callbacks = c;
      adRequests++;
    },
  },
};
async function main() {
  game.setState(game.defaults());
  game.setInteractive(true);
  game.attachPlatformEvents();
  assert.ok(handlers.game_api_pause && handlers.game_api_resume);
  game.getState().upgrades.auto = 2;
  const baseTap = game.tapPower(),
    baseAuto = game.autoPower(),
    baseYield = game.reward(game.getState().beds[0]);
  game.growthBoost();
  assert.equal(
    game.getState().growthBoostUntil,
    0,
    "Opening an ad alone grants no growth bonus",
  );
  callbacks.onClose();
  assert.equal(
    game.tapPower(),
    baseTap,
    "Closing without a reward grants nothing",
  );
  game.growthBoost();
  callbacks.onRewarded();
  const growthDeadline = game.getState().growthBoostUntil;
  callbacks.onRewarded();
  callbacks.onClose();
  assert.equal(
    game.getState().growthBoostUntil,
    growthDeadline,
    "Duplicate reward cannot extend the boost",
  );
  assert.equal(game.tapPower(), baseTap * 2);
  assert.equal(game.autoPower(), baseAuto * 2);
  assert.equal(
    game.reward(game.getState().beds[0]),
    baseYield,
    "Growth bonus does not double harvest price",
  );
  const requestsBefore = adRequests;
  game.growthBoost();
  assert.equal(
    adRequests,
    requestsBefore,
    "Active growth bonus cannot trigger another ad",
  );
  game.getState().boostUntil = clock + 120000;
  game.getState().fertilizerUntil = clock + 90000;
  assert.equal(
    game.tapPower(),
    baseTap * 2 * 1.75,
    "Fertilizer and grandkids stack once",
  );
  assert.equal(
    game.reward(game.getState().beds[0]),
    Math.round(12 * 2 * 1.5),
    "Harvest bonus stays separate from growth",
  );
  const restoredGrowth = game.sanitize(
    JSON.parse(JSON.stringify(game.getState())),
  );
  assert.equal(
    restoredGrowth.growthBoostUntil,
    growthDeadline,
    "Growth timer survives reload",
  );
  handlers.game_api_pause();
  game.getState().coins = 5000;
  game.buyHome("tv");
  assert.equal(
    game.getState().homePurchases.length,
    0,
    "Platform pause blocks home transactions",
  );
  assert.equal(game.getState().coins, 5000);
  await tick(10000);
  handlers.game_api_resume();
  assert.equal(
    game.getState().growthBoostUntil,
    growthDeadline + 10000,
    "Platform pause preserves growth bonus time",
  );
  await tick(120001);
  assert.equal(
    game.tapPower(),
    baseTap,
    "Expired bonuses restore normal tap growth",
  );
  assert.equal(
    game.autoPower(),
    baseAuto,
    "Expired bonuses restore normal auto growth",
  );
  const offlineGrowth = game.defaults();
  offlineGrowth.upgrades.auto = 2;
  offlineGrowth.lastSavedAt = clock - 240000;
  offlineGrowth.growthBoostUntil = offlineGrowth.lastSavedAt + 30000;
  assert.equal(
    game.offlineAmount(offlineGrowth),
    Math.floor(((0.6 * 270) / 16) * 12 * 0.55),
    "Offline growth bonus counts only its 30-second overlap, not all four minutes",
  );
  game.setState(game.defaults());
  adRequests = 0;
  game.getState().boostUntil = clock + 1000;
  game.showMegaWatermelon();
  const deadline = game.getFlags().megaDeadline;
  handlers.game_api_pause();
  assert.equal(game.getFlags().paused, true);
  await tick(10000);
  game.updateMegaTimer();
  game.hitMegaWatermelon();
  assert.equal(
    game.getFlags().megaHp,
    8,
    "Platform pause cannot consume mega time or clicks",
  );
  handlers.game_api_resume();
  assert.equal(
    game.getFlags().megaDeadline,
    deadline + 10000,
    "Mega duration shifts by the paused interval",
  );
  assert.equal(
    game.getState().boostUntil,
    clock + 1000,
    "Buff duration is preserved during platform pause",
  );
  game.closeMegaHarvest();
  assert.equal(game.getFlags().paused, false);
  let rewards = 0;
  game.rewarded(() => rewards++);
  game.rewarded(() => rewards++);
  assert.equal(adRequests, 1, "Repeated clicks cannot open a second ad");
  callbacks.onRewarded();
  callbacks.onRewarded();
  assert.equal(rewards, 1, "Reward callback is idempotent");
  callbacks.onClose();
  assert.equal(game.getFlags().paused, false);
  game.rewarded(() => (game.getState().boostUntil = clock + 120000));
  await tick(2000);
  callbacks.onRewarded();
  await tick(1000);
  callbacks.onClose();
  assert.equal(
    game.getState().boostUntil - clock,
    119000,
    "A bonus created during an ad must not be extended by the earlier ad time",
  );
  game.rewarded(() => rewards++);
  callbacks.onError();
  callbacks.onClose();
  assert.equal(rewards, 1, "Error or close without reward cannot grant coins");
  assert.equal(
    game.getFlags().paused,
    false,
    "Ad errors release the game pause",
  );
  game.setPlayer({
    setData: async (data, flush) =>
      calls.push({ at: clock, data: JSON.parse(JSON.stringify(data)), flush }),
  });
  game.getState().coins = 10;
  game.getState().homePurchases = ["tv"];
  game.save({ cloudNow: true });
  await tick(0);
  for (let n = 0; n < 45; n++) {
    game.getState().coins++;
    game.save({ cloudNow: true });
    await tick(100);
  }
  assert.equal(
    calls.length,
    1,
    "Cloud writes are limited even for flush requests",
  );
  assert.equal(
    calls[0].data.grandmaGardenSaveV2.coins,
    10,
    "Queued snapshots cannot mutate in flight",
  );
  assert.deepEqual(
    calls[0].data.grandmaGardenSaveV2.homePurchases,
    ["tv"],
    "Permanent home purchases are included in cloud snapshots",
  );
  await tick(500);
  assert.equal(
    calls.length,
    2,
    "Continuous play cannot postpone cloud sync forever",
  );
  assert.equal(
    calls[1].data.grandmaGardenSaveV2.coins,
    55,
    "Trailing sync contains the latest state",
  );
  assert.equal(
    JSON.parse(saved.get("grandma-garden-save-v2")).coins,
    55,
    "Local save is immediate",
  );
  game.setPlayer(null);
  game.offerOffline(123);
  const offline = game.sanitize(
    JSON.parse(saved.get("grandma-garden-save-v2")),
  );
  assert.equal(
    offline.pendingOfflineCoins,
    123,
    "Unclaimed offline income survives reload",
  );
  game.setState(offline);
  game.offerOffline(offline.pendingOfflineCoins);
  const before = game.getState().coins;
  game.collectOffline(1);
  game.collectOffline(1);
  assert.equal(
    game.getState().coins,
    before + 123,
    "Offline income can only be claimed once",
  );
  assert.equal(game.getState().pendingOfflineCoins, 0);
  saved.clear();
  Object.assign(game.getState(), game.localSave());
  assert.equal(
    game.getState().lastSavedAt,
    0,
    "Missing local save must not outrank existing cloud data",
  );
  const remote = game.defaults();
  remote.coins = 987;
  remote.lastSavedAt = clock - 1000;
  context.window.ysdk.getPlayer = async () => ({
    getData: async () => ({ grandmaGardenSaveV2: remote }),
  });
  assert.equal(await game.initPlayer(), true);
  assert.equal(game.getState().coins, 987);
  game.setPlayer(null);
  let resolveRemote;
  const delayedRemote = new Promise((resolve) => (resolveRemote = resolve));
  context.window.ysdk.getPlayer = async () => ({
    getData: () => delayedRemote,
  });
  const importing = game.initPlayer();
  game.getState().coins = 42;
  game.save();
  resolveRemote({
    grandmaGardenSaveV2: { ...remote, coins: 9999, lastSavedAt: clock + 1000 },
  });
  assert.equal(
    await importing,
    false,
    "Late cloud response cannot overwrite fresh local actions",
  );
  assert.equal(game.getState().coins, 42);
  game.setPlayer(null);
  context.window.ysdk.getPlayer = async () => ({
    getData: async () => ({
      grandmaGardenSaveV2: { ...remote, coins: 7, lastSavedAt: clock - 100000 },
    }),
  });
  game.forceCloudImport();
  assert.equal(await game.initPlayer(), true);
  assert.equal(
    game.getState().coins,
    7,
    "Explicit account selection takes precedence over a newer local timestamp",
  );
  game.setPlayer(null);
  assert.equal(game.sanitize({ coins: Infinity, seeds: NaN }).coins, 0);
  assert.equal(
    game
      .sanitize({ version: 1, cropIndex: 4, seasonHarvests: 50 })
      .purchasedCrops.includes("pumpkin"),
    true,
    "v1 migration preserves unlocked crops",
  );
  game.setInteractive(false);
  game.markReady();
  assert.equal(readyCalls, 0);
  let decoded = false,
    resolveDecode;
  context.document.images = [
    {
      complete: false,
      decode: () =>
        new Promise(
          (resolve) =>
            (resolveDecode = () => {
              decoded = true;
              resolve();
            }),
        ),
    },
  ];
  const loading = game.loadVisibleAssets();
  assert.equal(decoded, false);
  resolveDecode();
  await loading;
  context.document.images = [
    {
      complete: false,
      decode: () => Promise.reject(new Error("Missing sprite")),
    },
  ];
  await assert.rejects(
    game.loadVisibleAssets(),
    /Missing sprite/,
    "Broken startup assets must not be reported ready",
  );
  game.setInteractive(true);
  game.markReady();
  game.markReady();
  assert.equal(
    readyCalls,
    1,
    "Game Ready is sent once and only after readiness",
  );
  assert.ok(
    Buffer.byteLength(JSON.stringify(game.getState())) < 200000,
    "Save payload stays below the SDK data limit",
  );
  let redirected = "";
  context.URL = URL;
  context.location.href = "http://127.0.0.1:4174/";
  context.window.location = { replace: (url) => (redirected = url) };
  handlers["account-open"]();
  assert.equal(game.getFlags().paused, true);
  handlers["account-close"]();
  assert.equal(
    new URL(redirected).searchParams.get("restore-cloud"),
    "1",
    "Account selection reload must explicitly prefer the selected cloud progress",
  );
  console.log(
    "PASS: rewarded growth ×2/120s, click+auto, independent harvest bonus, fertilizer stacking, expiration/pause/reload/offline overlap; SDK ads/cloud/image readiness",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
