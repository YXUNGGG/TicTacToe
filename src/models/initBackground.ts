import { createUniqueId, getRandom } from "../utils/utils";

// import imgUrl from '../assets/mountain.png';

let mountainImage: HTMLImageElement;
// // const mountainWidth = mountainImage.width / 4;    // because 4x scale
// // const mountainHeight = mountainImage.height / 4;
let mountainWidth: number;
let mountainHeight: number;

class Moving {
  public x;
  public y;

  public vx = 0;
  public vy = 0;

  public id;

  constructor(xPosition: number, yPosition: number, id?:number) {
    this.id = id || createUniqueId();

    this.x = xPosition;
    this.y = yPosition;
  }

  setMove() {
    this.x -= this.vx;
    this.y -= this.vy;
  }
}

class Mountain extends Moving {
  private image: HTMLImageElement;
  private farSpeed = 0.1;
  private closeSpeed = 0.28;
  
  public z;
  public vx = 0;
  public width;
  public height;
  public isClose;

  constructor({x = 0, y = 0, isClose = true}) {   // в объекте можно производить операции и не соблюдать порядок заполнения
    super(x, y);

    this.image = mountainImage;
    this.isClose = isClose;

    this.z = isClose ? 0 : 2;
    this.width = mountainWidth;
    this.height =  mountainHeight;
  }

  renderNext(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.save();

    this.vx = this.isClose ? this.closeSpeed : this.farSpeed;

    context.globalAlpha = this.isClose ? 1 : 0.8

    if (!this.isClose) context.globalCompositeOperation = "destination-over";
  
    context.drawImage(this.image, this.x, this.y, this.width, this.height);  //pic original size

    context.closePath();
    context.restore()

    super.setMove();
  }
}

class WindBreaker extends Moving {
  public width = getRandom(25, 45);
  public height = getRandom(5, 7);

  public z = 1;
  public vx = 0.5

  constructor ({x = 0, y = 0}) {
    super(x, y);
  }
  renderNext(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.lineWidth = this.height;
    context.lineCap = "round";
    context.strokeStyle = "#fff";
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.width, this.y);
    context.stroke();

    super.setMove();
  }
}

export class CanvasBackgroundManager {
  public animationId = 0;

  public mountainWidth = 0;
  public mountainHeight = 0;

  public parent;
  private ctx;

  public width;
  public height;

  private screen: (Mountain | WindBreaker)[] = [];

  private mountainsSpawnConfig = {
    closeMin: 0,
    closeMax: 60,
    farMin: 50,
    farMax: 120
  }

  constructor(parentElement: HTMLDivElement, context: CanvasRenderingContext2D) {
    this.parent = parentElement;
    this.ctx = context;

    this.width = this.parent.offsetWidth;
    this.height = this.parent.offsetHeight;
  }

  initialise(mountain: HTMLImageElement) {  //insert mountains across the entire width as init
    this.screen = [];

    mountainImage = mountain;
    mountainWidth = mountainImage.width;
    mountainHeight = mountainImage.height;

    for (let isFar = 1; isFar > -1; isFar--) {
      let startX = -(mountainWidth / 2) * isFar;
    
      if (!mountainWidth) return;
      
      for (let x = startX; x <= this.width + mountainWidth; x += !isFar ? mountainWidth : mountainWidth - 100) {  // magic number is padding
        this.createMountain({
          x,
          isClose: Boolean(!isFar)
        });
      }
    }

    let windStartPos = 0;
    for (; windStartPos < this.width; ) {
      this.createWind(windStartPos);
      windStartPos += getRandom(100, 240);
    }

    this.renderNextFrame();
  }

  public handleResize(canvas: HTMLCanvasElement) {
   canvas.width = this.parent.offsetWidth;
   canvas.height = this.parent.offsetHeight;

    this.width = canvas.width;
    this.height = canvas.height;
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      console.log("Destroyed 👌");
    }

    this.screen = [];
  }

  createMountain({x, isClose}: {x: number, isClose: boolean}) {
    const {closeMax, closeMin, farMax, farMin} = this.mountainsSpawnConfig;

    const y = isClose ? getRandom(closeMin, closeMax) : getRandom(farMin, farMax);

    this.screen.push(
      new Mountain({
        y: this.height - mountainHeight + y,
        x: isClose ? x + getRandom(-20, 20) : x + getRandom(80, 120),
        isClose
      })
    );
  }

  deleteDepartedMountain(id: number) {  //ушедшую, департированную
    this.screen = this.screen.filter(figure => figure.id !== id);
  }  

  handleMountainSlide(mountain: Mountain) {
    this.createMountain({
      x: this.width,
      isClose: mountain.isClose
    });

    this.deleteDepartedMountain(mountain.id);
  }

  createWind(x: number) {
    this.screen.push(new WindBreaker({
      x: x || this.width,
      y: getRandom(40, this.height - 30),   //small padding on bottom
    }));
  }

  renderNextFrame() {
    if (document.visibilityState === 'hidden') {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.screen
    .sort((a, b) => b.z - a.z)
    .forEach((figure) =>{
      this.ctx.globalAlpha = 1;

      figure.renderNext(this.ctx);

      if (figure.x + figure.width <= 0) {
        if (figure instanceof Mountain) this.handleMountainSlide(figure);
        else {
          figure.x = this.width;
          figure.y = getRandom(40, this.height - 30);
        };
      }
    });
    
    this.animationId = requestAnimationFrame(() => this.renderNextFrame());
  }
}