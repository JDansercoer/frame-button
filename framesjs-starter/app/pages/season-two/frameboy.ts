export enum Views {
  home = 0,
  snipe = 1,
  leaderboard = 2,
}

export enum ViewNames {
  home = "Home",
  snipe = "Snipe",
  leaderboard = "Leaderboard",
}

// set names

export const viewNames = {
  [Views.home]: ViewNames.home,
  [Views.snipe]: ViewNames.snipe,
  [Views.leaderboard]: ViewNames.leaderboard,
};

export const frameBoyViews = {
  [Views.home]: {
    buttons: ["home", "action", "leaderboard", "https://dojoengine.org"],
    inputText: "",
    input: false,
  },
  [Views.snipe]: {
    buttons: ["home", "snipe", "duck", "leaderboard"],
    inputText: "target username",
    input: true,
  },
  [Views.leaderboard]: {
    buttons: ["home", "snipe", "find", "reload"],
    inputText: "find",
    input: true,
  },
};

export const viewsArray = Object.values(frameBoyViews);
