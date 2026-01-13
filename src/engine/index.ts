import { Ai, BoardType, BotPresets, Player } from "../models/Player";
import { symbolType } from "../types/GameContext";
import { getCanvasPosition, renderSymbol } from "../utils/drawFunctions";
import { checkBoardState, getRandom } from "../utils/utils";

export const Wins_positins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export class GameController {
  private canvas;
  private callbacks = new Map<string, (() => unknown)[]>();
  public secondPlayerSymbol: symbolType = getRandom(0, 2) ? "X" : "O";

  public context;
  public board: BoardType;
  public parent: HTMLDivElement;

  public playingCell: number | null = null; 
  public movesCount = 0;
  public gameStatus: "running" | "draw" | string = "running";
  public currentTurn: symbolType = "O";

  public playerOne: Player;
  public playerTwo: Player | Ai;

  constructor(canvasElem: HTMLCanvasElement, boardElement: HTMLDivElement, botDifficult: BotPresets | undefined) {
    this.parent = boardElement;
    const {clientHeight, clientWidth} = this.parent;
    this.canvas = canvasElem;
    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;

    this.context = this.canvas.getContext("2d"); 
    this.board = new Array(9).fill(0).map((_, i) => i);

    this.playerOne = new Player("P1");
    this.playerTwo = botDifficult 
      ? new Ai(this.secondPlayerSymbol, botDifficult)
      : new Player("P2");
      
    window.addEventListener("resize", () => this.handleResize);
  }

  static emptyIndices(board: BoardType) {
    return board.filter(c => c != "O" && c != "X");   // returns sells without "X" or "O"
  }

  public handleResize() {
    const {clientHeight, clientWidth} = this.parent;

    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;

    this.context!.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cells = this.board.map((cell, i) => [cell, i]).filter(cell => typeof cell[0] !== "number") as [symbolType, number][];

    cells.forEach(tile => {
      renderSymbol(this.context!, tile[1], tile[0], "", true);
    });
  }

  public handleCellHover(cellId: number) {
    const tile = this.board[cellId];

    if (typeof tile !== "number") return;

    renderSymbol(this.context!, cellId, this.currentTurn,"#cecece", true);
  }

  handleCellLeave(cellId: number) {
    const tile = this.board[cellId];

    if (typeof tile !== "number") return;

    const {offsetX, offsetY, tileRect} = getCanvasPosition(cellId);

    this.context!.clearRect(offsetX, offsetY, tileRect.width, tileRect.height);
  }

  public init() {
    this.emit("updateCells");
    this.nextTurn();
  }

  public reset() {
    this.movesCount = 0;
    this.currentTurn = "O";
    this.gameStatus = "running";
    this.board = new Array(9).fill(0).map((_, i) => i);
    this.secondPlayerSymbol = this.secondPlayerSymbol === "X" ? "O" : "X";
    
    this.context!.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public onEvent(event: string, callback: () => void) {  
    const existedEvent = this.callbacks.get(event);
    if (existedEvent) {
      existedEvent.push(callback);
      return;
    }

    this.callbacks.set(event, [callback]);
  }

  public offEvent(event: string, funcName: string) {
    const functions = this.callbacks.get(event);
    functions?.filter(cb => cb.name === funcName);

    this.callbacks.delete(event);
    if (functions) this.callbacks.set(event, functions);
  }

  private async emit(event: string) {
    const callbacks = this.callbacks.get(event);

    if (callbacks) {
      for (const callback of callbacks) {
        const result = callback();
        if (result instanceof Promise) {
          await result;
        }
      }
    }
    // if (callbacks) callbacks.forEach((callback) => {
    //   const result = callback();
    //   if (result instanceof Promise) {
    //     await result;
    //   }
    // });
  }

  public async nextTurn() {
    this.currentTurn = this.currentTurn === "X" ? "O" : "X";
    if (
      this.playerTwo.isBot &&
      this.currentTurn === this.secondPlayerSymbol
    ) {
      const id = await this.handleBotStep();
      await this.setNewStep(id!);
    }

    this.movesCount++;
  }

  private async handleBotStep() {
    const botTinkingDelay = getRandom(400, 1200);
    return new Promise<number>(resolve => {
        setTimeout(() => {
          if (!(this.playerTwo instanceof Ai)) return;
          if (this.movesCount === 0) {
            const aiStepId = getRandom(0, 10)    // first step is between 0 and 9 (last not included)
            
            resolve(aiStepId);
          } else {
            const aiStepId = this.playerTwo.AiTurnByLevel(this.board);
            resolve(aiStepId);
          }
        }, botTinkingDelay);
    });
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     aiStepId = this.playerTwo.AiTurnByLevel(this.board, this.playerTwo.preset);
    //     resolve(this.setNewStep(aiStepId));
    //   });
    // });
    // this.setNewStep(aiStepId);
  }

  private async handleVictory(winnerName: string) {
    this.gameStatus = winnerName + " win!";
    await this.emit("victory");
  }

  private handleDraw() {
    this.gameStatus = "draw";
  }

  private updateBoardCell(id: number) {
    this.board[id] = this.currentTurn;
  }

  public getPlayerNameByTurn() {
    const currentPlayer = this.currentTurn === this.secondPlayerSymbol
      ? this.playerTwo 
      : this.playerOne;
    return currentPlayer.name;
  }

  public async setNewStep(id: number) {
    this.updateBoardCell(id);
    this.playingCell = id;

    // this.emit("updateCells");
    await this.emit("drawFigure");
  
    const isWin = checkBoardState(this.board, this.currentTurn);

    if (!isWin.length && !GameController.emptyIndices(this.board).length) {
      return this.handleDraw();
    } else if (isWin.length > 0) {
      await this.handleVictory(this.getPlayerNameByTurn());
      return;
    }
    
    this.nextTurn();
  }
}