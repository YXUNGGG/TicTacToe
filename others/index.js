class Game extends VirtualGame {
  constructor() {
    super();

    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.interface = {
      field: Id("Field"),
      tiles: Id("tiles")
    };

    this.canvas.width = this.interface.tiles.offsetWidth;
    this.canvas.height = this.interface.tiles.offsetHeight;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.game = {
      size: 3,
      symbols: "XO",
      move: -1,
      cooldown: true
    };

    this.colors = ["#0086e4", "#f28113"];

    this.ambient = new AmbientManager();

    this.players = [
      new Ai(1, 2),
      new Ai(2, 2)
      //new Player(1, "Sergey Sex"),
      //new Player(2, "xtreme Gay"),
    ];

    this.audio = {
      buffers: new Map(),

      sources: ["./assets/cross.mp3", "./assets/circle.mp3", "./assets/through.mp3", "./assets/flip.mp3"],

      install() {
        if (this.buffers.size === this.sources.length) return;

        this.sources.forEach(src => {
          var audio = new Audio();
          audio.src = src;

          this.buffers.set(src.split("/").pop(), audio);
        });
      },

      play(name, volume = 1) {
        var audio = this.buffers.get(name);
        if (!audio) return console.warn(`Audio ${name} does not exists`);

        audio.volume = volume;
        audio.play();
      }
    };

    window.addEventListener("resize", this.handleRisize.bind(this));

    this.init();
  }

  init() {
    this.game.move = -1;
    this.audio.install();
    this.setupField();
    this.setupScore();
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.nextTurn();
  }

  restart() {
    setTimeout(() => {
      this.audio.play("flip.mp3", 0.6);
      this.init();
    }, 1600);
  }

  setupField() {
    this.interface.tiles.innerHTML = null;

    this.interface.tiles.addEventListener("contextmenu", e => {
      e.preventDefault();
      e.stopPropagation();
    });

    this.field = new Array(this.game.size ** 2).fill(0).map((item, index) => {
      var tile = document.createElement("div");

      tile.dataset.id = index;
      tile.classList.add("Tile", "Empty");

      tile.addEventListener("click", () => this.handleTileClick(index));
      tile.addEventListener("mousemove", () => this.handleMouseMove(index));
      tile.addEventListener("mouseleave", () => this.handleMouseLeave(index));

      this.interface.tiles.appendChild(tile);

      return {
        id: index,
        empty: true,
        symbol: null
      };
    });
  }

  setupScore() {
    const containers = Array.from(document.querySelectorAll(".player-score"));

    containers.forEach((element, i) => {
      var player = this.players[i];

      var html = `<div class="name shade-player-${i + 1}">${player.shortName}</div>` + `<div class="score">${player.score}</div>`;

      element.innerHTML = html;
    });
  }

  getTileHtmlById(tileId) {
    return document.querySelector(`.Tile[data-id="${tileId}"]`);
  }

  async nextTurn() {
    super.nextTurn();

    const {isVictory, isDraw, combination} = this.getState();

    if (isDraw) return this.handleDraw();
    if (isVictory) return this.handleVictory(combination);

    this.game.move += 1;

    const nextPlayer = this.players[this.game.move % this.players.length];

    Hints.insertHint(`<font class="shade-player-${nextPlayer.id}">${nextPlayer.name}'s</font> TURN`);

    if (nextPlayer.isBot) {
      var generatedId = await nextPlayer.Middleware(this);

      return this.handleTileClick(generatedId, true, true);
    }

    this.game.cooldown = false;
  }

  async handleVictory(combination) {
    const player = this.players[this.game.move % this.players.length];

    this.audio.play("through.mp3", 0.6);

    player.increaseScore();
    Hints.insertHint(`<font class="shade-player-${player.id}">${player.name}</font> WON!`);

    await this.renderThroughLine(combination);

    this.restart();
  }

  handleDraw() {
    Hints.insertHint("DRAW!");
    this.restart();
  }

  handleRisize() {
    this.canvas.width = this.interface.tiles.offsetWidth;
    this.canvas.height = this.interface.tiles.offsetHeight;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.field
      .filter(tile => Boolean(tile.symbol))
      .forEach(tile => {
        this.renderSymbol(tile.id, false, this.game.symbols.indexOf(tile.symbol));
      });
  }

  handleMouseLeave(tileId) {
    const tile = this.getTileById(tileId);

    if (!tile.empty) return;

    const {offsetX, offsetY, tileRect} = this.getVirtualPosition(tileId);

    this.ctx.clearRect(offsetX, offsetY, tileRect.width, tileRect.height);
  }

  handleMouseMove(tileId) {
    const tile = this.getTileById(tileId);

    if (!tile.empty || this.game.cooldown) return;

    const {ctx, game} = this;

    const handlers = [() => this.renderCross(tileId, false), () => this.renderCircle(tileId, false)];

    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#f5f5f5";

    handlers[game.move % this.players.length]();
  }

  async handleTileClick(tileId, smooth = true, ignoreCooldown = false) {
    const {symbols, move} = this.game;

    const tile = this.getTileById(tileId);
    const tileHtml = this.getTileHtmlById(tileId);

    if (!tile.empty || (this.game.cooldown && !ignoreCooldown)) return;

    const desiredSymbol = symbols[move % this.players.length];
    const audios = ["cross.mp3", "circle.mp3"];

    tileHtml.classList.remove("Empty");

    this.game.cooldown = true;
    this.audio.play(audios[move % this.players.length], 0.7);
    this.updateTileById(tileId, prev => ({
      ...prev,
      empty: false,
      symbol: desiredSymbol
    }));

    await this.renderSymbol(tileId, smooth);

    this.nextTurn();
  }

  getVirtualPosition(tileId) {
    const tileHtml = this.getTileHtmlById(tileId);
    const tileRect = tileHtml.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    const offsetX = Math.round(tileRect.x - canvasRect.x);
    const offsetY = Math.round(tileRect.y - canvasRect.y);

    return {
      tileRect,
      padding: 50,
      offsetX,
      offsetY,
      centerX: offsetX + tileRect.width / 2,
      centerY: offsetY + tileRect.height / 2
    };
  }

  async renderThroughLine(combination) {
    const {canvas, ctx} = this;

    const [startTile, endTile] = [combination[0], combination[2]].map(tileId => {
      return this.getTileHtmlById(tileId);
    });

    const startRect = startTile.getBoundingClientRect();
    const endRect = endTile.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    var offsetX = startRect.x == endRect.x ? 0 : 22;
    var offsetY = startRect.y == endRect.y ? 0 : 22;

    offsetY = startRect.y > endRect.y ? -offsetY : offsetY;

    const startX = startRect.x - canvasRect.x + startRect.width / 2 - offsetX;
    const startY = startRect.y - canvasRect.y + startRect.height / 2 - offsetY;
    const targetX = endRect.x - canvasRect.x + endRect.width / 2 + offsetX;
    const targetY = endRect.y - canvasRect.y + endRect.height / 2 + offsetY;

    ctx.lineWidth = 8;
    ctx.strokeStyle = "#313131";

    await this.renderLine(startX, startY, targetX, targetY);
  }

  async renderLine(sx, sy, tx, ty, smooth = true) {
    return new Promise(resolve => {
      const worker = progress => {
        this.ctx.beginPath();
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(tx - (tx - sx) * progress, ty - (ty - sy) * progress);
        this.ctx.stroke();

        if (progress <= 0) return resolve();

        requestAnimationFrame(() => worker(progress - 0.04));
      };

      worker(smooth ? 1 : 0);
    });
  }

  async renderCircle(tileId, smooth = true) {
    const {offsetX, offsetY, centerX, centerY, tileRect, padding} = this.getVirtualPosition(tileId);

    const radius = tileRect.width / 2 - padding;

    return new Promise(resolve => {
      const worker = angle => {
        this.ctx.clearRect(offsetX, offsetY, tileRect.width, tileRect.height);

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, Math.PI, angle * Math.PI);
        this.ctx.stroke();

        if (angle >= 3) return resolve();

        requestAnimationFrame(() => worker(angle + 0.05));
      };

      worker(smooth ? 1 : 3);
    });
  }

  async renderCross(tileId, smooth = true) {
    const {offsetX, offsetY, tileRect, padding} = this.getVirtualPosition(tileId);

    this.ctx.clearRect(offsetX, offsetY, tileRect.width, tileRect.height);

    return Promise.all([
      await this.renderLine(offsetX + padding, offsetY + padding, offsetX + tileRect.width - padding, offsetY + tileRect.height - padding, smooth),
      await this.renderLine(offsetX + tileRect.width - padding, offsetY + padding, offsetX + padding, offsetY + tileRect.height - padding, smooth)
    ]);
  }

  async renderSymbol(tileId, smooth = true, preset) {
    const {ctx, game, colors} = this;

    const handlers = [() => this.renderCross(tileId, smooth), () => this.renderCircle(tileId, smooth)];

    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.strokeStyle = colors[preset ?? game.move % this.players.length];

    await handlers[preset ?? game.move % this.players.length]();
  }
}

const Controller = new Game();
