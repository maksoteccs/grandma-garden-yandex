(() => {
  "use strict";
  const SAVE_KEY = "grandma-garden-save-v2",
    CLOUD_KEY = "grandmaGardenSaveV2",
    CLOUD_DELAY = 5000,
    OFFLINE_CAP = 14400,
    MAX_BEDS = 3,
    MEGA_INTERVAL = 180000,
    MEGA_DURATION = 3000,
    MEGA_HITS = 8;
  const crops = [
    {
      id: "radish",
      ru: "Редиска",
      en: "Radish",
      value: 12,
      need: 16,
      unlock: 0,
      color: "#e94d6d",
    },
    {
      id: "carrot",
      ru: "Морковь",
      en: "Carrot",
      value: 32,
      need: 25,
      unlock: 5,
      color: "#f17d22",
    },
    {
      id: "cabbage",
      ru: "Капуста",
      en: "Cabbage",
      value: 78,
      need: 39,
      unlock: 14,
      color: "#83c74f",
    },
    {
      id: "tomato",
      ru: "Помидор",
      en: "Tomato",
      value: 180,
      need: 58,
      unlock: 28,
      color: "#ed4637",
    },
    {
      id: "pumpkin",
      ru: "Тыква",
      en: "Pumpkin",
      value: 430,
      need: 86,
      unlock: 50,
      color: "#ef8527",
    },
    {
      id: "watermelon",
      ru: "Арбуз",
      en: "Watermelon",
      value: 960,
      need: 125,
      unlock: 80,
      color: "#58ad4d",
    },
    {
      id: "magic",
      ru: "Чудо-овощ",
      en: "Wonder Crop",
      value: 2400,
      need: 180,
      unlock: 120,
      color: "#aa58d4",
    },
    // Append IDs to preserve cropIndex in existing local and cloud saves.
    {
      id: "cucumber",
      ru: "Огурец",
      en: "Cucumber",
      value: 115,
      need: 48,
      unlock: Infinity,
      color: "#5c9d35",
    },
    {
      id: "beet",
      ru: "Свёкла",
      en: "Beetroot",
      value: 270,
      need: 70,
      unlock: Infinity,
      color: "#b33c69",
    },
    {
      id: "pepper",
      ru: "Перец",
      en: "Pepper",
      value: 640,
      need: 104,
      unlock: Infinity,
      color: "#e8b534",
    },
    {
      id: "corn",
      ru: "Кукуруза",
      en: "Corn",
      value: 1500,
      need: 150,
      unlock: Infinity,
      color: "#edbc3e",
    },
    {
      id: "broccoli",
      ru: "Брокколи",
      en: "Broccoli",
      value: 3800,
      need: 215,
      unlock: Infinity,
      color: "#41893f",
    },
    {
      id: "zucchini",
      ru: "Кабачок",
      en: "Zucchini",
      value: 6000,
      need: 265,
      unlock: Infinity,
      color: "#9abd63",
    },
  ];
  // Seed licences last one season. Early tools stay affordable; each new crop is a savings goal.
  const cropPurchasePrices = [
    0, 360, 1500, 6000, 22000, 80000, 280000, 3000, 12000, 42000, 140000,
    480000, 850000,
  ];
  crops.forEach((c, i) => (c.purchasePrice = cropPurchasePrices[i]));
  const cropOrder = crops
    .map((_, i) => i)
    .sort((a, b) => crops[a].purchasePrice - crops[b].purchasePrice);
  const homeDefs = [
    {
      id: "tv",
      price: 5000,
      ru: "Новый телевизор",
      en: "New television",
      ruDesc: "Любимые сериалы — теперь на большом экране.",
      enDesc: "Her favourite shows, now on a big screen.",
      ruThanks: "Вот это экран! Теперь соседку в сериале издалека узнаю!",
      enThanks:
        "What a screen! Now I can see every detail in my favourite shows!",
    },
    {
      id: "sofa",
      price: 18000,
      ru: "Мягкий диван",
      en: "Cosy sofa",
      ruDesc: "Отдохнуть после огорода и принять внуков.",
      enDesc: "Rest after gardening, with room for the grandkids.",
      ruThanks: "На таком диване и помидоры бы полежали!",
      enThanks: "Even the tomatoes would love a rest on this sofa!",
    },
    {
      id: "fridge",
      price: 65000,
      ru: "Новый холодильник",
      en: "New refrigerator",
      ruDesc: "Побольше места для домашних заготовок.",
      enDesc: "More room for delicious homemade preserves.",
      ruThanks: "Теперь все баночки поместятся. Ну, почти все!",
      enThanks: "Now all my jars will fit. Well, almost all!",
    },
    {
      id: "kitchen",
      price: 220000,
      ru: "Уютная кухня",
      en: "Cosy kitchen",
      ruDesc: "Готовить пироги и варенье стало ещё приятнее.",
      enDesc: "A lovely place to bake pies and make jam.",
      ruThanks: "Заходи на пироги! Новую кухню надо обжить!",
      enThanks: "Come over for pie! Let's make this kitchen feel like home!",
    },
    {
      id: "renovation",
      price: 750000,
      ru: "Евроремонт",
      en: "Home renovation",
      ruDesc: "Новые окна, светлые стены и тёплый паркет.",
      enDesc: "New windows, bright walls and warm oak floors.",
      ruThanks: "Вот теперь дворец! Только тапочки у порога снимай!",
      enThanks: "It's a palace now! Just leave your muddy boots at the door!",
    },
    {
      id: "terrace",
      price: 2400000,
      ru: "Терраса мечты",
      en: "Dream terrace",
      ruDesc: "Чай с внуками и вид на любимый огород.",
      enDesc: "Tea with the grandkids, overlooking the garden.",
      ruThanks: "Весь урожай того стоил. Садись, чай уже готов!",
      enThanks: "Every harvest was worth it. Sit down, the tea is ready!",
    },
  ];
  const upgradeDefs = [
    {
      id: "water",
      icon: "hose",
      ru: "Улучшить шланг",
      en: "Upgrade the hose",
      ruDesc: "+1 к росту за клик",
      enDesc: "+1 growth per click",
      cost: 24,
      mult: 1.72,
    },
    {
      id: "auto",
      icon: "auto-water",
      ru: "Автополив",
      en: "Auto-watering",
      ruDesc: "+0,3 роста/сек на грядку",
      enDesc: "+0.3 growth/sec per bed",
      cost: 90,
      mult: 1.86,
    },
    {
      id: "value",
      icon: "market-basket",
      ru: "Рыночная корзина",
      en: "Market basket",
      ruDesc: "+40% к цене урожая",
      enDesc: "+40% harvest value",
      cost: 130,
      mult: 1.9,
    },
    {
      id: "beds",
      icon: "garden-bed",
      ru: "Новая грядка",
      en: "New garden bed",
      ruDesc: "Ещё одна культура одновременно",
      enDesc: "Grow one more crop at once",
      cost: 320,
      mult: 8,
      max: 2,
    },
  ];
  const i18n = {
    ru: {
      brand: "Огород бабушки",
      home: "Дом бабушки",
      homeKicker: "Урожай ради уюта",
      homeIntro: "Порадуй бабушку покупками за монеты с огорода.",
      homePermanent:
        "Покупки навсегда · сохраняются между сезонами · без бонусов к росту",
      homeProgress: "Уют дома: {n} из {total}",
      homeBalance: "В кошельке",
      homeOwned: "Куплено",
      homeBuy: "Купить",
      homeShort: "Не хватает {n} монет",
      homeConfirm: "Купить «{name}» за {n} монет?",
      homeConfirmBuy: "Да, порадовать бабушку",
      homeCancel: "Пока не покупать",
      homePurchased: "Для бабушки: {name}!",
      homeGranny: "Урожай — хорошо, а уютный дом — ещё лучше!",
      homeForever: "Останется в новом сезоне",
      newSeason: "Новый сезон",
      season: "Сезон",
      weedAlert: "На грядке сорняки!",
      weedNotice: "Сорняки!",
      plantOn: "Посадить на грядку",
      gardenPower: "МОЩЬ ОГОРОДА",
      upgrades: "Улучшения",
      currentTool: "Текущий инструмент",
      boost: "Урожай ×2",
      grandkids: "Помощь внуков",
      growthAdHint: "Рост ×2 · 2 мин · за видео",
      growthAdActive: "Рост ×2 · ещё {n} сек.",
      growthAdReady: "Внуки помогают! Рост ×2 на 2 минуты",
      weedRemaining: "Ещё нажатий: {n}",
      watchVideo: "Смотреть видео",
      keepSeeds: "Сохрани чудо-семена",
      startSeason: "Начать",
      fillAlbum: "Заполни альбом",
      collection: "Коллекция урожая",
      welcomeBack: "С возвращением!",
      gardenWorked: "Огород работал без тебя",
      doubleReward: "Забрать ×2 за видео",
      collect: "Забрать",
      startOver: "Начать огород заново?",
      later: "Позже",
      settings: "Настройки",
      language: "Язык",
      save: "Сохранить прогресс",
      continue: "Продолжить",
      harvests: "{n} урожаев",
      oneHarvest: "{n} урожай",
      fewHarvests: "{n} урожая",
      coins: "{n} монет",
      level: "Уровень {n}",
      buy: "{n} ●",
      prestigeNeed: "Собери ещё {n} урожаев",
      prestigeCoins: "Заработай ещё {n} монет в сезоне",
      prestigeReady: "Получишь {reward}",
      prestigeCopy:
        "Монеты, улучшения и грядки сбросятся. Все овощи, кроме редиски, нужно снова купить за монеты. Коллекция, удобрения и покупки для дома сохранятся. Ты получишь {reward}; сила семян растёт с убывающей отдачей.",
      offline: "Автополив собрал {n} монет.",
      unlocked: "Новая культура: {name}!",
      golden: "Золотой урожай! ×5",
      bought: "{name}: уровень {n}",
      notEnough: "Не хватает монет",
      saved: "Прогресс сохранён",
      adUnavailable: "Реклама пока недоступна",
      rewardReady: "Урожай ×2 на 2 минуты!",
      seasonStarted: "Сезон {n}! Урожай усилен",
      localDemo: "Тестовый бонус выдан без рекламы",
      weedRemoved: "Сорняк убран! +{n} монет",
      bedUnlocked: "Открыта грядка {n}!",
      boostActive: "Бонус ещё {n} сек.",
      tapGrowth: "+{n} роста за клик",
      discovered: "Собрано: {n}",
      goldenFound: "Золотых: {n}",
      undiscovered: "Не открыто",
      languageRu: "Русский",
      languageEn: "English",
      gardenRewards: "НАГРАДЫ ОГОРОДА",
      fertilizer: "Удобрение",
      fertilizerEffect: "×1,5 урожай и ×1,75 рост",
      fertilizerUse: "Применить",
      fertilizerActive: "Работает ещё {n} сек.",
      rewardIn: "До награды: {n}",
      claimReward: "Забрать награду",
      rewardClaimed: "Награда: +{coins} монет и удобрение!",
      noFertilizer: "Удобрения закончились",
      fertilizerStarted: "Удобрение работает 90 секунд!",
      rareHarvest: "РЕДКИЙ УРОЖАЙ",
      megaWatermelon: "МЕГА-УРОЖАЙ!",
      megaHits: "Собери ещё {n} овощей",
      megaTime: "Осталось {n} сек.",
      megaPrize: "Мега-урожай собран! +{coins} монет и +2 удобрения",
      megaMissed: "Мега-урожай упущен — в следующий раз быстрее!",
      oldHose: "Старый шланг",
      blueHose: "Усиленный шланг",
      mechanicHose: "Латунный распылитель",
      magicHose: "Чудо-шланг",
      grannyGift: "Бабушка подарила удобрение!",
      pageTitle: "Огород бабушки: Гигантский урожай",
      loadingText: "Готовим грядки…",
      gardenAria: "Огород",
      grannyAlt: "Весёлая бабушка со шлангом",
      hoseAlt: "Шланг",
      closeUpgrades: "Закрыть улучшения",
      close: "Закрыть",
      megaAria: "Собрать мега-урожай",
      newBed: "Новая грядка",
      harvestWord: "урожай",
      buyCrop: "Купить семена: {name} — {n} монет",
      unlockCrop: "Открыть",
      plantCrop: "Посадить на выбранную грядку",
      autoIncome: "Автодоход: {n} монет/с",
      buyBedHint: "Открыть посадочное место",
      autoIncomeHint: "Доход автополива без золотых урожаев",
      secondsShort: "{n}с",
      loadError:
        "Не удалось загрузить огород. Проверь соединение и попробуй снова.",
      retry: "Попробовать снова",
    },
    en: {
      brand: "Granny's Garden",
      home: "Grandma's home",
      homeKicker: "Harvest a little happiness",
      homeIntro: "Treat grandma to home comforts with garden coins.",
      homePermanent:
        "Permanent purchases · survive every season · no growth bonuses",
      homeProgress: "Home comforts: {n} of {total}",
      homeBalance: "Your wallet",
      homeOwned: "Purchased",
      homeBuy: "Buy",
      homeShort: "Need {n} more coins",
      homeConfirm: "Buy {name} for {n} coins?",
      homeConfirmBuy: "Yes, treat grandma",
      homeCancel: "Not now",
      homePurchased: "For grandma: {name}!",
      homeGranny: "A good harvest is lovely. A cosy home is even better!",
      homeForever: "Kept in every new season",
      newSeason: "New season",
      season: "Season",
      weedAlert: "Weeds in the garden!",
      weedNotice: "Weeds!",
      plantOn: "Plant in garden bed",
      gardenPower: "GARDEN POWER",
      upgrades: "Upgrades",
      currentTool: "Current tool",
      boost: "Harvest ×2",
      grandkids: "Grandkids' help",
      growthAdHint: "Growth ×2 · 2 min · watch video",
      growthAdActive: "Growth ×2 · {n}s left",
      growthAdReady: "Grandkids are helping! Growth ×2 for 2 minutes",
      weedRemaining: "Taps left: {n}",
      watchVideo: "Watch video",
      keepSeeds: "Keep wonder seeds",
      startSeason: "Start",
      fillAlbum: "Fill the album",
      collection: "Harvest collection",
      welcomeBack: "Welcome back!",
      gardenWorked: "Your garden kept working",
      doubleReward: "Claim ×2 for video",
      collect: "Claim",
      startOver: "Start the garden over?",
      later: "Later",
      settings: "Settings",
      language: "Language",
      save: "Save progress",
      continue: "Continue",
      harvests: "{n} harvests",
      oneHarvest: "{n} harvest",
      fewHarvests: "{n} harvests",
      coins: "{n} coins",
      level: "Level {n}",
      buy: "{n} ●",
      prestigeNeed: "Harvest {n} more crops",
      prestigeCoins: "Earn {n} more coins this season",
      prestigeReady: "You will get {reward}",
      prestigeCopy:
        "Coins, upgrades and beds reset. Buy every crop except radish again with coins. Your collection, fertilizer and home purchases stay. You will get {reward}; seed power has diminishing returns.",
      offline: "Auto-watering collected {n} coins.",
      unlocked: "New crop: {name}!",
      golden: "Golden harvest! ×5",
      bought: "{name}: level {n}",
      notEnough: "Not enough coins",
      saved: "Progress saved",
      adUnavailable: "Ads are unavailable right now",
      rewardReady: "Harvest ×2 for 2 minutes!",
      seasonStarted: "Season {n}! Harvest bonus increased",
      localDemo: "Test reward granted without an ad",
      weedRemoved: "Weed removed! +{n} coins",
      bedUnlocked: "Garden bed {n} unlocked!",
      boostActive: "Bonus: {n}s left",
      tapGrowth: "+{n} growth per click",
      discovered: "Harvested: {n}",
      goldenFound: "Golden: {n}",
      undiscovered: "Not discovered",
      languageRu: "Русский",
      languageEn: "English",
      gardenRewards: "GARDEN REWARDS",
      fertilizer: "Fertilizer",
      fertilizerEffect: "×1.5 harvest and ×1.75 growth",
      fertilizerUse: "Use",
      fertilizerActive: "Active for {n}s",
      rewardIn: "Reward in: {n}",
      claimReward: "Claim reward",
      rewardClaimed: "Reward: +{coins} coins and fertilizer!",
      noFertilizer: "No fertilizer left",
      fertilizerStarted: "Fertilizer is active for 90 seconds!",
      rareHarvest: "RARE HARVEST",
      megaWatermelon: "MEGA HARVEST!",
      megaHits: "Collect {n} more crops",
      megaTime: "{n}s left",
      megaPrize: "Mega harvest collected! +{coins} coins and +2 fertilizer",
      megaMissed: "Mega harvest missed — be faster next time!",
      oldHose: "Old garden hose",
      blueHose: "Reinforced hose",
      mechanicHose: "Brass sprayer",
      magicHose: "Wonder hose",
      grannyGift: "Granny gave you fertilizer!",
      pageTitle: "Granny's Garden: Giant Harvest",
      loadingText: "Preparing the beds…",
      gardenAria: "Garden",
      grannyAlt: "Cheerful granny with a garden hose",
      hoseAlt: "Garden hose",
      closeUpgrades: "Close upgrades",
      close: "Close",
      megaAria: "Collect the mega harvest",
      newBed: "New bed",
      harvestWord: "harvest",
      buyCrop: "Buy seeds: {name} — {n} coins",
      unlockCrop: "Unlock",
      plantCrop: "Plant in the selected bed",
      autoIncome: "Auto income: {n} coins/s",
      buyBedHint: "Unlock planting space",
      autoIncomeHint: "Auto income excluding golden harvests",
      secondsShort: "{n}s",
      loadError:
        "The garden could not load. Check your connection and try again.",
      retry: "Try again",
    },
  };
  const grannyQuips = {
    ru: [
      "Шланг — это лейка с интернетом!",
      "Сорняки? Это салат, который сопротивляется.",
      "Арбуз видел? Он меня боится.",
      "Не трогай помидоры — они стесняются.",
      "Главный секрет урожая: хвалить кабачки.",
      "Я не колдую. Почти.",
      "Внучек, кликай увереннее!",
    ],
    en: [
      "A hose is just a watering can with Wi-Fi!",
      "Weeds? That is salad fighting back.",
      "The watermelon is scared of me.",
      "Do not stare at the tomatoes. They are shy.",
      "Compliment the vegetables. It works.",
      "I never use magic. Almost never.",
      "Tap with confidence, dear!",
    ],
  };
  const emptyBed = (i = 0) => ({
    cropIndex: i,
    growth: 0,
    golden: false,
    weedHp: 0,
    nextWeedAt: Date.now() + 22000 + Math.random() * 25000,
  });
  function record(entries) {
    const result = {};
    for (const [key, value] of entries) result[key] = value;
    return result;
  }
  const defaults = () => ({
    version: 6,
    purchasedCrops: ["radish"],
    homePurchases: [],
    coins: 0,
    pendingOfflineCoins: 0,
    totalCoins: 0,
    seasonCoins: 0,
    seasonHarvests: 0,
    lifetimeHarvests: 0,
    season: 1,
    seeds: 0,
    fertilizer: 0,
    fertilizerUntil: 0,
    nextRewardAt: 8,
    megaNextAt: Date.now() + MEGA_INTERVAL,
    grannyTaps: 0,
    grannyGiftClaimed: false,
    bedsCount: 1,
    selectedBed: 0,
    beds: [emptyBed(0), emptyBed(0), emptyBed(0)],
    upgrades: { water: 0, auto: 0, value: 0, beds: 0 },
    collection: record(crops.map((c) => [c.id, 0])),
    goldenCollection: record(crops.map((c) => [c.id, 0])),
    boostUntil: 0,
    growthBoostUntil: 0,
    lastSavedAt: Date.now(),
    languageOverride: null,
  });
  let state = defaults(),
    lang = "ru",
    player = null,
    cloudTimer = null,
    grannyBubbleTimer = null,
    megaTimer = null,
    initialized = false,
    paused = false,
    gameplay = false,
    rewardedActive = false,
    offlineReward = 0,
    megaHp = 0,
    megaDeadline = 0,
    lastHudSecond = -1,
    lastMegaCheck = 0,
    lastTick = performance.now(),
    readySent = false;
  const el = {},
    htmlCache = {};
  const ids = [
    "home-button",
    "home-modal",
    "home-close",
    "home-list",
    "home-wallet",
    "home-progress-label",
    "home-progress",
    "home-progress-fill",
    "home-granny-message",
    "home-confirmation",
    "home-confirm-copy",
    "home-confirm-button",
    "home-cancel-button",
    "loading-screen",
    "game",
    "coins-value",
    "seeds-value",
    "season-label",
    "income-label",
    "beds-container",
    "effects-layer",
    "dock-bed-label",
    "harvest-count",
    "crop-list",
    "total-beds-label",
    "watering-can-image",
    "watering-can-name",
    "watering-can-level",
    "tap-power-label",
    "upgrade-list",
    "boost-button",
    "boost-label",
    "growth-boost-button",
    "growth-boost-label",
    "prestige-description",
    "prestige-button",
    "collection-button",
    "collection-modal",
    "collection-close",
    "collection-list",
    "offline-modal",
    "offline-copy",
    "offline-double",
    "offline-collect",
    "prestige-modal",
    "prestige-copy",
    "prestige-confirm",
    "prestige-cancel",
    "settings-button",
    "settings-modal",
    "settings-close-x",
    "language-toggle",
    "save-button",
    "settings-close",
    "toast-stack",
    "mobile-upgrades-button",
    "mobile-upgrades-close",
    "upgrades-panel",
    "panel-scrim",
    "fertilizer-count",
    "fertilizer-label",
    "reward-button",
    "fertilizer-button",
    "mega-watermelon",
    "mega-watermelon-hit",
    "mega-watermelon-label",
    "mega-watermelon-progress",
    "mega-timer-label",
    "mega-timer-progress",
    "granny-art",
    "granny-bubble",
    "bed-status-list",
    "income-rate",
  ];
  function cache() {
    ids.forEach((id) => (el[id] = document.getElementById(id)));
  }
  function tr(k, v = {}) {
    let s = i18n[lang][k] ?? i18n.ru[k] ?? k;
    Object.entries(v).forEach(([a, b]) => (s = s.split(`{${a}}`).join(b)));
    return s;
  }
  function fmt(v) {
    if (!Number.isFinite(v)) return "0";
    for (const [s, n] of [
      ["T", 1e12],
      ["B", 1e9],
      ["M", 1e6],
      ["K", 1e3],
    ])
      if (Math.abs(v) >= n)
        return `${(v / n).toFixed(v / n >= 100 ? 0 : v / n >= 10 ? 1 : 2).replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1")}${s}`;
    return Math.floor(v).toLocaleString(lang === "ru" ? "ru-RU" : "en-US");
  }
  function fmtDec(v) {
    return v >= 1000
      ? fmt(v)
      : (Math.floor(v * 100) / 100).toLocaleString(
          lang === "ru" ? "ru-RU" : "en-US",
          { maximumFractionDigits: 2 },
        );
  }
  function harvestWord(n) {
    if (lang !== "ru") return tr(n === 1 ? "oneHarvest" : "harvests", { n });
    let a = n % 10,
      b = n % 100;
    return tr(
      a === 1 && b !== 11
        ? "oneHarvest"
        : a >= 2 && a <= 4 && !(b >= 12 && b <= 14)
          ? "fewHarvests"
          : "harvests",
      { n },
    );
  }
  function seedRewardText(n) {
    if (lang !== "ru") return `${n} wonder seed${n === 1 ? "" : "s"}`;
    let a = n % 10,
      b = n % 100,
      word =
        a === 1 && b !== 11
          ? "чудо-семя"
          : a >= 2 && a <= 4 && !(b >= 12 && b <= 14)
            ? "чудо-семени"
            : "чудо-семян";
    return `${n} ${word}`;
  }
  function sanitize(raw) {
    const b = defaults();
    if (!raw || typeof raw !== "object") return b;
    if (raw.version === 1) {
      b.coins = raw.coins || 0;
      b.totalCoins = raw.totalCoins || 0;
      b.seasonHarvests = raw.seasonHarvests || 0;
      b.lifetimeHarvests = raw.lifetimeHarvests || 0;
      b.season = raw.season || 1;
      b.seeds = raw.seeds || 0;
      b.beds[0] = {
        ...emptyBed(raw.cropIndex || 0),
        growth: raw.growth || 0,
        golden: !!raw.currentGolden,
      };
      b.upgrades = { ...b.upgrades, ...raw.upgrades };
      b.collection = { ...b.collection, ...raw.collection };
      b.goldenCollection = { ...b.goldenCollection, ...raw.goldenCollection };
      b.boostUntil = raw.boostUntil || 0;
      b.lastSavedAt = raw.lastSavedAt || Date.now();
      return sanitize({ ...b, version: 5, purchasedCrops: undefined });
    }
    let x = { ...b, ...raw },
      oldMega = Number(raw.megaNextAt),
      nonNegative = (v) =>
        Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : 0,
      whole = (v) => Math.floor(nonNegative(v));
    x.version = 6;
    x.coins = nonNegative(x.coins);
    x.pendingOfflineCoins = nonNegative(x.pendingOfflineCoins);
    x.totalCoins = nonNegative(x.totalCoins);
    x.seasonCoins = nonNegative(x.seasonCoins);
    x.seasonHarvests = whole(x.seasonHarvests);
    x.lifetimeHarvests = Math.max(x.seasonHarvests, whole(x.lifetimeHarvests));
    x.season = Math.max(1, whole(x.season) || 1);
    x.seeds = nonNegative(x.seeds);
    x.fertilizer = whole(x.fertilizer);
    x.fertilizerUntil = nonNegative(x.fertilizerUntil);
    x.nextRewardAt = Math.max(1, whole(x.nextRewardAt) || 8);
    x.megaNextAt =
      raw.version >= 5 && Number.isFinite(oldMega) && oldMega > 1e12
        ? oldMega
        : Date.now() + MEGA_INTERVAL;
    x.grannyTaps = whole(x.grannyTaps);
    x.boostUntil = nonNegative(x.boostUntil);
    x.growthBoostUntil = nonNegative(x.growthBoostUntil);
    x.homePurchases = Array.isArray(raw.homePurchases)
      ? homeDefs
          .filter((item) => raw.homePurchases.includes(item.id))
          .map((item) => item.id)
      : [];
    x.lastSavedAt = nonNegative(x.lastSavedAt) || Date.now();
    x.upgrades = record(
      Object.keys(b.upgrades).map((k) => [
        k,
        Math.min(k === "beds" ? 2 : 999, whole(raw.upgrades?.[k])),
      ]),
    );
    x.collection = record(
      crops.map((c) => [c.id, whole(raw.collection?.[c.id])]),
    );
    x.goldenCollection = record(
      crops.map((c) => [c.id, whole(raw.goldenCollection?.[c.id])]),
    );
    x.beds = [0, 1, 2].map((i) => {
      let r = raw.beds?.[i] || {},
        cropIndex = Math.min(crops.length - 1, Math.max(0, whole(r.cropIndex))),
        nextWeedAt = Number(r.nextWeedAt);
      return {
        cropIndex,
        growth: nonNegative(r.growth),
        golden: !!r.golden,
        weedHp: Math.min(3, whole(r.weedHp)),
        nextWeedAt:
          Number.isFinite(nextWeedAt) && nextWeedAt > 0
            ? nextWeedAt
            : Date.now() + 22000 + Math.random() * 25000,
      };
    });
    x.bedsCount = Math.min(MAX_BEDS, Math.max(1, whole(x.bedsCount) || 1));
    x.selectedBed = Math.min(
      x.bedsCount - 1,
      Math.max(0, whole(x.selectedBed)),
    );
    x.purchasedCrops = Array.isArray(raw.purchasedCrops)
      ? crops
          .filter((c) => c.id === "radish" || raw.purchasedCrops.includes(c.id))
          .map((c) => c.id)
      : crops
          .filter(
            (c, i) =>
              i === 0 ||
              (raw.version < 6 && x.seasonHarvests >= c.unlock) ||
              x.collection[c.id] > 0 ||
              x.beds.some((b) => b.cropIndex === i),
          )
          .map((c) => c.id);
    x.beds.forEach((b) => {
      if (!x.purchasedCrops.includes(crops[b.cropIndex].id)) b.cropIndex = 0;
    });
    return x;
  }
  let cloudDirty = false,
    cloudFlush = false,
    cloudInFlight = false,
    lastCloudSentAt = -Infinity,
    stateRevision = 0;
  let preferCloudOnce =
    typeof location.search === "string" &&
    /(?:^|[?&])restore-cloud=1(?:&|$)/.test(location.search);
  let platformPaused = false,
    accountSwitching = false,
    externalPauseAt = null,
    externalPauseTimers = null,
    platformSdk = null,
    interactiveReady = false;
  let bedCropNodes = [],
    lastBoostSecond = -1,
    lastGrowthBoostSecond = -1;
  const localDemo =
    typeof __GARDEN_DEV__ === "undefined"
      ? ["localhost", "127.0.0.1", ""].includes(location.hostname)
      : __GARDEN_DEV__;
  function localSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return sanitize(JSON.parse(raw));
    } catch (e) {
      console.warn(e);
    }
    return { ...defaults(), lastSavedAt: 0 };
  }
  function save({ cloudNow = false, toastIt = false } = {}) {
    state.lastSavedAt = Date.now();
    stateRevision++;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn(e);
    }
    if (toastIt) toast(tr("saved"));
    queueCloudSave(cloudNow);
  }
  function queueCloudSave(flush = false) {
    if (!player || accountSwitching) return;
    cloudDirty = true;
    cloudFlush = cloudFlush || flush;
    if (cloudInFlight || cloudTimer !== null) return;
    const delay = Math.max(0, CLOUD_DELAY - (Date.now() - lastCloudSentAt));
    if (!delay) void sendCloudSave();
    else cloudTimer = setTimeout(sendCloudSave, delay);
  }
  async function sendCloudSave() {
    cloudTimer = null;
    if (!player || accountSwitching || cloudInFlight || !cloudDirty) return;
    const snapshot = JSON.parse(JSON.stringify(state)),
      flush = cloudFlush;
    cloudDirty = false;
    cloudFlush = false;
    cloudInFlight = true;
    lastCloudSentAt = Date.now();
    try {
      await player.setData({ [CLOUD_KEY]: snapshot }, flush);
    } catch (e) {
      cloudDirty = true;
      cloudFlush = cloudFlush || flush;
      console.warn(e);
    } finally {
      cloudInFlight = false;
      if (cloudDirty) queueCloudSave();
    }
  }
  async function withTimeout(promise, ms) {
    let timer;
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error("Operation timed out")),
            ms,
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
  async function initPlayer() {
    if (!window.ysdk || player) return false;
    const revision = stateRevision;
    try {
      const result = await withTimeout(
        (async () => {
          const candidate = await window.ysdk.getPlayer();
          return { candidate, data: await candidate.getData([CLOUD_KEY]) };
        })(),
        4000,
      );
      player = result.candidate;
      const remote = result.data?.[CLOUD_KEY];
      if (preferCloudOnce) {
        state = sanitize(remote || defaults());
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
          console.warn(e);
        }
        preferCloudOnce = false;
        if (window.history?.replaceState) {
          const url = new URL(location.href);
          url.searchParams.delete("restore-cloud");
          window.history.replaceState(null, "", url.href);
        }
        return true;
      }
      if (
        remote &&
        stateRevision === revision &&
        Number(remote.lastSavedAt) > state.lastSavedAt
      ) {
        state = sanitize(remote);
        return true;
      }
    } catch (e) {
      console.warn(e);
    }
    return false;
  }
  function externalPaused() {
    return (
      platformPaused || accountSwitching || document.hidden || rewardedActive
    );
  }
  function attachPlatformEvents() {
    const sdk = window.ysdk;
    if (!sdk?.on || platformSdk === sdk) return;
    platformSdk = sdk;
    sdk.on("game_api_pause", () => {
      platformPaused = true;
      if (interactiveReady) syncPause();
    });
    sdk.on("game_api_resume", () => {
      platformPaused = false;
      if (interactiveReady) syncPause();
    });
    if (sdk.EVENTS?.ACCOUNT_SELECTION_DIALOG_OPENED) {
      sdk.on(sdk.EVENTS.ACCOUNT_SELECTION_DIALOG_OPENED, () => {
        accountSwitching = true;
        clearTimeout(cloudTimer);
        cloudTimer = null;
        if (interactiveReady) syncPause();
      });
      sdk.on(sdk.EVENTS.ACCOUNT_SELECTION_DIALOG_CLOSED, () => {
        const url = new URL(location.href);
        url.searchParams.set("restore-cloud", "1");
        window.location.replace(url.href);
      });
    }
  }
  function detectLang() {
    let l =
      state.languageOverride ||
      window.ysdk?.environment?.i18n?.lang ||
      navigator.language ||
      "ru";
    lang = String(l).toLowerCase().startsWith("ru") ? "ru" : "en";
    document.documentElement.lang = lang;
  }
  function translate() {
    document.title = tr("pageTitle");
    document
      .querySelectorAll("[data-i18n]")
      .forEach((n) => (n.textContent = tr(n.dataset.i18n)));
    document
      .querySelectorAll("[data-i18n-aria]")
      .forEach((n) => n.setAttribute("aria-label", tr(n.dataset.i18nAria)));
    document
      .querySelectorAll("[data-i18n-alt]")
      .forEach((n) => (n.alt = tr(n.dataset.i18nAlt)));
    document
      .querySelectorAll("[data-i18n-title]")
      .forEach((n) => (n.title = tr(n.dataset.i18nTitle)));
    el["language-toggle"].querySelector("b").textContent =
      lang === "ru" ? tr("languageRu") : tr("languageEn");
  }
  function cropName(c) {
    return c[lang];
  }
  function maxCrop() {
    let m = 0;
    crops.forEach((c, i) => {
      if (state.purchasedCrops.includes(c.id) && c.value > crops[m].value)
        m = i;
    });
    return m;
  }
  function seedPower() {
    return Math.sqrt(Math.max(0, state.seeds));
  }
  function seedMult() {
    return 1 + seedPower() * 0.08;
  }
  function boostMult() {
    return Date.now() < state.boostUntil ? 2 : 1;
  }
  function fertilizerActive() {
    return Date.now() < state.fertilizerUntil;
  }
  function fertilizerGrowth() {
    return fertilizerActive() ? 1.75 : 1;
  }
  function growthBoostMult() {
    return Date.now() < state.growthBoostUntil ? 2 : 1;
  }
  function fertilizerValue() {
    return fertilizerActive() ? 1.5 : 1;
  }
  function tapPower() {
    return (
      (1 + state.upgrades.water) *
      (1 + seedPower() * 0.02) *
      fertilizerGrowth() *
      growthBoostMult()
    );
  }
  function autoPower() {
    return (
      state.upgrades.auto *
      0.3 *
      (1 + seedPower() * 0.015) *
      fertilizerGrowth() *
      growthBoostMult()
    );
  }
  function reward(bed) {
    return Math.round(
      crops[bed.cropIndex].value *
        (1 + state.upgrades.value * 0.4) *
        seedMult() *
        boostMult() *
        fertilizerValue() *
        (bed.golden ? 5 : 1),
    );
  }
  function cost(u) {
    return Math.floor(u.cost * Math.pow(u.mult, state.upgrades[u.id]));
  }
  function prestigeHarvestGoal() {
    let s = Math.max(0, state.season - 1);
    return 120 + Math.floor(s * 40 + Math.pow(s, 1.35) * 15);
  }
  function prestigeCoinGoal() {
    return Math.floor(3500 * Math.pow(1.65, Math.max(0, state.season - 1)));
  }
  function prestigeReward() {
    let h = prestigeHarvestGoal(),
      c = prestigeCoinGoal();
    if (state.seasonHarvests < h || state.seasonCoins < c) return 0;
    return Math.min(
      3,
      1 + Math.floor(Math.log2(Math.max(1, state.seasonCoins / c))),
    );
  }
  function newCrop(bed) {
    bed.growth = 0;
    bed.golden = Math.random() < Math.min(0.18, 0.05 + state.seeds * 0.003);
    bed.weedHp = 0;
    bed.nextWeedAt = Date.now() + 22000 + Math.random() * 30000;
  }
  function hoseTier() {
    return Math.min(4, Math.floor(state.upgrades.water / 3) + 1);
  }
  function hoseName() {
    return tr(
      ["", "oldHose", "blueHose", "mechanicHose", "magicHose"][hoseTier()],
    );
  }
  function render() {
    let bed = state.beds[state.selectedBed],
      crop = crops[bed.cropIndex];
    el["coins-value"].textContent = fmt(state.coins);
    el["seeds-value"].textContent = fmt(state.seeds);
    el["season-label"].textContent = `${tr("season")} ${state.season}`;
    el["income-label"].textContent =
      `×${seedMult().toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} ${tr("harvestWord")}`;
    el["dock-bed-label"].textContent = cropName(crop);
    el["harvest-count"].textContent = harvestWord(state.seasonHarvests);
    el["total-beds-label"].textContent = `${state.bedsCount} / ${MAX_BEDS}`;
    el["watering-can-image"].src = `assets/tools/hose-${hoseTier()}.png`;
    el["watering-can-name"].textContent = hoseName();
    el["watering-can-level"].textContent = ["", "I", "II", "III", "IV"][
      hoseTier()
    ];
    el["tap-power-label"].textContent = tr("tapGrowth", {
      n: fmtDec(tapPower()),
    });
    let sec = Math.max(0, Math.ceil((state.boostUntil - Date.now()) / 1000));
    el["boost-label"].textContent = sec
      ? tr("boostActive", { n: sec })
      : tr("watchVideo");
    renderGrowthBoost();
    if (!el["home-modal"].hidden) renderHome();
    let harvestRem = Math.max(0, prestigeHarvestGoal() - state.seasonHarvests),
      coinRem = Math.max(0, prestigeCoinGoal() - state.seasonCoins),
      pr = prestigeReward();
    el["prestige-description"].textContent = harvestRem
      ? tr("prestigeNeed", { n: harvestRem })
      : coinRem
        ? tr("prestigeCoins", { n: fmt(coinRem) })
        : tr("prestigeReady", { reward: seedRewardText(pr) });
    el["prestige-button"].disabled = !pr;
    renderBeds();
    renderCrops();
    renderUpgrades();
    renderRewards();
    renderBedStatuses();
  }
  let lastStatusUpdate = 0;
  function renderBedStatuses() {
    setHtml(
      "bed-status-list",
      [0, 1, 2]
        .map((i) => {
          if (i >= state.bedsCount)
            return `<div class="bed-status-item"><button class="bed-status-card is-locked" data-status-unlock="${i}"><span>${tr("newBed")}</span><strong>+ ${fmt(cost(upgradeDefs.find((u) => u.id === "beds")))} ●</strong><small>${tr("buyBedHint")}</small></button></div>`;
          const b = state.beds[i],
            c = crops[b.cropIndex];
          return `<div class="bed-status-item"><button class="bed-status-card" data-status-bed="${i}" aria-label="${cropName(c)}"><img src="assets/crops/${c.id}.png" alt=""><span class="bed-status-name">${cropName(c)}</span><small>${tr("coins", { n: fmt(reward(b)) })}</small><span class="bed-status-track" role="progressbar" aria-label="${cropName(c)}" aria-valuemin="0" aria-valuemax="100"><i></i><b></b></span></button><button type="button" class="bed-weed-alert" data-status-weed="${i}" hidden><img src="assets/tools/weed.png" alt=""><span><strong>${tr("weedNotice")}</strong><small></small></span></button></div>`;
        })
        .join(""),
    );
    updateBedStatuses();
  }
  function updateBedStatuses() {
    let income = 0;
    el["bed-status-list"].querySelectorAll("[data-status-bed]").forEach((n) => {
      const i = +n.dataset.statusBed,
        b = state.beds[i],
        c = crops[b.cropIndex],
        p = Math.min(100, (b.growth / c.need) * 100);
      n.classList.toggle("is-selected", i === state.selectedBed);
      n.querySelector("i").style.width = `${p}%`;
      n.querySelector("b").textContent = `${Math.floor(p)}%`;
      n.querySelector('[role="progressbar"]').setAttribute(
        "aria-valuenow",
        Math.floor(p),
      );
      const alert = el["bed-status-list"].querySelector(
        `[data-status-weed="${i}"]`,
      );
      alert.hidden = !b.weedHp;
      alert.querySelector("small").textContent = tr("weedRemaining", {
        n: b.weedHp,
      });
      alert.setAttribute(
        "aria-label",
        `${cropName(c)}: ${tr("weedAlert")} ${tr("weedRemaining", { n: b.weedHp })}`,
      );
      income +=
        ((autoPower() * (b.weedHp ? 0.25 : 1)) / c.need) *
        reward({ ...b, golden: false });
    });
    el["income-rate"].textContent = tr("autoIncome", { n: fmtDec(income) });
  }
  function waterDrops(i) {
    const crop = el["beds-container"].querySelector(
      `[data-bed="${i}"] .bed-crop`,
    );
    if (!crop) return;
    const r = crop.getBoundingClientRect(),
      stage = el["effects-layer"].getBoundingClientRect(),
      granny = el["granny-art"].getBoundingClientRect();
    if (!stage.width || !stage.height) return;
    // Anchor to the nozzle in the actual illustration, not viewport coordinates.
    const sx = granny.left + granny.width * 0.83 - stage.left,
      sy = granny.top + granny.height * 0.56 - stage.top;
    const tx = r.left + r.width * 0.5 - stage.left,
      ty = r.top + r.height * 0.7 - stage.top;
    const spread = Math.max(3, Math.min(10, r.width * 0.16)),
      reach = Math.max(12, (tx - sx) * 0.36);
    const jets = Array.from({ length: 5 }, (_, k) => {
      const dx = (k - 2) * spread * 0.5,
        d = `M ${sx} ${sy} C ${sx + reach} ${sy + 4}, ${tx + dx - 18} ${ty - 36}, ${tx + dx} ${ty}`;
      return `<path class="water-jet" d="${d}" style="--delay:${k * 14}ms"/>`;
    }).join("");
    const splashes = Array.from({ length: 8 }, (_, k) => {
      const angle = Math.PI * (1.08 + k * 0.12),
        distance = 12 + (k % 3) * 5;
      return `<circle class="water-splash" cx="${tx}" cy="${ty}" r="${k % 2 ? 1.5 : 2}" style="--splash-x:${Math.cos(angle) * distance}px;--splash-y:${Math.sin(angle) * distance}px;--delay:${230 + k * 12}ms"/>`;
    }).join("");
    const group = document.createElement("span");
    group.className = "watering-burst";
    group.dataset.wateringBed = String(i);
    group.innerHTML = `<svg viewBox="0 0 ${stage.width} ${stage.height}" preserveAspectRatio="none" aria-hidden="true"><g class="water-stream">${jets}</g><ellipse class="water-ripple" cx="${tx}" cy="${ty + 4}" rx="${spread * 1.5}" ry="${spread * 0.48}"/>${splashes}</svg>`;
    // Fast tapping must not accumulate an opaque wall of water or unbounded DOM nodes.
    const active = el["effects-layer"].querySelectorAll(".watering-burst");
    if (active.length >= 3) active[0].remove();
    el["effects-layer"].appendChild(group);
    setTimeout(() => group.remove(), 680);
  }
  function growthScale(b) {
    let p = Math.min(1, b.growth / crops[b.cropIndex].need);
    return (0.22 + 0.78 * Math.sqrt(p)).toFixed(3);
  }
  // Rebuild markup only when its structure changes; frequent updates (selection, growth, weed hits, prices) are patched in place so a button is never replaced mid-tap.
  function setHtml(key, html) {
    if (htmlCache[key] === html) return;
    htmlCache[key] = html;
    el[key].innerHTML = html;
  }
  function renderBeds() {
    setHtml(
      "beds-container",
      [0, 1, 2]
        .map((i) => {
          if (i >= state.bedsCount)
            return `<button class="bed-slot is-locked" data-locked-bed="${i}" aria-label="${tr("newBed")}"><span class="unlock-bed"><b>+</b><small>${tr("newBed")}</small></span></button>`;
          let b = state.beds[i],
            c = crops[b.cropIndex],
            hp = [0, 1, 2].map(() => "<i></i>").join("");
          return `<button class="bed-slot" data-bed="${i}" aria-label="${cropName(c)}"><img class="bed-crop" src="assets/crops/${c.id}.png" alt="${cropName(c)}"><span class="weed-button" data-weed="${i}" hidden><img src="assets/tools/weed.png" alt="${tr("weedAlert")}"><span class="weed-hp">${hp}</span></span></button>`;
        })
        .join(""),
    );
    bedCropNodes = Array.from(
      el["beds-container"].querySelectorAll("[data-bed]"),
      (n) => n.querySelector(".bed-crop"),
    );
    syncBeds();
  }
  function syncBeds() {
    el["beds-container"].querySelectorAll("[data-bed]").forEach((n) => {
      let i = +n.dataset.bed,
        b = state.beds[i];
      n.classList.toggle("is-selected", i === state.selectedBed);
      n.querySelector(".bed-crop")?.style.setProperty(
        "--growth-scale",
        growthScale(b),
      );
      let w = n.querySelector(".weed-button");
      if (w) w.hidden = !b.weedHp;
      n.querySelectorAll(".weed-hp i").forEach((h, k) =>
        h.classList.toggle("is-hit", k >= b.weedHp),
      );
    });
  }
  function renderActiveBed() {
    let b = state.beds[state.selectedBed];
    el["dock-bed-label"].textContent = cropName(crops[b.cropIndex]);
    syncBeds();
    el["crop-list"]
      .querySelectorAll("[data-crop]")
      .forEach((n) =>
        n.classList.toggle("is-selected", +n.dataset.crop === b.cropIndex),
      );
    renderBedStatuses();
  }
  function renderCrops() {
    setHtml(
      "crop-list",
      cropOrder
        .map((i) => {
          const c = crops[i];
          let owned = state.purchasedCrops.includes(c.id);
          const price = c.purchasePrice.toLocaleString(
            lang === "ru" ? "ru-RU" : "en-US",
          );
          const purchaseLabel = tr("buyCrop", { name: cropName(c), n: price });
          const overlay = owned
            ? ""
            : `<span class="crop-unlock-overlay" aria-hidden="true"><span class="crop-unlock-label">${tr("unlockCrop")}</span><span class="crop-unlock-price"><img src="assets/ui/coin.svg" alt=""><b>${price}</b></span></span>`;
          return `<button class="crop-card${owned ? "" : " is-unpurchased"}" data-crop="${i}" aria-label="${owned ? cropName(c) : purchaseLabel}" title="${owned ? tr("plantCrop") : purchaseLabel}"><img src="assets/crops/${c.id}.png" alt=""><span class="crop-card-copy"${owned ? "" : ' aria-hidden="true"'}><strong>${cropName(c)}</strong><small>${tr("coins", { n: fmt(reward({ cropIndex: i, golden: false })) })}</small></span>${overlay}</button>`;
        })
        .join(""),
    );
    let sel = state.beds[state.selectedBed].cropIndex;
    el["crop-list"]
      .querySelectorAll("[data-crop]")
      .forEach((n) =>
        n.classList.toggle("is-selected", +n.dataset.crop === sel),
      );
  }
  function upgradeMaxed(u) {
    return u.max !== undefined && state.upgrades[u.id] >= u.max;
  }
  function renderUpgrades() {
    setHtml(
      "upgrade-list",
      upgradeDefs
        .map((u) => {
          let level = state.upgrades[u.id],
            atMax = upgradeMaxed(u),
            src =
              u.icon === "hose"
                ? `assets/tools/hose-${hoseTier()}.png`
                : `assets/upgrades/${u.icon}.png`;
          return `<article class="upgrade-card"><span class="upgrade-icon"><img src="${src}" alt=""></span><span><strong>${lang === "ru" ? u.ru : u.en}</strong><small>${lang === "ru" ? u.ruDesc : u.enDesc}</small><small class="level-pill">${tr("level", { n: level })}</small></span><button class="buy-button" data-upgrade="${u.id}">${atMax ? "MAX" : tr("buy", { n: fmt(cost(u)) })}</button></article>`;
        })
        .join(""),
    );
    el["upgrade-list"].querySelectorAll("[data-upgrade]").forEach((n) => {
      let u = upgradeDefs.find((x) => x.id === n.dataset.upgrade);
      n.disabled = upgradeMaxed(u) || state.coins < cost(u);
    });
  }
  let pendingHomePurchase = null,
    lastHomePurchase = null;
  function homePrice(n) {
    return n.toLocaleString(lang === "ru" ? "ru-RU" : "en-US");
  }
  function renderHome() {
    const owned = state.homePurchases.length;
    el["home-wallet"].textContent = homePrice(Math.floor(state.coins));
    el["home-progress-label"].textContent = tr("homeProgress", {
      n: owned,
      total: homeDefs.length,
    });
    el["home-progress"].setAttribute("aria-valuenow", owned);
    el["home-progress-fill"].style.width =
      `${(owned / homeDefs.length) * 100}%`;
    const last = state.homePurchases.includes(lastHomePurchase)
      ? homeDefs.find((item) => item.id === lastHomePurchase)
      : null;
    el["home-granny-message"].textContent = last
      ? last[lang + "Thanks"]
      : tr("homeGranny");
    setHtml(
      "home-list",
      homeDefs
        .map((item) => {
          const bought = state.homePurchases.includes(item.id),
            affordable = state.coins >= item.price;
          const name = item[lang],
            price = homePrice(item.price);
          return `<article class="home-item${bought ? " is-owned" : ""}"><div class="home-item-art"><img src="assets/home/${item.id}.png" alt="" loading="lazy" width="256" height="256">${bought ? `<span class="home-owned-badge">✓ ${tr("homeOwned")}</span>` : ""}</div><h3>${name}</h3><p>${item[lang + "Desc"]}</p><button type="button" data-home-buy="${item.id}" ${bought || !affordable ? "disabled" : ""} aria-label="${bought ? `${name}: ${tr("homeOwned")}` : tr("homeConfirm", { name, n: price })}">${bought ? tr("homeOwned") : `<span>${tr("homeBuy")}</span><span class="home-item-price"><img src="assets/ui/coin.svg" alt="">${price}</span>`}</button><small class="home-item-hint">${bought ? tr("homeForever") : affordable ? "" : tr("homeShort", { n: homePrice(Math.ceil(item.price - state.coins)) })}</small></article>`;
        })
        .join(""),
    );
    renderHomeConfirmation();
  }
  function renderHomeConfirmation() {
    const item = homeDefs.find((x) => x.id === pendingHomePurchase);
    el["home-confirmation"].hidden = !item;
    if (!item) return;
    el["home-confirm-copy"].textContent = tr("homeConfirm", {
      name: item[lang],
      n: homePrice(item.price),
    });
    el["home-confirm-button"].disabled =
      state.coins < item.price || state.homePurchases.includes(item.id);
  }
  function openHome() {
    closeUpgrades();
    pendingHomePurchase = null;
    renderHome();
    showModal(el["home-modal"]);
    el["home-button"].setAttribute("aria-expanded", "true");
    el["home-close"].focus?.();
  }
  function closeHome() {
    pendingHomePurchase = null;
    hideModal(el["home-modal"]);
    el["home-button"].setAttribute("aria-expanded", "false");
    el["home-button"].focus?.();
  }
  function requestHomePurchase(id) {
    const item = homeDefs.find((x) => x.id === id);
    if (!item || externalPaused() || state.homePurchases.includes(id)) return;
    if (state.coins < item.price) return toast(tr("notEnough"));
    pendingHomePurchase = id;
    renderHomeConfirmation();
    el["home-confirm-button"].focus?.();
  }
  function buyHome(id) {
    const item = homeDefs.find((x) => x.id === id);
    if (!item || externalPaused() || state.homePurchases.includes(id)) return;
    if (state.coins < item.price) {
      renderHome();
      return toast(tr("notEnough"));
    }
    state.coins -= item.price;
    state.homePurchases.push(id);
    pendingHomePurchase = null;
    lastHomePurchase = id;
    save({ cloudNow: true });
    render();
    toast(tr("homePurchased", { name: item[lang] }));
    el["home-close"].focus?.();
  }
  function cancelHomePurchase() {
    const id = pendingHomePurchase;
    pendingHomePurchase = null;
    renderHomeConfirmation();
    el["home-list"].querySelector(`[data-home-buy="${id}"]`)?.focus?.();
  }
  function renderCollection() {
    el["collection-list"].innerHTML = cropOrder
      .map((i) => {
        const c = crops[i];
        let n = state.collection[c.id] || 0,
          g = state.goldenCollection[c.id] || 0;
        return `<article class="collection-card${n ? "" : " is-locked"}"><img src="assets/crops/${c.id}.png" alt=""><strong>${n ? cropName(c) : "???"}</strong><small>${n ? `${tr("discovered", { n })} · ${tr("goldenFound", { n: g })}` : tr("undiscovered")}</small></article>`;
      })
      .join("");
  }
  function renderRewards() {
    let ready = state.lifetimeHarvests >= state.nextRewardAt,
      remaining = Math.max(0, state.nextRewardAt - state.lifetimeHarvests),
      sec = Math.max(0, Math.ceil((state.fertilizerUntil - Date.now()) / 1000));
    el["fertilizer-count"].textContent = state.fertilizer;
    el["fertilizer-label"].textContent = sec
      ? tr("fertilizerActive", { n: sec })
      : tr("fertilizerEffect");
    el["reward-button"].textContent = ready
      ? tr("claimReward")
      : tr("rewardIn", { n: remaining });
    el["reward-button"].disabled = !ready;
    el["fertilizer-button"].textContent = sec
      ? tr("secondsShort", { n: sec })
      : tr("fertilizerUse");
    el["fertilizer-button"].disabled = state.fertilizer < 1 || !!sec;
  }
  function claimReward() {
    if (state.lifetimeHarvests < state.nextRewardAt) return;
    let coins = Math.max(
      100,
      Math.round(crops[maxCrop()].value * seedMult() * 3),
    );
    state.coins += coins;
    state.totalCoins += coins;
    state.seasonCoins += coins;
    state.fertilizer++;
    state.nextRewardAt =
      Math.max(state.nextRewardAt, state.lifetimeHarvests) +
      12 +
      Math.floor(state.season / 2);
    toast(tr("rewardClaimed", { coins: fmt(coins) }));
    grannySay(
      lang === "ru"
        ? "Подарок за честный труд. И за быстрые пальцы."
        : "A gift for honest work. And fast fingers.",
    );
    celebrateGranny();
    save();
    render();
  }
  function useFertilizer() {
    if (state.fertilizer < 1) {
      toast(tr("noFertilizer"));
      return;
    }
    if (fertilizerActive()) return;
    state.fertilizer--;
    state.fertilizerUntil = Date.now() + 90000;
    toast(tr("fertilizerStarted"));
    grannySay(
      lang === "ru"
        ? "Теперь растёт так, будто весна на турборежиме!"
        : "Now it grows like spring on turbo mode!",
    );
    save();
    render();
  }
  function celebrateGranny() {
    el["granny-art"].classList.remove("is-celebrating");
    void el["granny-art"].offsetWidth;
    el["granny-art"].classList.add("is-celebrating");
    setTimeout(() => el["granny-art"].classList.remove("is-celebrating"), 1250);
  }
  function grannySay(message) {
    clearTimeout(grannyBubbleTimer);
    el["granny-bubble"].textContent =
      message ||
      grannyQuips[lang][Math.floor(Math.random() * grannyQuips[lang].length)];
    el["granny-bubble"].hidden = false;
    window.dispatchEvent(new Event("garden-bubble"));
    el["granny-bubble"].classList.remove("is-showing");
    void el["granny-bubble"].offsetWidth;
    el["granny-bubble"].classList.add("is-showing");
    grannyBubbleTimer = setTimeout(() => {
      el["granny-bubble"].hidden = true;
    }, 3800);
  }
  function grannyTap() {
    state.grannyTaps++;
    celebrateGranny();
    if (state.grannyTaps >= 7 && !state.grannyGiftClaimed) {
      state.grannyGiftClaimed = true;
      state.fertilizer++;
      toast(tr("grannyGift"));
      grannySay(
        lang === "ru"
          ? "Только никому: это мой секретный компост."
          : "Keep it quiet: this is my secret compost.",
      );
      save();
      render();
      return;
    }
    grannySay();
    save();
  }
  function maybeMega() {
    if (Date.now() >= state.megaNextAt && el["mega-watermelon"].hidden)
      showMegaWatermelon();
  }
  function showMegaWatermelon() {
    document.activeElement?.blur?.();
    megaHp = MEGA_HITS;
    megaDeadline = Date.now() + MEGA_DURATION;
    state.megaNextAt = Date.now() + MEGA_INTERVAL;
    save();
    clearInterval(megaTimer);
    el["mega-watermelon"].hidden = false;
    el["mega-watermelon"].classList.remove("is-won", "is-missed");
    el["mega-watermelon-label"].textContent = tr("megaHits", { n: megaHp });
    el["mega-watermelon-progress"].style.width = "100%";
    paused = true;
    stopGameplay();
    updateMegaTimer();
    megaTimer = setInterval(updateMegaTimer, 50);
    grannySay(
      lang === "ru"
        ? "Быстрее! Собирай всё, пока не переросло!"
        : "Quick! Collect it before it overgrows!",
    );
  }
  function updateMegaTimer() {
    if (externalPaused()) return;
    let left = Math.max(0, megaDeadline - Date.now()),
      sec = Math.ceil(left / 1000);
    el["mega-timer-label"].textContent = tr("megaTime", { n: sec });
    el["mega-timer-progress"].style.width = `${(left / MEGA_DURATION) * 100}%`;
    if (!left) missMegaHarvest();
  }
  function closeMegaHarvest() {
    clearInterval(megaTimer);
    megaTimer = null;
    megaHp = 0;
    megaDeadline = 0;
    el["mega-watermelon"].hidden = true;
    el["mega-watermelon"].classList.remove("is-won", "is-missed");
    syncPause();
  }
  function missMegaHarvest() {
    if (!megaDeadline) return;
    clearInterval(megaTimer);
    megaTimer = null;
    megaDeadline = 0;
    megaHp = 0;
    el["mega-watermelon"].classList.add("is-missed");
    setTimeout(() => {
      closeMegaHarvest();
      toast(tr("megaMissed"));
      save();
      render();
    }, 420);
  }
  function hitMegaWatermelon() {
    if (!megaHp || externalPaused()) return;
    if (Date.now() >= megaDeadline) return missMegaHarvest();
    megaHp--;
    el["mega-watermelon-hit"].classList.remove("is-hit");
    void el["mega-watermelon-hit"].offsetWidth;
    el["mega-watermelon-hit"].classList.add("is-hit");
    el["mega-watermelon-label"].textContent = tr("megaHits", { n: megaHp });
    el["mega-watermelon-progress"].style.width =
      `${(megaHp / MEGA_HITS) * 100}%`;
    if (megaHp) return;
    clearInterval(megaTimer);
    megaTimer = null;
    megaDeadline = 0;
    let coins = Math.max(
      500,
      Math.round(crops[maxCrop()].value * seedMult() * 12),
    );
    state.coins += coins;
    state.totalCoins += coins;
    state.seasonCoins += coins;
    state.fertilizer += 2;
    el["mega-watermelon"].classList.add("is-won");
    celebrateGranny();
    setTimeout(() => {
      closeMegaHarvest();
      toast(tr("megaPrize", { coins: fmt(coins) }));
      save();
      render();
    }, 650);
  }
  function grow(i) {
    if (paused || i >= state.bedsCount) return;
    state.selectedBed = i;
    let b = state.beds[i],
      amount = tapPower() * (b.weedHp ? 0.75 : 1);
    waterDrops(i);
    b.growth += amount;
    if (b.growth >= crops[b.cropIndex].need) {
      harvest(i);
      render();
    } else {
      renderActiveBed();
      save();
    }
  }
  function harvest(i) {
    let b = state.beds[i],
      c = crops[b.cropIndex],
      r = reward(b),
      gold = b.golden;
    state.coins += r;
    state.totalCoins += r;
    state.seasonCoins += r;
    state.seasonHarvests++;
    state.lifetimeHarvests++;
    state.collection[c.id] = (state.collection[c.id] || 0) + 1;
    if (gold)
      state.goldenCollection[c.id] = (state.goldenCollection[c.id] || 0) + 1;
    newCrop(b);
    if (gold) {
      toast(tr("golden"));
      celebrateGranny();
      grannySay(
        lang === "ru"
          ? "Золотой! Теперь можно хвастаться соседке."
          : "Golden! Now I can brag to the neighbor.",
      );
    }
    float(`+${fmt(r)} ●`, innerWidth * 0.48, innerHeight * 0.42, true);
    maybeMega();
    save();
  }
  function hitWeed(i, e) {
    if (paused) return;
    e?.stopPropagation();
    let b = state.beds[i];
    if (!b || !b.weedHp) return;
    state.selectedBed = i;
    b.weedHp--;
    if (!b.weedHp) {
      let bonus = Math.max(4, Math.round(crops[b.cropIndex].value * 0.2));
      state.coins += bonus;
      state.totalCoins += bonus;
      state.seasonCoins += bonus;
      b.nextWeedAt = Date.now() + 25000 + Math.random() * 30000;
      toast(tr("weedRemoved", { n: fmt(bonus) }));
    }
    save();
    render();
  }
  function buyUpgrade(id) {
    let u = upgradeDefs.find((x) => x.id === id);
    if (!u) return;
    if (u.max !== undefined && state.upgrades[id] >= u.max) return;
    let c = cost(u);
    if (state.coins < c) {
      toast(tr("notEnough"));
      return;
    }
    state.coins -= c;
    state.upgrades[id]++;
    if (id === "beds") {
      state.bedsCount = Math.min(MAX_BEDS, 1 + state.upgrades.beds);
      state.selectedBed = state.bedsCount - 1;
      toast(tr("bedUnlocked", { n: state.bedsCount }));
    } else
      toast(
        tr("bought", {
          name: lang === "ru" ? u.ru : u.en,
          n: state.upgrades[id],
        }),
      );
    save();
    render();
  }
  function selectCrop(i) {
    const c = crops[i];
    if (!c || paused) return;
    if (!state.purchasedCrops.includes(c.id)) {
      if (state.coins < c.purchasePrice) {
        toast(tr("notEnough"));
        return;
      }
      state.coins -= c.purchasePrice;
      state.purchasedCrops.push(c.id);
      toast(tr("unlocked", { name: cropName(c) }));
    }
    let b = state.beds[state.selectedBed];
    if (b.cropIndex !== i) {
      b.cropIndex = i;
      newCrop(b);
    }
    save({ cloudNow: true });
    render();
  }
  function hasBlockingUi() {
    return (
      externalPaused() ||
      [...document.querySelectorAll(".modal-backdrop")].some(
        (x) => !x.hidden,
      ) ||
      !el["mega-watermelon"].hidden
    );
  }
  function syncPause() {
    const now = Date.now();
    if (externalPaused()) {
      if (externalPauseAt === null) {
        externalPauseAt = now;
        externalPauseTimers = {
          boostUntil: state.boostUntil,
          growthBoostUntil: state.growthBoostUntil,
          fertilizerUntil: state.fertilizerUntil,
          megaNextAt: state.megaNextAt,
        };
      }
    } else if (externalPauseAt !== null) {
      const delta = Math.max(0, now - externalPauseAt);
      for (const key of [
        "boostUntil",
        "growthBoostUntil",
        "fertilizerUntil",
        "megaNextAt",
      ])
        if (
          state[key] > externalPauseAt &&
          state[key] === externalPauseTimers[key]
        )
          state[key] += delta;
      if (megaDeadline > 0) megaDeadline += delta;
      externalPauseAt = null;
      externalPauseTimers = null;
      lastTick = performance.now();
    }
    paused = hasBlockingUi();
    if (paused) stopGameplay();
    else startGameplay();
  }
  function showModal(m) {
    m.hidden = false;
    syncPause();
  }
  function hideModal(m) {
    m.hidden = true;
    syncPause();
  }
  function openUpgrades() {
    el["upgrades-panel"].classList.add("is-open");
    el["panel-scrim"].hidden = false;
    el["mobile-upgrades-button"].setAttribute("aria-expanded", "true");
  }
  function closeUpgrades() {
    el["upgrades-panel"].classList.remove("is-open");
    el["panel-scrim"].hidden = true;
    el["mobile-upgrades-button"].setAttribute("aria-expanded", "false");
  }
  function showPrestige() {
    let n = prestigeReward();
    if (!n) return;
    el["prestige-copy"].textContent = tr("prestigeCopy", {
      reward: seedRewardText(n),
    });
    showModal(el["prestige-modal"]);
  }
  function prestige() {
    let n = prestigeReward();
    if (!n) return;
    state.seeds += n;
    state.season++;
    state.coins = 0;
    state.seasonCoins = 0;
    state.seasonHarvests = 0;
    state.purchasedCrops = ["radish"];
    state.bedsCount = 1;
    state.selectedBed = 0;
    state.beds = [emptyBed(), emptyBed(), emptyBed()];
    state.upgrades = { water: 0, auto: 0, value: 0, beds: 0 };
    hideModal(el["prestige-modal"]);
    toast(tr("seasonStarted", { n: state.season }));
    save({ cloudNow: true });
    render();
  }
  function offlineAmount(s) {
    let elapsed = Math.min(
      OFFLINE_CAP,
      Math.max(0, (Date.now() - s.lastSavedAt) / 1000),
    );
    if (elapsed < 60 || s.upgrades.auto < 1) return 0;
    // Only the remaining real-time bonus window counts, not the whole offline period.
    const growthSeconds =
      elapsed +
      Math.min(
        elapsed,
        Math.max(0, (s.growthBoostUntil - s.lastSavedAt) / 1000),
      );
    let sum = 0,
      seedBonus = 1 + Math.sqrt(Math.max(0, s.seeds)) * 0.08;
    for (let i = 0; i < s.bedsCount; i++) {
      let b = s.beds[i],
        c = crops[b.cropIndex];
      sum +=
        ((s.upgrades.auto * 0.3 * growthSeconds) / c.need) *
        c.value *
        (1 + s.upgrades.value * 0.4) *
        seedBonus *
        0.55;
    }
    return Math.floor(sum);
  }
  function offerOffline(n) {
    offlineReward = n;
    if (n < 5) return;
    state.pendingOfflineCoins = n;
    save();
    el["offline-copy"].textContent = tr("offline", { n: fmt(n) });
    showModal(el["offline-modal"]);
  }
  function collectOffline(m) {
    let n = offlineReward * m;
    state.coins += n;
    state.totalCoins += n;
    state.seasonCoins += n;
    offlineReward = 0;
    state.pendingOfflineCoins = 0;
    hideModal(el["offline-modal"]);
    float(`+${fmt(n)} ●`, innerWidth / 2, innerHeight / 2, true);
    save();
    render();
  }
  function rewarded(fn) {
    if (rewardedActive || platformPaused || accountSwitching || document.hidden)
      return;
    if (window.ysdk?.adv?.showRewardedVideo) {
      let got = false,
        closed = false;
      rewardedActive = true;
      syncPause();
      const finish = () => {
        if (closed) return;
        closed = true;
        rewardedActive = false;
        syncPause();
        render();
      };
      try {
        window.ysdk.adv.showRewardedVideo({
          callbacks: {
            onRewarded: () => {
              if (got || closed) return;
              got = true;
              fn();
            },
            onClose: finish,
            onError: () => {
              finish();
              toast(tr("adUnavailable"));
            },
          },
        });
      } catch {
        finish();
        toast(tr("adUnavailable"));
      }
    } else if (localDemo) {
      toast(tr("localDemo"));
      rewardedActive = true;
      syncPause();
      setTimeout(() => {
        fn();
        rewardedActive = false;
        syncPause();
        render();
      }, 200);
    } else toast(tr("adUnavailable"));
  }
  function boost() {
    if (Date.now() < state.boostUntil) return;
    rewarded(() => {
      state.boostUntil = Date.now() + 120000;
      toast(tr("rewardReady"));
      save();
      render();
    });
  }
  function renderGrowthBoost() {
    const sec = Math.max(
      0,
      Math.ceil((state.growthBoostUntil - Date.now()) / 1000),
    );
    el["growth-boost-label"].textContent = sec
      ? tr("growthAdActive", { n: sec })
      : tr("growthAdHint");
    el["growth-boost-button"].disabled = sec > 0;
    el["growth-boost-button"].classList.toggle("is-active", sec > 0);
  }
  function growthBoost() {
    if (Date.now() < state.growthBoostUntil) return;
    rewarded(() => {
      state.growthBoostUntil = Date.now() + 120000;
      toast(tr("growthAdReady"));
      save();
      render();
    });
  }
  function float(txt, x, y, coin = false) {
    let r = el["effects-layer"].getBoundingClientRect(),
      n = document.createElement("span");
    n.className = `float-text${coin ? " coin-text" : ""}`;
    n.textContent = txt;
    n.style.left = `${Math.max(20, Math.min(r.width - 20, x - r.left))}px`;
    n.style.top = `${Math.max(25, Math.min(r.height - 25, y - r.top))}px`;
    el["effects-layer"].appendChild(n);
    setTimeout(() => n.remove(), 800);
  }
  function toast(msg) {
    let n = document.createElement("div");
    n.className = "toast";
    n.textContent = msg;
    el["toast-stack"].appendChild(n);
    setTimeout(() => n.remove(), 2900);
  }
  function gardenLayout(width, height) {
    const edge = width < 520 ? 10 : 14;
    // HUD is a sibling in its own grid track, never a deduction from the camera.
    const scale = Math.max(
      0,
      Math.min((width - edge * 2) / 1754, (height - edge * 2) / 826, 0.82),
    );
    return {
      edge,
      scale,
      left: (width - 1754 * scale) / 2,
      top: (height - 826 * scale) / 2,
    };
  }
  function cameraViewport(width, height, desktop) {
    width = Math.max(1, Math.floor(width));
    height = Math.max(1, Math.floor(height));
    if (desktop) {
      if (width > height * 2) width = height * 2;
      else if (height > width * 2) height = width * 2;
    }
    return { width, height };
  }
  function setupGardenWorld() {
    const stage = document.getElementById("garden-stage"),
      camera = document.getElementById("garden-camera"),
      world = document.getElementById("garden-world");
    if (!stage || !camera || !world) return;
    if (stage.dataset.worldScaleReady) return;
    stage.dataset.worldScaleReady = "true";
    let frame = 0;
    const fit = () => {
      frame = 0;
      const bounds = camera.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const desktop =
        window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ??
        true;
      const box = cameraViewport(bounds.width, bounds.height, desktop);
      stage.style.width = `${box.width}px`;
      stage.style.height = `${box.height}px`;
      const width = stage.clientWidth,
        height = stage.clientHeight;
      if (!width || !height) return;
      const {
        edge,
        scale,
        left: worldLeft,
        top: worldTop,
      } = gardenLayout(width, height);
      world.style.setProperty("--world-scale", scale.toFixed(5));
      world.style.visibility = "visible";
      const bubble =
        el["granny-bubble"] || document.getElementById("granny-bubble");
      const bubbleWidth = Math.min(
        240,
        Math.max(140, 440 * scale),
        width - edge * 2,
      );
      const above = worldTop >= edge + 58;
      bubble.style.width = `${bubbleWidth}px`;
      // Use the empty space above the bed on short screens, rather than shrink the art for speech.
      bubble.style.left = `${Math.max(edge, Math.min(width - edge - bubbleWidth, worldLeft + (above ? 330 * scale - bubbleWidth / 2 : 590 * scale)))}px`;
      bubble.style.top = `${above ? worldTop - 58 : Math.max(edge, worldTop + 8)}px`;
      bubble.classList.toggle("is-beside", !above);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    window.addEventListener("garden-bubble", schedule);
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(schedule);
      observer.observe(camera);
    } else window.addEventListener("resize", schedule);
    schedule();
  }
  function startGameplay() {
    if (gameplay || paused || !interactiveReady || externalPaused()) return;
    gameplay = true;
    try {
      window.ysdk?.features?.GameplayAPI?.start();
    } catch {}
  }
  function stopGameplay() {
    if (!gameplay) return;
    gameplay = false;
    try {
      window.ysdk?.features?.GameplayAPI?.stop();
    } catch {}
  }
  function events() {
    el["home-button"].onclick = openHome;
    el["home-close"].onclick = closeHome;
    el["home-modal"].onclick = (e) => {
      if (e.target === el["home-modal"]) closeHome();
    };
    el["home-list"].addEventListener("click", (e) => {
      const button = e.target.closest("[data-home-buy]");
      if (button) requestHomePurchase(button.dataset.homeBuy);
    });
    el["home-confirm-button"].onclick = () => buyHome(pendingHomePurchase);
    el["home-cancel-button"].onclick = cancelHomePurchase;
    el["bed-status-list"].addEventListener("click", (e) => {
      const weed = e.target.closest("[data-status-weed]");
      if (weed) return hitWeed(+weed.dataset.statusWeed, e);
      let n = e.target.closest("[data-status-bed]");
      if (n) {
        state.selectedBed = +n.dataset.statusBed;
        save();
        renderActiveBed();
      } else if (e.target.closest("[data-status-unlock]")) buyUpgrade("beds");
    });
    el["beds-container"].addEventListener("click", (e) => {
      let weed = e.target.closest("[data-weed]");
      if (weed) return hitWeed(+weed.dataset.weed, e);
      let bed = e.target.closest("[data-bed]");
      if (bed) return grow(+bed.dataset.bed);
      if (e.target.closest("[data-locked-bed]")) return buyUpgrade("beds");
    });
    el["crop-list"].addEventListener("click", (e) => {
      let b = e.target.closest("[data-crop]");
      if (b) selectCrop(+b.dataset.crop);
    });
    el["upgrade-list"].addEventListener("click", (e) => {
      let b = e.target.closest("[data-upgrade]");
      if (b) buyUpgrade(b.dataset.upgrade);
    });
    el["reward-button"].onclick = claimReward;
    el["fertilizer-button"].onclick = useFertilizer;
    el["mega-watermelon-hit"].onclick = hitMegaWatermelon;
    el["granny-art"].onclick = grannyTap;
    el["granny-art"].onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        grannyTap();
      }
    };
    el["boost-button"].onclick = boost;
    el["growth-boost-button"].onclick = growthBoost;
    el["prestige-button"].onclick = showPrestige;
    el["prestige-confirm"].onclick = prestige;
    el["prestige-cancel"].onclick = () => hideModal(el["prestige-modal"]);
    el["collection-button"].onclick = () => {
      renderCollection();
      showModal(el["collection-modal"]);
    };
    el["collection-close"].onclick = () => hideModal(el["collection-modal"]);
    el["offline-collect"].onclick = () => collectOffline(1);
    el["offline-double"].onclick = () => rewarded(() => collectOffline(2));
    el["mobile-upgrades-button"].onclick = () =>
      el["upgrades-panel"].classList.contains("is-open")
        ? closeUpgrades()
        : openUpgrades();
    el["mobile-upgrades-close"].onclick = closeUpgrades;
    el["panel-scrim"].onclick = closeUpgrades;
    el["settings-button"].onclick = () => {
      closeUpgrades();
      showModal(el["settings-modal"]);
    };
    el["settings-close"].onclick = el["settings-close-x"].onclick = () =>
      hideModal(el["settings-modal"]);
    el["save-button"].onclick = () => save({ cloudNow: true, toastIt: true });
    el["language-toggle"].onclick = () => {
      state.languageOverride = lang === "ru" ? "en" : "ru";
      detectLang();
      translate();
      save();
      render();
    };
    document.addEventListener("keydown", (e) => {
      if (!el["home-modal"].hidden) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeHome();
          return;
        }
        if (e.key === "Tab") {
          const buttons = [
            ...el["home-modal"].querySelectorAll("button:not([disabled])"),
          ].filter((n) => n.getClientRects().length);
          const first = buttons[0],
            last = buttons[buttons.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
      if (e.key === "Escape") closeUpgrades();
    });
    let stage = document.getElementById("garden-stage");
    stage.addEventListener("scroll", () => {
      stage.scrollTop = stage.scrollLeft = 0;
    });
    window.addEventListener("resize", () => {
      if (innerWidth > 700) closeUpgrades();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) save({ cloudNow: true });
      else lastTick = performance.now();
      syncPause();
    });
    window.addEventListener("pagehide", () => save({ cloudNow: true }));
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("dragstart", (e) => e.preventDefault());
  }
  function loop(now) {
    let dt = Math.min(0.25, (now - lastTick) / 1000);
    lastTick = now;
    if (externalPaused()) {
      requestAnimationFrame(loop);
      return;
    }
    if (!paused) {
      if (now - lastMegaCheck >= 1000) {
        lastMegaCheck = now;
        maybeMega();
      }
      const auto = autoPower();
      for (let i = 0; i < state.bedsCount; i++) {
        if (paused) break;
        let b = state.beds[i];
        if (!b.weedHp && Date.now() >= b.nextWeedAt) {
          b.weedHp = 3;
          save();
          render();
        }
        if (auto > 0) {
          b.growth += auto * dt * (b.weedHp ? 0.25 : 1);
          if (b.growth >= crops[b.cropIndex].need) {
            harvest(i);
            render();
          }
        }
        let node = bedCropNodes[i];
        if (node) {
          let p = Math.min(100, (b.growth / crops[b.cropIndex].need) * 100);
          node.style.setProperty(
            "--growth-scale",
            (0.22 + 0.78 * Math.sqrt(p / 100)).toFixed(3),
          );
        }
      }
      if (now - lastStatusUpdate >= 100) {
        lastStatusUpdate = now;
        updateBedStatuses();
      }
    }
    let sec = Math.max(0, Math.ceil((state.boostUntil - Date.now()) / 1000));
    if (sec !== lastBoostSecond) {
      const expired = lastBoostSecond > 0 && !sec;
      lastBoostSecond = sec;
      el["boost-label"].textContent = sec
        ? tr("boostActive", { n: sec })
        : tr("watchVideo");
      if (expired) render();
    }
    let fertSec = Math.max(
      0,
      Math.ceil((state.fertilizerUntil - Date.now()) / 1000),
    );
    const growthSec = Math.max(
      0,
      Math.ceil((state.growthBoostUntil - Date.now()) / 1000),
    );
    if (growthSec !== lastGrowthBoostSecond) {
      const expired = lastGrowthBoostSecond > 0 && !growthSec;
      lastGrowthBoostSecond = growthSec;
      expired ? render() : renderGrowthBoost();
    }
    if (fertSec !== lastHudSecond) {
      let expired = lastHudSecond > 0 && !fertSec;
      lastHudSecond = fertSec;
      expired ? render() : renderRewards();
    }
    requestAnimationFrame(loop);
  }
  async function loadVisibleAssets() {
    await withTimeout(
      Promise.all(
        [...document.images].map((img) => {
          if (img.complete && img.naturalWidth) return Promise.resolve();
          if (img.decode) return img.decode();
          return new Promise((resolve, reject) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", reject, { once: true });
          });
        }),
      ),
      20000,
    );
  }
  async function init() {
    if (initialized) return;
    initialized = true;
    cache();
    attachPlatformEvents();
    state = localSave();
    detectLang();
    await initPlayer();
    if (preferCloudOnce)
      throw new Error(
        "Selected cloud progress is unavailable; retry without overwriting it",
      );
    const off = offlineAmount(state) + (state.pendingOfflineCoins || 0);
    detectLang();
    translate();
    events();
    setupGardenWorld();
    render();
    await loadVisibleAssets();
    el.game.hidden = false;
    el["loading-screen"].remove();
    await new Promise(requestAnimationFrame);
    interactiveReady = true;
    markReady();
    offerOffline(off);
    syncPause();
    setTimeout(() => {
      if (!paused) maybeMega();
    }, 900);
    setInterval(() => {
      if (!paused && Math.random() < 0.42) grannySay();
    }, 30000);
    lastTick = performance.now();
    requestAnimationFrame(loop);
  }
  function markReady() {
    if (
      readySent ||
      !interactiveReady ||
      !window.ysdk?.features?.LoadingAPI?.ready
    )
      return;
    try {
      window.ysdk.features.LoadingAPI.ready();
      readySent = true;
    } catch (e) {
      console.warn(e);
    }
  }
  // The game may start without the SDK after a timeout; when the SDK arrives later, still report readiness, gameplay and hook up the cloud save.
  async function attachLateSdk() {
    if (!initialized || !window.ysdk) return;
    attachPlatformEvents();
    markReady();
    if (gameplay && !externalPaused()) {
      try {
        window.ysdk.features?.GameplayAPI?.start();
      } catch {}
    }
    await initPlayer();
    if (!state.languageOverride) {
      detectLang();
      translate();
    }
    render();
  }
  function startupFailed(error) {
    console.warn(error);
    cache();
    if (!el["loading-screen"]) {
      toast(tr("loadError"));
      return;
    }
    el["loading-screen"].querySelector("p").textContent = tr("loadError");
    const retry = document.getElementById("loading-retry");
    retry.textContent = tr("retry");
    retry.hidden = false;
    retry.onclick = () => window.location.reload();
  }
  function onSdkSettled() {
    attachPlatformEvents();
    (initialized ? attachLateSdk() : init()).catch(startupFailed);
  }
  // Bootstrap: tests replace only this block, never a player's actual save.
  setupGardenWorld();
  if (window.__yandexSdkSettled) onSdkSettled();
  else {
    window.addEventListener("yandex-sdk-ready", onSdkSettled, { once: true });
    setTimeout(() => {
      if (!initialized) init().catch(startupFailed);
    }, 4000);
  }
})();
