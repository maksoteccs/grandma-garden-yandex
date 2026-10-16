const assert = require("node:assert/strict");
const { game, context, nodes, saved } = require("./economy-smoke.cjs");
const baseQuery = context.document.querySelectorAll;
context.document.querySelectorAll = (selector) =>
  selector === ".modal-backdrop"
    ? [
        "home-modal",
        "collection-modal",
        "prestige-modal",
        "settings-modal",
        "offline-modal",
      ]
        .map((id) => nodes.get(id))
        .filter(Boolean)
    : baseQuery(selector);
const normal = game.defaults();
assert.deepEqual(Array.from(normal.homePurchases), []);
assert.equal(game.homeDefs.length, 6);
assert.equal(new Set(game.homeDefs.map((x) => x.id)).size, 6);
assert.ok(
  game.homeDefs.every(
    (x, i, a) => x.price > 0 && (!i || x.price > a[i - 1].price),
  ),
);
assert.deepEqual(
  Array.from(game.sanitize({ version: 6 }).homePurchases),
  [],
  "Old saves do not receive accidental purchases",
);
assert.deepEqual(
  Array.from(
    game.sanitize({ homePurchases: ["tv", "tv", "unknown", null, "sofa"] })
      .homePurchases,
  ),
  ["tv", "sofa"],
  "Only unique known home items are accepted",
);
assert.deepEqual(
  Array.from(game.sanitize({ homePurchases: { tv: true } }).homePurchases),
  [],
  "Malformed purchases are ignored",
);
let state = game.defaults();
state.coins = 4999;
game.setState(state);
game.requestHomePurchase("tv");
game.buyHome("tv");
assert.equal(game.getState().coins, 4999);
assert.equal(
  game.getState().homePurchases.length,
  0,
  "Insufficient funds do not grant an item",
);
state.coins = 5000;
game.setState(state);
game.openHome();
assert.equal(
  game.getFlags().paused,
  true,
  "Opening the home shop pauses garden clicks",
);
game.requestHomePurchase("tv");
assert.equal(game.getPendingHome(), "tv");
assert.equal(
  game.getState().coins,
  5000,
  "First click asks for confirmation and does not debit",
);
assert.equal(nodes.get("home-confirmation").hidden, false);
game.cancelHomePurchase();
assert.equal(game.getPendingHome(), null);
assert.equal(game.getState().coins, 5000, "Cancel preserves the wallet");
game.requestHomePurchase("tv");
game.buyHome(game.getPendingHome());
assert.equal(game.getState().coins, 0);
assert.deepEqual(Array.from(game.getState().homePurchases), ["tv"]);
game.getState().coins = 6000;
game.buyHome("tv");
game.buyHome("not-real");
assert.equal(
  game.getState().coins,
  6000,
  "Duplicate/invalid requests cannot spend coins",
);
assert.equal(game.getState().homePurchases.length, 1);
assert.match(nodes.get("home-list").innerHTML, /home-item is-owned/);
assert.match(
  nodes.get("home-granny-message").textContent,
  /экран/i,
  "Purchase has its own granny thank-you",
);
let restored = game.sanitize(JSON.parse(saved.get("grandma-garden-save-v2")));
assert.deepEqual(
  Array.from(restored.homePurchases),
  ["tv"],
  "Purchase is saved immediately",
);
game.setState(restored);
game.getState().seasonCoins = 3500;
game.getState().seasonHarvests = 120;
game.prestige();
assert.equal(game.getState().season, 2);
assert.deepEqual(
  Array.from(game.getState().homePurchases),
  ["tv"],
  "Furniture survives a new season",
);
assert.equal(game.getState().coins, 0);
restored = game.sanitize(JSON.parse(saved.get("grandma-garden-save-v2")));
assert.deepEqual(
  Array.from(restored.homePurchases),
  ["tv"],
  "Permanent purchases survive season reset plus reload",
);
game.closeHome();
assert.equal(
  game.getFlags().paused,
  false,
  "Closing the shop resumes gameplay",
);
for (const item of game.homeDefs) {
  state = game.defaults();
  state.coins = item.price;
  state.seasonCoins = 100000;
  state.totalCoins = 100000;
  state.upgrades.auto = 1;
  game.setState(state);
  const beforeTap = game.tapPower(),
    beforeAuto = game.autoPower(),
    beforeYield = game.reward(game.getState().beds[0]);
  game.buyHome(item.id);
  assert.equal(
    game.getState().coins,
    0,
    `${item.id}: exactly the listed price`,
  );
  assert.equal(game.getState().homePurchases.includes(item.id), true);
  assert.equal(
    game.getState().seasonCoins,
    100000,
    "Spending does not erase earned season progress",
  );
  assert.equal(game.getState().totalCoins, 100000);
  assert.equal(game.tapPower(), beforeTap);
  assert.equal(game.autoPower(), beforeAuto);
  assert.equal(
    game.reward(game.getState().beds[0]),
    beforeYield,
    "Cosmetic purchases cannot inflate the economy",
  );
}
console.log(
  "PASS: home shop confirmation/cancel/exact prices/no duplicates, legacy+malformed saves, season+reload persistence, pause/resume, no economy multipliers",
);
