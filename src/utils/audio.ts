class ActionsSoundManager {
  private cross: HTMLAudioElement;
  private circle: HTMLAudioElement;
  private winLine: HTMLAudioElement;

  constructor() {
    this.cross = new Audio("/src/assets/cross.mp3");
    this.circle = new Audio("/src/assets/circle.mp3");
    this.winLine = new Audio("/src/assets/win-line.mp3");
  }

  play(action: "cross" | "circle" | "winLine") {
    this[action].play();
  }
}

export const actionsSoundManager = new ActionsSoundManager();