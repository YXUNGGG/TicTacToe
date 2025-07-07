const textures = {
  mountain: sprite("./assets/mountain.png")
};

class Drawable {
  constructor({x, y, w, h, color, id}) {
    this.id = id || uniqueId();
    this.x = x;
    this.y = y;
    this.z = 0;

    this.width = w;
    this.height = h;
    this.color = color || "transparent";
  }

  nextFrame(ctx) {
    if (this.color && this.color != "transparent") {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.closePath();
    }
  }
}

class Movable extends Drawable {
  constructor({x, y, w, h, color, id}) {
    super({x, y, w, h, color, id});

    this.vx = 0;
    this.vy = 0;
    this.ground = false;
    this.gravitable = true;
    this.frictional = true;
  }

  nextFrame(ctx) {
    this.x += this.vx;
    this.y += this.vy;

    super.nextFrame(ctx);
  }
}

class Mountain extends Movable {
  constructor({x = 0, y = 0, isFar = false}) {
    super({x, y});

    this.x = x;
    this.y = y;
    this.isFar = isFar;
    this.texture = textures.mountain;
    this.z = isFar ? 0 : 1;

    this.width = textures.mountain.width;
    this.height = textures.mountain.height;

    this.far_speed = -0.1;
    this.near_speed = -0.25;
  }

  nextFrame(ctx) {
    ctx.beginPath();
    ctx.globalAlpha = this.isFar ? 0.7 : 1;

    this.vx = this.isFar ? this.far_speed : this.near_speed;

    ctx.drawImage(this.texture, this.x, this.y);
    ctx.closePath();

    super.nextFrame(ctx);
  }
}

class Wind extends Movable {
  constructor({x, y}) {
    super({x, y});

    this.z = 2;

    this.width = randomInt(25, 45);
    this.height = 6;

    this.vx = -0.45;
  }

  nextFrame(ctx) {
    ctx.beginPath();
    ctx.lineWidth = this.height;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.stroke();

    super.nextFrame();
  }
}

class AmbientManager {
  constructor() {
    this.parent = Id("mountains");
    this.canvas = Id("backdrop-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = this.parent.offsetWidth;
    this.canvas.height = this.parent.offsetHeight;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.config = {
      near_offset_min: 0,
      near_offset_max: 55,
      far_offset_min: 50,
      far_offset_max: 70
    };

    this.scene = [];

    textures.mountain.addEventListener("load", this.init.bind(this));
    window.addEventListener("resize", this.handleRisize.bind(this));
  }

  init() {
    const {width, height} = this;

    for (let isFar = 1; isFar > -1; isFar--) {
      let startX = (textures.mountain.width / 2) * isFar;

      for (let x = startX; x < width + textures.mountain.width; x += textures.mountain.width) {
        this.insertMountain({
          x,
          isFar: Boolean(isFar)
        });
      }
    }

    var windX = 0;
    for (; windX < width; ) {
      this.insertWind(windX);
      windX += randomInt(100, 250);
    }

    requestAnimationFrame(this.nextFrame.bind(this));
  }

  handleRisize() {
    this.canvas.width = this.parent.offsetWidth;
    this.canvas.height = this.parent.offsetHeight;

    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  insertMountain({x, isFar}) {
    const {near_offset_max, near_offset_min, far_offset_max, far_offset_min} = this.config;

    var y = isFar ? randomInt(far_offset_min, far_offset_max) : randomInt(near_offset_min, near_offset_max);

    this.scene.push(
      new Mountain({
        y: this.height - textures.mountain.height + y,
        x: x || 0,
        isFar: isFar || false
      })
    );
  }

  insertWind(x, y) {
    this.scene.push(
      new Wind({
        x: x || this.width,
        y: y || randomInt(50, this.height - textures.mountain.height)
      })
    );
  }

  deleteById(id) {
    this.scene = this.scene.filter(item => item.id !== id);
  }

  handleMountainLoop(mountain) {
    this.insertMountain({
      x: this.width,
      isFar: mountain.isFar
    });

    this.deleteById(mountain.id);
  }

  nextFrame() {
    const {width, height, ctx} = this;

    ctx.clearRect(0, 0, width, height);

    this.scene
      .sort((a, b) => {
        return a.z < b.z ? -1 : 1;
      })
      .forEach(drawable => {
        ctx.globalAlpha = 1;

        drawable.nextFrame(ctx);

        if (drawable.x + drawable.width <= 0 && drawable instanceof Mountain) {
          this.handleMountainLoop(drawable);
        }

        if (drawable.x + drawable.width <= 0 && drawable instanceof Wind) {
          drawable.x = width;
          drawable.y = randomInt(50, this.height - textures.mountain.height);
        }
      });

    requestAnimationFrame(this.nextFrame.bind(this));
  }
}
