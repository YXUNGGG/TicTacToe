class VirtualGame {
  constructor(preset = {}) {
    this.result = "running";
    this.turn = preset.turn || "";
    this.field = [];
    this.oMovesCount = preset.oMovesCount || 0;

    if (preset.field && preset.field.length > 0) {
      this.field = preset.field.map(tile => tile);
    }
  }

  nextTurn() {
    this.turn = this.turn === "X" ? "O" : "X";
  }

  getTileById(tileId) {
    return this.field[tileId];
  }

  updateTileById(tileId, callback) {
    var previous = this.getTileById(tileId);

    if (!previous) return;

    this.field[tileId] = callback(previous);
  }

  getEmptyTiles() {
    return this.field.filter(tile => tile.empty);
  }

  getScore() {
    if (this.result == "running") return;

    if (this.result === "X-won") return 10 - this.oMovesCount;
    if (this.result === "O-won") return -10 + this.oMovesCount;

    return 0;
  }

  getState() {
    const symbolField = this.field.map(tile => tile.symbol);
    const combinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [6, 4, 2]
    ];

    const state = {
      isVictory: false,
      isDraw: false,
      isTerminal: false,
      combination: null
    };

    combinations.forEach(([x, y, z]) => {
      if (symbolField[x] == symbolField[y] && symbolField[y] == symbolField[z] && symbolField[x]) {
        state.isVictory = true;
        state.combination = [x, y, z];
        this.result = symbolField[x] + "-won";
      }
    });

    if (!symbolField.includes(null) && !state.isVictory) {
      state.isDraw = true;
      this.result = "draw";
    }

    state.isTerminal = state.isVictory || state.isDraw;

    return state;
  }
}

class Player {
  constructor(id, name, isBot = false) {
    this.id = id;
    this.name = name;
    this.isBot = isBot;
    this.score = 0;

    this.shortName = this.name
      .split(" ")
      .map(word => word[0])
      .slice(0, 3)
      .join("");
  }

  increaseScore() {
    this.score += 1;
  }
}

class Ai extends Player {
  constructor(id, level) {
    var levels = ["Novice", "Advanced", "Master"];

    super(id, levels[level] + " AI", true);

    this.level = level;
    this.levels = levels;
    this.prefixes = ["n", "a", "m"];
    this.shortName = this.prefixes[this.level] + "AI";

    this.advanced_optimal_chance = 0.68;
    this.novice_optimal_chance = 0.36;
  }

  async Middleware(game) {
    const handlers = [() => this.noviceTurn(game), () => this.advancedTurn(game), () => this.masterTurn(game)];

    const delay = randomInt(350, 1500);

    return new Promise(resolve => {
      setTimeout(() => {
        var id = handlers[this.level]();

        resolve(id);
      }, delay);
    });
  }

  getAvailableActions(game) {
    const virtual = new VirtualGame(game);
    const emptyTiles = virtual.getEmptyTiles();

    const availableActions = emptyTiles
      .map(tile => {
        var action = new AiAction(tile.id);
        var next = action.applyTo(virtual);

        action.minimaxValue = minimaxValue(next);

        return action;
      })
      .sort(game.turn === "X" ? AiAction.Descending : AiAction.Ascending);

    var suboptimal = availableActions.filter((action, i, arr) => action.minimaxValue !== arr[0].minimaxValue);

    if (suboptimal.length < 1) suboptimal = availableActions;

    return {
      suboptimal,
      available: availableActions,
      optimal: availableActions.filter((action, i, arr) => action.minimaxValue === arr[0].minimaxValue)
    };
  }

  noviceTurn(game) {
    const {suboptimal, optimal} = this.getAvailableActions(game);
    const actions = chance(this.novice_optimal_chance) ? optimal : suboptimal;

    return randomElement(actions).positionId;
  }

  advancedTurn(game) {
    const {suboptimal, optimal} = this.getAvailableActions(game);
    const actions = chance(this.advanced_optimal_chance) ? optimal : suboptimal;

    return randomElement(actions).positionId;
  }

  masterTurn(game) {
    const {optimal} = this.getAvailableActions(game);

    return randomElement(optimal).positionId;
  }
}

class AiAction {
  constructor(position) {
    this.minimaxValue = 0;
    this.positionId = position;
  }

  applyTo(preset) {
    var next = new VirtualGame(preset);

    next.updateTileById(this.positionId, prev => ({
      ...prev,
      empty: false,
      symbol: preset.turn
    }));

    if (preset.turn === "O") next.oMovesCount++;

    next.nextTurn();

    return next;
  }

  static Ascending(firstAction, secondAction) {
    if (firstAction.minimaxValue < secondAction.minimaxValue) return -1;
    if (firstAction.minimaxValue > secondAction.minimaxValue) return 1;

    return 0;
  }

  static Descending(firstAction, secondAction) {
    if (firstAction.minimaxValue > secondAction.minimaxValue) return -1;
    else if (firstAction.minimaxValue < secondAction.minimaxValue) return 1;

    return 0;
  }
}

const minimaxValue = state => {
  if (state.getState().isTerminal) return state.getScore();

  var stateScore = state.turn === "X" ? -100 : 100;

  var availablePositions = state.getEmptyTiles();

  availablePositions
    .map(tile => {
      var action = new AiAction(tile.id);

      return action.applyTo(state);
    })
    .forEach(nextState => {
      var nextScore = minimaxValue(nextState);

      if (state.turn === "X") {
        if (nextScore > stateScore) stateScore = nextScore;
      } else {
        if (nextScore < stateScore) stateScore = nextScore;
      }
    });

  return stateScore;
};
